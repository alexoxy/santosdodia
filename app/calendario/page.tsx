import type { Metadata } from 'next';
import CalendarExplorer from '../components/CalendarExplorer';

export const metadata:Metadata={
  title:'Global Christian Saints Calendar',
  description:'Browse verified saints, feasts and commemorations from Roman Catholic, Orthodox, Anglican and Oriental Orthodox traditions.'
};
export default function CalendarPage(){return <CalendarExplorer/>}
