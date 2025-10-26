import { redirect } from 'next/navigation';

const DEFAULT_LOCALE = 'pt-pt';

export default function HomeRedirect() {
  redirect(`/${DEFAULT_LOCALE}`);
}
