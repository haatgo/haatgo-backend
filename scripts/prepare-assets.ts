import sharp from 'sharp';
import {readdir,writeFile} from 'node:fs/promises';
import {resolve,extname,basename} from 'node:path';
const root=process.argv[2];if(!root)throw new Error('Pass the source asset directory explicitly');
for(const folder of ['products','categories','sections','heroes'])for(const file of await readdir(resolve(root,folder))){
  if(!['.png','.svg'].includes(extname(file)))continue;
  const target=resolve(root,folder,basename(file,extname(file))+'.webp');
  await sharp(resolve(root,folder,file)).resize({width:folder==='categories'?512:1600,height:folder==='categories'?512:1600,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toFile(target);
  console.log(folder+'/'+basename(target));
}
