import AddToCalendar from './components/AddToCalendar';

export default function Home() {
  return (
    <div className="space-y-8">
      <section style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32 }}>Calendário de Santos</h1>
        <p className="lead" style={{ marginTop: 8 }}>
          Católica e Ortodoxa — simples, devocional e disponível em vários idiomas.
        </p>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Santo(s) de hoje</h2>
        <p className="lead" style={{ marginBottom: 16 }}>
          Assina o calendário (ou adiciona evento) no teu app preferido.
        </p>
        <AddToCalendar feedPath="/api/ical/all" title="Santos do Dia (todos)" />
      </section>
    </div>
  );
}
