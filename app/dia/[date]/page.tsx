// app/dia/[date]/page.tsx
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
    '15': [{ name: 'Santo Inácio (ex.)', tradition: 'catolica' }],
    '23': [{ name: 'São Sérgio (ex.)', tradition: 'ortodoxa' }],
  };
  return map[day] || [{ name: 'Sem registos (exemplo).', tradition: 'catolica' }];
}

function isValidDate(iso: string) {
  const m = iso.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!m) return false;
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && (dt.getUTCMonth() + 1) === mo && dt.getUTCDate() === d;
}

export default async function DiaPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params; // Next 15: params como Promise
  const dateISO = date;

  if (!isValidDate(dateISO)) {
    return (
      <div className="card">
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Data inválida</h1>
        <p className="lead">Usa AAAA-MM-DD. Ex.: <a href="/dia/2025-11-07">/dia/2025-11-07</a></p>
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
        <div style={{ display: 'grid', gap: 12 }}>
          {feasts.map((f, i) => (
            <div key={i} style={{ borderTop: i ? '1px solid var(--line)' : 'none', paddingTop: i ? 12 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{f.name}</div>
                  <div className="lead" style={{ fontSize: 13 }}>{f.tradition === 'catolica' ? 'Católica' : 'Ortodoxa'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a className="btn btn-primary" href="#" onClick={(e)=>{e.preventDefault(); alert('Em breve: acender vela');}}>Acender vela</a>
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
