import React, { useState } from 'react';

export default function FeedbackBar({ journalId }) {
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (sent) return <div style={{opacity:.7, fontSize:'.9rem'}}>Thanks — logged.</div>;

    const key = 'fb_' + journalId;
      useEffect(() => { if (localStorage.getItem(key)) setSent(true); }, [key]);

    const send = async (rating) => {
      try {
        setBusy(true);
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/journal-feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            journal_id: journalId,
            rating,                              // 1..5
            feedback_text: note?.trim() || null  // optional
          })
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed');

        // ✅ Mark as sent locally so it doesn’t reappear
        localStorage.setItem(key, '1');
        setSent(true);
      } catch (e) {
        console.error('Feedback submit failed:', e);
        setSent(true); // soft-ack for demo UX
      } finally {
        setBusy(false);
      }
    };

useEffect(() => {
  if (localStorage.getItem(key)) setSent(true);
}, [key]);


  return (
    <div style={{display:'flex',gap:8,alignItems:'center',marginTop:6,flexWrap:'wrap'}}>
      <span style={{opacity:.75}}>Was this helpful?</span>
      <button disabled={busy} onClick={() => send(5)}>👍</button>
      <button disabled={busy} onClick={() => send(1)}>👎</button>
      <input
        placeholder="Add a note (optional)"
        maxLength={300}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{minWidth:180,flex:1}}
      />
    </div>
  );
}
