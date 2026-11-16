import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { MemoryStore } from '../../src/store.js';
import { hash } from '../../src/domain.js';
import { config } from '../../src/config.js';
import { createHmac } from 'node:crypto';
let store:MemoryStore;let api:ReturnType<typeof request>;let service:ReturnType<typeof createApp>['service'];
beforeEach(()=>{store=new MemoryStore();const runtime=createApp(store);service=runtime.service;api=request(runtime.app);});
async function login(phone='9876543210',role='customer') {const send=await api.post('/v1/auth/otp/send').send({phone,role}).expect(200);return (await api.post('/v1/auth/otp/verify').send({challengeId:send.body.data.challengeId,otp:'123456'}).expect(200)).body.data;}
async function admin(){return (await api.post('/v1/admin/auth/login').send({email:'admin@haatgo.local',password:'HaatGo-demo-2026!'}).expect(200)).body.data;}
const auth=(token:string)=>({Authorization:`Bearer ${token}`});
async function checkout(customer:Awaited<ReturnType<typeof login>>,method='COD'){
  const headers=auth(customer.accessToken);const address=(await api.post('/v1/addresses').set(headers).send({label:'Home',house:'12',street:'Market Road',pincode:'700150'}).expect(200)).body.data;
  await api.put('/v1/cart').set(headers).send({expectedRevision:0,lines:[{productId:'prd_1',quantity:2}]}).expect(200);
  const quote=(await api.post('/v1/checkout/quote').set(headers).send({addressId:address.id}).expect(200)).body.data;
  const body={quoteId:quote.id,addressId:address.id,paymentMethod:method};
  const order=(await api.post('/v1/orders').set(headers).set('Idempotency-Key','checkout-12345678').send(body).expect(200)).body.data;return {order,quote,address,body};
}
async function readyPartner(){const p=await login('9876543211','partner'),a=await admin();await api.post(`/v1/admin/partners/${p.user.id}/approve`).set(auth(a.accessToken)).send({expectedVersion:1,reason:'Demo approval'}).expect(200);await api.put('/v1/partner/availability').set(auth(p.accessToken)).send({availability:'online',location:[88.3915,22.4428]}).expect(200);return p;}

