import React, { useEffect, useState } from 'react';
import AuthForm from './AuthForm';
import { supabase } from './supabaseClient';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [forcedTone, setForcedTone] = useState("frank"); // or "stoic" as default


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

    console.log('Submitting:', entry);

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, forcedTone }),


    });

    const data = await res.json();
    console.log('GPT Response:', data);

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

      <br /><br />
<label style={{ display: 'block', marginBottom: '0.5rem' }}>Voice (required):</label>
<select value={forcedTone} onChange={(e) => setForcedTone(e.target.value)}>
  <option value="frank">🔴 Frank Friend</option>
  <option value="stoic">🟢 Stoic Mentor</option>
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

     <div style={{ marginTop: '2rem' }}>
  <h3>🧠 Your Reflection Thread</h3>
  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
    {Array.isArray(history) && history.length > 0 ? (
      history.map((item, index) => (
        <div key={index} style={{ marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
            <p><strong>🧍 You:</strong></p>
            <p>{String(item.entry_text || '(No entry text)')}</p>
          </div>

       <div style={{
  backgroundColor: item.tone_mode === 'Frank Friend' ? '#fff1f1' : '#f0fdf4',
  padding: '1rem',
  borderRadius: '6px',
  borderLeft: `4px solid ${item.tone_mode === 'Frank Friend' ? '#cc0000' : '#2e7d32'}`,
  marginTop: '1rem'
}}>
  <p style={{
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: item.tone_mode === 'Frank Friend' ? '#b30000' : '#05642c',
    marginBottom: '0.5rem'
  }}>
    {item.tone_mode === 'Frank Friend' ? '🔴 Frank Friend' : '🟢 Stoic Mentor'}
  </p>
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
