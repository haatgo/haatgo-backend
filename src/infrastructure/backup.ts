import {createHash} from 'node:crypto';
import type {Db} from 'mongodb';
import {z} from 'zod';
import {collections,requireThat,type State} from '../domain.js';
import type {Store} from '../store.js';
import {readPrivateReceipt,savePrivateReceipt} from './private-files.js';

const digest=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
function canonical(value:unknown):unknown{if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,canonical(item)]));return value;}
const recordsDigest=(value:unknown)=>digest(JSON.stringify(canonical(value)));
const record=z.object({id:z.string().min(1),version:z.number().int().positive(),createdAt:z.iso.datetime(),updatedAt:z.iso.datetime()}).passthrough();
const stateSchema=z.object(Object.fromEntries(collections.map(name=>[name,z.array(record)]))).strict();
const bundleSchema=z.object({format:z.literal('haatgo-local-backup-v1'),createdAt:z.iso.datetime(),records:stateSchema,files:z.array(z.object({key:z.string().uuid(),base64:z.string(),sha256:z.string().regex(/^[a-f0-9]{64}$/)})),recordsSha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export type BackupBundle=Omit<z.infer<typeof bundleSchema>,'records'>&{records:State};

export async function createBackup(store:Store):Promise<BackupBundle>{
  // Store.read uses one snapshot transaction for all collections.
  const records=await store.read(),files:BackupBundle['files']=[];
  for(const receipt of records.receipts.filter(row=>row.uploaded)){
    const bytes=receipt.bytes?Buffer.from(receipt.bytes,'base64'):await readPrivateReceipt(receipt.objectKey);
    files.push({key:receipt.objectKey,base64:bytes.toString('base64'),sha256:digest(bytes)});
  }
  return {format:'haatgo-local-backup-v1',createdAt:new Date().toISOString(),records,files,recordsSha256:recordsDigest(records)};
}

export function validateBackup(input:unknown){
  const bundle=bundleSchema.parse(input);
  requireThat(recordsDigest(bundle.records)===bundle.recordsSha256,'BACKUP_INTEGRITY','Backup records failed the integrity check',400);
  for(const rows of Object.values(bundle.records))requireThat(new Set(rows.map(row=>row.id)).size===rows.length,'BACKUP_DUPLICATE','Backup contains duplicate record IDs',400);
  const files=new Map(bundle.files.map(file=>[file.key,file]));
  requireThat(files.size===bundle.files.length,'BACKUP_DUPLICATE','Backup contains duplicate files',400);
  for(const file of bundle.files)requireThat(digest(Buffer.from(file.base64,'base64'))===file.sha256,'BACKUP_INTEGRITY','Backup receipt failed the integrity check',400);
  for(const receipt of bundle.records.receipts)if(receipt.uploaded)requireThat(files.has(String(receipt.objectKey)),'BACKUP_MISSING_FILE','Backup is missing a private receipt',400);
  return bundle;
}

export async function restoreBackup(db:Db,input:unknown,privateDirectory:string){
  const bundle=validateBackup(input);
  // Refuse every populated target. This command never deletes or replaces records.
  for(const name of collections)requireThat(await db.collection(name).countDocuments({},{limit:1})===0,'RESTORE_TARGET_NOT_EMPTY','Restore requires a fresh, empty target database',409);
  const state=structuredClone(bundle.records) as unknown as State;
  state.sessions=[];state.challenges=[];state.devices=[];
  for(const user of state.users)if(user.availability==='online')user.availability='offline';
  // Files are restored first: no committed receipt can reference a missing image.
  for(const file of bundle.files)await savePrivateReceipt(file.key,Buffer.from(file.base64,'base64'),privateDirectory);
  const client=db.client;
  await client.withSession(session=>session.withTransaction(async()=>{
    await db.collection('control').updateOne({_id:'writer' as never},{$inc:{revision:1}},{upsert:true,session});
    for(const name of collections){
      requireThat(await db.collection(name).countDocuments({},{session,limit:1})===0,'RESTORE_TARGET_NOT_EMPTY','Restore target changed; no records were restored',409);
      if(state[name].length)await db.collection(name).insertMany(state[name],{session});
    }
  },{readConcern:{level:'snapshot'},writeConcern:{w:'majority'}}));
  return {collections:collections.length,receipts:bundle.files.length,sessionsRevoked:true};
}
