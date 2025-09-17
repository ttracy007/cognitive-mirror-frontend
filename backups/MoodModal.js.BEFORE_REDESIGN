import React, { useEffect, useState } from 'react';

export default function MoodModal({ userId, onClose }) {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');


  async function load(d) {
    setLoading(true); setErr(''); setData(null);
    try {
      // ✅ match backend route name & query params
      const url = `${process.env.REACT_APP_BACKEND_URL}/mood-stats?user_id=${encodeURIComponent(userId)}&days=${d}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setData(json); // ✅ keep backend field names as-is
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (userId) load(days); }, [userId, days]);

  // ── tiny UI helpers ──────────────────────────────────────────────────────────
  const Bar = ({ pct }) => (
    <div style={{background:'#eef2ff', height:8, borderRadius:4, overflow:'hidden'}}>
      <div style={{width:`${Math.max(3, pct)}%`, height:'100%', background:'#647cff'}} />
    </div>
  );

  const Spark = ({ series }) => {
    const max = Math.max(1, ...series.map(s => s.count));
    return (
      <div style={{display:'flex', gap:2, alignItems:'flex-end', height:24}}>
        {series.map(pt => (
          <div
            key={pt.date}
            title={`${pt.date}: ${pt.count} entry(ies)`}
            style={{
              width:6,
              height: Math.max(2, Math.round((pt.count / max) * 24)),
              background:'#c7d2fe',
              borderRadius:2
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={wrap} role="dialog" aria-modal="true">
      <div style={card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <h2 style={{margin:0, fontSize:'1.15rem'}}>Mood snapshot</h2>
          <button onClick={onClose} style={closeBtn}>&times;</button>
        </div>

        <div style={toggleRow}>
          {[7,30,60].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              disabled={loading}
              style={{ ...chip, ...(days===d ? chipOn : {}) }}
            >
              Last {d} days
            </button>
          ))}
        </div>

        {loading && <div style={muted}>Loading…</div>}
        {err && <div style={{color:'#b91c1c'}}>Error: {err}</div>}

          {data && (
    <div style={{marginTop:8}}>
      <div style={kpiRow}>
        <div style={kpi}>
          <div style={kpiLabel}>Entries</div>
          <div style={kpiValue}>{data.total_entries}</div>
          {/* optional sparkline if backend adds daily=[{date, count}] */}
          {Array.isArray(data.daily) && data.daily.length > 0 && (
            <div style={{marginTop:6}}><Spark series={data.daily} /></div>
          )}
        </div>

        <div style={kpi}>
          <div style={kpiLabel}>Avg severity</div>
          <div style={kpiValue}>
            {data.avg_severity}
            {/* optional delta if backend adds severity_delta (positive=up/worse, negative=down/better) */}
            {typeof data.severity_delta === 'number' && (
              <span
                style={{
                  marginLeft:8,
                  fontSize:'.9rem',
                  color:
                    data.severity_delta > 0 ? '#b91c1c' :
                    data.severity_delta < 0 ? '#116a34' : '#6b7280'
                }}
              >
                {data.severity_delta > 0 ? '▲' : data.severity_delta < 0 ? '▼' : '—'}{' '}
                {Math.abs(data.severity_delta)}
              </span>
            )}
          </div>
          {typeof data.severity_delta === 'number' && (
            <div style={{fontSize:'.75rem', color:'#6b7280'}}>vs prior {data.days} days</div>
          )}
        </div>
      </div>

      <div style={{marginTop:12}}>
        <div style={kpiLabel}>Top emotions (share)</div>
        {Array.isArray(data.top_emotions) && data.top_emotions.length ? (
          <div style={{display:'grid', gap:8, marginTop:6}}>
            {(() => {
              const total = data.top_emotions.reduce((a,b)=>a + (b.count||0), 0) || 1;
              return data.top_emotions.map(e => {
                const pct = Math.round(((e.count || 0) / total) * 100);
                return (
                  <div key={e.emotion}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'.9rem', marginBottom:4}}>
                      <span>{e.emotion}</span>
                      <span style={{color:'#6b7280'}}>{pct}%</span>
                    </div>
                    <Bar pct={pct} />
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <div style={muted}>No emotions logged in this window.</div>
        )}
      </div>
    </div>
  )}
      </div>
    </div>
  );
}

const wrap = {
  position:'fixed', inset:0, background:'rgba(0,0,0,0.35)',
  display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
};
const card = { background:'#fff', borderRadius:12, padding:'14px 16px', width:'min(480px, 92%)', boxShadow:'0 10px 30px rgba(0,0,0,0.12)' };
const closeBtn = { fontSize:'1.4rem', lineHeight:1, border:0, background:'transparent', cursor:'pointer', padding:'2px 6px' };
const toggleRow = { display:'flex', gap:6, margin:'4px 0 10px' };
const chip = { padding:'6px 10px', border:'1px solid #d1d5db', borderRadius:20, background:'#fff', cursor:'pointer' };
const chipOn = { background:'#e5edff', borderColor:'#93c5fd' };
const kpiRow = { display:'flex', gap:12, marginTop:4 };
const kpi = { flex:'1 1 0', background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px' };
const kpiLabel = { fontSize:'.8rem', color:'#6b7280' };
const kpiValue = { fontSize:'1.25rem', fontWeight:700, marginTop:2 };
const muted = { color:'#6b7280', fontStyle:'italic' };
