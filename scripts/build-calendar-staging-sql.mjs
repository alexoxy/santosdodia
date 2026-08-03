import fs from 'node:fs';
import path from 'node:path';

function argument(name){
 const index=process.argv.indexOf(name);
 return index>=0?process.argv[index+1]:undefined;
}

const inputPath=argument('--input');
const outputPath=argument('--output');
if(!inputPath||!outputPath){
 console.error('Usage: node scripts/build-calendar-staging-sql.mjs --input <package.json> --output <seed.sql>');
 process.exit(2);
}

const input=JSON.parse(fs.readFileSync(path.resolve(inputPath),'utf8'));
const errors=[];

function text(value,label,{optional=false}={}){
 if(value===null||value===undefined){if(optional)return null;errors.push(`${label} is required`);return''}
 if(typeof value!=='string'||!value.trim()){errors.push(`${label} must be a non-empty string`);return''}
 return value.trim();
}
function oneOf(value,allowed,label){if(!allowed.includes(value))errors.push(`${label} must be one of ${allowed.join(', ')}`);return value}
function isoDate(value,label,{optional=false}={}){
 const normalized=text(value,label,{optional});
 if(normalized===null)return null;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(normalized)||Number.isNaN(new Date(`${normalized}T00:00:00Z`).getTime()))errors.push(`${label} must be an ISO date`);
 return normalized;
}
function dateTime(value,label){const normalized=text(value,label);if(Number.isNaN(new Date(normalized).getTime()))errors.push(`${label} must be an ISO date-time`);return normalized}
function sha256(value,label){const normalized=text(value,label);if(!/^[a-f0-9]{64}$/.test(normalized))errors.push(`${label} must be a lowercase SHA-256`);return normalized}
function array(value,label){if(!Array.isArray(value)){errors.push(`${label} must be an array`);return[]}return value}
function nullableInteger(value,label,min,max){if(value===null||value===undefined)return null;if(!Number.isInteger(value)||value<min||value>max)errors.push(`${label} must be an integer from ${min} to ${max}`);return value}
function sql(value){if(value===null||value===undefined)return'NULL';if(typeof value==='number')return String(value);return`'${String(value).replaceAll("'","''")}'`}
function bool(value){return value===false?0:1}

if(input?.schemaVersion!=='1.0')errors.push('schemaVersion must equal 1.0');
const run=input?.run??{};
const runId=text(run.id,'run.id');
const runStatus=oneOf(run.status,['provisional','validated','rejected'],'run.status');
const createdAt=dateTime(run.createdAt,'run.createdAt');
const retrievedAt=dateTime(run.retrievedAt,'run.retrievedAt');
const manifestPath=text(run.dropboxManifestPath,'run.dropboxManifestPath');
if(!manifestPath.startsWith('/Santos do Dia/02_Dados_Eclesiasticos/'))errors.push('run.dropboxManifestPath must be inside the approved Dropbox staging root');
const manifestHash=sha256(run.manifestSha256,'run.manifestSha256');
const validationReportPath=text(run.validationReportPath,'run.validationReportPath',{optional:true});

const sourceAuthority=['official-church','official-jurisdiction','official-local-church','reference-engine','reference-directory','osint-corroboration'];
const policyValidation=['provisional','cross-checked','verified','retired'];
const ruleTypes=['fixed-date','easter-offset','weekday-relative-to-fixed-date','weekday-relative-to-easter','native-calendar-date','annual-source-table','transfer-or-omission'];
const ruleValidation=['provisional','cross-checked','verified','rejected','retired'];
const occurrenceValidation=['provisional','cross-checked','verified','rejected'];
const publicationStatus=['withheld','publishable'];
const translationStatus=['source','reviewed','assisted','missing','rejected'];
const sourceIds=new Set();
const ruleIds=new Set();
const occurrenceIds=new Set();

