import './globals.css';
import { Inter, Cormorant_Garamond } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-serif' });

export const metadata = {
  title: 'santosdodia.com — Calendário de Santos',
  description: 'Católica e Ortodoxa, em vários idiomas, com iCal/Google/Outlook.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <header style={{ borderBottom: '1px solid var(--line)' }}>
          <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12 }}>
            <a href="/" style={{ textDecoration: 'none', color: 'var(--ink)', fontWeight: 700, fontFamily: 'var(--font-serif)', fontSize: 22 }}>
              santosdodia<span style={{ color: 'var(--gold)' }}>.com</span>
            </a>
            <div style={{ display: 'flex', gap: 12 }}>
              <a className="btn btn-ghost" href="/calendario">Calendário</a>
              <a className="btn btn-ghost" href="/api/ical/all">ICS</a>
            </div>
          </nav>
        </header>

        <main className="container">{children}</main>

        <footer style={{ borderTop: '1px solid var(--line)' }}>
          <div className="container" style={{ textAlign: 'center', fontSize: 12, color: 'rgba(31,41,55,.7)', paddingTop: 12, paddingBottom: 12 }}>
            © {new Date().getFullYear()} santosdodia.com
          </div>
        </footer>
      </body>
    </html>
  );
}
