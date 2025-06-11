
import React, { useEffect, useState } from 'react';
import './App.css';
import AuthForm from './AuthForm';
import { supabase } from './supabaseClient';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [forcedTone, setForcedTone] = useState('frank');
  const [history, setHistory] = useState([]);
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [parsedTags, setParsedTags] = useState([]);
  const [severityLevel, setSeverityLevel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      console.log("✅ Username restored from localStorage:", storedUsername);
      setUsername(storedUsername);
    }
  }, []);

  const fetchHistory = async () => {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', user?.user?.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setHistory(data);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    console.log("🧠 Submitting journal for user:", username);

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, forcedTone, username }),
    });

    const data = await res.json();
    const responseText = data.response || 'No response received.';

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const {
      data: savedEntry,
      error,
    } = await supabase
      .from('journals')
      .insert({
        user_id: userId,
        username: username,
        entry_text: entry,
        response_text: responseText,
        tone_mode: forcedTone,
      })
      .select();

    if (!error && savedEntry && savedEntry[0]) {
      setLatestEntryId(savedEntry[0].id);
    }

    setEntry('');
    setSummaryText('');
    setParsedTags([]);
    setSeverityLevel('');
    setIsProcessing(false);
    setTimeout(fetchHistory, 300);
  };

  if (!session && !showLogin) {
    return <LandingPage onStart={() => setShowLogin(true)} />;
  }

  if (!session) {
    return (
      <LoginPage
        onAuthSuccess={(session, username) => {
          setSession(session);
          setUsername(username);
          localStorage.setItem("username", username);
        }}
      />
    );
  }

  return (
    <div className="App">
      <h1>Cognitive Mirror</h1>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="What's on your mind?"
      />
      <div className="controls">
        <select value={forcedTone} onChange={(e) => setForcedTone(e.target.value)}>
          <option value="frank">Frank Friend</option>
          <option value="stoic">Stoic Mentor</option>
        </select>
        <button onClick={handleSubmit} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Submit'}
        </button>
      </div>
      <div className="history">
        <h2>Journal History</h2>
        {history.map((entry, index) => (
          <div key={index} className="entry">
            <strong>{entry.tone_mode}:</strong> {entry.entry_text}<br />
            <em>Response:</em> {entry.response_text}<br />
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
