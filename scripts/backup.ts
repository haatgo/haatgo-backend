import { writeFile } from 'node:fs/promises';
import {resolve} from 'node:path';
import { config } from '../src/config.js';
import {MongoStore} from '../src/store.js';
import {createBackup} from '../src/infrastructure/backup.js';
const store=await MongoStore.connect(config.MONGODB_URI);
try{const path=resolve(process.argv[2]??'.runtime/backup.json');await writeFile(path,JSON.stringify(await createBackup(store)),{mode:0o600,flag:'wx'});console.log('Created database and private receipt backup:',path);}finally{await store.close();}
