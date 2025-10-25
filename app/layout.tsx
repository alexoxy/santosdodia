import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'santosdodia.com — Calendário de Santos',
  description: 'Católica e Ortodoxa, em vários idiomas, com iCal/Google/Outlook.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <header style={{ borderBottom: '1px solid #E5E7EB' }}>
          <nav style={{ maxWidth: 960, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <a href="/" style={{ textDecoration: 'none', color: '#1F2937', fontWeight: 700 }}>santosdodia<span style={{ color: '#C9A227' }}>.com</span></a>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/calendario">Calendário</a>
              <a href="/api/ical/all">ICS</a>
            </div>
          </nav>
        </header>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
          {children}
        </main>
        <footer style={{ borderTop: '1px solid #E5E7EB', textAlign: 'center', fontSize: 12, padding: '12px 16px' }}>
          © {new Date().getFullYear()} santosdodia.com
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
