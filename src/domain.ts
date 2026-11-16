import catalogueAssets from './assets/catalogue-assets.json' with {type:'json'};
import { createHash, randomUUID } from 'node:crypto';

export type Role = 'customer' | 'partner' | 'admin';
export type AdminRole = 'super-admin' | 'catalogue' | 'dispatcher' | 'support' | 'finance';
export interface Entity { id: string; version: number; createdAt: string; updatedAt: string }
export interface User extends Entity { phone: string; name: string; role: Role; approval: 'pending' | 'approved' | 'suspended'; availability: 'offline' | 'online' | 'busy'; lastHeartbeatAt?: string; location?: [number, number]; activeOrderId?: string; adminRole?: AdminRole }
export interface Session extends Entity { userId: string; accessHash: string; refreshHash: string; expiresAt: string; refreshExpiresAt: string }
export interface Challenge extends Entity { phone: string; role: 'customer' | 'partner'; attempts: number; expiresAt: string }
export interface Category extends Entity { name: string; slug: string; active: boolean; icon?:string;iconAssetId?:string }
export interface Product extends Entity { name: string; slug: string; categoryId: string; unit: string; packSize: number; sellingPricePaise: number; maxQuantity: number; active: boolean; aliases: string[];zoneIds?:string[];marketIds?:string[]; image: string;imageAssetId?:string; description: string }
export interface Market extends Entity { name: string; address: string; location: [number, number]; active: boolean; openHour: number; closeHour: number }
export interface Zone extends Entity { name: string; pincodes: string[]; marketId: string; active: boolean; deliveryFeePaise: number; partnerEarningPaise: number; codEnabled: boolean }
export interface Address extends Entity { userId: string; label: string; house: string; street: string; landmark: string; pincode: string; instructions: string; deleted: boolean }
export interface CartLine { productId: string; quantity: number }
export interface Cart extends Entity { userId: string; lines: CartLine[]; revision: number }
export interface OrderLine extends CartLine { lineId: string; name: string; unit: string; unitSellingPricePaise: number; lineSellingTotalPaise: number; fulfillmentState: 'requested' | 'bought' | 'missing' | 'removed' | 'substituted'; actualCostPaise?: number }
export interface Pricing { itemsPaise: number; deliveryFeePaise: number; discountPaise: number; taxPaise: number; handlingFeePaise: number; totalPaise: number; currency: 'INR' }
export interface Quote extends Entity { userId: string; addressId: string; addressVersion:number;zoneId: string;zoneVersion:number; marketId: string;marketVersion:number; lines: OrderLine[]; pricing: Pricing; cartRevision: number; expiresAt: string; promotionId?:string }
export type OrderStatus = 'placed' | 'assignment_pending' | 'partner_assigned' | 'partner_accepted' | 'traveling_to_market' | 'shopping' | 'shopping_review' | 'purchased' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'exception';
export const transitions:Record<OrderStatus,readonly OrderStatus[]>={placed:['assignment_pending','cancelled'],assignment_pending:['partner_accepted','cancelled'],partner_assigned:['partner_accepted','assignment_pending','exception'],partner_accepted:['traveling_to_market','shopping','assignment_pending','exception'],traveling_to_market:['shopping','exception'],shopping:['shopping_review','purchased','exception'],shopping_review:['shopping','purchased','exception'],purchased:['out_for_delivery','exception'],out_for_delivery:['delivered','exception'],exception:['shopping','cancelled'],delivered:[],cancelled:[]};
export interface Order extends Entity { publicOrderId: string; customerId: string; marketId: string; zoneId: string; addressSnapshot: Address; lines: OrderLine[]; pricing: Pricing; quoteId: string; status: OrderStatus; assignedPartnerId?: string;partnerEarningPaise?:number; payment: { method: 'COD' | 'ONLINE'; status: string }; lastEventSequence: number; receiptId?: string; amountCollectedPaise?: number }
export interface Offer extends Entity { orderId: string; partnerId: string; earningPaise:number;status: 'pending' | 'accepted' | 'declined' | 'expired'; expiresAt: string }
export interface Substitution extends Entity { orderId: string; lineId: string; productId: string; name: string; proposedPricePaise: number; status: 'pending' | 'approved' | 'rejected' | 'expired'; expiresAt: string }
export interface Receipt extends Entity { orderId: string; partnerId: string; mimeType: string; objectKey: string; uploaded: boolean; confirmed: boolean; bytes?: string; totalPurchaseCostPaise?: number }
export interface Payment extends Entity { orderId: string; amountPaise: number; status: string; provider: 'dummy'; providerOrderId: string }
export interface Ledger extends Entity { orderId: string; partnerId?: string; account?:string; purpose: string; debitPaise: number; creditPaise: number; amountPaise: number; status: string; groupId: string }
export interface Ticket extends Entity { orderId?: string; userId: string; issue: string; status: string; resolution?: string }
export interface Audit extends Entity { actorId: string; action: string; resourceId: string; reason: string; before?: unknown; after?: unknown }
export interface DomainEvent extends Entity { eventId: string; aggregateType: string; aggregateId: string; seq: number; type: string; payload: Record<string, unknown>; audience: string[]; published: boolean; occurredAt: string }
export interface Idempotency extends Entity { actorId: string; route: string; key: string; requestHash: string; result: unknown }
export interface Device extends Entity { userId: string; tokenHash: string; platform: string }
export interface Webhook extends Entity { providerEventId: string }
export interface Promotion extends Entity { code:string; title:string; percent:number; maxDiscountPaise:number; minItemsPaise:number; active:boolean; startsAt:string; endsAt:string; perUserLimit:number }
export interface PromotionUse extends Entity { promotionId:string; userId:string; orderId:string }
export interface MediaAsset extends Entity {kind:'products'|'categories'|'sections';publicId:string;url:string;width:number;height:number;format:string;bytes:number;folder:string;filename:string;uploadedBy:string}
export interface State {media:MediaAsset[]; users: User[]; sessions: Session[]; challenges: Challenge[]; categories: Category[]; products: Product[]; markets: Market[]; zones: Zone[]; addresses: Address[]; carts: Cart[]; quotes: Quote[]; orders: Order[]; offers: Offer[]; substitutions: Substitution[]; receipts: Receipt[]; payments: Payment[]; ledger: Ledger[]; tickets: Ticket[]; audit: Audit[]; events: DomainEvent[]; idempotency: Idempotency[]; devices: Device[]; webhooks: Webhook[];promotions:Promotion[];promotionUses:PromotionUse[] }
export const collections: (keyof State)[] = ['media','users','sessions','challenges','categories','products','markets','zones','addresses','carts','quotes','orders','offers','substitutions','receipts','payments','ledger','tickets','audit','events','idempotency','devices','webhooks','promotions','promotionUses'];
export const blank = (): State => Object.fromEntries(collections.map(name => [name, []])) as unknown as State;
export const now = () => new Date().toISOString();
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function entity(prefix: string): Entity { const at = now(); return { id: `${prefix}_${randomUUID()}`, version: 1, createdAt: at, updatedAt: at }; }
export function touch<T extends Entity>(value: T): T { value.version++; value.updatedAt = now(); return value; }
export class Fault extends Error { constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); } }
export function requireThat(condition: unknown, code: string, message: string, status = 422): asserts condition { if (!condition) throw new Fault(status, code, message); }
export function find<T extends Entity>(rows: T[], id: string): T { const result = rows.find(row => row.id === id); if (!result) throw new Fault(404, 'NOT_FOUND', 'Resource not found'); return result; }
export function expected(entity: Entity, version: number) { if (entity.version !== version) throw new Fault(409, 'VERSION_CONFLICT', 'This resource changed. Refresh and review.', { currentVersion: entity.version }); }
export function seed(): State {
  const state = blank();state.media=structuredClone(catalogueAssets.media) as MediaAsset[];
  state.categories = ['Vegetables','Fruits','Staples','Dairy & Eggs'].map((name, i) => ({ ...entity('cat'), id: `cat_${i+1}`, name, slug: name.toLowerCase().replaceAll(/[^a-z]+/g,'-'), active: true }));
  for(const category of state.categories){const asset=(catalogueAssets.categories as Record<string,{url:string;id:string}>)[category.id];if(asset){category.icon=asset.url;category.iconAssetId=asset.id;}}
  const products: [string, string, number, string, string, string[]][] = [
    ['Tomato (Desi)','cat_1',2800,'500 g','🍅',['tomato','tamatar']], ['Potato','cat_1',3500,'1 kg','🥔',['alu','aloo']],
    ['Onion','cat_1',4000,'1 kg','🧅',['peyaj','pyaaz']], ['Coriander','cat_1',1500,'1 bunch','🌿',['dhaniya']],
    ['Banana','cat_2',4500,'6 pieces','🍌',['kola']], ['Apple','cat_2',12000,'500 g','🍎',[]],
    ['Rice','cat_3',6800,'1 kg','🌾',['chal']], ['Mustard oil','cat_3',15500,'1 litre','🫙',[]],
    ['Milk','cat_4',3000,'500 ml','🥛',[]], ['Farm eggs','cat_4',4800,'6 pieces','🥚',[]],
    ['Carrot','cat_1',3800,'500 g','🥕',[]], ['Brinjal','cat_1',3200,'500 g','🍆',['begun']]
  ];
  state.products = products.map(([name,categoryId,price,unit,image,aliases], i) => ({ ...entity('prd'), id:`prd_${i+1}`, name, slug: name.toLowerCase().replaceAll(/[^a-z]+/g,'-'), categoryId, sellingPricePaise: price, unit, packSize: 1, maxQuantity: 20, active: true, aliases, image, description: 'Sourced from your local market. Availability is confirmed during shopping.' }));
  for(const product of state.products){const asset=(catalogueAssets.products as Record<string,{url:string;id:string}>)[product.id];if(asset){product.image=asset.url;product.imageAssetId=asset.id;}}
  state.markets.push({ ...entity('mkt'), id:'mkt_sonarpur', name:'Sonarpur Local Market', address:'Sonarpur, Kolkata', location:[88.3915,22.4428], active:true, openHour:0, closeHour:24 });
  state.zones.push({ ...entity('zone'), id:'zone_sonarpur', name:'Sonarpur pilot', pincodes:['700150','700149','700151'], marketId:'mkt_sonarpur', active:true, deliveryFeePaise:2900, partnerEarningPaise:4000, codEnabled:true });
  state.users.push({ ...entity('usr'), id:'admin_demo', phone:'9000000000', name:'Demo administrator', role:'admin', adminRole:'super-admin', approval:'approved', availability:'offline' });
  state.promotions.push({...entity('promo'),id:'promo_welcome',code:'WELCOME10',title:'A welcome to your local market',percent:10,maxDiscountPaise:5000,minItemsPaise:10000,active:true,startsAt:'2026-01-01T00:00:00.000Z',endsAt:'2027-12-31T23:59:59.000Z',perUserLimit:1});
  return state;
}
