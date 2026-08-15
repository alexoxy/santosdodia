#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  buildSupplementalSeeds,
  chooseCandidate,
  classifyMediaUrl,
  extractMediaCandidates,
  mapRegistryTradition,
  nextFailureCount,
  shouldRetire,
} from './live-stream-curator-lib.mjs';

assert.equal(mapRegistryTradition(['catholic']),'roman-catholic');
assert.equal(mapRegistryTradition(['oriental-orthodox','coptic-orthodox']),'coptic-orthodox');
assert.equal(mapRegistryTradition(['lutheran']),null);
assert.equal(classifyMediaUrl('https://www.youtube.com/@VaticanNews/live'),'live');
assert.equal(classifyMediaUrl('https://www.youtube.com/@VaticanNews'),'archive');
assert.equal(classifyMediaUrl('https://example.org/about'),null);

const candidates=extractMediaCandidates('<a href="/live-broadcasts">Live</a><a href="https://www.youtube.com/@church/live?utm_source=x">YT</a><a href="/about">About</a>','https://church.example/');
assert.equal(candidates.length,2);
assert.ok(candidates.some(item=>item.url==='https://church.example/live-broadcasts'&&item.kind==='live'));
assert.ok(candidates.some(item=>item.url==='https://www.youtube.com/@church/live'&&item.kind==='live'));

const chosen=chooseCandidate([
 {url:'https://example.org/live',kind:'live',score:60,probe:{ok:true,status:200}},
 {url:'https://www.youtube.com/@church/live',kind:'live',score:80,probe:{ok:false,status:403}},
 {url:'https://dead.example/live',kind:'live',score:90,probe:{ok:false,status:404}},
],'live');
assert.equal(chosen,'https://www.youtube.com/@church/live');

assert.equal(nextFailureCount(0,{mediaReachable:false,sourceReachable:false}),1);
assert.equal(nextFailureCount(2,{mediaReachable:false,sourceReachable:false}),3);
assert.equal(nextFailureCount(2,{mediaReachable:true,sourceReachable:false}),0);
assert.equal(shouldRetire({consecutiveFailures:2}),false);
assert.equal(shouldRetire({consecutiveFailures:3}),true);
assert.equal(shouldRetire({pinned:true,consecutiveFailures:99}),false);

const supplemental=buildSupplementalSeeds({sources:[
 {id:'new-coptic',name:'Official Coptic',url:'https://coptic.example/',traditions:['coptic-orthodox'],domains:['media'],languages:['ar','en'],authorityClass:'A1'},
 {id:'duplicate',name:'Duplicate',url:'https://www.vaticannews.va/',traditions:['catholic'],domains:['media'],languages:['it'],authorityClass:'A1'},
 {id:'weak',name:'Weak',url:'https://weak.example/',traditions:['anglican'],domains:['media'],languages:['en'],authorityClass:'B1'},
 {id:'lutheran',name:'Lutheran',url:'https://lutheran.example/',traditions:['lutheran'],domains:['media'],languages:['en'],authorityClass:'A1'}
]},[{sourceUrl:'https://www.vaticannews.va/pt/epg.html'}]);
assert.deepEqual(supplemental.map(item=>item.id),['official-new-coptic']);

console.log('Live stream discovery, activation and retirement safeguards passed.');
