import React, { useEffect, useState } from 'react';
import SummaryViewer from './SummaryViewer';  
import { supabase } from './supabaseClient';
import './App.css';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [forcedTone, setForcedTone] = useState("frank");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [parsedTags, setParsedTags] = useState([]);
  const [severityLevel, setSeverityLevel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [username, setUsername] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const prompts = ["What’s weighing you down?"];
  const [placeholderPrompt, setPlaceholderPrompt] = useState(() =>
    prompts[Math.floor(Math.random() * prompts.length)]
  );
  let transcriptBuffer = '';

  useEffect(() => {
      const savedUsername = localStorage.getItem("username");
      if (savedUsername) {
        setUsername(savedUsername);
  }
  }, []);
  
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
  const hasTriggeredSummary = localStorage.getItem('hasTriggeredSummary');
  if (!hasTriggeredSummary && history.length >= 5) {
    setShowSummary(true);
    localStorage.setItem('hasTriggeredSummary', 'true');
  }
}, [history]);
  
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

   // 🔽 Function 1: Submit Journal
  const handleSubmitJournal = async () => {
    if (!entry.trim()) {
      console.warn("⚠️ Entry is empty—submission skipped.");
      return;
    }

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("❌ Supabase session error:", sessionError?.message);
        return;
      }

      const token = sessionData.session.access_token;
      const userId = sessionData.session.user?.id;

      const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          entry,
          tone_mode: forcedTone,
          username,
          user_id: userId
        }),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        console.error("❌ Journal POST failed:", errorResponse.error || res.statusText);
        return;
      }

      const result = await res.json();
      setSummaryText(result.response_text);
      setParsedTags(result.emotion_tags || []);
      setSeverityLevel(result.severity || '');
      fetchHistory(); // Optional refresh if needed
    } catch (err) {
      console.error("❌ Unhandled journal submit error:", err.message);
    }
  };

  // 🔽 Function 2: Fetch Past Journals
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

  // 🔽 UI setup (useEffect, etc)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchHistory();
    }
  }, [session]);

  // 🔽 UI rendering begins
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Cognitive Mirror</h1>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="What’s on your mind?"
        style={{ width: '100%', height: '100px' }}
      />
      <div style={{ marginTop: '1rem' }}>
        <label>
          Choose a voice:
          <select
            value={forcedTone}
            onChange={(e) => setForcedTone(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="frank">Frank Friend</option>
            <option value="stoic">Stoic Mentor</option>
            <option value="therapist">Therapist</option>
            <option value="movies">Movie Metaphors</option>
          </select>
        </label>
        <button onClick={handleSubmitJournal} style={{ marginLeft: '1rem' }}>
          Submit
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {history.length > 0 ? (
          history.map((item, index) => (
            <div key={index} style={{ marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
                <p><strong>🧠 You:</strong></p>
                <p>{item.entry_text}</p>
              </div>
              <div
                style={{
                  backgroundColor: '#e6f7ff',
                  padding: '1rem',
                  borderRadius: '6px',
                  borderLeft: '4px solid #1890ff',
                  marginTop: '1rem'
                }}
              >
                <p><strong>{item.tone_mode}</strong></p>
                <p>{item.response_text}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#777' }}><em>No reflections yet.</em></p>
        )}
      </div>

      {showSummary && (
        <SummaryViewer history={history} onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
};

export default App;
