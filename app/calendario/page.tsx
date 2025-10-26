'use client';

import { useMemo, useState } from 'react';

import { getMonthlyFeasts, type Tradition as FeastTradition } from '../../data/feasts';

type TraditionFilter = 'todas' | FeastTradition;

// Grelha do mês
function monthMatrix(year:number, month:number) {
  // month: 0..11
  const first = new Date(Date.UTC(year, month, 1));
  // segunda=0
  const startDay = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = Array(startDay).fill(null).concat(
    Array.from({length: daysInMonth}, (_,i)=>i+1)
  );
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({length: cells.length/7}, (_,w)=>cells.slice(w*7, w*7+7));
}

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getUTCFullYear());
  const [month, setMonth] = useState(today.getUTCMonth()); // 0..11
  const [trad, setTrad] = useState<TraditionFilter>('todas');

  const matrix = useMemo(()=>monthMatrix(year, month), [year, month]);
  const feasts = useMemo(()=>{
    const tradition = trad === 'todas' ? undefined : trad;
    return getMonthlyFeasts(year, month, tradition).map((feast) => ({
      date: feast.dateISO,
      name: feast.name,
      tradition: feast.tradition,
      notes: feast.notes
    }));
  }, [year, month, trad]);

  function prevMonth() {
    const m = new Date(Date.UTC(year, month, 1)); m.setUTCMonth(m.getUTCMonth() - 1);
    setYear(m.getUTCFullYear()); setMonth(m.getUTCMonth());
  }
  function nextMonth() {
    const m = new Date(Date.UTC(year, month, 1)); m.setUTCMonth(m.getUTCMonth() + 1);
    setYear(m.getUTCFullYear()); setMonth(m.getUTCMonth());
  }

  const monthName = new Intl.DateTimeFormat('pt', { month: 'long', timeZone:'UTC' })
    .format(new Date(Date.UTC(year, month, 1)));

  return (
    <div className="space-y-4">
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <button className="btn btn-primary" onClick={prevMonth}>&larr;</button>
        <strong style={{textTransform:'capitalize'}}>{monthName} {year}</strong>
        <button className="btn btn-primary" onClick={nextMonth}>&rarr;</button>

        <div style={{marginLeft:'auto', display:'flex', gap:12, alignItems:'center'}}>
          <label><input type="radio" name="trad" checked={trad==='todas'} onChange={()=>setTrad('todas')} /> Todas</label>
          <label><input type="radio" name="trad" checked={trad==='catolica'} onChange={()=>setTrad('catolica')} /> Católica</label>
          <label><input type="radio" name="trad" checked={trad==='ortodoxa'} onChange={()=>setTrad('ortodoxa')} /> Ortodoxa</label>
        </div>
      </div>

      <div className="card">
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6}}>
          {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=>(
            <div key={d} style={{fontWeight:600, color:'var(--ink)', opacity:.8}}>{d}</div>
          ))}
          {matrix.flat().map((day, idx) => {
            const dateStr = day ? `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : '';
            const items = day ? feasts.filter(f => f.date === dateStr) : [];
            const isToday = day &&
              day === today.getUTCDate() &&
              month === today.getUTCMonth() && year === today.getUTCFullYear();

            return (
              <div key={idx} style={{
                border:'1px solid var(--line)', borderRadius:'12px', minHeight:92, background:'#fff',
                padding:8, opacity: day ? 1 : 0.4
              }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                  <span style={{fontWeight:700, color: isToday ? 'var(--pine)' : 'var(--ink)'}}>{day ?? ''}</span>
                  {isToday && <span style={{color:'var(--pine)', fontSize:12}}>hoje</span>}
                </div>
                <div style={{display:'grid', gap:4}}>
                  {items.map((f, i)=>(
                    <a
                      key={i}
                      href={`/dia/${dateStr}`}
                      className="calendar-link"
                      title={f.notes ?? undefined}
                    >
                      • {f.name} {f.tradition === 'catolica' ? '(Cat.)' : '(Ort.)'}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {feasts.length === 0 ? (
          <p className="lead" style={{ marginTop: 12 }}>Sem registos para este mês nesta tradição. Volta mais tarde!</p>
        ) : null}
      </div>

      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <a className="btn btn-accent" href="/api/ical/all">Assinar ICS (todos)</a>
        <a className="btn btn-ghost" href="/api/ical/catolica">ICS Católica</a>
        <a className="btn btn-ghost" href="/api/ical/ortodoxa">ICS Ortodoxa</a>
      </div>
    </div>
  );
}
