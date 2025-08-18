import React, { useEffect, useState } from 'react';

export default function MoodModal({ userId, onClose }) {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  async function load(d) {
    setLoading(true); setErr(''); setData(null);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/mood-summary?user_id=${encodeURIComponent(userId)}&days=${d}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (userId) load(days); }, [userId, days]);

  return (
    <div style={wrap} role="dialog" aria-modal="true">
      <div style={card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <h2 style={{margin:0, fontSize:'1.15rem'}}>Mood snapshot</h2>
          <button onClick={onClose} style={closeBtn}>&times;</button>
        </div>

        <div style={toggleRow}>
          {[7,30,90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              disabled={loading}
              style={{
                ...chip,
                ...(days===d ? chipOn : {})
              }}
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
                <div style={kpiValue}>{data.count}</div>
              </div>
              <div style={kpi}>
                <div style={kpiLabel}>Avg severity</div>
                <div style={kpiValue}>{data.avgSeverity}</div>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <div style={kpiLabel}>Top emotions</div>
              {data.topEmotions?.length ? (
                <ul style={{margin:'6px 0 0 16px', padding:0}}>
                  {data.topEmotions.map(e => (
                    <li key={e.emotion} style={{margin:'2px 0'}}>{e.emotion} — {e.count}</li>
                  ))}
                </ul>
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
