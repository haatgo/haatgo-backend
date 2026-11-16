const base=process.env.API_BASE_URL??'http://localhost:4000';
for(const path of ['/health/live','/health/ready','/v1/config','/v1/catalog/home','/v1/products/search?q=alu','/v1/geo/serviceability?pincode=700150']){
  const response=await fetch(base+path);if(!response.ok)throw new Error(`${path}: ${response.status}`);const json=await response.json();if(!json.data)throw new Error(`${path}: missing envelope`);console.log(`PASS ${path}`);
}
const forbidden=await fetch(base+'/v1/admin/orders');if(forbidden.status!==401)throw new Error('Unprotected admin API');console.log('PASS admin API requires login');
export {};
