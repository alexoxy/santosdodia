import type { Metadata } from 'next';
import SavedSaintsList from '../components/SavedSaintsList';

export const metadata: Metadata = {
  title: 'Guardados',
  description: 'Santos guardados neste dispositivo.',
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return <div className="page-stack product-home"><SavedSaintsList /></div>;
}
