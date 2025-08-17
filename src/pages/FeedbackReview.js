import React, { useEffect, useState } from 'react'; 

export default function FeedbackReview() {
  const [items, setItems] = useState([]);
  const [rating, setRating] = useState('');
  const load = async () => {
    const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/admin/feedback`);
    if (rating) url.searchParams.set('rating', rating);
    const res = await fetch(url);
    const json = await res.json();
    setItems(json.items || []);
  };
  useEffect(() => { load(); }, [rating]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Feedback (latest)</h2>
      <label>Filter rating: </label>
      <select value={rating} onChange={e=>setRating(e.target.value)}>
        <option value="">All</option>
        <option value="5">👍 (5)</option>
        <option value="1">👎 (1)</option>
      </select>
      <table style={{ width:'100%', marginTop:12, borderCollapse:'collapse' }}>
        <thead><tr>
          <th style={{textAlign:'left'}}>When</th>
          <th>Rating</th>
          <th style={{textAlign:'left'}}>Note</th>
          <th>Journal</th>
        </tr></thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{textAlign:'center'}}>{r.rating}</td>
              <td style={{textAlign:'left'}}>{r.feedback_text || '—'}</td>
              <td style={{textAlign:'center'}}>{r.journal_id.slice(0,8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
