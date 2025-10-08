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
          Assina o calendário para veres sempre quem se celebra hoje.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <a className="btn btn-primary" href="/api/ical/all">Assinar ICS (todos)</a>
          <a className="btn btn-accent" href="/api/ical/catolica">ICS Católica</a>
          <a className="btn btn-ghost" href="/api/ical/ortodoxa">ICS Ortodoxa</a>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', maxWidth: 960 }}>
        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Procura o teu santo — por nome</h3>
          <form action="/teu-santo">
            <input name="q" placeholder="Ex.: João / Maria / Teresa…" style={{ width:'100%', border:'1px solid var(--line)', borderRadius: 8, padding: '10px 12px' }} />
            <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }}>Procurar</button>
          </form>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Procura o teu santo — por data</h3>
          <form action="/teu-santo">
            <input name="d" placeholder="MM-DD (ex.: 11-07)" style={{ width:'100%', border:'1px solid var(--line)', borderRadius: 8, padding: '10px 12px' }} />
            <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }}>Procurar</button>
          </form>
        </div>
      </section>
    </div>
  );
}
