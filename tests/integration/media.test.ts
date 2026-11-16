import {afterEach,expect,it,vi} from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import {createApp} from '../../src/app.js';
import {MemoryStore} from '../../src/store.js';
import {config} from '../../src/config.js';
import {uploadCatalogueImage} from '../../src/infrastructure/catalogue-media.js';
const settings={MEDIA_PROVIDER:config.MEDIA_PROVIDER,CLOUDINARY_CLOUD_NAME:config.CLOUDINARY_CLOUD_NAME,CLOUDINARY_UPLOAD_PRESET:config.CLOUDINARY_UPLOAD_PRESET,CLOUDINARY_ASSET_ROOT:config.CLOUDINARY_ASSET_ROOT};
afterEach(()=>{Object.assign(config,settings);vi.unstubAllGlobals();});
const picture=async()=>({kind:'products' as const,filename:'tomato.png',mimeType:'image/png' as const,base64:(await sharp({create:{width:20,height:20,channels:3,background:'#ef4531'}}).png().toBuffer()).toString('base64')});
async function setup(){const store=new MemoryStore(),uploader=vi.fn(async()=>({publicId:'haatgo/products/image',url:'https://res.cloudinary.com/test/image/upload/v1/haatgo/products/image.webp',width:20,height:20,format:'webp',bytes:120,folder:'haatgo/products'}));const api=request(createApp(store,undefined,uploader).app);const login=(await api.post('/v1/admin/auth/login').send({email:config.ADMIN_EMAIL,password:config.ADMIN_PASSWORD})).body.data;return {store,uploader,api,headers:{Authorization:'Bearer '+login.accessToken}};}
it('authorizes uploads before calling a provider and validates file bytes, size and scope',async()=>{
  const {store,uploader,api,headers}=await setup(),body=await picture();
  await api.post('/v1/admin/media/images').send(body).expect(401);
  await store.mutate(s=>{s.users[0].adminRole='finance';});await api.post('/v1/admin/media/images').set(headers).send(body).expect(403);
  await store.mutate(s=>{s.users[0].adminRole='catalogue';});
  await api.post('/v1/admin/media/images').set(headers).send({...body,base64:Buffer.from('not a PNG image at all').toString('base64')}).expect(400);
  await api.post('/v1/admin/media/images').set(headers).send({...body,folder:'pothersathi/overwrite'}).expect(400);
  await api.post('/v1/admin/media/images').set(headers).send({...body,base64:Buffer.alloc(2*1024*1024+1).toString('base64')}).expect(400);
  expect(uploader).not.toHaveBeenCalled();
});
it('records audited media outside the provider call and binds product references to the right image type',async()=>{
  const {store,uploader,api,headers}=await setup();uploader.mockImplementationOnce(async()=>{await store.mutate(s=>{s.products[0].description='Concurrent edit during upload';});return {publicId:'haatgo/products/test',url:'https://res.cloudinary.com/test/image/upload/v1/haatgo/products/test.webp',width:20,height:20,format:'webp',bytes:120,folder:'haatgo/products'};});
  const asset=(await api.post('/v1/admin/media/images').set(headers).send(await picture()).expect(200)).body.data;
  const product=(await store.read()).products[0];await api.patch('/v1/admin/products/'+product.id).set(headers).send({expectedVersion:product.version,reason:'Attach uploaded photo',image:asset.url,imageAssetId:asset.id}).expect(200);
  await api.patch('/v1/admin/categories/cat_1').set(headers).send({expectedVersion:1,reason:'Wrong image type',icon:asset.url,iconAssetId:asset.id}).expect(400);
  expect((await api.get('/v1/admin/media/images?kind=products').set(headers).expect(200)).body.data.items[0].id).toBe(asset.id);
  expect((await store.read()).audit.some(entry=>entry.action==='media.upload')).toBe(true);
});
it('normalizes an image and sends only server-selected HaatGo upload parameters',async()=>{
  Object.assign(config,{MEDIA_PROVIDER:'cloudinary',CLOUDINARY_CLOUD_NAME:'fixture',CLOUDINARY_UPLOAD_PRESET:'fixture-preset',CLOUDINARY_ASSET_ROOT:'haatgo'});
  const transport=vi.fn(async()=>new Response(JSON.stringify({public_id:'haatgo/products/id',secure_url:'https://res.cloudinary.com/fixture/image/upload/v1/haatgo/products/id.webp',resource_type:'image',width:20,height:20,format:'webp',bytes:120}),{status:200}));vi.stubGlobal('fetch',transport);
  const asset=await uploadCatalogueImage(await picture());expect(asset.folder).toBe('haatgo/products');
  const [url,options]=transport.mock.calls[0] as unknown as [string,RequestInit];expect(url).toBe('https://api.cloudinary.com/v1_1/fixture/image/upload');const form=options.body as FormData;expect(form.get('folder')).toBe('haatgo/products');expect((form.get('file') as File).type).toBe('image/webp');
});
it('returns a recoverable provider error without exposing response credentials',async()=>{
  Object.assign(config,{MEDIA_PROVIDER:'cloudinary',CLOUDINARY_CLOUD_NAME:'fixture',CLOUDINARY_UPLOAD_PRESET:'fixture-preset'});vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({error:{message:'sensitive upstream detail'}}),{status:400})));
  await expect(uploadCatalogueImage(await picture())).rejects.toMatchObject({code:'MEDIA_UPLOAD_FAILED',status:502});
});
