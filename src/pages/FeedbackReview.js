// src/FeedbackReview.js
import React, { useEffect, useState } from 'react';

export default function FeedbackReviewPanel() {
  const [items, setItems] = useState([]);
  const [rating, setRating] = useState(''); // '' | '1' | '5'

  const load = async () => {
    try {
      const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/journal-feedback`);
      if (rating) url.searchParams.set('rating', rating);

      const res = await fetch(url.toString(), {
        headers: { 'x-service-role-key': process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || '' },
        cache: 'no-store',
      });

      if (!res.ok) {
        console.error('Feedback admin fetch failed:', res.status);
        setItems([]);
        return;
      }

      const json = await res.json();
      setItems(json.items || []);
    } catch (e) {
      console.error('Load feedback failed:', e);
      setItems([]);
    }
  };

  useEffect(() => { load(); }, [rating]);

  return (
    <div style={{ padding: 8 }}>
      <h3 style={{ marginTop: 0 }}>Feedback (latest)</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label>Filter rating:</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">All</option>
          <option value="5">👍 (5)</option>
          <option value="1">👎 (1)</option>
        </select>
      </div>

      <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 4px' }}>When (UTC)</th>
            <th style={{ textAlign: 'center', padding: '6px 4px' }}>Rating</th>
            <th style={{ textAlign: 'left', padding: '6px 4px' }}>Note</th>
            <th style={{ textAlign: 'center', padding: '6px 4px' }}>Journal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: '6px 4px' }}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{ textAlign: 'center', padding: '6px 4px' }}>{r.rating}</td>
              <td style={{ padding: '6px 4px' }}>{r.feedback_text || '—'}</td>
              <td style={{ textAlign: 'center', padding: '6px 4px' }}>
                {(r.journal_id || '').slice(0, 8)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} style={{ opacity: 0.7, padding: '10px 4px' }}>
                No feedback yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
