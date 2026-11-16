import { z } from 'zod';
const id=z.string().min(1).max(200),version=z.number().int().positive(),money=z.number().int().nonnegative();
const meta={id,version,createdAt:z.iso.datetime(),updatedAt:z.iso.datetime()};
const address=z.object({...meta,userId:id,label:z.string(),house:z.string(),street:z.string(),landmark:z.string(),pincode:z.string().regex(/^\d{6}$/),instructions:z.string(),deleted:z.boolean()});
const line=z.object({productId:id,quantity:z.number().int().positive(),lineId:id,name:z.string(),unit:z.string(),unitSellingPricePaise:money,lineSellingTotalPaise:money,fulfillmentState:z.enum(['requested','bought','missing','removed','substituted']),actualCostPaise:money.optional()});
const pricing=z.object({itemsPaise:money,deliveryFeePaise:money,discountPaise:money,taxPaise:money,handlingFeePaise:money,totalPaise:money,currency:z.literal('INR')});
export const schemas={
  MediaAsset:z.object({...meta,kind:z.enum(['products','categories','sections']),publicId:id,url:z.url(),width:z.number().int().positive(),height:z.number().int().positive(),format:z.string(),bytes:z.number().int().positive(),folder:z.string(),filename:z.string(),uploadedBy:id}),
  Category:z.object({...meta,name:z.string(),slug:z.string(),active:z.boolean(),icon:z.string().optional(),iconAssetId:z.string().optional()}),
  Product:z.object({...meta,name:z.string(),slug:z.string(),categoryId:id,unit:z.string(),packSize:z.number().positive(),sellingPricePaise:money,maxQuantity:z.number().int().positive(),active:z.boolean(),aliases:z.array(z.string()),zoneIds:z.array(id).optional(),marketIds:z.array(id).optional(),image:z.string(),imageAssetId:z.string().optional(),description:z.string()}),
  Address:address,Cart:z.object({lines:z.array(z.object({productId:id,quantity:z.number().int().positive()})),revision:z.number().int().nonnegative()}).passthrough(),
  Quote:z.object({...meta,userId:id,addressId:id,zoneId:id,marketId:id,lines:z.array(line),pricing,cartRevision:z.number().int(),expiresAt:z.iso.datetime(),promotionId:id.optional()}).passthrough(),
  Order:z.object({...meta,publicOrderId:id,customerId:id,marketId:id,zoneId:id,addressSnapshot:address,lines:z.array(line),pricing,quoteId:id,status:z.enum(['placed','assignment_pending','partner_assigned','partner_accepted','traveling_to_market','shopping','shopping_review','purchased','out_for_delivery','delivered','cancelled','exception']),assignedPartnerId:id.optional(),payment:z.object({method:z.enum(['COD','ONLINE']),status:z.string()}),lastEventSequence:z.number().int().nonnegative(),receiptId:id.optional(),amountCollectedPaise:money.optional()}).passthrough(),
  User:z.object({...meta,phone:z.string(),name:z.string(),role:z.enum(['customer','partner','admin']),approval:z.enum(['pending','approved','suspended']),availability:z.enum(['online','offline','busy']),adminRole:z.enum(['super-admin','catalogue','dispatcher','support','finance']).optional(),location:z.tuple([z.number(),z.number()]).optional(),lastHeartbeatAt:z.string().optional(),activeOrderId:id.optional()}),
  Event:z.object({eventId:id,aggregateType:z.string(),aggregateId:id,seq:z.number().int().positive(),type:z.enum(['order.stage_changed','catalogue.changed','serviceability.changed','cart.changed','partner.offer_created','partner.offer_expired','order.substitution_requested','order.substitution_decided','order.receipt_confirmed','payment.status_changed','finance.ledger_changed']),occurredAt:z.iso.datetime(),payload:z.record(z.string(),z.unknown())})
};
export const requestSchemas:Record<string,z.ZodType>={
  'POST /v1/auth/otp/send':z.object({phone:z.string().regex(/^[6-9]\d{9}$/),role:z.enum(['customer','partner']).default('customer')}),
  'POST /v1/auth/otp/verify':z.object({challengeId:id,otp:z.string().regex(/^\d{6}$/)}),
  'POST /v1/auth/token/refresh':z.object({refreshToken:z.string().optional(),role:z.enum(['customer','partner','admin']).default('customer')}),
  'POST /v1/admin/auth/login':z.object({email:z.email(),password:z.string()}),
  'POST /v1/devices':z.object({token:id,platform:z.enum(['android','web'])}),
  'POST /v1/addresses':address.omit({id:true,version:true,createdAt:true,updatedAt:true,userId:true,deleted:true}),
  'PATCH /v1/addresses/:id':address.omit({id:true,version:true,createdAt:true,updatedAt:true,userId:true,deleted:true}).extend({expectedVersion:version}),
  'PUT /v1/cart':schemas.Cart.omit({revision:true}).extend({expectedRevision:z.number().int().nonnegative()}),
  'POST /v1/checkout/quote':z.object({addressId:id,couponCode:z.string().max(40).optional()}),
  'POST /v1/orders':z.object({quoteId:id,addressId:id,paymentMethod:z.enum(['COD','ONLINE'])}),
  'POST /v1/orders/:id/cancel':z.object({expectedVersion:version,reason:z.string().min(1)}),
  'POST /v1/orders/:id/substitutions/:requestId/decision':z.object({expectedVersion:version,decision:z.enum(['approve','reject'])}),
  'POST /v1/payments/gateway-order':z.object({orderId:id}),
  'POST /v1/payments/verify-callback':z.object({paymentId:id,dummyResult:z.enum(['success','failure'])}),
  'POST /v1/webhooks/payment':z.object({providerEventId:id,paymentId:id}),
  'POST /v1/support/tickets':z.object({orderId:id.optional(),issue:z.string().min(1).max(500)}),
  'PUT /v1/partner/availability':z.object({availability:z.enum(['online','offline']),location:z.tuple([z.number(),z.number()]).optional()}),
  'POST /v1/partner/heartbeat':z.object({location:z.tuple([z.number(),z.number()])}),
  'PATCH /v1/partner/orders/:id/shopping-items/:lineId':z.object({expectedVersion:version,fulfillmentState:z.enum(['bought','missing']),actualCostPaise:money.optional()}),
  'POST /v1/partner/orders/:id/substitutions':z.object({expectedVersion:version,lineId:id,productId:id}),
  'POST /v1/partner/orders/:id/receipt/upload-intent':z.object({mimeType:z.enum(['image/png','image/jpeg'])}),
  'POST /v1/partner/orders/:id/receipt/confirm':z.object({expectedVersion:version,receiptId:id,totalPurchaseCostPaise:money}),
  'POST /v1/partner/orders/:id/delivery/verify':z.object({expectedVersion:version,otp:z.string().regex(/^\d{6}$/),amountCollectedPaise:money.default(0)}),
  'POST /v1/partner/orders/:id/incident':z.object({expectedVersion:version,reason:z.string().min(1)}),
  'POST /v1/admin/orders/:id/resolve-exception':z.object({expectedVersion:version,reason:z.string().min(1),outcome:z.enum(['resume-shopping','cancel'])}),
  'POST /v1/admin/finance/refunds':z.object({orderId:id,amountPaise:money.positive(),reason:z.string().min(1)}),
  'PATCH /v1/admin/support/tickets/:id':z.object({expectedVersion:version,status:z.enum(['open','in_progress','resolved']),resolution:z.string().min(1)})
};
for(const suffix of ['arrive-market','shopping/complete','out-for-delivery'])requestSchemas[`POST /v1/partner/orders/:id/${suffix}`]=z.object({expectedVersion:version});
for(const suffix of ['assign','reassign'])requestSchemas[`POST /v1/admin/orders/:id/${suffix}`]=z.object({expectedVersion:version,partnerId:id,reason:z.string().min(1)});
for(const suffix of ['approve','suspend'])requestSchemas[`POST /v1/admin/partners/:id/${suffix}`]=z.object({expectedVersion:version,reason:z.string().min(1)});
const category=z.object({name:z.string().min(1),slug:z.string().min(1),active:z.boolean(),icon:z.string().max(1000).optional(),iconAssetId:z.string().max(200).optional()});
const market=z.object({name:z.string().min(1),address:z.string().min(1),location:z.tuple([z.number(),z.number()]),active:z.boolean(),openHour:z.number().int().min(0).max(23),closeHour:z.number().int().min(1).max(24)});
const zone=z.object({name:z.string().min(1),pincodes:z.array(z.string().regex(/^\d{6}$/)).min(1),marketId:id,active:z.boolean(),deliveryFeePaise:money,partnerEarningPaise:money,codEnabled:z.boolean()});
for(const [name,schema] of Object.entries({products:schemas.Product.omit({id:true,version:true,createdAt:true,updatedAt:true}),categories:category,markets:market,zones:zone})){requestSchemas[`POST /v1/admin/${name}`]=schema;requestSchemas[`PATCH /v1/admin/${name}/:id`]=schema.partial().extend({expectedVersion:version,reason:z.string().min(1)});}

requestSchemas['PATCH /v1/me']=z.object({name:z.string().min(1).max(500)});
requestSchemas['PUT /v1/uploads/:id']=z.object({base64:z.string().min(12).max(2800000)});
requestSchemas['PATCH /v1/admin/finance/entries/:id']=z.object({expectedVersion:version,status:z.enum(['approved','paid','remitted','refunded','disputed']),reason:z.string().min(1)});
const promotion=z.object({code:z.string().regex(/^[A-Z0-9]{3,30}$/),title:z.string().min(1),percent:z.number().int().min(1).max(100),maxDiscountPaise:money,minItemsPaise:money,active:z.boolean(),startsAt:z.iso.datetime(),endsAt:z.iso.datetime(),perUserLimit:z.number().int().min(1).max(100)});
requestSchemas['POST /v1/admin/promotions']=promotion;requestSchemas['PATCH /v1/admin/promotions/:id']=promotion.partial().extend({expectedVersion:version,reason:z.string().min(1)});

requestSchemas['POST /v1/admin/media/images']=z.object({kind:z.enum(['products','categories','sections']),filename:z.string().min(1).max(180),mimeType:z.enum(['image/png','image/jpeg','image/webp']),base64:z.string().max(2800000)}).strict();