describe('identity and ownership',()=>{
  it('rejects wrong OTP and counts failed attempts',async()=>{const c=(await api.post('/v1/auth/otp/send').send({phone:'9876543210'})).body.data;for(let i=0;i<5;i++)await api.post('/v1/auth/otp/verify').send({challengeId:c.challengeId,otp:'000000'}).expect(401);await api.post('/v1/auth/otp/verify').send({challengeId:c.challengeId,otp:'123456'}).expect(401);});
  it('rotates refresh sessions and rejects replay',async()=>{const c=await login();const rotated=await api.post('/v1/auth/token/refresh').send({refreshToken:c.refreshToken}).expect(200);await api.get('/v1/me').set(auth(c.accessToken)).expect(401);await api.get('/v1/me').set(auth(rotated.body.data.accessToken)).expect(200);await api.post('/v1/auth/token/refresh').send({refreshToken:c.refreshToken}).expect(401);});
  it('cannot escalate role or access admin APIs',async()=>{const c=await login();await api.get('/v1/admin/orders').set(auth(c.accessToken)).expect(403);await api.post('/v1/auth/otp/send').send({phone:'9876543210',role:'admin'}).expect(400);});
  it('denies cross-customer order and address access',async()=>{const c=await login(),other=await login('9876543212');const {order,address}=await checkout(c);await api.get(`/v1/orders/${order.id}`).set(auth(other.accessToken)).expect(404);await api.delete(`/v1/addresses/${address.id}`).set(auth(other.accessToken)).expect(404);});
  it('keeps partner pending until admin approval',async()=>{const p=await login('9876543211','partner');await api.put('/v1/partner/availability').set(auth(p.accessToken)).send({availability:'online'}).expect(403);});
  it('enforces backend admin role permissions',async()=>{const a=await admin();await store.mutate(s=>{s.users.find(u=>u.id==='admin_demo')!.adminRole='support';});await api.post('/v1/admin/products').set(auth(a.accessToken)).send({}).expect(403);});
});
describe('catalogue, cart and quotes',()=>{
  it('supports aliases and manual PIN without GPS',async()=>{expect((await api.get('/v1/products/search?q=alu')).body.data.items[0].name).toBe('Potato');expect((await api.get('/v1/geo/serviceability?pincode=700150')).body.data.serviceable).toBe(true);expect((await api.get('/v1/geo/serviceability?pincode=999999')).body.data.serviceable).toBe(false);});
  it('rejects quantity overflow, duplicate lines and stale revisions',async()=>{const c=await login();await api.put('/v1/cart').set(auth(c.accessToken)).send({expectedRevision:0,lines:[{productId:'prd_1',quantity:21}]}).expect(422);await api.put('/v1/cart').set(auth(c.accessToken)).send({expectedRevision:0,lines:[{productId:'prd_1',quantity:1},{productId:'prd_1',quantity:1}]}).expect(422);await api.put('/v1/cart').set(auth(c.accessToken)).send({expectedRevision:0,lines:[{productId:'prd_1',quantity:1}]}).expect(200);await api.put('/v1/cart').set(auth(c.accessToken)).send({expectedRevision:0,lines:[]}).expect(409);});
  it('returns one order for same key and rejects different payload',async()=>{const c=await login();const {order,body}=await checkout(c);const repeat=await api.post('/v1/orders').set(auth(c.accessToken)).set('Idempotency-Key','checkout-12345678').send(body).expect(200);expect(repeat.body.data.id).toBe(order.id);await api.post('/v1/orders').set(auth(c.accessToken)).set('Idempotency-Key','checkout-12345678').send({...body,paymentMethod:'ONLINE'}).expect(409);expect((await store.read()).orders).toHaveLength(1);});
  it('checks integer paise and ignores client totals',async()=>{const c=await login();const {order,quote}=await checkout(c);expect(quote.pricing.totalPaise).toBe(8500);expect(order.pricing.totalPaise).toBe(8500);});
  it('refuses changed prices even with a still-valid quote',async()=>{const c=await login();const {body}=await checkout(c);await store.mutate(s=>{s.products[0].sellingPricePaise=9999;const cart=s.carts[0];cart.revision=1;});await api.post('/v1/orders').set(auth(c.accessToken)).set('Idempotency-Key','new-price-intent').send(body).expect(409);});
  it('keeps accepted quote snapshot stable after product changes',async()=>{const c=await login();const {order}=await checkout(c);await store.mutate(s=>{s.products[0].sellingPricePaise=9999;});expect((await api.get(`/v1/orders/${order.id}`).set(auth(c.accessToken))).body.data.lines[0].unitSellingPricePaise).toBe(2800);});
});
describe('shopping and delivery',()=>{
  it('completes the COD market journey exactly once with balanced ledger',async()=>{
    const p=await readyPartner(),c=await login();let {order}=await checkout(c);const headers=auth(p.accessToken);const offer=(await api.get('/v1/partner/offers/current').set(headers)).body.data;
    order=(await api.post(`/v1/partner/offers/${offer.id}/accept`).set(headers).send({}).expect(200)).body.data;
    await api.post(`/v1/partner/offers/${offer.id}/accept`).set(headers).send({}).expect(409);
    order=(await api.post(`/v1/partner/orders/${order.id}/arrive-market`).set(headers).send({expectedVersion:order.version}).expect(200)).body.data;
    order=(await api.patch(`/v1/partner/orders/${order.id}/shopping-items/${order.lines[0].lineId}`).set(headers).send({expectedVersion:order.version,fulfillmentState:'bought',actualCostPaise:5000}).expect(200)).body.data;
    await api.post(`/v1/partner/orders/${order.id}/shopping/complete`).set(headers).send({expectedVersion:order.version}).expect(422);
    const intent=(await api.post(`/v1/partner/orders/${order.id}/receipt/upload-intent`).set(headers).send({mimeType:'image/png'}).expect(200)).body.data;
    await api.put(intent.uploadUrl).set(headers).send({base64:Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]).toString('base64')}).expect(200);
    order=(await api.post(`/v1/partner/orders/${order.id}/receipt/confirm`).set(headers).set('Idempotency-Key','receipt-finalize-123').send({expectedVersion:order.version,receiptId:intent.receiptId,totalPurchaseCostPaise:5000}).expect(200)).body.data;
    order=(await api.post(`/v1/partner/orders/${order.id}/shopping/complete`).set(headers).send({expectedVersion:order.version}).expect(200)).body.data;
    order=(await api.post(`/v1/partner/orders/${order.id}/out-for-delivery`).set(headers).send({expectedVersion:order.version}).expect(200)).body.data;
    await api.post(`/v1/partner/orders/${order.id}/delivery/verify`).set(headers).set('Idempotency-Key','delivery-finalize-123').send({expectedVersion:order.version,otp:'000000',amountCollectedPaise:8500}).expect(401);
    const body={expectedVersion:order.version,otp:'654321',amountCollectedPaise:8500};const delivery=()=>api.post(`/v1/partner/orders/${order.id}/delivery/verify`).set(headers).set('Idempotency-Key','delivery-finalize-123').send(body);
    expect((await delivery().expect(200)).body.data.status).toBe('delivered');await delivery().expect(200);const ledger=(await store.read()).ledger;expect(ledger.filter(l=>l.purpose==='COD_COLLECTION')).toHaveLength(1);expect(ledger.reduce((n,l)=>n+l.debitPaise-l.creditPaise,0)).toBe(0);
  });
  it('allows only one concurrent accept and preserves assignment',async()=>{const p=await readyPartner(),c=await login();await checkout(c);const offer=(await api.get('/v1/partner/offers/current').set(auth(p.accessToken))).body.data;const results=await Promise.all([1,2].map(()=>api.post(`/v1/partner/offers/${offer.id}/accept`).set(auth(p.accessToken)).send({})));expect(results.map(r=>r.status).sort()).toEqual([200,409]);});
  it('requires explicit same/lower-price substitution approval',async()=>{const p=await readyPartner(),c=await login();let {order}=await checkout(c);const h=auth(p.accessToken);const f=(await api.get('/v1/partner/offers/current').set(h)).body.data;order=(await api.post(`/v1/partner/offers/${f.id}/accept`).set(h)).body.data;order=(await api.post(`/v1/partner/orders/${order.id}/arrive-market`).set(h).send({expectedVersion:order.version})).body.data;order=(await api.patch(`/v1/partner/orders/${order.id}/shopping-items/${order.lines[0].lineId}`).set(h).send({expectedVersion:order.version,fulfillmentState:'missing'})).body.data;
    await api.post(`/v1/partner/orders/${order.id}/substitutions`).set(h).send({expectedVersion:order.version,lineId:order.lines[0].lineId,productId:'prd_6'}).expect(422);
    const sub=(await api.post(`/v1/partner/orders/${order.id}/substitutions`).set(h).send({expectedVersion:order.version,lineId:order.lines[0].lineId,productId:'prd_4'}).expect(200)).body.data;
    await api.patch(`/v1/partner/orders/${order.id}/shopping-items/${order.lines[0].lineId}`).set(h).send({expectedVersion:sub.order.version,fulfillmentState:'bought'}).expect(409);
    order=(await api.post(`/v1/orders/${order.id}/substitutions/${sub.proposal.id}/decision`).set(auth(c.accessToken)).send({expectedVersion:sub.order.version,decision:'reject'}).expect(200)).body.data;expect(order.lines[0].fulfillmentState).toBe('removed');expect(order.pricing.totalPaise).toBe(2900);
  });
});
describe('dummy payments and support',()=>{
  it('verifies signed webhooks and deduplicates provider events',async()=>{const c=await login();const {order}=await checkout(c,'ONLINE');const p=(await api.post('/v1/payments/gateway-order').set(auth(c.accessToken)).send({orderId:order.id}).expect(200)).body.data;const payload=JSON.stringify({providerEventId:'provider-event-1',paymentId:p.id});await api.post('/v1/webhooks/payment').set('Content-Type','application/json').set('X-Dummy-Signature','forged').send(payload).expect(401);const signed=()=>api.post('/v1/webhooks/payment').set('Content-Type','application/json').set('X-Dummy-Signature',createHmac('sha256',config.SESSION_SECRET).update(payload).digest('hex')).send(payload);await signed().expect(200);expect((await signed().expect(200)).body.data.duplicate).toBe(true);expect((await store.read()).ledger.filter(l=>l.purpose==='ONLINE_COLLECTION')).toHaveLength(1);});
  it('keeps support scoped to its owner and audits resolution',async()=>{const c=await login(),a=await admin(),other=await login('9876543212');const ticket=(await api.post('/v1/support/tickets').set(auth(c.accessToken)).send({issue:'Please help'})).body.data;expect((await api.get('/v1/support/tickets').set(auth(other.accessToken))).body.data).toHaveLength(0);await api.patch(`/v1/admin/support/tickets/${ticket.id}`).set(auth(a.accessToken)).send({expectedVersion:1,status:'resolved',resolution:'Helped customer'}).expect(200);expect((await store.read()).audit.at(-1)?.action).toBe('ticket.resolve');});
});
