import type { Metadata } from 'next';
import InstitutionalPage from '../components/InstitutionalPage';

export const metadata:Metadata={title:'Privacy',description:'How Santos do Dia handles language preferences, virtual candles, technical requests and external media.'};
export default function PrivacyPage(){return <InstitutionalPage kind="privacy"/>}
