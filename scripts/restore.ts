import {MongoClient} from 'mongodb';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {restoreBackup} from '../src/infrastructure/backup.js';

const [file,targetUri,privateDirectory]=process.argv.slice(2);
if(!file||!targetUri||!privateDirectory)throw new Error('Usage: npm run db:restore -- <backup.json> <fresh-target-mongodb-uri> <private-receipt-directory>');
const client=await new MongoClient(targetUri).connect();
try{console.log(await restoreBackup(client.db(),JSON.parse(await readFile(file,'utf8')),resolve(privateDirectory)));}finally{await client.close();}
