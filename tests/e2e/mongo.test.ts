import { afterAll, beforeAll, expect, it } from 'vitest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoStore } from '../../src/store.js';
import { Service } from '../../src/service.js';
let mongo:MongoMemoryReplSet;let store:MongoStore;
beforeAll(async()=>{mongo=await MongoMemoryReplSet.create({binary:{version:'8.0.12'},replSet:{count:1}});store=await MongoStore.connect(mongo.getUri('haatgo_integration'));});
afterAll(async()=>{await store?.close();await mongo?.stop();});
it('commits facts and outbox atomically, rolls back failures and survives reconnect',async()=>{
  const service=new Service(store);const initial=(await store.read()).products[0].sellingPricePaise;
  await expect(store.mutate(state=>{state.products[0].sellingPricePaise=1;service.event(state,'catalogue.changed',state.products[0].id,{version:2},['public']);throw new Error('injected failure');})).rejects.toThrow('injected');
  expect((await store.read()).products[0].sellingPricePaise).toBe(initial);expect((await store.read()).events).toHaveLength(0);
  await store.mutate(state=>{state.products[0].sellingPricePaise=3000;service.event(state,'catalogue.changed',state.products[0].id,{version:2},['public']);});
  const other=await MongoStore.connect(mongo.getUri('haatgo_integration'));expect((await other.read()).products[0].sellingPricePaise).toBe(3000);expect((await other.read()).events).toHaveLength(1);await other.close();
});
it('serializes simultaneous Mongo writes without losing either update',async()=>{await Promise.all([store.mutate(s=>{s.products[0].maxQuantity+=1;}),store.mutate(s=>{s.products[0].maxQuantity+=1;})]);expect((await store.read()).products[0].maxQuantity).toBe(22);});
