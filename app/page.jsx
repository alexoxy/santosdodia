export default function Home() {
  return (
    <div>
      <h1 style={{ fontSize: 32, margin: 0 }}>Calendário de Santos</h1>
      <p style={{ opacity: 0.8 }}>Católica e Ortodoxa — simples, devocional e em vários idiomas.</p>
      <p><a href="/api/ical/all">Baixar ICS (exemplo)</a></p>
    </div>
  );
}
