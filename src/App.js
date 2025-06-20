// 🔼 Imports and Setup 
import React, { useEffect, useState } from 'react';
import SummaryViewer from './SummaryViewer'; 
import { supabase } from './supabaseClient';
import './App.css';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';

// 🔽 Component State Initialization
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

  // 🔽 Function 1: Load Saved Username
  useEffect(() => {
      const savedUsername = localStorage.getItem("username");
      if (savedUsername) {
        setUsername(savedUsername);
      }
  }, []);

  // 🔽 Function 2: Set Up Voice Recognition
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

  // 🔽 Function 3: Show Summary Trigger
  useEffect(() => {
    const hasTriggeredSummary = localStorage.getItem('hasTriggeredSummary');
    if (!hasTriggeredSummary && history.length >= 5) {
      setShowSummary(true);
      localStorage.setItem('hasTriggeredSummary', 'true');
    }
  }, [history]);

   // 🔽 Function 3a: Build Current Commit Tag 
  useEffect(() => {
    fetch('/build-version.txt')
      .then(res => res.text())
      .then(text => {
         console.log("🛠️ App.js version:", text);
         console.log(`🧱 Frontend build version: ${text}`);
      });
  }, []);
  
  // 🔽 Function 4: Auth Setup
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

  // 🔽 Function 5: Submit New Journal Entry
  const handleSubmit = async () => {
        console.warn("🧪 handleSubmit called!");
    const user = session?.user;
    if (!user || !entry.trim()) return;
    
    
    
    setIsProcessing(true);

    if (!username || username.trim() === "") {
      console.warn("Username is missing-aborting submission.");
      alert("Username is missing-please refresh or log in again.");
      return;
    }

    const debug_marker = Math.random().toString(36).substring(2, 8);
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_text:entry, tone_mode:forcedTone, username, user_id:userId, debug_marker }),
    });

    const data = await res.json();
    const responseText = data.response || 'No response received.';

    console.log('✅ Submitting journal for user:', username);
    // console.log("💡 Fresh deploy trigger");
    // console.log("🚨 App.js version: [insert build label or timestamp]");
    
    setEntry('');
    setParsedTags([]);
    setSeverityLevel('');
    setIsProcessing(false);
    setTimeout(fetchHistory, 300);
  };

   // 🔽 Function 6: Fetch Past Journals
  const fetchHistory = async () => {
    const user = session?.user;
    if (!user) return;
    const { data, error } = await supabase
      .from('journals')
      .select('id, entry_text, response_text, tone_mode, timestamp, debug_marker')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });
      
    if (error) {
    console.error("❌ Error fetching history:", error.message);
    return;
  }

  const filtered = (data || []).filter(entry =>
    entry.response_text?.trim().toLowerCase() !== 'no response received.' &&
    entry.debug_marker?.trim() !== ''
  );
  console.log("📜 Filtered journal history:", filtered);  // <== Required for confirmation
  setHistory(filtered);
};

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  // 🔽 UI State Routing
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

  // 🔽 Tone Display Utility
  const displayTone = (mode) => {
    const t = mode?.trim().toLowerCase();
    return t === 'frank' ? '🔴 Frank Friend' : '🟢 Stoic Mentor';
  };

  const getToneStyle = (mode) => {
    const tone = mode?.trim().toLowerCase();
    switch (tone) {
      case 'frank':
      case 'frank friend':
        return {
          backgroundColor: '#fff1f1',
          borderColor: '#cc0000',
          label: '🔴 Frank Friend',
        };
      case 'stoic':
      case 'stoic mentor':
        return {
          backgroundColor: '#f0fdf4',
          borderColor: '#2e7d32',
          label: '🟢 Stoic Mentor',
        };
      case 'therapist':
        return {
          backgroundColor: '#fef6ff',
          borderColor: '#b755e5',
          label: '🟣 Therapist Mode',
        };
      case 'movies':
        return {
          backgroundColor: '#fdfaf6',
          borderColor: '#ff8c00',
          label: '🎬 Movie Metaphors Man',
        };
      default:
        return {
          backgroundColor: '#eeeeee',
          borderColor: '#999999',
          label: '❓ Unknown',
        };
    }
  };

  // 🔽 UI Rendering
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* Header and Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Cognitive Mirror</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setSession(null);
          }}
          style={{ padding: '0.5rem 1rem', background: '#eee', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>

      {/* Tone Picker */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>🗣️ Voice:</label>
        <select
          value={forcedTone}
          onChange={(e) => setForcedTone(e.target.value)}
          style={{ padding: '0.4rem' }}
        >
          <option value="frank">Frank Friend</option>
          <option value="stoic">Stoic Mentor</option>
          <option value="therapist">Therapist Mode</option>
          <option value="movies">Movie Metaphors Man</option>
        </select>
      </div>

      {/* Journal Input & Instructions */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Input */}
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

        {/* Prompt Instructions */}
        <div style={{
          flex: 1,
          backgroundColor: '#f9f9f9',
          padding: '1rem',
          borderLeft: '4px solid #ffa500',
          borderRadius: '6px',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          color: '#333'
        }}>
          <strong>Pick a real problem. Share it fully.</strong><br />
          The mirror gets to know you by what you give it—and over time, it starts revealing emotional patterns and loops you didn’t even know you had.<br /><br />
          Respond honestly to whatever it reflects back. Let it challenge you.<br />
          <strong>The more you give, the more it gives you back.</strong>
        </div>
      </div>

      {/* Reflection Thread & Summary */}
      <div style={{ marginTop: '2rem' }}>
        <h3>🧠 Your Reflection Thread</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>

          {history.length >= 5 ? (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                onClick={() => setShowSummary(true)}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Generate Handoff Summaries
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                disabled
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#ccc',
                  color: '#666',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'not-allowed'
                }}
              >
                Add at least 5 reflections to enable summaries
              </button>
            </div>
          )}

          {showSummary && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <SummaryViewer history={history} onClose={() => setShowSummary(false)} />
            </div>
          )}

          {history.length > 0 ? (
            history.map((item, index) => {
              const style = getToneStyle(item.tone_mode);
              return (
                <div key={index} style={{ marginBottom: '2rem' }}>
                  <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
                    <p><strong>🧠 You:</strong></p>
                    <p>{item.entry_text}</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: style.backgroundColor,
                      padding: '1rem',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${style.borderColor}`,
                      marginTop: '1rem'
                    }}
                  >
                    <p><strong>{style.label}</strong></p>
                    <p>{item.response_text}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#777' }}><em>No reflections yet.</em></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
