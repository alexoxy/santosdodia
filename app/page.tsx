export default function Home() {
  return (
    <main style={{maxWidth: 880, margin: '0 auto', padding: 24}}>
      <h1>santosdodia.com</h1>
      <p>Calendário de Santos — Católica e Ortodoxa</p>
      <p><a href="/api/ical/all">Baixar ICS (exemplo)</a></p>
      <p><a href="/api/ical/catolica">ICS Católica</a> · <a href="/api/ical/ortodoxa">ICS Ortodoxa</a></p>
    </main>
  );
}