const sources=array(input.sources,'sources').map((item,index)=>{
 const prefix=`sources[${index}]`;
 const normalized={
  id:text(item?.id,`${prefix}.id`),churchId:text(item?.churchId,`${prefix}.churchId`),jurisdictionId:text(item?.jurisdictionId,`${prefix}.jurisdictionId`,{optional:true}),
  name:text(item?.name,`${prefix}.name`),url:text(item?.url,`${prefix}.url`),authority:oneOf(item?.authority,sourceAuthority,`${prefix}.authority`),
  usagePolicy:text(item?.usagePolicy,`${prefix}.usagePolicy`),copyrightPolicy:text(item?.copyrightPolicy,`${prefix}.copyrightPolicy`,{optional:true}),active:item?.active!==false
 };
 if(sourceIds.has(normalized.id))errors.push(`Duplicate source id ${normalized.id}`);sourceIds.add(normalized.id);return normalized;
});

const policies=array(input.policies,'policies').map((item,index)=>{
 const prefix=`policies[${index}]`;
 const normalized={
  id:text(item?.id,`${prefix}.id`),churchId:text(item?.churchId,`${prefix}.churchId`),jurisdictionId:text(item?.jurisdictionId,`${prefix}.jurisdictionId`,{optional:true}),
  engineId:text(item?.engineId,`${prefix}.engineId`),fixedDatePolicy:text(item?.fixedDatePolicy,`${prefix}.fixedDatePolicy`),calendarSystem:text(item?.calendarSystem,`${prefix}.calendarSystem`),
  effectiveFrom:isoDate(item?.effectiveFrom,`${prefix}.effectiveFrom`,{optional:true}),effectiveTo:isoDate(item?.effectiveTo,`${prefix}.effectiveTo`,{optional:true}),
  sourceId:text(item?.sourceId,`${prefix}.sourceId`),validationStatus:oneOf(item?.validationStatus,policyValidation,`${prefix}.validationStatus`)
 };
 if(!sourceIds.has(normalized.sourceId))errors.push(`${prefix}.sourceId does not exist`);return normalized;
});

const rules=array(input.rules,'rules').map((item,index)=>{
 const prefix=`rules[${index}]`;
 const normalized={
  id:text(item?.id,`${prefix}.id`),churchId:text(item?.churchId,`${prefix}.churchId`),jurisdictionId:text(item?.jurisdictionId,`${prefix}.jurisdictionId`,{optional:true}),
  canonicalEventId:text(item?.canonicalEventId,`${prefix}.canonicalEventId`),ruleType:oneOf(item?.ruleType,ruleTypes,`${prefix}.ruleType`),calendarSystem:text(item?.calendarSystem,`${prefix}.calendarSystem`),
  anchorEventId:text(item?.anchorEventId,`${prefix}.anchorEventId`,{optional:true}),offsetDays:item?.offsetDays??null,month:nullableInteger(item?.month,`${prefix}.month`,1,13),day:nullableInteger(item?.day,`${prefix}.day`,1,31),
  nativeMonth:text(item?.nativeMonth,`${prefix}.nativeMonth`,{optional:true}),nativeDay:nullableInteger(item?.nativeDay,`${prefix}.nativeDay`,1,30),weekdayRule:text(item?.weekdayRule,`${prefix}.weekdayRule`,{optional:true}),
  dateRangeStart:isoDate(item?.dateRangeStart,`${prefix}.dateRangeStart`,{optional:true}),dateRangeEnd:isoDate(item?.dateRangeEnd,`${prefix}.dateRangeEnd`,{optional:true}),
  effectiveFrom:isoDate(item?.effectiveFrom,`${prefix}.effectiveFrom`,{optional:true}),effectiveTo:isoDate(item?.effectiveTo,`${prefix}.effectiveTo`,{optional:true}),
  sourceId:text(item?.sourceId,`${prefix}.sourceId`),validationStatus:oneOf(item?.validationStatus,ruleValidation,`${prefix}.validationStatus`)
 };
 if(normalized.offsetDays!==null&&!Number.isInteger(normalized.offsetDays))errors.push(`${prefix}.offsetDays must be an integer`);
 if(ruleIds.has(normalized.id))errors.push(`Duplicate rule id ${normalized.id}`);ruleIds.add(normalized.id);
 if(!sourceIds.has(normalized.sourceId))errors.push(`${prefix}.sourceId does not exist`);return normalized;
});

