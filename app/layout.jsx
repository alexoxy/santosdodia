import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Santos do Dia',
  description: 'Em construção',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
