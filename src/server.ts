import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { MongoStore } from './store.js';
import { createApp } from './app.js';
import { config } from './config.js';
import { startRenderKeepAlive } from './render-keep-alive.js';

export async function start(uri=config.MONGODB_URI,port=config.PORT) {
  const store=await MongoStore.connect(uri);const {app,service,infrastructure}=createApp(store);const server=createServer(app);
  const io=new Server(server,{cors:{origin:[config.CUSTOMER_WEB_ORIGIN,config.ADMIN_WEB_ORIGIN],credentials:true}});
  io.use(async(socket,next)=>{try{const token=socket.handshake.auth.token as string|undefined;if(!token){socket.data.public=true;return next();}socket.data.user=service.access(await store.read(),token);next();}catch{next(new Error('Unauthorized'));}});
  io.on('connection',socket=>{socket.join('public');const user=socket.data.user;if(user)socket.join(user.role==='admin'?'admin':`${user.role}:${user.id}`);socket.on('subscribe:order',async(id,ack)=>{try{if(!user)throw new Error('Unauthorized');const current=service.access(await store.read(),socket.handshake.auth.token);const order=service.owned(await store.read(),String(id),current);socket.join(`order:${order.id}`);ack?.({ok:true});}catch{ack?.({ok:false});}});});
  let pumping=false;
  const timer=setInterval(async()=>{if(pumping)return;pumping=true;try{if(config.QUEUE_MODE==='dummy')await service.sweep();const state=await store.read();for(const socket of io.sockets.sockets.values()){if(socket.handshake.auth.token){try{service.access(state,String(socket.handshake.auth.token));}catch{socket.disconnect(true);}}}for(const event of state.events.filter(e=>!e.published)){
    if(['catalogue.changed','serviceability.changed'].includes(event.type))await infrastructure.invalidateCatalogue();const {audience,published,id,createdAt,updatedAt,version,...payload}=event;
    for(const room of audience)io.to(room).emit('domain:event',payload);
    await store.mutate(draft=>{const e=draft.events.find(e=>e.id===event.id);if(e)e.published=true;});
  }}catch(error){console.error('outbox processing failed',error instanceof Error?error.message:'unknown');}finally{pumping=false;}},2000);
  await new Promise<void>(resolve=>server.listen(port,'0.0.0.0',resolve));
  const stopRenderKeepAlive = startRenderKeepAlive();
  console.log(`HaatGo API ready: http://localhost:${port} (dummy OTP ${config.DUMMY_OTP}; queue=${config.QUEUE_MODE})`);
  const close=async()=>{stopRenderKeepAlive?.();clearInterval(timer);await new Promise<void>(resolve=>io.close(()=>resolve()));await infrastructure.close();await store.close();};
  return {server,store,service,close};
}
if(process.argv[1]?.replaceAll('\\','/').match(/\/server\.(ts|js)$/)){start().then(runtime=>{for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>void runtime.close().then(()=>process.exit(0)));}).catch(error=>{console.error(error);process.exitCode=1;});}
