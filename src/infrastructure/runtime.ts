import {Redis} from 'ioredis';
import {config} from '../config.js';
import {Fault,hash} from '../domain.js';

export class Infrastructure {
  private buckets=new Map<string,{count:number;until:number}>();
  readonly redis:Redis|undefined;
  constructor(){
    if(config.QUEUE_MODE==='redis'){
      this.redis=new Redis(config.REDIS_URL,{lazyConnect:true,maxRetriesPerRequest:1,enableOfflineQueue:false,connectTimeout:2000});
      this.redis.on('error',()=>{});void this.redis.connect().catch(()=>{});
    }
  }
  async rateLimit(scope:string,identity:string,max=30,windowMs=60000){
    const key=config.REDIS_NAMESPACE+':rate:'+scope+':'+hash(identity);
    if(this.redis){
      try{
        const count=Number(await this.redis.eval("local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end; return count",1,key,windowMs));
        if(count>max)throw new Fault(429,'RATE_LIMITED','Too many attempts. Try again shortly.');
      }catch(error){if(error instanceof Fault)throw error;throw new Fault(503,'LIMITER_UNAVAILABLE','Authentication is temporarily unavailable. Please retry.');}
      return;
    }
    const at=Date.now(),bucket=this.buckets.get(key);
    if(!bucket||bucket.until<at)this.buckets.set(key,{count:1,until:at+windowMs});
    else if(++bucket.count>max)throw new Fault(429,'RATE_LIMITED','Too many attempts. Try again shortly.');
    if(this.buckets.size>10000)for(const [k,v] of this.buckets)if(v.until<at)this.buckets.delete(k);
  }
  async catalogue<T>(load:()=>T):Promise<T>{
    if(this.redis){try{const cached=await this.redis.get(config.REDIS_NAMESPACE+':cache:catalogue');if(cached)return JSON.parse(cached) as T;}catch{/* Public reads fall back to authoritative Mongo state. */}}
    const data=load();if(this.redis)try{await this.redis.set(config.REDIS_NAMESPACE+':cache:catalogue',JSON.stringify(data),'EX',30);}catch{}
    return data;
  }
  async invalidateCatalogue(){if(this.redis)await this.redis.del(config.REDIS_NAMESPACE+':cache:catalogue');}
  async health(){if(!this.redis)return {mode:'dummy',ready:true};try{return {mode:'redis',ready:await this.redis.ping()==='PONG'};}catch{return {mode:'redis',ready:false};}}
  async close(){this.redis?.disconnect();}
}
