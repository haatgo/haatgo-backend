import {expect,it} from 'vitest';import request from 'supertest';import {createApp} from '../../src/app.js';import {MemoryStore} from '../../src/store.js';
it('catalogue operators can select existing markets and zones but cannot change operations settings',async()=>{
  const store=new MemoryStore(),api=request(createApp(store).app);
  const login=(await api.post('/v1/admin/auth/login').send({email:'admin@haatgo.local',password:'HaatGo-demo-2026!'})).body.data;
  const headers={Authorization:'Bearer '+login.accessToken};await store.mutate(s=>{s.users[0].adminRole='catalogue';});
  await api.get('/v1/admin/markets').set(headers).expect(200);await api.get('/v1/admin/zones').set(headers).expect(200);
  await api.patch('/v1/admin/products/prd_1').set(headers).send({expectedVersion:1,reason:'Sonarpur catalogue eligibility',zoneIds:['zone_sonarpur'],marketIds:['mkt_sonarpur']}).expect(200);
  await api.patch('/v1/admin/zones/zone_sonarpur').set(headers).send({expectedVersion:1,reason:'Unauthorized settings edit',active:false}).expect(403);
  await api.patch('/v1/admin/products/prd_1').set(headers).send({expectedVersion:2,reason:'Unknown relation',zoneIds:['missing']}).expect(404);
});
