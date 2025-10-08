import AddToCalendar from '../../components/AddToCalendar';

type Feast = { name: string; tradition: 'catolica' | 'ortodoxa'; notes?: string; };

function getMockFeasts(dateISO: string): Feast[] {
  const day = dateISO.slice(-2);
  const map: Record<string, Feast[]> = {
    '01': [{ name: 'Santa Teresa (ex.)', tradition: 'catolica' }],
    '07': [
      { name: 'São João (ex.)', tradition: 'catolica' },
      { name: 'Santa Pelágia (ex.)', tradition: 'ortodoxa' }
    ],
  };
  return map[day] || [{ name: 'Sem registos (exemplo).', tradition: 'catolica' }];
}

export default function DiaPage({ params }: { params: { date: string } }) {
  const dateISO = params.date;
  const feasts = getMockFeasts(dateISO);
  const d = new Date(dateISO + 'T00:00:00Z');
  const nice = new Intl.DateTimeFormat('pt', { dateStyle: 'full', timeZone: 'UTC' }).format(d);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>Santos de {nice}</h1>
        <div style={{ display:'grid', gap:12 }}>
          {feasts.map((f, i) => (
            <div key={i} style={{ borderTop: i ? '1px solid var(--line)' : 'none', paddingTop: i ? 12 : 0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:18 }}>{f.name}</div>
                  <div className="lead" style={{ fontSize:13 }}>{f.tradition === 'catolica' ? 'Católica' : 'Ortodoxa'}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <a className="btn btn-primary" href="#" onClick={(e)=>{e.preventDefault();alert('Em breve: acender vela')}}>Acender vela</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Adicionar este dia ao teu calendário</h2>
        <AddToCalendar feedPath="/api/ical/all" title={`Santos de ${nice}`} dateISO={dateISO} />
      </section>
    </div>
  );
}
