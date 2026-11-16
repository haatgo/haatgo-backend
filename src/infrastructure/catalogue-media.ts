import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {config} from '../config.js';
import {Fault,requireThat} from '../domain.js';

export type AssetKind='products'|'categories'|'sections';
export interface ImageUpload{kind:AssetKind;filename:string;mimeType:'image/png'|'image/jpeg'|'image/webp';base64:string}
export interface UploadedImage{publicId:string;url:string;width:number;height:number;format:string;bytes:number;folder:string}
export type MediaUploader=(input:ImageUpload)=>Promise<UploadedImage>;
export function validateImage(input:ImageUpload){
  requireThat(/^[A-Za-z0-9+/]+={0,2}$/.test(input.base64),'INVALID_IMAGE','Select a valid PNG, JPEG or WebP image',400);
  const bytes=Buffer.from(input.base64,'base64');
  requireThat(bytes.length>12&&bytes.length<=2*1024*1024,'IMAGE_SIZE','Images must be at most 2 MB',400);
  const png=input.mimeType==='image/png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg=input.mimeType==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const webp=input.mimeType==='image/webp'&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  requireThat(png||jpeg||webp,'INVALID_IMAGE','The image contents do not match its file type',400);
  return bytes;
}
export const uploadCatalogueImage:MediaUploader=async input=>{
  const original=validateImage(input);
  requireThat(config.MEDIA_PROVIDER==='cloudinary'&&config.CLOUDINARY_CLOUD_NAME&&config.CLOUDINARY_UPLOAD_PRESET,'MEDIA_NOT_CONFIGURED','Image uploads are not configured on this server',503);
  const folder=`${config.CLOUDINARY_ASSET_ROOT}/${input.kind}`;
  let bytes:Buffer;
  try{bytes=await sharp(original,{limitInputPixels:40_000_000}).rotate().resize({width:input.kind==='categories'?512:1600,height:input.kind==='categories'?512:1600,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer();}catch{throw new Fault(400,'INVALID_IMAGE','This image cannot be decoded. Choose another PNG, JPEG or WebP.');}
  const form=new FormData();form.set('file',new Blob([new Uint8Array(bytes)],{type:'image/webp'}),'haatgo-image.webp');
  // Reuse the existing unsigned preset through this authenticated backend only.
  // Never accept a folder, URL, public ID or preset supplied by the browser.
  form.set('upload_preset',config.CLOUDINARY_UPLOAD_PRESET);form.set('folder',folder);
  form.set('public_id',`haatgo-${randomUUID()}`);
  let response:Response;
  try{response=await fetch(`https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/image/upload`,{method:'POST',body:form,signal:AbortSignal.timeout(45000)});}catch{throw new Fault(502,'MEDIA_UPLOAD_FAILED','Image upload could not reach Cloudinary. Please retry.');}
  const result=await response.json().catch(()=>null) as Record<string,unknown>|null;
  requireThat(response.ok&&result,'MEDIA_UPLOAD_FAILED','Cloudinary could not accept this image. Please retry or choose another file.',502);
  let url:URL|undefined;try{if(typeof result.secure_url==='string')url=new URL(result.secure_url);}catch{}
  requireThat(url?.protocol==='https:'&&url.hostname==='res.cloudinary.com'&&url.pathname.startsWith(`/${config.CLOUDINARY_CLOUD_NAME}/image/upload/`)&&result.resource_type==='image'&&typeof result.public_id==='string','INVALID_MEDIA_RESPONSE','Cloudinary returned an invalid image response',502);
  requireThat(String(result.public_id).startsWith(folder+'/')||result.asset_folder===folder,'MEDIA_FOLDER_MISMATCH','The upload preset must allow the dedicated HaatGo folder',502);
  requireThat(Number.isInteger(result.width)&&Number(result.width)>0&&Number(result.width)<=10000&&Number.isInteger(result.height)&&Number(result.height)>0&&Number(result.height)<=10000,'IMAGE_DIMENSIONS','Choose an image no larger than 10,000 pixels per side',400);
  return {publicId:String(result.public_id),url:url.href,width:Number(result.width),height:Number(result.height),format:String(result.format),bytes:Number(result.bytes),folder};
};
