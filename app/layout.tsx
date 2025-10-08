export const metadata = {
  title: 'santosdodia.com — Calendário de Santos',
  description: 'Católica e Ortodoxa, em vários idiomas, com iCal/Google/Outlook.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ background: '#F8F7F3', color: '#1F2937', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
