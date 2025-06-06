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
      setHistory(data || []);
    }
  };

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  const handleSubmit = async () => {
    const user = session?.user;
    if (!user || !entry.trim()) return;

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, forcedTone }),
    });

    const data = await res.json();
    const responseText = data.response || 'No response received.';

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
    } else if (saved && saved[0]) {
      setLatestEntryId(saved[0].id);
    }

    setEntry('');
    setTimeout(fetchHistory, 300);
  };

  if (!session) return <AuthForm />;

  const canGenerateSummary = Array.isArray(history) && history.length >= 5;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <p>✅ Logged in as {session.user.email}</p>
      <br /><br />

      {/* Tone + Summary Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <label>Voice (required):</label>
        <select value={forcedTone} onChange={(e) => setForcedTone(e.target.value)}>
          <option value="frank">🔴 Frank Friend</option>
          <option value="stoic">🟢 Stoic Mentor</option>
        </select>

        {canGenerateSummary ? (
          <>
            <button onClick={() => alert('🧠 Summary feature coming soon.')}>
              🔍 Generate Summary
            </button>
            <button onClick={() => alert('🧪 Previewing a sample summary...')}>
              🧪 Preview Summary
            </button>
          </>
        ) : null}
      </div>

      {/* Conditional “Not Quite Yet” block */}
      {!canGenerateSummary && !showSummary && (
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
          <h3 style={{ marginTop: 0 }}>🔍 <strong>“Not Quite Yet”</strong></h3>
          <p>
            <strong>Cognitive Mirror</strong> works best when it sees you over time—not just in a single moment.<br />
            We need <strong>at least five days</strong> of journaling to form a meaningful reflection summary.
          </p>
          <p>
            That gives the mirror a chance to detect emotional patterns, shifts, and turning points—not just passing moods.<br />
            The more you write, the clearer the picture gets. Keep going—you’re not just venting, you’re building insight.
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

      {/* Journal Input */}
      <textarea
        rows="6"
        cols="60"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="What's on your mind?"
      />
      <br /><br />
      <button onClick={handleSubmit}>Reflect</button>

      {/* History Thread */}
      <div style={{ marginTop: '2rem' }}>
        <h3>🧠 Your Reflection Thread</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {history.length > 0 ? (
            history.map((item, index) => (
              <div
                key={index}
                className={item.id === latestEntryId ? 'fade-in' : ''}
                style={{ marginBottom: '2rem' }}
              >
                <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
                  <p><strong>🧍 You:</strong></p>
                  <p>{item.entry_text}</p>
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
                  <p>{item.response_text}</p>
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
