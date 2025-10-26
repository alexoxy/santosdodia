import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Santos do Dia',
  description:
    'Calendário ecuménico diário com santos oficiais das igrejas Católica, Anglicana e Ortodoxa em múltiplos idiomas.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-PT">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
