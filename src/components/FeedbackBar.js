import React, { useEffect, useState } from 'react';

export default function FeedbackBar({ journalId, userId }) {
  const [stage, setStage] = useState('idle'); // 'idle' | 'up' | 'down' | 'sent'
  const [choice, setChoice] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  // hide if already sent on this device for this journal
  useEffect(() => {
    if (!journalId) return;
    const key = `fb_${journalId}`;
    if (localStorage.getItem(key)) setStage('sent');
  }, [journalId]);

  if (!journalId) return null;
  if (stage === 'sent') {
    return <div style={{opacity:.7, fontSize:'.9rem'}}>Thanks — logged.</div>;
  }

  const POSITIVE_CHOICES = [
    ['learned_new','Helped me learn something new about myself'],
    ['reframed_known','Said something I knew, but in a helpful way'],
    ['saw_pattern','Helped me see a pattern'],
    ['decided_next_step','Helped me decide a next step'],
  ];
  const NEGATIVE_CHOICES = [
    ['missed_point','Missed the point'],
    ['generic','Too generic / boilerplate'],
    ['tone_off','Tone felt off'],
    ['too_long','Too long / over-explained'],
    ['unsolicited_advice','Gave advice I didn’t ask for'],
  ];

  const submit = async () => {
    try {
      setBusy(true);
      const rating = stage === 'up' ? 5 : 1;
  
      // ⬇️ REPLACE your current `body` with this:
      const body = {
        journal_id: journalId,
        user_id: userId,
        rating,
        feedback_text: note?.trim() || null,
        choice_group: stage === 'up' ? 'pos' : 'neg',// match follow-up set
        choice_key: choice || null
      };
  
      console.log('[FE] /journal-feedback -> sending:', body);

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/journal-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
  
      // read as text first so we can always log it
      const raw = await res.text();
      console.log('[FE] /journal-feedback <- status:', res.status, 'raw:', raw);

      // parse once (stream already consumed)
      let json = null;
      try { json = raw ? JSON.parse(raw) : null; }
      catch (e) { console.warn('[FE] response not JSON:', e); }

      // error branch uses parsed JSON if present
      if (!res.ok) {
        throw new Error((json && json.error) ? json.error : `HTTP ${res.status}`);
      }

      // success -> optional id + mark complete
      const feedbackId = json?.feedback_id ?? null;
      if (feedbackId) console.log('[FE] feedback saved id=', feedbackId);

      // mark complete on this device
      localStorage.setItem(`fb_${journalId}`, '1');
      setStage('sent');
      
    } catch (e) {
      console.error('Feedback submit failed:', e);
      // still close to avoid UX stall in demos
      localStorage.setItem(`fb_${journalId}`, '1');
      setStage('sent');
    } finally {
      setBusy(false);
    }
  };

  const renderChoices = (items) => (
    <div style={{display:'flex',flexDirection:'column',gap:8, marginTop:6, width:'100%'}}>
      {items.map(([val, label]) => (
        <label key={val} style={{display:'flex',alignItems:'center',gap:8, cursor:'pointer'}}>
          <input
            type="radio"
            name={`fb_${journalId}`}
            value={val}
            checked={choice === val}
            onChange={() => setChoice(val)}
            disabled={busy}
          />
          <span>{label}</span>
        </label>
      ))}
      <textarea
        placeholder="Optional note (max 300 chars)"
        maxLength={300}
        value={note}
        onChange={e => setNote(e.target.value)}
        disabled={busy}
        style={{width:'100%', minHeight:60, padding:8, fontFamily:'inherit'}}
      />
      <div style={{display:'flex', gap:8}}>
        <button
          onClick={submit}
          disabled={busy || (!choice && !note.trim())}
        >
          {busy ? 'Sending…' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={() => { setStage('idle'); setChoice(''); setNote(''); }}
          disabled={busy}
          style={{opacity:.8}}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
      {stage === 'idle' && (
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <span style={{fontStyle:'italic', color:'#888', fontSize:'.9rem'}}>Was this helpful?</span>
          <button
            title="Yes"
            onClick={() => setStage('up')}
            disabled={busy}
            aria-label="Thumbs up"
          >👍</button>
          <button
            title="No"
            onClick={() => setStage('down')}
            disabled={busy}
            aria-label="Thumbs down"
          >👎</button>
        </div>
      )}

      {stage === 'up'   && renderChoices(POSITIVE_CHOICES)}
      {stage === 'down' && renderChoices(NEGATIVE_CHOICES)}
    </div>
  );
}
