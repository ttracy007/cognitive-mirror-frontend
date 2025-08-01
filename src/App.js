// 🔼 Imports and Setup  
import React, { useEffect, useState } from 'react'; 
import SummaryViewer from './SummaryViewer'; 
import { supabase } from './supabaseClient';
import './App.css';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import JournalTimeline from './components/JournalTimeline';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [forcedTone, setForcedTone] = useState("frank");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [parsedTags, setParsedTags] = useState([]);
  const [severityLevel, setSeverityLevel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [username, setUsername] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const prompts = ["What’s weighing you down?"];
  const [showGroupedView, setShowGroupedView] = useState(false);
  const [placeholderPrompt, setPlaceholderPrompt] = useState(() =>
    prompts[Math.floor(Math.random() * prompts.length)] 
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  let transcriptBuffer = '';
  const [tooltipVisible, setTooltipVisible] = useState(false);

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
         // console.log(`🧱 Frontend build version: ${text}`);
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

    console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL);

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry_text: entry,
        tone_mode: forcedTone,
        username,
        user_id: userId,
        debug_marker,
      }),
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
    setRefreshTrigger(prev => prev +1);
  };

  // 🔽 Function 5b: Generate Pattern Insight
  const handlePatternInsight = async () => {
    setIsProcessing(true); // ⏳ Mirror is thinking...
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/generate-pattern-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          tone_mode: toneMode  // ✅ pass selected voice
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('✅ Insight:', data.insight);
        setRefreshTrigger(prev => prev + 1); // 🔁 trigger timeline refresh
      } else {
        console.error('❌ Insight error:', data.error);
      }
    } catch (err) {
      console.error('❌ Insight fetch failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };
   // 🔽 Function 6: Fetch Past Journals
  const fetchHistory = async () => {
    const user = session?.user;
    if (!user) return;
    const { data, error } = await supabase
      .from('journals')
      .select('id, entry_text, response_text, primary_theme, secondary_theme, tone_mode, timestamp, debug_marker')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });
      
    if (error) {
    console.error("❌ Error fetching history:", error.message);
    return;
  }

  // 🔽 Function 6a: Filter Out No Respose, No debug markers 

  const showAll = true; // <== True all entries, False filtered 
  const filtered = showAll
    ? (data || [])
    : (data || []).filter(entry =>
    entry.response_text?.trim().toLowerCase() !== 'no response received.' &&
    entry.debug_marker?.trim() !== ''
  );
  // console.log("📜 Filtered journal history:", filtered);  // <== Enable if False 
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

// 🔽 Function 7: Generate Handoff Summaries  

  // 🔽 Tone Display Utility
  const displayTone = (mode) => {
    const t = mode?.trim().toLowerCase();
    return t === 'frank' ? '🔴 Frank Friend' : '🟢 Marcus Aurelius';
  };

  const getToneStyle = (mode) => {
    const tone = mode?.trim().toLowerCase();
    switch (tone) {
      case 'frank':
      case 'frank friend':
        return {
          backgroundColor: '#fff1f1',
          borderColor: '#cc0000',
          label: '🔴 Tony',
        };
      case 'marcus':
      case 'marcus aurelius':
        return {
          backgroundColor: '#f0fdf4',
          borderColor: '#2e7d32',
          label: '🟢 Marcus Aurelius',
        };
      case 'therapist':
        return {
          backgroundColor: '#fef6ff',
          borderColor: '#b755e5',
          label: '🟣 Clara',
        };
      case 'movies':
        return {
          backgroundColor: '#fdfaf6',
          borderColor: '#ff8c00',
          label: '🎬 Movie Metaphors Man',
        };
      case 'verena':
          return {
            backgroundColor: '#ffeaf0',
            borderColor: '#ec407a',
            label: '🌸 Verena',
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
  <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
 {/* Header with Logout + Summary */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h1 style={{ marginBottom: '1rem' }}>Cognitive Mirror</h1>
  <div style={{ display: 'flex', gap: '1rem' }}>
    <button
      onClick={() => setShowSummary(true)}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Generate Handoff Summaries
    </button>
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
</div>

 {/* Input box now at TOP */}
    <div style={{ marginTop: '1rem' }}>
      <textarea
  rows="6"
  cols="60"
  value={entry}
  onChange={(e) => setEntry(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (entry.trim() && !isProcessing) {
        handleSubmit();
      }
    }
  }}
  placeholder={placeholderPrompt}
  style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
/>
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
        <button onClick={startListening} disabled={isListening}>🎙️ Start Talking</button>
        <button onClick={stopListening} disabled={!isListening}>🛑 Stop</button>
        <button onClick={handleSubmit} disabled={isProcessing || !entry.trim()}>🧠 Reflect</button>
        {/* <button
            onClick={handlePatternInsight}
            disabled={isProcessing}
            style={{
              backgroundColor: '#444',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔍 See Pattern Insight
          </button> */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={handlePatternInsight}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
             style={{
              backgroundColor: '#374151',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            >
              🧭 See Pattern Insight
            </button>

            {tooltipVisible && (
              <div style={{
                position: 'absolute',
                top: '-2.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#333',
                color: '#fff',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                zIndex: 1000
              }}>
                Generates a unified insight based on your recent themes, topics, and emotional loops.
              </div>
            )}
          </div>

        {isListening && <span>🎧 Listening…</span>}
        {isProcessing && (
      <div style={{ color: '#888', fontStyle: 'italic', fontSize: '0.95rem' }}>
        Mirror is thinking<span className="dots"></span>
  </div>
)}

      </div>
    </div>


{/* JournalTimeline Render Call */}
<div style={{ flex: 1, overflowY: 'auto' }}>
  <JournalTimeline userId={session?.user?.id} refreshTrigger={refreshTrigger} />
</div>

   
    {/* Generate Handoff Summary Bottom Center
    // <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
    //   {history.length >= 5 ? (
    //     <button
    //       onClick={() => setShowSummary(true)}
    //       style={{
    //         padding: '1rem 2rem',
    //         fontSize: '1rem',
    //         backgroundColor: '#333',
    //         color: 'white',
    //         border: 'none',
    //         borderRadius: '5px',
    //         cursor: 'pointer'
    //       }}
    //     >
    //       Generate Handoff Summaries
    //     </button>
    //   ) : (
    //     <button
    //       disabled
    //       style={{
    //         padding: '1rem 2rem',
    //         fontSize: '1rem',
    //         backgroundColor: '#ccc',
    //         color: '#666',
    //         border: 'none',
    //         borderRadius: '5px',
    //         cursor: 'not-allowed'
    //       }}
    //     >
    //       Add at least 5 reflections to enable summaries
    //     </button>
    //   )}
      </div>
      */}   

      {showSummary && (
        <div style={{ marginTop: '1rem' }}>
          <SummaryViewer history={history} onClose={() => setShowSummary(false)} />
        </div>
      )}
      {/* Bottom-center fixed tone picker */}
<div style={{
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#f4f4f4',
  padding: '0.5rem 1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  zIndex: 999
}}>
  <label style={{ marginRight: '0.5rem' }}>🗣️ Voice:</label>
  <select
    value={forcedTone}
    onChange={(e) => setForcedTone(e.target.value)}
    style={{ padding: '0.4rem' }}
  >
    <option value="frank">Tony</option>
    <option value="marcus">Marcus</option>
    <option value="therapist">Clara</option>
    <option value="movies">Movies</option>
    <option value="verena">Verena</option>
  </select>
</div>
//     {/* 🔁 Pinned Bottom-Right: Generate Summary Button */}
{/*{history.length >= 5 && (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#333',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    zIndex: 9999
  }}>
    <button
      onClick={() => setShowSummary(true)}
      style={{
        fontSize: '0.9rem',
        color: 'white',
        background: 'none',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      🧠 Summary
    </button>
  </div>
)}*/}
  </div>
  );
};
export default App;
