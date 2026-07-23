import type { Metadata } from 'next';
import CalendarExplorer from '../components/CalendarExplorer';
import TraditionFeeds from '../components/TraditionFeeds';

export const metadata:Metadata={title:'Christian Saints Calendars',description:'Browse saints and feasts and subscribe to Roman Catholic, Orthodox, Anglican, Coptic, Armenian, Ethiopian and Syriac calendars.'};
export default function CalendarPage(){return <div className="page-stack"><CalendarExplorer/><TraditionFeeds/></div>}
