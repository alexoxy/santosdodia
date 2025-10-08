type Feast = {
  name: string;
  tradition: 'catolica' | 'ortodoxa';
  notes?: string;
};

/** MOCK de dados por data (depois ligamos à base) */
function getMockFeasts(dateISO: string): Feast[] {
  // exemplo simples só para ver layout
  const day = dateISO.slice(-2);
  const map: Record<string, Feast[]> = {
    '01': [{ name: 'Santa Teresa (ex.)', tradition: 'catolica' }],
    '07': [
      { name: 'São João (ex.)', tradition: 'catolica' },
      { name: 'Santa Pelágia (ex.)', tradition: 'ortodoxa' }
    ],
    '15': [{ name: 'Santo Inácio (ex.)', tradition: 'catolica' }],
    '23': [{ name: 'São Sérgio (ex.)', tradition: 'ortodoxa' }],
  };
  return map[day] || [{ name: 'Sem registos de exemplo neste dia (ainda).', tradition: 'catolica' }];
}

function isValidDate(iso: string) {
  // espera AAAA-MM-DD
  const m = iso.match(/^\\d{4}-\\d{2}-\\d{2}$/);
  if (!m) return false;
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && (dt.getUTCMonth() + 1) === mo && dt.getUTCDate() === d;
}

function googleCalLink(dateISO: string, title: string) {
  // Evento dia inteiro → usa formato YYYYMMDD/ YYYYMMDD+1
  const [y, m, d] = dateISO.split('-').map(Number);
  const start = `${y}${String(m).padStart(2,'0')}${String(d).padStart(2,'0')}`;
  const endDate = new Date(Date.UTC(y, m - 1, d + 1));
  const end = `${endDate.getUTCFullYear()}${String(endDate.getUTCMonth()+1).padStart(2,'0')}${String(endDate.getUTCDate()).padStart(2,'0')}`;
  const text = encodeURIComponent(title);
  const details = encodeURIComponent('santosdodia.com');
  return `https://calendar.google.com/calendar/u/0/r/eventedit?dates=${start}/${end}&text=${text}&details=${details}`;
}

export default function DiaPage({ params }: { params: { date: string } }) {
  const dateISO = params.date; // AAAA-MM-DD
  if (!isValidDate(dateISO)) {
    return (
      <div className="card">
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Data inválida</h1>
        <p className="lead">Usa o formato AAAA-MM-DD. Ex.: <a href="/dia/2025-11-07">/dia/2025-11-07</a></p>
      </div>
    );
  }

  const feasts = getMockFeasts(dateISO);
  const d = new Date(dateISO + 'T00:00:00Z');
  const nice = new Intl.DateTimeFormat('pt', { dateStyle: 'full', timeZone: 'UTC' }).format(d);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>Santos de {nice}</h1>
        <p className="lead" style={{ marginBottom: 12 }}>
          Consulta os santos celebrados neste dia por tradição.
        </p>

        <div style={{ display:'grid', gap:12 }}>
          {feasts.map((f, i) => (
            <div key={i} style={{ borderTop: i ? '1px solid var(--line)' : 'none', paddingTop: i ? 12 : 0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{f.name}</div>
                  <div className="lead" style={{ fontSize: 13 }}>{f.tradition === 'catolica' ? 'Católica' : 'Ortodoxa'}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {/* ICS por tradição (mock) */}
                  <a className="btn btn-ghost" href={`/api/ical/${f.tradition === 'catolica' ? 'catolica' : 'ortodoxa'}`}>ICS</a>
                  {/* Google Calendar one-click */}
                  <a className="btn btn-ghost" href={googleCalLink(dateISO, f.name)} target="_blank" rel="noreferrer">+ Google</a>
                  {/* Placeholder para vela (ligaremos ao Stripe depois) */}
                  <a className="btn btn-primary" href="#" onClick={(e)=>{e.preventDefault(); alert('Em breve: acender vela (pagamento).');}}>Acender vela</a>
                </div>
              </div>
              {f.notes && <p className="lead" style={{ marginTop: 6 }}>{f.notes}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Assinar este dia no teu calendário</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <a className="btn btn-accent" href="/api/ical/all">ICS (todos)</a>
          <a className="btn btn-ghost" href="/api/ical/catolica">ICS Católica</a>
          <a className="btn btn-ghost" href="/api/ical/ortodoxa">ICS Ortodoxa</a>
        </div>
      </section>
    </div>
  );
}
