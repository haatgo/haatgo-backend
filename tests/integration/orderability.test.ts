import {expect,it} from 'vitest';import {MemoryStore} from '../../src/store.js';import {Service} from '../../src/service.js';import {entity,type User} from '../../src/domain.js';
import request from 'supertest';import {createApp} from '../../src/app.js';
it('applies PIN availability consistently to home, search and product links',async()=>{
  const store=new MemoryStore(),api=request(createApp(store).app);
  await store.mutate(s=>{s.products[0].zoneIds=['different-zone'];s.products[1].marketIds=['different-market'];s.categories.find(c=>c.id===s.products[2].categoryId)!.active=false;});
  for(const path of ['/v1/catalog/home?pincode=700150','/v1/products/search?pincode=700150','/v1/products?pincode=700150']){
    const result=(await api.get(path).expect(200)).body.data;
    const rows=result.products??result.items;
    expect(rows.some((row:{id:string})=>['prd_1','prd_2','prd_3'].includes(row.id))).toBe(false);
  }
  await api.get('/v1/products/prd_1?pincode=700150').expect(404);
  expect((await api.get('/v1/catalog/home?pincode=999999').expect(200)).body.data.products).toEqual([]);
  await api.get('/v1/catalog/home?pincode=invalid').expect(400);
});
it('quote refuses products excluded from a zone or belonging to an archived category',async()=>{const store=new MemoryStore(),service=new Service(store);const user:User={...entity('user'),id:'zone-customer',name:'Customer',phone:'9876543217',role:'customer',approval:'approved',availability:'offline'};await store.mutate(s=>{s.users.push(user);s.addresses.push({...entity('address'),id:'zone-address',userId:user.id,label:'Home',house:'12',street:'Market Road',landmark:'',pincode:'700150',instructions:'',deleted:false});s.carts.push({...entity('cart'),userId:user.id,lines:[{productId:'prd_1',quantity:1}],revision:1});s.products[0].zoneIds=['another-zone'];});await expect(service.quote(user,'zone-address')).rejects.toMatchObject({code:'PRODUCT_UNAVAILABLE_IN_ZONE'});await store.mutate(s=>{s.products[0].zoneIds=[];s.categories[0].active=false;});await expect(service.quote(user,'zone-address')).rejects.toMatchObject({code:'PRODUCT_UNAVAILABLE_IN_ZONE'});});
