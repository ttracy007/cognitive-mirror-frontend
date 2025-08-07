// 🔼 Imports and Setup     
import React, { useEffect, useState } from 'react'; 
import SummaryViewer from './SummaryViewer'; 
import { supabase } from './supabaseClient';
import './App.css';
import JournalTimeline from './components/JournalTimeline';

const App = () => {
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
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const prompts = ["What’s shakkng sugar?"];
  const [showGroupedView, setShowGroupedView] = useState(false);
  const [placeholderPrompt, setPlaceholderPrompt] = useState(() =>
    prompts[Math.floor(Math.random() * prompts.length)] 
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  let transcriptBuffer = '';
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [styleVariant, setStyleVariant] = useState("D")
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeStep, setWelcomeStep] =useState(1);
  const [username, setUsername] = useState('');

  // 🔽 Function 1: Load Saved Username
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
      // setShowWelcome(false); // auto-skip welcome on reload
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
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/generate-pattern-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          tone_mode: forcedTone // ✅ pass selected voice
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
  <>
    {/* Step 1: Welcome Screen */}
    {showWelcome && welcomeStep === 1 && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.96)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '1.5rem',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        overflowY: 'auto'
      }}>
        <div style={{ maxWidth: '600px', width: '90%' }}>
          <h2 style={{ marginBottom: '0.8rem', fontSize: '1.6rem' }}>🪞 Welcome to Cognitive Mirror</h2>
          <p style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>
            <strong>This isn’t a chatbot.</strong><br />
            It’s a place to hear yourself — and be challenged.
          </p>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.8rem' }}>
            Start by dropping one honest thought.<br />
            Nothing fancy. Just what’s actually on your mind.
          </p>
          <blockquote style={{ fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.95rem', color: '#444' }}>
            “I keep going back to the same idiot time after time even though I know he’s a jackass. What’s wrong with me?”
          </blockquote>
          <p style={{ fontSize: '0.95rem', marginBottom: '1.2rem' }}>
            Then click 🧠 <strong>Reflect</strong>.<br />
            Mirror will respond in a voice that cuts through the noise.
          </p>

          <hr style={{ width: '100%', margin: '1.2rem 0' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>💡 What Happens Next</h3>
          <ul style={{ textAlign: 'left', fontSize: '0.95rem', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
            <li>• Your reflections are remembered — across time.</li>
            <li>• Mirror will track the themes you return to most.</li>
            <li>• When you’re ready, click <strong>See Pattern Insight</strong> to spot emotional loops.</li>
            <li>• Before your next therapy session? Click <strong>Generate Summary</strong>.</li>
          </ul>

          <p style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1.2rem' }}>
            🟢 Ready to try? Just type and Reflect.
          </p>

          <button
            onClick={() => setWelcomeStep(2)}
            style={{
              padding: '0.6rem 1.2rem',
              fontSize: '0.95rem',
              borderRadius: '6px',
              backgroundColor: '#374151',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Start Reflecting →
          </button>
        </div>
      </div>
    )}

    {/* Step 2: Username */}
    {showWelcome && welcomeStep === 2 && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.96)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>What should we call you?</h2>
        <p style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>
          Don’t worry — everything you say here is like Vegas. Stays in the Mirror.
        </p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a name"
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '1.5rem',
            width: '100%',
            maxWidth: '300px'
          }}
        />
        <button
          onClick={() => setShowWelcome(false)}
          disabled={!username.trim()}
          style={{
            padding: '0.8rem 1.5rem',
            fontSize: '1rem',
            borderRadius: '6px',
            backgroundColor: '#374151',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Let’s begin →
        </button>
      </div>
    )}

    {/* MAIN APP INTERFACE — Only render when welcome is dismissed */}
    {!showWelcome && (
      <div className="chat-container background-option-1">
        {/* Header with Logout + Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Cognitive Mirror</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowSummary(true)}>Generate Handoff Summaries</button>
            <button onClick={async () => {
              await supabase.auth.signOut();
              setSession(null);
            }}>Log Out</button>
          </div>
        </div>

        {/* Sticky Input Bar */}
        <div className="reflection-input-container" style={{ position: 'fixed', bottom: '70px', left: 0, right: 0, zIndex: 999 }}>
          <textarea
            rows="3"
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
          {/* Buttons below input */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={startListening} disabled={isListening}>🎙️ Start</button>
            <button onClick={stopListening} disabled={!isListening}>🛑 Stop</button>
            <button onClick={handleSubmit} disabled={isProcessing || !entry.trim()}>🧠 Reflect</button>
            <button
              onClick={handlePatternInsight}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              🧭 See Pattern Insight
            </button>
            {tooltipVisible && (
              <div style={{
                position: 'absolute', top: '-2.5rem', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: '#333', color: '#fff', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem'
              }}>
                Generates a unified insight based on your recent themes, topics, and emotional loops.
              </div>
            )}
            {isListening && <span>🎧 Listening…</span>}
            {isProcessing && <div>Mirror is thinking<span className="dots"></span></div>}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <JournalTimeline
            userId={session?.user?.id}
            refreshTrigger={refreshTrigger}
            styleVariant={styleVariant}
          />
        </div>

        {/* Tone Picker */}
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#f4f4f4', padding: '0.5rem 1rem',
          borderRadius: '8px', zIndex: 999
        }}>
          <label style={{ marginRight: '0.5rem' }}>🗣️ Voice:</label>
          <select value={forcedTone} onChange={(e) => setForcedTone(e.target.value)}>
            <option value="frank">Tony</option>
            <option value="marcus">Marcus</option>
            <option value="therapist">Clara</option>
            <option value="movies">Movies</option>
            <option value="verena">Verena</option>
          </select>
        </div>

        {/* Summary Viewer */}
        {showSummary && (
          <div style={{ marginTop: '1rem' }}>
            <SummaryViewer history={history} onClose={() => setShowSummary(false)} />
          </div>
        )}
      </div>
    )}
  </>
);
}

export default App;
