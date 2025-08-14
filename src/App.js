// 🔼 Imports and Setup     
import React, { useEffect, useState } from 'react'; 
import SummaryViewer from './SummaryViewer'; 
import { supabase } from './supabaseClient';
import './App.css';
// import DemoSofia from './pages/DemoSofia';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import JournalTimeline from './components/JournalTimeline';

const App = () => {

  // --- Tone descriptions map ---
  const toneDescriptions = {
    therapist: "🩺 Clara – A warm, grounded therapist who sees the pattern beneath the panic.",
    marcus: "🧘 Marcus – Speaks like the Stoic philosopher himself. Will quote Meditations.",
    frank: "💪🍷 Tony – A frank, no-bullshit friend who tells you what you need to hear.",
    movies: "🎬 Movies – A movie buff who only speaks through movie metaphors.",
    verena: "🌸 Verena – A clarity-driven life coach unphased by self-pity."
  };

  // Default to Clara
  const [forcedTone, setForcedTone] = useState("therapist");
  // Keep a visible description bound to the current selection
  const [toneDescription, setToneDescription] = useState(toneDescriptions["therapist"]);

  const handleToneChange = (e) => {
    const val = e.target.value;
    setForcedTone(val);
    setToneDescription(toneDescriptions[val] || "");
  };

  // 🔽 Existing states (no change to their order beyond moving forcedTone here)
  const [showLogin, setShowLogin] = useState(false);
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [tooltip, setTooltip] = useState("🩺 Clara – A warm, grounded therapist who sees the pattern beneath the panic.");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [parsedTags, setParsedTags] = useState([]);
  const [severityLevel, setSeverityLevel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const prompts = ["What’s shaking sugar?"];
  const [showGroupedView, setShowGroupedView] = useState(false);
  const [placeholderPrompt, setPlaceholderPrompt] = useState(() =>
    prompts[Math.floor(Math.random() * prompts.length)] 
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  let transcriptBuffer = '';
  const [tooltipVisible, setTooltipVisible] = useState(null); // 'pattern' | 'therapist' | 'mood' | null
  const [styleVariant, setStyleVariant] = useState("D")
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] =useState(1);
  const [username, setUsername] = useState('');
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const handleOpenMoodTracker = () => setShowMoodTracker(true);
  const handleCloseMoodTracker = () => setShowMoodTracker(flase);

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

    // Centralize tooltip copy in one place
    const TOOLTIP_TEXT = {
      pattern: "Generates a unified insight based on your recent themes, topics, and emotional loops.",
      therapist: "A handoff-style recap of emotional themes, loops, and potential focus areas for therapy.",
      mood: "Visualizes your emotional trends over time. Coming soon."
    };

// 🔽 UI Rendering
return (
  <>
    {/* Step 1: Voice Introduction + Begin */}
    {showWelcome && welcomeStep === 1 && (
      <div
        style={{
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
          fontFamily: 'sans-serif',
          overflowY: 'auto'
        }}
      >
        <div style={{ maxWidth: '700px', width: '90%' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.6rem' }}>✨ Choose Your Companion</h2>
          <ul style={{ textAlign: 'left', fontSize: '1rem', marginBottom: '2rem' }}>
            <li style={{ marginBottom: '1rem' }}>
              <b>💪🍷 Tony</b> – A frank, no-bullshit friend who’s always honest and supportive, helping you cut through the crap and break free from the loops that keep you stuck.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <b>🧘 Marcus Aurelius</b> – Speaks like the Stoic philosopher himself—calm, sparse, and deeply rooted in principle. If inspired he may quote from his own journal, <i>Meditations</i>.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <b>🩺 Clara</b> – A warm, grounded therapist who sees the pattern beneath the panic.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <b>🎬 Movie Metaphor Man</b> – Only thinks in movie metaphors—no matter what you say. Your problems are part of the hero's journey.
            </li>
            <li style={{ marginBottom: '1.5rem' }}>
              <b>🌸 Verena</b> – Verena is a clarity-driven career coach who helps you stop spinning your wheels and start building something real.
            </li>
          </ul>

          <button
            onClick={() => setShowWelcome(false)}
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
      </div>
    )}

    {/* MAIN APP INTERFACE — Only render when welcome is dismissed */}
    {!showWelcome && (
      <div className="chat-container background-option-1">
        {/* Header with Logout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1
              style={{
                marginBottom: '0.3rem',
                fontSize: '1.8rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
                textShadow: '0 1px 1px rgba(0,0,0,0.1)'
              }}
            >
              <span className="mirror-emoji" role="img" aria-label="mirror">
                🪞
              </span>{' '}
              Cognitive Mirror
            </h1>

            <div
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.6rem',
                fontSize: '0.75rem',
                color: '#555',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontStyle: 'italic'
              }}
            >
              beta testing — feedback welcome
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setSession(null);
              }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Sticky Input Bar (fixed) */}
        <div
          className="reflection-input-container"
        >
          <textarea
          className="reflection-textarea"
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
        />
          {/* Toolbar row: all action buttons on one line */}
          <div
            className="cm-toolbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px 12px',
              padding: '6px 10px',
              background: '#f2f2f2',
              border: '1px solid #e6e6e6',
              borderRadius: '6px'
            }}
          >
            {/* Action buttons (one row) */}
            <div
              className="cm-actions"
              style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', position: 'relative' }}
            >
              {/* <button className="cm-btn" onClick={startListening} disabled={isListening}>
                🎙️ Start
              </button>
              <button className="cm-btn" onClick={stopListening} disabled={!isListening}>
                🛑 Stop
          </button> */}
          
              <button className="cm-btn" onClick={handleSubmit} disabled={isProcessing || !entry.trim()}>
                🧠 Reflect
              </button>

              <button
                className="cm-btn"
                onClick={handlePatternInsight}
                onMouseEnter={() => setTooltipVisible('pattern')}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                🧭 See Pattern Insight
              </button>

              <button
                className="cm-btn"
                onClick={() => setShowSummary(true)}
                onMouseEnter={() => setTooltipVisible('therapist')}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                🩺 Therapist Summary
              </button>

              <button
                className="cm-btn"
                onClick={handleOpenMoodTracker /* your existing handler */}
                onMouseEnter={() => setTooltipVisible('mood')}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                📊 Mood Tracker
              </button>

              {/* Shared tooltip renderer for the three buttons */}
              {tooltipVisible && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-2.4rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#333',
                    color: '#fff',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    pointerEvents: 'none'
                  }}
                >
                  {tooltipVisible === 'pattern' &&
                    'Generates a unified insight based on your recent themes, topics, and emotional loops.'}
                  {tooltipVisible === 'therapist' &&
                    'A handoff-style recap of emotional themes, loops, and potential focus areas for therapy.'}
                  {tooltipVisible === 'mood' && 'Visualizes your emotional trends over time. Coming soon.'}
                </div>
              )}

              {isListening && <span>🎧 Listening…</span>}
              {isProcessing && (
                <div>
                  Mirror is thinking<span className="dots"></span>
                </div>
              )}
            </div>

            {/* Voice cluster with subtle separation and a narrower select */}
            <div
              className="cm-voice"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px 10px',
                flexWrap: 'wrap',
                borderLeft: '1px solid #e6e6e6',
                paddingLeft: 12
              }}
            >
              <label style={{ marginRight: '0.35rem' }}>🗣️ Voice:</label>
              <select
                value={forcedTone}
                onChange={handleToneChange}
                aria-label="Select voice"
                style={{ minWidth: 120, maxWidth: 160, padding: '6px 8px' }}
              >
                <option value="therapist">Clara</option>
                <option value="marcus">Marcus</option>
                <option value="frank">Tony</option>
                <option value="movies">Movies</option>
                <option value="verena">Verena</option>
              </select>
              <div
                className="cm-tone-desc"
                aria-live="polite"
              >
                {toneDescription}
              </div>
            </div>
          </div>
          {/* END toolbar */}
        </div>
        {/* END fixed input container */}

        {/* Timeline (outside the fixed container) */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
          <JournalTimeline userId={session?.user?.id} refreshTrigger={refreshTrigger} styleVariant={styleVariant} />
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
