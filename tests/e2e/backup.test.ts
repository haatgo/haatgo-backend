import {afterAll,beforeAll,expect,it} from 'vitest';
import {MongoMemoryReplSet} from 'mongodb-memory-server';
import {MongoClient} from 'mongodb';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {MemoryStore,MongoStore} from '../../src/store.js';
import {createBackup,restoreBackup} from '../../src/infrastructure/backup.js';
import {entity} from '../../src/domain.js';
let mongo:MongoMemoryReplSet,client:MongoClient,directory:string;
beforeAll(async()=>{mongo=await MongoMemoryReplSet.create({binary:{version:'8.0.12'},replSet:{count:1}});client=await new MongoClient(mongo.getUri()).connect();directory=await mkdtemp(join(tmpdir(),'haatgo-restore-'));});
afterAll(async()=>{await client?.close();await mongo?.stop();if(directory)await rm(directory,{recursive:true,force:true});});
it('restores records and private images into a fresh database, revokes sessions and refuses overwrite',async()=>{
  const store=new MemoryStore(),key=randomUUID(),bytes=Buffer.from('private-receipt-fixture');
  await store.mutate(s=>{s.products[0].sellingPricePaise=3456;s.receipts.push({...entity('receipt'),orderId:'fixture',partnerId:'partner',mimeType:'image/png',objectKey:key,uploaded:true,confirmed:true,bytes:bytes.toString('base64')});s.sessions.push({...entity('session'),userId:'fixture',accessHash:'old-access',refreshHash:'old-refresh',expiresAt:new Date().toISOString(),refreshExpiresAt:new Date().toISOString()});});
  const bundle=await createBackup(store),db=client.db('restored');
  expect(await restoreBackup(db,bundle,directory)).toMatchObject({receipts:1,sessionsRevoked:true});
  const restored=await MongoStore.connect(mongo.getUri('restored'));
  try{const state=await restored.read();expect(state.products[0].sellingPricePaise).toBe(3456);expect(state.sessions).toEqual([]);expect(await readFile(join(directory,key))).toEqual(bytes);}finally{await restored.close();}
  await expect(restoreBackup(db,bundle,directory)).rejects.toMatchObject({code:'RESTORE_TARGET_NOT_EMPTY'});
});
it('rejects altered records, altered receipts and missing images before writing data',async()=>{
  const store=new MemoryStore(),key=randomUUID();await store.mutate(s=>s.receipts.push({...entity('receipt'),orderId:'fixture',partnerId:'partner',mimeType:'image/png',objectKey:key,uploaded:true,confirmed:false,bytes:Buffer.from('image').toString('base64')}));
  const bundle=await createBackup(store),db=client.db('tampered');
  const changed=structuredClone(bundle);changed.records.products[0].sellingPricePaise=1;
  await expect(restoreBackup(db,changed,directory)).rejects.toMatchObject({code:'BACKUP_INTEGRITY'});
  const broken=structuredClone(bundle);broken.files[0].base64=Buffer.from('altered').toString('base64');
  await expect(restoreBackup(db,broken,directory)).rejects.toMatchObject({code:'BACKUP_INTEGRITY'});
  await expect(restoreBackup(db,{...bundle,files:[]},directory)).rejects.toMatchObject({code:'BACKUP_MISSING_FILE'});
  expect(await db.collection('products').countDocuments()).toBe(0);
});
