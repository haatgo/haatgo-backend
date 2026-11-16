import {mkdir,readFile,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {requireThat} from '../domain.js';
const root=resolve('.runtime/private-receipts');
function target(key:string,directory=root){requireThat(/^[a-f0-9-]{36}$/.test(key),'INVALID_OBJECT_KEY','Invalid private object reference',400);return resolve(directory,key);}
export async function savePrivateReceipt(key:string,bytes:Buffer,directory=root){await mkdir(directory,{recursive:true});await writeFile(target(key,directory),bytes,{mode:0o600});}
export async function readPrivateReceipt(key:string){return readFile(target(key));}
