import { SUPPORTED_LOCALES } from '../../lib/i18n';
import { CATEGORIES, TRADITIONS } from '../../data/observances';

export async function GET(){
  const filterParameters=[
    {name:'locale',in:'query',schema:{type:'string',enum:SUPPORTED_LOCALES}},
    {name:'tradition',in:'query',schema:{type:'string',enum:TRADITIONS}},
    {name:'category',in:'query',schema:{type:'string',enum:CATEGORIES}},
    {name:'country',in:'query',schema:{type:'string',minLength:2,maxLength:2}},
    {name:'live',in:'query',description:'Set to 0 to use only the curated repository dataset.',schema:{type:'string',enum:['0','1'],default:'1'}}
  ];
  const document={
    openapi:'3.1.0',
    info:{
      title:'Santos do Dia machine interface',version:'2.0.0',
      description:'Machine-readable access for search engines, calendar clients and AI agents. Records expose tradition, source identifiers and validation status.'
    },
    servers:[{url:'https://santosdodia.com'}],
    paths:{
      '/api/v1/today':{get:{summary:'Observances for today or a selected date',parameters:[{name:'date',in:'query',schema:{type:'string',format:'date'}},...filterParameters],responses:{'200':{description:'Observances and source-health metadata'}}}},
      '/api/v1/observances':{get:{summary:'List and filter observances',parameters:[{name:'year',in:'query',schema:{type:'integer'}},{name:'month',in:'query',schema:{type:'integer',minimum:1,maximum:12}},{name:'date',in:'query',schema:{type:'string',format:'date'}},{name:'patronage',in:'query',schema:{type:'string'}},...filterParameters],responses:{'200':{description:'Filtered observance list'}}}},
      '/api/v1/search':{get:{summary:'Search names, patronages, regions and traditions',parameters:[{name:'q',in:'query',schema:{type:'string'}},{name:'year',in:'query',schema:{type:'integer'}},...filterParameters],responses:{'200':{description:'Search results'}}}},
      '/api/ical/{feed}':{get:{summary:'ICS calendar feed',parameters:[{name:'feed',in:'path',required:true,schema:{type:'string',enum:['all',...TRADITIONS]}},...filterParameters],responses:{'200':{description:'ICS calendar containing the current and following year'}}}}
    }
  };
  return Response.json(document,{headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800','Access-Control-Allow-Origin':'*'}});
}
