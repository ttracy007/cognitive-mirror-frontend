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

  const fetchHistory = async () => {
    const {
      data: user,
      error: userError
    } = await supabase.auth.getUser();

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

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, forcedTone, username }),
    });

    const data = await res.json();
    const responseText = data.response || 'No response received.';

    const {
      data: savedEntry,
      error,
    } = await supabase
      .from('journals')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        username: username,
        entry_text: entry,
        response_text: responseText,
        tone_mode: data.tone_mode,
        theme_tags: data.theme_tags || [],
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

  const handleSummary = async () => {
    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/clinical-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }),
    });
    const data = await res.json();
    setSummaryText(data.summary);
  };

  const parseTags = (text) => {
    const match = text.match(/Tags:\s*\[([^\]]+)\]/i);
    return match ? match[1].split(',').map(t => t.trim().toLowerCase()) : [];
  };

  const renderHistory = () => {
    return history.map((entry, index) => (
      <div key={index} className="entry">
        <div><strong>{entry.tone_mode}:</strong> {entry.entry_text}</div>
        <div><em>Response:</em> {entry.response_text}</div>
        <div><em>Tags:</em> {entry.theme_tags?.join(', ')}</div>
        <hr />
      </div>
    ));
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
        <button onClick={handleSummary}>Get Summary</button>
      </div>

      {summaryText && (
        <div className="summary">
          <h2>Summary</h2>
          <pre>{summaryText}</pre>
        </div>
      )}

      <div className="history">
        <h2>Journal History</h2>
        {renderHistory()}
      </div>
    </div>
  );
};

export default App;
