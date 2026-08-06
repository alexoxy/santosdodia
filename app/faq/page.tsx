import type { Metadata } from 'next';
import InstitutionalPage from '../components/InstitutionalPage';

export const metadata:Metadata={title:'Frequently asked questions',description:'Answers about Christian traditions, dates, languages, sources, live media, calendars and privacy.'};
export default function FaqPage(){return <InstitutionalPage kind="faq"/>}
