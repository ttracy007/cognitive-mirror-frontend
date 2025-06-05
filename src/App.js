import React, { useEffect, useState } from 'react';
import AuthForm from './AuthForm';
import { supabase } from './supabaseClient';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [tone, setTone] = useState('warm-therapist');
  const [history, setHistory] = useState([]);

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
      .select('entry_text, response_text, timestamp')
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

    console.log('Submitting:', entry, tone);

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, tone }),
    });

    const data = await res.json();
    console.log('GPT Response:', data);

    const responseText = data.response || 'No response received.';

    const { data: saved, error } = await supabase
      .from('journals')
      .insert({
        user_id: user.id,
        entry_text: entry,
        tone_mode: tone,
        response_text: responseText,
      })
      .select();

    if (error) {
      console.error('Save error:', error.message);
    } else {
      console.log('Saved entry:', saved);
    }

    setEntry('');
    setTimeout(fetchHistory, 300);
  };

  if (!session) return <AuthForm />;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <p>✅ Logged in as {session.user.email}</p>

      <label>Choose Your Voice:</label>
      <select value={tone} onChange={(e) => setTone(e.target.value)}>
        <option value="warm-therapist">Warm Therapist</option>
        <option value="stoic-mentor">Stoic Mentor</option>
        <option value="frank-friend">Frank-but-Kind Friend</option>
      </select>

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

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h3>📝 Reflections</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {Array.isArray(history) && history.length > 0 ? (
              history.map((item, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <p>{String(item.entry_text || '(No entry text)')}</p>
                  <hr />
                </div>
              ))
            ) : (
              <p style={{ color: '#777' }}><em>No entries yet.</em></p>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>🪞 Cognitive Mirror</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {Array.isArray(history) && history.length > 0 ? (
              history.map((item, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <p>{String(item.response_text || '(No reflection yet)')}</p>
                  <hr />
                </div>
              ))
            ) : (
              <p style={{ color: '#777' }}><em>No reflections yet.</em></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
