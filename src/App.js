import React, { useEffect, useState } from 'react';
import './App.css';
import AuthForm from './AuthForm';
import { supabase } from './supabaseClient';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [forcedTone, setForcedTone] = useState("frank");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [hasUsedOverride, setHasUsedOverride] = useState(false);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const fetchHistory = async () => {
    const user = session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('journals')
      .select('id, entry_text, response_text, tone_mode, timestamp')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Fetch error:', error.message);
    } else {
      console.log('Fetched history:', data);
      setHistory(data || []);
    }
  };

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

const handleSubmit = async () => {
  const user = session?.user;
  if (!user || !entry.trim()) return;

  console.log('Submitting:', entry);

  // Step 1: Fetch GPT response
  const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry, forcedTone }),
  });

  const data = await res.json();
  console.log('GPT Response:', data);

  const responseText = data.response || 'No response received.';

  // Step 2: Save to Supabase
  const { data: saved, error } = await supabase
    .from('journals')
    .insert({
      user_id: user.id,
      entry_text: entry,
      response_text: responseText,
      tone_mode: data.tone_mode,
    })
    .select();

  if (error) {
    console.error('Save error:', error.message);
  } else {
    console.log('Saved entry:', saved);
    if (saved && saved[0]) {
      setLatestEntryId(saved[0].id); // ✅ For animation
    }
  }

  setEntry('');
  setTimeout(fetchHistory, 300);
};


  if (!session) return <AuthForm />;
 const canGenerateSummary = Array.isArray(history) && history.length >= 5;

{Array.isArray(history) && !canGenerateSummary && (
  <div style={{
    backgroundColor: '#fff7e6',
    padding: '1.5rem',
    borderRadius: '8px',
    borderLeft: '6px solid #ffae42',
    marginBottom: '2rem',
    lineHeight: '1.5'
  }}>
    <h3 style={{ marginTop: 0 }}>🔎 <strong>“Not Quite Yet”</strong></h3>
    <p><strong>Cognitive Mirror</strong> works best when it sees you over time—not just in a single moment.</p>
    <p>We need at <strong>least five days</strong> of journaling to form a meaningful reflection summary.</p>
    <p>That gives the mirror a chance to detect emotional patterns, shifts, and turning points—not just passing moods.</p>
    <p>The more you write, the clearer the picture gets.<br />
      Keep going. You’re not just venting—you’re building self-understanding.</p>
    <br />
    <button style={{
      padding: '0.4rem 0.75rem',
      fontSize: '0.9rem',
      backgroundColor: '#ffae42',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      color: '#fff'
    }} onClick={() => alert('🧪 Previewing a sample summary...')}>
      ⏩ Generate Preview Summary →
    </button>
  </div>
)}

{canGenerateSummary && (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
    <label style={{ marginRight: '0.5rem' }}>Voice (required):</label>
    <select value={forcedTone} onChange={(e) => setForcedTone(e.target.value)}>
      <option value="frank">🔴 Frank Friend</option>
      <option value="stoic">🟢 Stoic Mentor</option>
    </select>

    <button
      style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
      onClick={() => alert('🧠 Summary feature coming soon.')}>
      🔍 Generate Summary
    </button>

    <button
      style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
      onClick={() => alert('🧪 Previewing a sample summary...')}>
      🧪 Preview Summary
    </button>
  </div>
)}
</div> {/* close the scrolling wrapper if not already */}
</div> {/* close the reflection block if not already */}

<br /><br />

      <textarea
        rows="6"
        cols="60"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="What's on your mind?"
      />
      <br /><br />

      <button onClick={handleSubmit}>Reflect</button>
      {!showSummary && history.length < 5 && (
  <div
    style={{
      backgroundColor: '#fef9ef',
      padding: '1.5rem',
      borderLeft: '5px solid #ffa500',
      borderRadius: '6px',
      lineHeight: '1.5',
      marginBottom: '2rem',
    }}
  >
    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>🔍 <strong>“Not Quite Yet”</strong></h3>
    <p style={{ marginBottom: '0.75rem' }}>
      <strong>Cognitive Mirror</strong> works best when it sees you over time—not just in a single moment.<br />
      We need <strong>at least five days</strong> of journaling to form a meaningful reflection summary.<br />
      That gives the mirror a chance to detect emotional patterns, shifts, and turning points—not just passing moods.
    </p>
    <p style={{ marginBottom: '1rem' }}>
      The more you write, the clearer the picture gets.<br />
      Keep going. You’re not just venting—you’re building self-understanding.
    </p>
    {!hasUsedOverride && (
      <button
        onClick={() => {
          setShowSummary(true);
          setHasUsedOverride(true);
        }}
        style={{
          marginTop: '1rem',
          backgroundColor: '#ffa500',
          color: '#fff',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ✨ Generate Preview Summary →
      </button>
    )}
  </div>
)}

      <div style={{ marginTop: '2rem' }}>
        <h3>🧠 Your Reflection Thread</h3>
          
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {Array.isArray(history) && history.length > 0 ? (
            history.map((item, index) => (
             <div
              key={index}
              className={item.id === latestEntryId ? 'fade-in' : ''}
              style={{ marginBottom: '2rem' }}
              >
                <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
                  <p><strong>🧍 You:</strong></p>
                  <p>{String(item.entry_text || '(No entry text)')}</p>
                </div>

                <div style={{
                  backgroundColor: item.tone_mode?.trim() === 'Frank Friend' ? '#fff1f1' : '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '6px',
                  borderLeft: `4px solid ${item.tone_mode?.trim() === 'Frank Friend' ? '#cc0000' : '#2e7d32'}`,
                  marginTop: '1rem'
                }}>
                  <p><strong>
                    {item.tone_mode?.trim() === 'Frank Friend'
                      ? '🔴 Frank Friend'
                      : '🟢 Stoic Mentor'}
                  </strong></p>
                  <p>{String(item.response_text || '(No reflection yet)')}</p>
                </div>

                <hr style={{ marginTop: '2rem' }} />
              </div>
            ))
          ) : (
            <p style={{ color: '#777' }}><em>No reflections yet.</em></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
