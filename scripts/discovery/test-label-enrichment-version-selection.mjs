import assert from 'node:assert/strict';
import { selectLabelEnrichmentVersion } from './select-label-enrichment-version.mjs';

const root='a'.repeat(64);
const identityManifest={stage:'global-candidate-identity-ledger',publish:false,rootSha256:root};
const progress=(enrichmentId,{completed=true,next=100,total=100,identityRootSha256=root}={})=>({schemaVersion:1,enrichmentId,sourceId:'wikidata',identityRootSha256,identityCount:total,nextEntityOffset:next,completed});
const v2=progress('saints-labels-v2');

const absent=selectLabelEnrichmentVersion({identityManifest,v2Progress:v2});
assert.equal(absent.selectedVersion,'v2');
assert.equal(absent.automaticSwitch,false);

const partial=selectLabelEnrichmentVersion({identityManifest,v2Progress:v2,v3Progress:progress('saints-labels-v3',{completed:false,next:40,total:100})});
assert.equal(partial.selectedVersion,'v2');
assert.equal(partial.reason,'v3-not-complete-current-identity-root');

const wrongRoot=selectLabelEnrichmentVersion({identityManifest,v2Progress:v2,v3Progress:progress('saints-labels-v3',{identityRootSha256:'b'.repeat(64)})});
assert.equal(wrongRoot.selectedVersion,'v2');

const complete=selectLabelEnrichmentVersion({identityManifest,v2Progress:v2,v3Progress:progress('saints-labels-v3')});
assert.equal(complete.selectedVersion,'v3');
assert.equal(complete.enrichmentId,'saints-labels-v3');
assert.equal(complete.streamPrefix,'enrichment/saints/v1/normalized/wikidata/labels-v3');
assert.equal(complete.automaticSwitch,true);
assert.equal(complete.publicationAllowed,false);
assert.equal(complete.productionMutation,false);

assert.throws(()=>selectLabelEnrichmentVersion({identityManifest,v2Progress:progress('saints-labels-v2',{completed:false,next:80,total:100})}),/complete v2 fallback/u);
console.log('Label enrichment version selection tests passed.');
