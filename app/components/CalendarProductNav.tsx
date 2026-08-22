'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '../../lib/i18n';
import { useLanguage } from './LanguageProvider';

const labels: Partial<Record<Locale,{label:string;browse:string;calculator:string;sync:string;api:string}>> = {
  en:{label:'Liturgical calendar',browse:'Explore',calculator:'Calculator',sync:'Sync',api:'API'},
  pt:{label:'Calendário litúrgico',browse:'Explorar',calculator:'Calculadora',sync:'Sincronizar',api:'API'},
  es:{label:'Calendario litúrgico',browse:'Explorar',calculator:'Calculadora',sync:'Sincronizar',api:'API'},
  it:{label:'Calendario liturgico',browse:'Esplora',calculator:'Calcolatore',sync:'Sincronizza',api:'API'},
};

export default function CalendarProductNav(){
  const { locale } = useLanguage();
  const pathname = usePathname();
  const copy = labels[locale] ?? labels.en!;
  const items = [
    {href:'/calendar',label:copy.browse,active:pathname==='/calendar'||pathname==='/calendario'},
    {href:'/tools/liturgical-calendar',label:copy.calculator,active:pathname.startsWith('/tools/liturgical-calendar')},
    {href:'/calendar/subscribe',label:copy.sync,active:pathname.startsWith('/calendar/subscribe')},
    {href:'/calendar/api',label:copy.api,active:pathname.startsWith('/calendar/api')},
  ];
  return <nav className="button-row" aria-label={copy.label} style={{justifyContent:'flex-start'}}>
    {items.map(item=><Link className={`btn ${item.active?'btn-primary':'btn-secondary'}`} href={item.href} key={item.href}>{item.label}</Link>)}
  </nav>;
}
