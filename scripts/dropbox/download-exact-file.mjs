import fs from 'node:fs';
import path from 'node:path';
import { refreshDropboxAccessToken } from './oauth.mjs';

function argument(name){const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:undefined;}
const remotePath=argument('--path');
const destination=argument('--destination');
if(!remotePath||!destination)throw new Error('Usage: node scripts/dropbox/download-exact-file.mjs --path </Dropbox/path/file> --destination <file>');
if(!remotePath.startsWith('/Santos do Dia/02_Dados_Eclesiasticos/'))throw new Error('Remote path must stay inside the canonical ecclesiastical Dropbox root.');
const token=await refreshDropboxAccessToken();
const response=await fetch('https://content.dropboxapi.com/2/files/download',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Dropbox-API-Arg':JSON.stringify({path:remotePath})},signal:AbortSignal.timeout(120000)});
if(!response.ok){const body=await response.text();throw new Error(`Dropbox exact download failed for ${remotePath} (HTTP ${response.status}): ${body.slice(0,400)}`);}
const bytes=Buffer.from(await response.arrayBuffer());
if(bytes.length>50*1024*1024)throw new Error('Exact product evidence downloader refuses files larger than 50 MB.');
const output=path.resolve(destination);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,bytes,{mode:0o600});
console.log(JSON.stringify({downloaded:true,path:remotePath,destination,size:bytes.length},null,2));
