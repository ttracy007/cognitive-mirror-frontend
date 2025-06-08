
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
  const [parsedTags, setParsedTags] = useState([]);
  const [severityLevel, setSeverityLevel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [username, setUsername] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const prompts = ["What’s weighing you down?", "What needs to come out?"];
  const [placeholderPrompt, setPlaceholderPrompt] = useState(() =>
    prompts[Math.floor(Math.random() * prompts.length)]
  );
  let transcriptBuffer = '';

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        const cleaned = finalTranscript.trim().replace(/\s+/g, ' ').replace(/[.!?]{2,}/g, match => match[0]);
        if (cleaned && !transcriptBuffer.endsWith(cleaned)) {
          transcriptBuffer += (cleaned + ' ');
          setEntry(transcriptBuffer.trim());
        }
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

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
    if (!error) setHistory(data || []);
  };

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  const handleSubmit = async () => {
    const user = session?.user;
    if (!user || !entry.trim()) return;

    setIsProcessing(true);

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
        username: username,
        entry_text: entry,
        response_text: responseText,
        tone_mode: data.tone_mode,
      })
      .select();

    if (!error && saved && saved[0]) {
      setLatestEntryId(saved[0].id);
    }

    setEntry('');
    setSummaryText('');
    setParsedTags([]);
    setSeverityLevel('');
    setIsProcessing(false);
    setTimeout(fetchHistory, 300);
  };

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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '1rem' }}>Cognitive Mirror</h1>

      
      <div style={{ marginBottom: '1rem' }}>
        <label>Voice (required): </label>
        <select value={forcedTone} onChange={(e) => setForcedTone(e.target.value)}>
          <option value="frank">🔴 Frank Friend</option>
          <option value="stoic">🟢 Stoic Mentor</option>
        </select>
      </div>


      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <textarea
            rows="6"
            cols="60"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={placeholderPrompt}
            style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
          />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button onClick={startListening} disabled={isListening}>🎙️ Start Talking</button>
            <button onClick={stopListening} disabled={!isListening}>🛑 Stop</button>
            <button onClick={handleSubmit} disabled={isProcessing || !entry.trim()}>🧠 Reflect</button>
            {isListening && <span>🎧 Listening…</span>}
            {isProcessing && <span style={{ color: '#888' }}>⏳ Processing reflection…</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
