import {readFile,writeFile} from 'node:fs/promises';
import {z} from 'zod';
import {schemas,requestSchemas} from '../src/contracts.js';
import {transitions} from '../src/domain.js';

const inventory=JSON.parse(await readFile('contracts/api-inventory.json','utf8'));
const output:Record<string,any>={
  openapi:'3.1.0',
  info:{title:'HaatGo local development API',version:'0.3.0',description:'Dummy providers. Full production acceptance and remaining detailed response schemas are pending.'},
  servers:[{url:'http://localhost:4000'}],paths:{},
  components:{securitySchemes:{BearerAuth:{type:'http',scheme:'bearer'}},schemas:Object.fromEntries(Object.entries(schemas).map(([name,schema])=>[name,z.toJSONSchema(schema,{target:'openapi-3.0'})]))}
};
for(const op of inventory.operations){
  const path=op.path.replace(/:(\w+)/g,'{$1}');
  const route=op.method+' '+op.path;
  let schema:Record<string,unknown>={};
  if(['/v1/me','/v1/partner/me'].includes(op.path))schema={$ref:'#/components/schemas/User'};
  if(op.path==='/v1/cart')schema={$ref:'#/components/schemas/Cart'};
  if(op.path==='/v1/checkout/quote')schema={$ref:'#/components/schemas/Quote'};
  if((op.path==='/v1/orders'&&op.method==='POST')||['/v1/orders/:publicOrderId','/v1/admin/orders/:id'].includes(op.path))schema={$ref:'#/components/schemas/Order'};
  if(op.path==='/v1/admin/media/images')schema=op.method==='POST'?{$ref:'#/components/schemas/MediaAsset'}:{type:'object',required:['items','nextCursor','total'],properties:{items:{type:'array',items:{$ref:'#/components/schemas/MediaAsset'}},nextCursor:{type:['string','null']},total:{type:'integer'}}};
  const parameters:unknown[]=[...op.path.matchAll(/:(\w+)/g)].map(match=>({name:match[1],in:'path',required:true,schema:{type:'string'}}));
  if(op.method==='GET')parameters.push(...['cursor','limit'].map(name=>({name,in:'query',required:false,schema:{type:'string'}})));
  const request=requestSchemas[route];
  const operation:Record<string,unknown>={
    operationId:op.operationId,summary:op.purpose,'x-role':op.role,
    security:op.role.startsWith('Public')||route==='POST /v1/admin/auth/login'?[]:[{BearerAuth:[]}],
    parameters,
    responses:{
      '200':{description:'Success',content:{'application/json':{schema:{type:'object',required:['data','meta'],properties:{data:schema,meta:{type:'object',properties:{requestId:{type:'string'},serverTime:{type:'string',format:'date-time'}}}}}}}},
      '400':{description:'Invalid request'},'401':{description:'Session required or expired'},'403':{description:'Role/ownership denied'},
      '404':{description:'Not found or not visible'},'409':{description:'Version/idempotency/assignment conflict'},'422':{description:'Policy rejected'},'429':{description:'Rate limit'}
    }
  };
  if(request)operation.requestBody={required:true,content:{'application/json':{schema:z.toJSONSchema(request,{target:'openapi-3.0'})}}};
  output.paths[path]??={};output.paths[path][op.method.toLowerCase()]=operation;op.status=op.path==='/v1/admin/media/images'?'implemented-cloudinary':'implemented-local-dummy';
}
inventory.version='0.3.0';inventory.status='local dummy handlers; production and full response-schema acceptance pending';
await writeFile('contracts/api-inventory.json',JSON.stringify(inventory,null,2)+'\n');
await writeFile('contracts/openapi.json',JSON.stringify(output,null,2)+'\n');
await writeFile('contracts/event-schema.json',JSON.stringify(z.toJSONSchema(schemas.Event),null,2)+'\n');
const domain=JSON.parse(await readFile('contracts/domain-contract.json','utf8'));
domain.orderTransitions=Object.entries(transitions).flatMap(([source,targets])=>targets.map(target=>[source,target]));
domain.status='Local dummy-provider baseline; production business approvals and full schema acceptance pending';
domain.localDecisions=['Partner assignment and acceptance commit atomically and expose partner_accepted','Driver compensation is snapshotted at offer/assignment','Quote binds address, cart, zone and market versions','Coupon discounts prorate when items are removed; delivery fee follows the current documented local policy'];
domain.ambiguitiesToResolve=['Production cancellation, empty-order delivery fee, reimbursement/funding and refund policies require operational sign-off','Payment and COD use separate state dimensions; existing clients retain enum-compatible response shapes'];
await writeFile('contracts/domain-contract.json',JSON.stringify(domain,null,2)+'\n');
console.log(`Generated OpenAPI for ${inventory.operations.length} operations and event schema.`);
