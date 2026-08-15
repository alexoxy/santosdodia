import type { Metadata } from 'next';
import CalendarProductNav from '../../components/CalendarProductNav';
import CalendarSyncCenter from '../../components/CalendarSyncCenter';
import { requestPublicLocale } from '../../../lib/request-public-locale';

const metadataCopy = {
  en:{title:'Sync the liturgical calendar',description:'Subscribe to a reviewed Christian liturgical calendar in Apple Calendar, Google Calendar or Outlook, or download ICS and use the equivalent JSON API.'},
  pt:{title:'Sincronizar o calendário litúrgico',description:'Subscreva um calendário litúrgico cristão revisto no Apple Calendar, Google Calendar ou Outlook, descarregue ICS ou use a API JSON equivalente.'},
  es:{title:'Sincronizar el calendario litúrgico',description:'Suscríbete a un calendario litúrgico cristiano revisado en Apple Calendar, Google Calendar u Outlook, descarga ICS o usa la API JSON equivalente.'},
  it:{title:'Sincronizza il calendario liturgico',description:'Abbonati a un calendario liturgico cristiano revisionato in Apple Calendar, Google Calendar o Outlook, scarica ICS o usa l’API JSON equivalente.'},
} as const;

export async function generateMetadata():Promise<Metadata>{
  const locale = await requestPublicLocale();
  const copy = metadataCopy[locale as keyof typeof metadataCopy] ?? metadataCopy.en;
  return {title:copy.title,description:copy.description,alternates:{canonical:'/calendar/subscribe'}};
}

export default function CalendarSubscribePage(){
  return <div className="page-stack"><CalendarProductNav/><CalendarSyncCenter/></div>;
}
