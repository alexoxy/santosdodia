import type { Metadata } from 'next';
import CopyrightSources from '../components/CopyrightSources';

export const metadata:Metadata={title:'Sources, Rights and Licensing',description:'Copyright, provenance, source attribution and licensing information for Santos do Dia.',alternates:{canonical:'/copyright'}};
export default function CopyrightPage(){return <CopyrightSources/>}
