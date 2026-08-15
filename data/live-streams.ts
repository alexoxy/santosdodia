import generated from './generated/live-streams.json';
import type { LocalizedText } from '../lib/i18n';
import type { Tradition } from './observances';

export type LiveStreamSource={
 id:string;
 tradition:Tradition;
 organization:string;
 liveUrl?:string;
 archiveUrl?:string;
 sourceUrl:string;
 descriptions:LocalizedText;
 languages:string[];
 verifiedAt:string;
};

type GeneratedLiveRegistry={schemaVersion:number;generatedAt:string;sources:LiveStreamSource[]};
const registry=generated as GeneratedLiveRegistry;
if(registry.schemaVersion!==1)throw new Error('Unsupported live stream registry schema.');

export const LIVE_STREAM_SOURCES:LiveStreamSource[]=registry.sources;
