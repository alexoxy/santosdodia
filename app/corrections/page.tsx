import type { Metadata } from 'next';
import InstitutionalPage from '../components/InstitutionalPage';

export const metadata:Metadata={title:'Corrections and rights requests',description:'How to report a factual, translation, source, broken-link or rights issue to Santos do Dia.'};
export default function CorrectionsPage(){return <InstitutionalPage kind="corrections"/>}