const occurrences=array(input.occurrences,'occurrences').map((item,index)=>{
 const prefix=`occurrences[${index}]`;
 const normalized={
  id:text(item?.id,`${prefix}.id`),churchId:text(item?.churchId,`${prefix}.churchId`),jurisdictionId:text(item?.jurisdictionId,`${prefix}.jurisdictionId`,{optional:true}),
  canonicalEventId:text(item?.canonicalEventId,`${prefix}.canonicalEventId`),dateIso:isoDate(item?.dateIso,`${prefix}.dateIso`),endDateIso:isoDate(item?.endDateIso,`${prefix}.endDateIso`,{optional:true}),
  nativeCalendarSystem:text(item?.nativeCalendarSystem,`${prefix}.nativeCalendarSystem`,{optional:true}),nativeYear:item?.nativeYear??null,nativeMonth:text(item?.nativeMonth,`${prefix}.nativeMonth`,{optional:true}),nativeDay:item?.nativeDay??null,
  rankCode:text(item?.rankCode,`${prefix}.rankCode`,{optional:true}),colourCode:text(item?.colourCode,`${prefix}.colourCode`,{optional:true}),ruleId:text(item?.ruleId,`${prefix}.ruleId`,{optional:true}),
  sourceId:text(item?.sourceId,`${prefix}.sourceId`),sourceRecordUrl:text(item?.sourceRecordUrl,`${prefix}.sourceRecordUrl`,{optional:true}),sourceRecordHash:text(item?.sourceRecordHash,`${prefix}.sourceRecordHash`,{optional:true}),
  validationStatus:oneOf(item?.validationStatus,occurrenceValidation,`${prefix}.validationStatus`),publicationStatus:oneOf(item?.publicationStatus,publicationStatus,`${prefix}.publicationStatus`)
 };
 if(normalized.nativeYear!==null&&!Number.isInteger(normalized.nativeYear))errors.push(`${prefix}.nativeYear must be an integer`);
 if(normalized.nativeDay!==null&&!Number.isInteger(normalized.nativeDay))errors.push(`${prefix}.nativeDay must be an integer`);
 if(occurrenceIds.has(normalized.id))errors.push(`Duplicate occurrence id ${normalized.id}`);occurrenceIds.add(normalized.id);
 if(!sourceIds.has(normalized.sourceId))errors.push(`${prefix}.sourceId does not exist`);
 if(normalized.ruleId&&!ruleIds.has(normalized.ruleId))errors.push(`${prefix}.ruleId does not exist`);
 if(normalized.publicationStatus==='publishable'&&!['cross-checked','verified'].includes(normalized.validationStatus))errors.push(`${prefix} cannot be publishable with ${normalized.validationStatus} validation`);
 return normalized;
});

const labels=array(input.labels,'labels').map((item,index)=>{
 const prefix=`labels[${index}]`;
 const normalized={occurrenceId:text(item?.occurrenceId,`${prefix}.occurrenceId`),locale:text(item?.locale,`${prefix}.locale`),name:text(item?.name,`${prefix}.name`),description:text(item?.description,`${prefix}.description`,{optional:true}),translationStatus:oneOf(item?.translationStatus,translationStatus,`${prefix}.translationStatus`),sourceLocale:text(item?.sourceLocale,`${prefix}.sourceLocale`,{optional:true})};
 if(!occurrenceIds.has(normalized.occurrenceId))errors.push(`${prefix}.occurrenceId does not exist`);return normalized;
});

if(runStatus!=='validated'&&occurrences.some(item=>item.publicationStatus==='publishable'))errors.push('Only a validated run may contain publishable occurrences');
for(const occurrence of occurrences.filter(item=>item.publicationStatus==='publishable')){
 const accepted=labels.filter(label=>label.occurrenceId===occurrence.id&&['source','reviewed'].includes(label.translationStatus));
 if(!accepted.some(label=>label.locale==='en'))errors.push(`${occurrence.id} needs an accepted English label`);
 if(!accepted.some(label=>label.locale==='pt'))errors.push(`${occurrence.id} needs an accepted Portuguese label`);
}

if(errors.length){console.error(`Calendar staging package rejected with ${errors.length} error(s):`);for(const error of errors)console.error(`- ${error}`);process.exit(1)}

