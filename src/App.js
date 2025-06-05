import React, { useEffect, useState } from 'react';
import AuthForm from './AuthForm';
import { supabase } from './supabaseClient';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [tone, setTone] = useState('warm-therapist');

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

  const saveJournalEntry = async (entry, tone, userId) => {
    const { error } = await supabase.from('journals').insert([
      {
        user_id: userId,
        entry_text: entry,
        tone_mode: tone,
        timestamp: new Date(),
      },
    ]);
    if (error) {
      console.error('Failed to save journal entry:', error.message);
    } else {
      console.log('Journal entry saved!');
    }
  };

  const handleSubmit = async () => {
    const user = session?.user;
    if (!user) return;

    await saveJournalEntry(entry, tone, user.id);
    setEntry('');
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
    </div>
  );
};

export default App;
