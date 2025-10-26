import AddToCalendar from '../../components/AddToCalendar';
import CandleButton from '../../components/CandleButton';
import { getFeastsForDate } from '@/data/feasts.js';

function isValidDate(iso) {
  const m = iso.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!m) return false;
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && (dt.getUTCMonth() + 1) === mo && dt.getUTCDate() === d;
}

export default async function DiaPage({ params }) {
  const { date } = await params;
  const dateISO = date;

  if (!isValidDate(dateISO)) {
    return (
      <div className="card">
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Data inválida</h1>
        <p className="lead">Usa AAAA-MM-DD. Ex.: <a href="/dia/2025-11-07">/dia/2025-11-07</a></p>
      </div>
    );
  }

  const feasts = getFeastsForDate(dateISO);
  const d = new Date(`${dateISO}T00:00:00Z`);
  const nice = new Intl.DateTimeFormat('pt', { dateStyle: 'full', timeZone: 'UTC' }).format(d);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>Santos de {nice}</h1>
        <div style={{ display: 'grid', gap: 12 }}>
          {feasts.length === 0 ? (
            <p className="lead">Ainda não temos santos associados a esta data. Volta em breve!</p>
          ) : null}
          {feasts.map((f, i) => (
            <div key={f.id} style={{ borderTop: i ? '1px solid var(--line)' : 'none', paddingTop: i ? 12 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{f.name}</div>
                  <div className="lead" style={{ fontSize: 13 }}>{f.tradition === 'catolica' ? 'Católica' : 'Ortodoxa'}</div>
                  {f.notes ? <p className="feast-notes">{f.notes}</p> : null}
                </div>
                <CandleButton dateISO={dateISO} />
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
