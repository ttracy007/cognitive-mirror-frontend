import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import './App.css';
import LoginPage from './LoginPage';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [forcedTone, setForcedTone] = useState("frank");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [summaryText, setSummaryText] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

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
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (!error) setHistory(data || []);
  };

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  const handleReflect = async () => {
    const user = session?.user;
    if (!user || !entry.trim()) return;

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, forcedTone }),
    });

    const data = await res.json();
    const responseText = data.response || 'No response received.';

    await supabase.from('journals').insert({
      user_id: user.id,
      entry_text: entry,
      response_text: responseText,
      tone_mode: data.tone_mode,
    });

    setEntry('');
    fetchHistory();
  };

  const handleStartListening = () => {
    if (!window.webkitSpeechRecognition) {
      alert("Your browser does not support SpeechRecognition.");
      return;
    }

    const recog = new window.webkitSpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setEntry((prev) => prev + ' ' + event.results[i][0].transcript.trim());
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    recog.onend = () => setListening(false);

    recog.start();
    setRecognition(recog);
    setListening(true);
  };

  const handleStopListening = () => {
    if (recognition) recognition.stop();
    setListening(false);
  };

  if (!session) {
    return <LoginPage onAuthSuccess={(session) => setSession(session)} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Cognitive Mirror</h1>

      <label>Voice (required): </label>
      <select value={forcedTone} onChange={(e) => setForcedTone(e.target.value)}>
        <option value="frank">🔴 Frank Friend</option>
        <option value="stoic">🟢 Stoic Mentor</option>
      </select>

      <textarea
        rows="5"
        style={{ width: '100%', marginTop: '1rem' }}
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="What's weighing you down?"
      />

      <div style={{ marginTop: '0.5rem' }}>
        <button onClick={handleStartListening} disabled={listening}>🎙 Start Talking</button>
        <button onClick={handleStopListening} disabled={!listening}>🔴 Stop</button>
        <button onClick={handleReflect}>🧠 Reflect</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>🧠 Your Reflection Thread</h3>
        {loadingSummary && <p>⏳ Processing...</p>}
        {history.length === 0 ? <p><em>No reflections yet.</em></p> :
          history.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
              <p><strong>🧍 You:</strong> {item.entry_text}</p>
              <p><strong>{item.tone_mode}:</strong> {item.response_text}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default App;
