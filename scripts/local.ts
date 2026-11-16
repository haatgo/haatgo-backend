import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { mkdir,readdir,readFile } from 'node:fs/promises';
import { resolve,relative } from 'node:path';
import { spawn,type ChildProcess } from 'node:child_process';
import {createHash} from 'node:crypto';
// A real local mongod replica set; data stays in this repo's ignored .runtime directory.
const dbPath=resolve('.runtime/mongo');await mkdir(dbPath,{recursive:true});
const mongo=await MongoMemoryReplSet.create({binary:{version:'8.0.12'},instanceOpts:[{dbPath,port:27027}],replSet:{name:'rs0',count:1,storageEngine:'wiredTiger'}});
let child:ChildProcess,closing=false,restarting=false,timer:ReturnType<typeof setTimeout>|undefined;
function launch(){
  const processHandle=spawn(process.execPath,['--import','tsx','src/server.ts'],{stdio:'inherit',env:{...process.env,MONGODB_URI:mongo.getUri('haatgo_local')}});
  child=processHandle;
  processHandle.once('exit',code=>{if(child===processHandle&&!closing&&!restarting)void close(code??1);});
}
async function restart(){
  if(closing||restarting)return;restarting=true;
  console.log('Backend source changed; restarting API.');
  await new Promise<void>(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',()=>resolve());child.kill();});
  if(!closing)launch();restarting=false;
}
// OneDrive/Windows may emit file notifications for reads and hydration. Compare
// bytes instead: only real source/config changes may interrupt the API process.
async function sourceDigest(){
  const hash=createHash('sha256');
  async function walk(directory:string){
    for(const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
      if(entry.name==='generated')continue;const path=resolve(directory,entry.name);
      if(entry.isDirectory())await walk(path);
      else if(/\.(ts|json)$/.test(entry.name)){hash.update(relative(process.cwd(),path));hash.update(await readFile(path));}
    }
  }
  for(const folder of ['src','worker'])await walk(resolve(folder));return hash.digest('hex');
}
let fingerprint=await sourceDigest(),scanning=false;
const sourceTimer=setInterval(async()=>{if(closing||scanning)return;scanning=true;try{const next=await sourceDigest();if(next!==fingerprint){fingerprint=next;await restart();}}catch{console.error('Source watch could not read a file; keeping the API running.');}finally{scanning=false;}},1000);
async function close(code=0){if(closing)return;closing=true;if(timer)clearTimeout(timer);clearInterval(sourceTimer);child?.kill();await mongo.stop({doCleanup:false});process.exit(code);}
for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>void close());
launch();
