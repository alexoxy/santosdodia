#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const token=process.env.GITHUB_TOKEN;
const repository=process.env.GITHUB_REPOSITORY;
const server=process.env.GITHUB_API_URL??'https://api.github.com';
const branch='automation/live-stream-refresh';
const generatedPath='data/generated/live-streams.json';

function run(command,args,options={}){
 const output=execFileSync(command,args,{encoding:'utf8',stdio:options.capture?'pipe':'inherit',...options});
 return typeof output==='string'?output.trim():'';
}

async function api(path,{method='GET',body}={}){
 const response=await fetch(`${server}${path}`,{
  method,
  headers:{Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'santosdodia-live-curator','Content-Type':'application/json'},
  body:body?JSON.stringify(body):undefined,
 });
 const text=await response.text();
 if(!response.ok)throw new Error(`GitHub API ${method} ${path} failed (${response.status}): ${text.slice(0,800)}`);
 return text?JSON.parse(text):null;
}

async function graphql(query,variables){
 const response=await fetch('https://api.github.com/graphql',{
  method:'POST',
  headers:{Authorization:`Bearer ${token}`,'User-Agent':'santosdodia-live-curator','Content-Type':'application/json'},
  body:JSON.stringify({query,variables}),
 });
 const payload=await response.json();
 if(!response.ok||payload.errors?.length)throw new Error(`GitHub GraphQL failed: ${JSON.stringify(payload.errors??payload).slice(0,1200)}`);
 return payload.data;
}

async function main(){
 if(!token||!repository)throw new Error('GITHUB_TOKEN and GITHUB_REPOSITORY are required.');
 const changed=run('git',['diff','--name-only'],{capture:true}).split(/\r?\n/u).filter(Boolean);
 if(changed.length===0){console.log('No generated live registry change.');return}
 if(changed.length!==1||changed[0]!==generatedPath)throw new Error(`Refusing non-generated changes: ${changed.join(', ')}`);

 run('git',['config','user.name','santosdodia-live-curator[bot]']);
 run('git',['config','user.email','santosdodia-live-curator[bot]@users.noreply.github.com']);
 run('git',['checkout','-B',branch]);
 run('git',['add','--',generatedPath]);
 run('git',['commit','-m','chore(live): refresh verified official streams']);
 run('git',['push','--force-with-lease','origin',`HEAD:${branch}`]);

 const [owner]=repository.split('/');
 const open=await api(`/repos/${repository}/pulls?state=open&base=main&head=${encodeURIComponent(`${owner}:${branch}`)}`);
 let pr=open[0];
 if(!pr){
  pr=await api(`/repos/${repository}/pulls`,{method:'POST',body:{
   title:'chore(live): refresh verified official streams',
   head:branch,
   base:'main',
   body:'Autonomous generated-only refresh of verified official Christian live/media endpoints. Discovery and health evidence are archived in Dropbox; this PR changes only `data/generated/live-streams.json`. It is eligible for auto-merge only after repository-required checks pass.',
  }});
 }else{
  await api(`/repos/${repository}/pulls/${pr.number}`,{method:'PATCH',body:{
   title:'chore(live): refresh verified official streams',
   body:'Autonomous generated-only refresh of verified official Christian live/media endpoints. Discovery and health evidence are archived in Dropbox; this PR changes only `data/generated/live-streams.json`. It is eligible for auto-merge only after repository-required checks pass.',
  }});
 }

 try{
  await graphql(`mutation($pullRequestId:ID!){enablePullRequestAutoMerge(input:{pullRequestId:$pullRequestId,mergeMethod:SQUASH}){pullRequest{number autoMergeRequest{enabledAt}}}}`,{pullRequestId:pr.node_id});
  console.log(`Live registry PR #${pr.number} opened/updated with auto-merge enabled.`);
 }catch(error){
  console.warn(`Auto-merge could not be enabled; PR #${pr.number} remains open for protected review: ${error instanceof Error?error.message:String(error)}`);
 }
}

main().catch(error=>{console.error(error instanceof Error?error.stack??error.message:String(error));process.exit(1)});
