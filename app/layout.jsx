import './globals.css';

export const metadata = {
  title: 'Santos do Dia',
  description: 'Em construção',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
