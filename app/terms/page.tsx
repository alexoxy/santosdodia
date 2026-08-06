import type { Metadata } from 'next';
import InstitutionalPage from '../components/InstitutionalPage';

export const metadata:Metadata={title:'Terms of use',description:'Terms for using Santos do Dia pages, calendar feeds, sources and public API.'};
export default function TermsPage(){return <InstitutionalPage kind="terms"/>}
