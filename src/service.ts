import { randomBytes } from 'node:crypto';
import { config } from './config.js';
import { entity, expected, Fault, find, hash, now, requireThat, touch, transitions, type Address, type CartLine, type DomainEvent, type Order, type Pricing, type State, type User } from './domain.js';
import type { Store } from './store.js';

export class Service {
  constructor(public store: Store) {}
  event(state: State, type: string, aggregateId: string, payload: Record<string, unknown>, audience: string[]) {
    const order = state.orders.find(row=>row.id===aggregateId);
    const seq = order ? ++order.lastEventSequence : state.events.filter(row=>row.aggregateId===aggregateId).length+1;
    const e: DomainEvent = { ...entity('evt'), eventId:'', aggregateType:order?'order':'resource', aggregateId, seq, type, payload, audience:[...new Set(audience)], published:false, occurredAt:now() }; e.eventId=e.id; state.events.push(e); return e;
  }
  audit(state: State, actor: User, action: string, resourceId: string, reason: string, before?: unknown, after?: unknown) { state.audit.push({...entity('aud'),actorId:actor.id,action,resourceId,reason,before,after}); }
  owned(state: State, id: string, user: User) {
    if(user.role==='admin')requireThat(['super-admin','dispatcher','support','finance'].includes(user.adminRole??''),'FORBIDDEN','Your role cannot inspect orders',403);
    const order = state.orders.find(row=>row.id===id || row.publicOrderId===id);
    if (!order || !(user.role==='admin' || order.customerId===user.id || order.assignedPartnerId===user.id)) throw new Fault(404,'NOT_FOUND','Order not found');
    return order;
  }
  assigned(state: State, id: string, user: User) { const o = this.owned(state,id,user); requireThat(user.role==='partner' && o.assignedPartnerId===user.id && user.approval==='approved','NOT_ASSIGNED','Only the assigned approved partner may act',403); return o; }
  access(state: State, token: string) { const session = state.sessions.find(row=>row.accessHash===hash(token) && row.expiresAt>now()); if (!session) throw new Fault(401,'SESSION_EXPIRED','Please log in again'); return find(state.users,session.userId); }
  issue(state: State, user: User) {
    const accessToken=randomBytes(32).toString('hex'), refreshToken=randomBytes(32).toString('hex');
    state.sessions.push({...entity('sess'),userId:user.id,accessHash:hash(accessToken),refreshHash:hash(refreshToken),expiresAt:new Date(Date.now()+15*60_000).toISOString(),refreshExpiresAt:new Date(Date.now()+7*86400_000).toISOString()});
    return {accessToken,refreshToken,user,expiresIn:900};
  }
  async sendOtp(phone: string, role: 'customer'|'partner') { return this.store.mutate(state=>{
    requireThat(state.challenges.filter(row=>row.phone===phone && Date.now()-Date.parse(row.createdAt)<60_000).length<5,'RATE_LIMITED','Wait before requesting another code',429);
    const challenge={...entity('otp'),phone,role,attempts:0,expiresAt:new Date(Date.now()+300_000).toISOString()};state.challenges.push(challenge);
    return {challengeId:challenge.id,expiresIn:300,provider:'dummy'};
  }); }
  async verifyOtp(challengeId: string, otp: string) {
    const result=await this.store.mutate(state=>{
      const c=state.challenges.find(row=>row.id===challengeId);
      if(!c || c.expiresAt<now() || c.attempts>=5) return {failure:true as const};
      c.attempts++; if(otp!==config.DUMMY_OTP) return {failure:true as const};
      c.expiresAt=now();
      let user=state.users.find(row=>row.phone===c.phone && row.role===c.role);
      if(!user) {user={...entity('usr'),phone:c.phone,name:c.role==='partner'?'Delivery partner':'Customer',role:c.role,approval:c.role==='partner'?'pending':'approved',availability:'offline'};state.users.push(user);}
      return this.issue(state,user);
    });
    if ('failure' in result) throw new Fault(401,'INVALID_OTP','Invalid or expired code'); return result;
  }
  zone(state: State, pincode: string) {
    const zone=state.zones.find(row=>row.active&&row.pincodes.includes(pincode));
    if(!zone) throw new Fault(422,'UNSERVICEABLE','We do not deliver to this address yet');
    const market=find(state.markets,zone.marketId);const hour=Number(new Intl.DateTimeFormat('en',{hour:'numeric',hourCycle:'h23',timeZone:'Asia/Kolkata'}).format(new Date()));
    requireThat(market.active && hour>=market.openHour && hour<market.closeHour,'MARKET_CLOSED','The market is currently closed');return {zone,market};
  }
  lines(state: State, lines: CartLine[]) {
    requireThat(lines.length>0&&lines.length<=100,'EMPTY_CART','Add items to your cart');
    requireThat(new Set(lines.map(line=>line.productId)).size===lines.length,'DUPLICATE_LINE','Products must appear only once');
    return lines.map(line=>{const p=find(state.products,line.productId);requireThat(p.active&&Number.isInteger(line.quantity)&&line.quantity>0&&line.quantity<=p.maxQuantity,'INVALID_QUANTITY','An item is unavailable or quantity is out of range');return {...line,lineId:entity('line').id,name:p.name,unit:p.unit,unitSellingPricePaise:p.sellingPricePaise,lineSellingTotalPaise:p.sellingPricePaise*line.quantity,fulfillmentState:'requested' as const};});
  }
  promotion(state:State,userId:string,code:string,itemsPaise:number){const p=state.promotions.find(p=>p.code===code.toUpperCase()&&p.active&&p.startsAt<=now()&&p.endsAt>now());requireThat(p,'INVALID_PROMOTION','This promotion is unavailable');requireThat(itemsPaise>=p.minItemsPaise,'PROMOTION_MINIMUM','Your basket does not meet the promotion minimum');requireThat(state.promotionUses.filter(use=>use.promotionId===p.id&&use.userId===userId).length<p.perUserLimit,'PROMOTION_LIMIT','You have already used this promotion');return p;}
  async quote(user: User, addressId: string, couponCode?:string) { return this.store.mutate(state=>{
    const address=find(state.addresses,addressId);requireThat(address.userId===user.id&&!address.deleted,'NOT_FOUND','Address not found',404);
    const {zone,market}=this.zone(state,address.pincode);const cart=state.carts.find(row=>row.userId===user.id);requireThat(cart,'EMPTY_CART','Your cart is empty');
    const lines=this.lines(state,cart.lines);for(const line of lines){const product=find(state.products,line.productId);requireThat((!product.zoneIds?.length||product.zoneIds.includes(zone.id))&&(!product.marketIds?.length||product.marketIds.includes(market.id))&&state.categories.some(c=>c.id===product.categoryId&&c.active),'PRODUCT_UNAVAILABLE_IN_ZONE','An item is not currently orderable in this delivery area');}const itemsPaise=lines.reduce((total,line)=>total+line.lineSellingTotalPaise,0);
    const promotion=couponCode?this.promotion(state,user.id,couponCode,itemsPaise):undefined;const discountPaise=promotion?Math.min(Math.floor(itemsPaise*promotion.percent/100),promotion.maxDiscountPaise,itemsPaise):0;
    const pricing:Pricing={itemsPaise,deliveryFeePaise:zone.deliveryFeePaise,discountPaise,taxPaise:0,handlingFeePaise:0,totalPaise:itemsPaise+zone.deliveryFeePaise-discountPaise,currency:'INR'};
    const quote={...entity('quote'),userId:user.id,addressId,addressVersion:address.version,zoneId:zone.id,zoneVersion:zone.version,marketId:market.id,marketVersion:market.version,lines,pricing,cartRevision:cart.revision,expiresAt:new Date(Date.now()+300_000).toISOString(),promotionId:promotion?.id};state.quotes.push(quote);return quote;
  }); }
  idempotent<T>(state: State,user: User,route: string,key: string,payload: unknown,fn:()=>T):T {
    requireThat(key&&key.length>=8&&key.length<=128,'IDEMPOTENCY_REQUIRED','Provide an Idempotency-Key of 8–128 characters',400);
    const requestHash=hash(JSON.stringify(payload));const previous=state.idempotency.find(row=>row.actorId===user.id&&row.route===route&&row.key===key);
    if(previous){requireThat(previous.requestHash===requestHash,'IDEMPOTENCY_CONFLICT','This key was used with a different request',409);return previous.result as T;}
    const result=fn();state.idempotency.push({...entity('idem'),actorId:user.id,route,key,requestHash,result:structuredClone(result)});return result;
  }
  dispatch(state: State,order: Order) {
    if(order.status!=='assignment_pending'||order.assignedPartnerId) return;
    if(state.offers.some(o=>o.orderId===order.id&&o.status==='pending'&&o.expiresAt>now()))return;
    const rejected=new Set(state.offers.filter(o=>o.orderId===order.id).map(o=>o.partnerId));
    const market=find(state.markets,order.marketId);
    const eligible=state.users.filter(u=>u.role==='partner'&&u.approval==='approved'&&u.availability==='online'&&!u.activeOrderId&&u.lastHeartbeatAt&&Date.now()-Date.parse(u.lastHeartbeatAt)<120_000&&!rejected.has(u.id)&&!state.offers.some(offer=>offer.partnerId===u.id&&offer.status==='pending'&&offer.expiresAt>now()));
    const distance=(u:User)=>u.location?Math.hypot((u.location[0]-market.location[0])*102,(u.location[1]-market.location[1])*111):Infinity;
    const partner=eligible.filter(u=>distance(u)<=5).sort((a,b)=>distance(a)-distance(b))[0];if(!partner)return;
    const offer={...entity('offer'),orderId:order.id,partnerId:partner.id,earningPaise:find(state.zones,order.zoneId).partnerEarningPaise,status:'pending' as const,expiresAt:new Date(Date.now()+30_000).toISOString()};state.offers.push(offer);
    this.event(state,'partner.offer_created',order.id,{offerId:offer.id,expiresAt:offer.expiresAt},[`partner:${partner.id}`,'admin']);
  }
  expirePartnerOffers(state:State,partnerId:string){for(const offer of state.offers.filter(o=>o.partnerId===partnerId&&o.status==='pending')){offer.status='expired';touch(offer);this.event(state,'partner.offer_expired',offer.orderId,{offerId:offer.id},[`partner:${partnerId}`,'admin']);}}
  async createOrder(user:User,body:{quoteId:string;addressId:string;paymentMethod:'COD'|'ONLINE'},key:string) {return this.store.mutate(state=>this.idempotent(state,user,'create-order',key,body,()=>{
    const quote=find(state.quotes,body.quoteId);requireThat(quote.userId===user.id&&quote.addressId===body.addressId,'INVALID_QUOTE','Review your quote again');requireThat(quote.expiresAt>now(),'QUOTE_EXPIRED','Your quote expired. Review a fresh quote.',409);
    const address=find(state.addresses,body.addressId);requireThat(address.userId===user.id&&!address.deleted,'NOT_FOUND','Address not found',404);const {zone,market}=this.zone(state,address.pincode);requireThat(quote.zoneId===zone.id&&quote.marketId===market.id&&(!quote.addressVersion||quote.addressVersion===address.version)&&(!quote.zoneVersion||quote.zoneVersion===zone.version)&&(!quote.marketVersion||quote.marketVersion===market.version),'QUOTE_CONTEXT_CHANGED','Address or market settings changed. Review a fresh quote.',409);
    const cart=state.carts.find(row=>row.userId===user.id);requireThat(cart?.revision===quote.cartRevision,'CART_CHANGED','Your cart changed. Review a fresh quote.',409);
    const changedLines=quote.lines.flatMap(line=>{const p=state.products.find(p=>p.id===line.productId);return !p||!p.active||!state.categories.some(c=>c.id===p.categoryId&&c.active)||(p.zoneIds?.length&&!p.zoneIds.includes(zone.id))||(p.marketIds?.length&&!p.marketIds.includes(market.id))||line.quantity>p.maxQuantity||p.sellingPricePaise!==line.unitSellingPricePaise?[{productId:line.productId,previousPaise:line.unitSellingPricePaise,currentPaise:p?.sellingPricePaise,available:p?.active??false}]:[];});if(changedLines.length)throw new Fault(409,'PRICE_CHANGED','Prices changed. Review a fresh quote.',{changedLines,requiresQuote:true});
    requireThat(zone.deliveryFeePaise===quote.pricing.deliveryFeePaise,'PRICE_CHANGED','Delivery fee changed. Review a fresh quote.',409);
    if(quote.promotionId){const p=find(state.promotions,quote.promotionId);this.promotion(state,user.id,p.code,quote.pricing.itemsPaise);requireThat(Math.min(Math.floor(quote.pricing.itemsPaise*p.percent/100),p.maxDiscountPaise,quote.pricing.itemsPaise)===quote.pricing.discountPaise,'PROMOTION_CHANGED','Promotion changed. Review a fresh quote.',409);}
    requireThat(body.paymentMethod!=='COD'||zone.codEnabled,'COD_UNAVAILABLE','COD is not available here');requireThat(body.paymentMethod!=='ONLINE'||config.ONLINE_PAYMENTS_ENABLED==='true','PAYMENT_DISABLED','Online payment is unavailable');
    const order:Order={...entity('ord'),publicOrderId:`HG-${Date.now()}-${Math.floor(Math.random()*10000)}`,customerId:user.id,marketId:quote.marketId,zoneId:quote.zoneId,addressSnapshot:structuredClone(address),lines:structuredClone(quote.lines),pricing:structuredClone(quote.pricing),quoteId:quote.id,status:body.paymentMethod==='COD'?'assignment_pending':'placed',payment:{method:body.paymentMethod,status:body.paymentMethod==='COD'?'to_collect':'pending'},lastEventSequence:0};state.orders.push(order);this.ledger(state,order,'ORDER_CHARGE',order.pricing.totalPaise,'posted');
    if(quote.promotionId)state.promotionUses.push({...entity('promo_use'),promotionId:quote.promotionId,userId:user.id,orderId:order.id});
    if(cart){cart.lines=[];cart.revision++;touch(cart);}
    this.event(state,'order.stage_changed',order.id,{status:order.status,version:order.version},[`customer:${user.id}`,'admin']);this.event(state,'cart.changed',user.id,{revision:cart?.revision},[`customer:${user.id}`]);this.dispatch(state,order);return order;
  }));}
  stage(state:State,order:Order,status:Order['status'],actor:User){const before=order.status;requireThat(transitions[before].includes(status),'ILLEGAL_TRANSITION',`Cannot move an order from ${before} to ${status}`,409);order.status=status;touch(order);this.audit(state,actor,'order.transition',order.id,`${before} -> ${status}`,before,status);this.event(state,'order.stage_changed',order.id,{status,version:order.version},[`customer:${order.customerId}`,`partner:${order.assignedPartnerId}`,'admin']);}
  claim(state:State,order:Order,partner:User,actor:User,reason:string){requireThat(partner.role==='partner'&&partner.approval==='approved'&&partner.availability==='online'&&!partner.activeOrderId,'PARTNER_BUSY','Partner is unavailable',409);requireThat(!order.assignedPartnerId&&order.status==='assignment_pending','ALREADY_ASSIGNED','Order already assigned',409);order.assignedPartnerId=partner.id;order.partnerEarningPaise=state.offers.find(offer=>offer.orderId===order.id&&offer.partnerId===partner.id&&offer.status==='pending')?.earningPaise??find(state.zones,order.zoneId).partnerEarningPaise;partner.activeOrderId=order.id;partner.availability='busy';touch(partner);this.stage(state,order,'partner_accepted',actor);this.audit(state,actor,'assignment.claim',order.id,reason);for(const offer of state.offers.filter(o=>(o.orderId===order.id||o.partnerId===partner.id)&&o.status==='pending')){offer.status=offer.orderId===order.id&&offer.partnerId===partner.id?'accepted':'expired';touch(offer);}}
  ledger(state:State,order:Order,purpose:string,amountPaise:number,status:string){
    requireThat(Number.isSafeInteger(amountPaise)&&amountPaise>=0,'INVALID_AMOUNT','Invalid money amount');const groupId=`${order.id}:${purpose}`;if(state.ledger.some(row=>row.groupId===groupId))return;
    if(purpose.includes('REFUND')){const collected=state.ledger.filter(l=>l.orderId===order.id&&['ONLINE_COLLECTION','COD_COLLECTION'].includes(l.purpose)).reduce((sum,l)=>sum+l.amountPaise,0);const reserved=state.ledger.filter(l=>l.orderId===order.id&&l.purpose.includes('REFUND')&&!l.purpose.endsWith('_COUNTERPART')).reduce((sum,l)=>sum+l.amountPaise,0);requireThat(amountPaise+reserved<=collected,'REFUND_LIMIT','Refunds cannot exceed confirmed collections');}
    const accounts:Record<string,[string,string]>={COD_COLLECTION:['PARTNER_CASH_IN_HAND','CUSTOMER_RECEIVABLE'],ONLINE_COLLECTION:['GATEWAY_RECEIVABLE','CUSTOMER_RECEIVABLE'],PARTNER_EARNING:['DELIVERY_EXPENSE','PARTNER_PAYABLE'],PURCHASE_REIMBURSEMENT:['MARKET_PURCHASE_EXPENSE','PARTNER_REIMBURSEMENT_PAYABLE'],ORDER_CHARGE:['CUSTOMER_RECEIVABLE','DEFERRED_ORDER_REVENUE'],ORDER_REVENUE:['DEFERRED_ORDER_REVENUE','ORDER_REVENUE']};
    const [debitAccount,creditAccount]=accounts[purpose]??(purpose.startsWith('ORDER_ADJUSTMENT_')?['DEFERRED_ORDER_REVENUE','CUSTOMER_RECEIVABLE']:purpose.includes('REFUND')?[/^(REMOVAL_|SUB_|CANCELLATION_|LATE_PAYMENT_)/.test(purpose)?'CUSTOMER_RECEIVABLE':'CUSTOMER_REFUND_EXPENSE','CUSTOMER_REFUND_PAYABLE']:['SETTLEMENT_CLEARING','SETTLEMENT_PAYABLE']);
    const partnerId=/^(COD_|PARTNER_|PURCHASE_|PAYOUT_|REIMBURSE_)/.test(purpose)?order.assignedPartnerId:undefined;
    state.ledger.push({...entity('led'),orderId:order.id,partnerId,account:debitAccount,purpose,amountPaise,debitPaise:amountPaise,creditPaise:0,status,groupId},{...entity('led'),orderId:order.id,partnerId,account:creditAccount,purpose:purpose+'_COUNTERPART',amountPaise,debitPaise:0,creditPaise:amountPaise,status,groupId});
  }
  finalizePayment(state:State,paymentId:string){const payment=find(state.payments,paymentId),order=find(state.orders,payment.orderId);if(payment.status==='paid')return payment;requireThat(['placed','cancelled'].includes(order.status),'PAYMENT_STATE','This order no longer accepts payment',409);payment.status='paid';touch(payment);this.ledger(state,order,'ONLINE_COLLECTION',payment.amountPaise,'paid');if(order.status==='cancelled'){order.payment.status='refund_pending';touch(order);this.ledger(state,order,'LATE_PAYMENT_REFUND',payment.amountPaise,'pending');}else{order.payment.status='paid';this.stage(state,order,'assignment_pending',state.users.find(u=>u.id==='admin_demo')!);this.dispatch(state,order);}this.event(state,'payment.status_changed',order.id,{paymentId:payment.id,status:order.payment.status},[`customer:${order.customerId}`,'admin']);return payment;}
  async sweep(){return this.store.mutate(state=>{let changed=0;for(const offer of state.offers){if(offer.status==='pending'&&offer.expiresAt<=now()){offer.status='expired';touch(offer);changed++;this.event(state,'partner.offer_expired',offer.orderId,{offerId:offer.id},[`partner:${offer.partnerId}`,'admin']);}}
    for(const proposal of state.substitutions)if(proposal.status==='pending'&&proposal.expiresAt<=now()){proposal.status='expired';const order=find(state.orders,proposal.orderId);const line=order.lines.find(row=>row.lineId===proposal.lineId)!;this.removeLine(state,order,line.lineId);changed++;this.event(state,'order.substitution_decided',order.id,{proposalId:proposal.id,status:'expired'},[`customer:${order.customerId}`,`partner:${order.assignedPartnerId}`,'admin']);}
    for(const payment of state.payments)if(payment.status==='pending'&&Date.now()-Date.parse(payment.createdAt)>3000){this.finalizePayment(state,payment.id);changed++;}
    for(const order of state.orders)this.dispatch(state,order);return {changed};});}
  reprice(state:State,order:Order){const original=find(state.quotes,order.quoteId).pricing;const itemsPaise=order.lines.filter(l=>l.fulfillmentState!=='removed').reduce((sum,l)=>sum+l.lineSellingTotalPaise,0);const discountPaise=Math.min(itemsPaise,Math.floor(original.discountPaise*itemsPaise/Math.max(original.itemsPaise,1)));order.pricing={...order.pricing,itemsPaise,discountPaise,totalPaise:itemsPaise+order.pricing.deliveryFeePaise+order.pricing.handlingFeePaise+order.pricing.taxPaise-discountPaise};}
  removeLine(state:State,order:Order,lineId:string){const before=order.pricing.totalPaise,line=order.lines.find(row=>row.lineId===lineId)!;line.fulfillmentState='removed';this.reprice(state,order);const adjustment=before-order.pricing.totalPaise;this.ledger(state,order,`ORDER_ADJUSTMENT_${lineId}`,adjustment,'posted');touch(order);if(order.payment.method==='ONLINE'&&['paid','partially_refunded','refund_pending'].includes(order.payment.status)){this.ledger(state,order,`REMOVAL_REFUND_${lineId}`,adjustment,'pending');order.payment.status='refund_pending';}}
  publicOrder(state:State,order:Order,user:User){return {...order,...(user.role==='customer'?{partnerEarningPaise:undefined,lines:order.lines.map(({actualCostPaise,...line})=>line)}:{}),market:find(state.markets,order.marketId),partner:order.assignedPartnerId?{id:order.assignedPartnerId,name:find(state.users,order.assignedPartnerId).name}:undefined,tracking:order.status==='out_for_delivery'&&order.assignedPartnerId?{location:find(state.users,order.assignedPartnerId).location,lastHeartbeatAt:find(state.users,order.assignedPartnerId).lastHeartbeatAt,provider:'dummy-foreground-position'}:undefined,substitutions:state.substitutions.filter(row=>row.orderId===order.id),receipt:user.role==='admin'||user.role==='partner'?state.receipts.filter(row=>row.orderId===order.id).map(({bytes,...rest})=>rest):undefined};}
}
