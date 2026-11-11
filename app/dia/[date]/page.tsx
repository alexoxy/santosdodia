import { permanentRedirect } from 'next/navigation';

export default async function LegacyDayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  permanentRedirect(`/day/${date}`);
}
