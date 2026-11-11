import type { Metadata } from 'next';
import AdvertisingPrivacyNotice from '../components/AdvertisingPrivacyNotice';
import InstitutionalPage from '../components/InstitutionalPage';

export const metadata:Metadata={title:'Privacy',description:'How Santos do Dia handles language preferences, virtual candles, technical requests, external media, advertising and consent.'};
export default function PrivacyPage(){return <><InstitutionalPage kind="privacy"/><AdvertisingPrivacyNotice/></>}