const now=new Date().toISOString();
const statements=['PRAGMA foreign_keys = ON;','BEGIN IMMEDIATE;'];
statements.push(`INSERT OR REPLACE INTO calendar_import_runs (id,created_at,retrieved_at,dropbox_manifest_path,manifest_sha256,status,validation_report_path,promoted_at) VALUES (${sql(runId)},${sql(createdAt)},${sql(retrievedAt)},${sql(manifestPath)},${sql(manifestHash)},${sql(runStatus)},${sql(validationReportPath)},NULL);`);
for(const item of sources)statements.push(`INSERT OR REPLACE INTO calendar_sources (id,church_id,jurisdiction_id,name,url,authority,usage_policy,copyright_policy,active) VALUES (${sql(item.id)},${sql(item.churchId)},${sql(item.jurisdictionId)},${sql(item.name)},${sql(item.url)},${sql(item.authority)},${sql(item.usagePolicy)},${sql(item.copyrightPolicy)},${bool(item.active)});`);
for(const item of policies)statements.push(`INSERT OR REPLACE INTO jurisdiction_calendar_policies (id,church_id,jurisdiction_id,engine_id,fixed_date_policy,calendar_system,effective_from,effective_to,source_id,validation_status) VALUES (${sql(item.id)},${sql(item.churchId)},${sql(item.jurisdictionId)},${sql(item.engineId)},${sql(item.fixedDatePolicy)},${sql(item.calendarSystem)},${sql(item.effectiveFrom)},${sql(item.effectiveTo)},${sql(item.sourceId)},${sql(item.validationStatus)});`);
for(const item of rules)statements.push(`INSERT OR REPLACE INTO calendar_rules (id,church_id,jurisdiction_id,canonical_event_id,rule_type,calendar_system,anchor_event_id,offset_days,month,day,native_month,native_day,weekday_rule,date_range_start,date_range_end,effective_from,effective_to,source_id,validation_status) VALUES (${sql(item.id)},${sql(item.churchId)},${sql(item.jurisdictionId)},${sql(item.canonicalEventId)},${sql(item.ruleType)},${sql(item.calendarSystem)},${sql(item.anchorEventId)},${sql(item.offsetDays)},${sql(item.month)},${sql(item.day)},${sql(item.nativeMonth)},${sql(item.nativeDay)},${sql(item.weekdayRule)},${sql(item.dateRangeStart)},${sql(item.dateRangeEnd)},${sql(item.effectiveFrom)},${sql(item.effectiveTo)},${sql(item.sourceId)},${sql(item.validationStatus)});`);
for(const item of occurrences)statements.push(`INSERT OR REPLACE INTO calendar_occurrences (id,import_run_id,church_id,jurisdiction_id,canonical_event_id,date_iso,end_date_iso,native_calendar_system,native_year,native_month,native_day,rank_code,colour_code,rule_id,source_id,source_record_url,source_record_hash,validation_status,publication_status,created_at,updated_at) VALUES (${sql(item.id)},${sql(runId)},${sql(item.churchId)},${sql(item.jurisdictionId)},${sql(item.canonicalEventId)},${sql(item.dateIso)},${sql(item.endDateIso)},${sql(item.nativeCalendarSystem)},${sql(item.nativeYear)},${sql(item.nativeMonth)},${sql(item.nativeDay)},${sql(item.rankCode)},${sql(item.colourCode)},${sql(item.ruleId)},${sql(item.sourceId)},${sql(item.sourceRecordUrl)},${sql(item.sourceRecordHash)},${sql(item.validationStatus)},${sql(item.publicationStatus)},${sql(now)},${sql(now)});`);
for(const item of labels.filter(label=>!['missing','rejected'].includes(label.translationStatus)))statements.push(`INSERT OR REPLACE INTO calendar_occurrence_labels (occurrence_id,locale,name,description,translation_status,source_locale) VALUES (${sql(item.occurrenceId)},${sql(item.locale)},${sql(item.name)},${sql(item.description)},${sql(item.translationStatus)},${sql(item.sourceLocale)});`);
statements.push('COMMIT;','');
fs.mkdirSync(path.dirname(path.resolve(outputPath)),{recursive:true});
fs.writeFileSync(path.resolve(outputPath),statements.join('\n'),'utf8');
console.log(`Generated ${outputPath}: ${sources.length} sources, ${policies.length} policies, ${rules.length} rules, ${occurrences.length} occurrences, ${labels.length} labels.`);
