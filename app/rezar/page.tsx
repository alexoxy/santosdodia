import type { Metadata } from 'next';
import PrayerHub from '../components/PrayerHub';

export const metadata: Metadata = {
  title: 'Rezar',
  description: 'Orações, novenas e leituras ligadas às celebrações cristãs, com fontes e direitos validados.',
  robots: { index: false, follow: true },
};

export default function PrayerPage() {
  return <PrayerHub />;
}
