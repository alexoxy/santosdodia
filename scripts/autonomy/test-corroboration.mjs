#!/usr/bin/env node
import assert from 'node:assert/strict';
import { corroborateClaims } from './corroborate-publication-candidates.mjs';

const policy={
  mode:'shadow-corroboration',productionWriteAllowed:false,
  matching:{minimumIndependentSources:2,minimumAuthorityScore:80,allowSingleFirstPartyAuthority:true,singleFirstPartyClaimClasses:['localized-source-label','geography','feast-or-observance-link'],neverSingleSourceClaimClasses:['birth-date','death-date','patronage']}
};
const sourceRegistry={sources:[
  {id:'wikidata',url:'https://www.wikidata.org/',authorityClass:'C1',authorityScore:68},
  {id:'official-a',url:'https://a.example/',authorityClass:'A1',authorityScore:100},
  {id:'official-b',url:'https://b.example/',authorityClass:'A2',authorityScore:95},
  {id:'specialist',url:'https://c.example/',authorityClass:'B2',authorityScore:85}
]};
const decisions={source:{sourceId:'wikidata'}};

function run(items,evidence){return corroborateClaims({queue:{items},decisions,evidence,policy,sourceRegistry});}
function ev(sourceId,claimClass,value,extra={}){
  const source=sourceRegistry.sources.find(s=>s.id===sourceId);
  return {qid:'Q1',claimClass,value,sourceId,sourceUrl:source.url,independenceGroup:new URL(source.url).hostname,authorityScore:source.authorityScore,verified:true,...extra};
}

{
  const result=run([{entityId:'e1',qid:'Q1',claimClass:'birth-date',value:'1900-01-01'}],[ev('official-a','birth-date','1900-01-01'),ev('official-b','birth-date','1900-01-01')]);
  assert.equal(result.summary.corroborated,1);assert.equal(result.corroborated[0].corroborationRule,'independent-multi-source');
}
{
  const result=run([{entityId:'e1',qid:'Q1',claimClass:'birth-date',value:'1900-01-01'}],[ev('official-a','birth-date','1900-01-01')]);
  assert.equal(result.summary.pending,1);assert.equal(result.summary.corroborated,0);
}
{
  const result=run([{entityId:'e1',qid:'Q1',claimClass:'localized-source-label',value:'São Exemplo'}],[ev('official-a','localized-source-label','São Exemplo')]);
  assert.equal(result.summary.corroborated,1);assert.equal(result.corroborated[0].corroborationRule,'authoritative-first-party');
}
{
  const result=run([{entityId:'e1',qid:'Q1',claimClass:'death-date',value:'2000-01-01'}],[ev('official-a','death-date','2000-01-02'),ev('official-b','death-date','2000-01-01')]);
  assert.equal(result.summary.conflicts,1);assert.equal(result.conflicts[0].disposition,'human-review-required');
}
{
  const result=run([{entityId:'e1',qid:'Q1',claimClass:'localized-source-label',value:'Example'}],[ev('wikidata','localized-source-label','Example')]);
  assert.equal(result.summary.pending,1);assert.equal(result.summary.validatedEvidence,0);
}
console.log('Claim corroboration policy tests passed.');
