// 🔼 Imports and Setup  
import React, { useEffect, useState } from 'react'; 
import SummaryViewer from './SummaryViewer'; 
import { supabase } from './supabaseClient';
import './App.css';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import JournalTimeline from './components/JournalTimeline';

// 🔽 Component State Initialization
const ENTRY_ANALYSIS_PROMPT = `
You are an emotional insight detector. Given a user's journal reflection, extract three things:

1. Topics: the literal subjects driving the reflection — people, situations, unfinished tasks, real-world concerns. Each should be 1–3 word noun phrases. No vague emotions. Ask: “What are they actually talking about?”

2. Severity: the level of emotional entrenchment or distress, on a scale of 1–5.

3. Entry Type: Classify the entry into one of these categories:
- Question
- Self-reflection
- Emotional Venting
- Goal Setting
- Planning
- Celebration/Success
- Creative Ideation
- Casual Remark
- Voice Challenge
- Hybrid (if the entry clearly blends two types, e.g., "Self-reflection + Question")
- Other (if none of the categories above apply) 

Examples for each category:
- Question: "What should I do about this?" / "Do you think I'm on the right path?"
- Self-reflection: "I keep repeating the same mistakes and I don't know why." / "I feel like I'm stuck in a loop."
- Emotional Venting: "I'm so frustrated with this whole situation!" / "This is all just bullshit and I'm tired of it."
- Goal Setting: "This week I want to focus on finishing my side project." / "My goal is to run three times this week."
- Planning: "Tomorrow I'll start early and complete tasks A, B, and C." / "Next month I'll launch my website."
- Celebration/Success: "I crushed it at work today!" / "I'm so proud of how I handled that situation."
- Creative Ideation: "I have this new idea for an app that might solve X." / "I'm brainstorming ways to make this project stand out."
- Casual Remark: "Just a quick thought before I go to bed." / "Random note: I saw something interesting today."
- Voice Challenge: "Verena, you keep saying the same thing!" / "You don’t understand me at all, do you?"
- Hybrid: "I feel stuck. What do you think I should do?" / "I'm happy about this progress, but should I be doing something different?"

Format:
Topics: [comma-separated, lowercase, literal phrases]
Severity: [1–5]
Entry Type: [one of the categories listed above, or "Hybrid + <secondary type>" if applicable]
`;

const callOpenAIChat = async (messages) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`, // Ensure this is in your .env
    },
    body: JSON.stringify({
      model: "gpt-4", // or gpt-3.5-turbo if you're using that
      messages,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response";
};


const extractTopicsAndSeverity = async (entryText) => {
  const gptResponse = await callOpenAIChat([
    { role: 'system', content: ENTRY_ANALYSIS_PROMPT },
    { role: 'user', content: entryText }
  ]);

  console.log("🧪 GPT Analysis Raw Response:", gptResponse);
  
  const topicMatch = gptResponse.match(/Topics:\s*\[(.*?)\]/i);
  console.log("🧪 Topics Match:", topicMatch ? topicMatch[1] : "No match");
  
  const parsedTopics = topicMatch
    ? topicMatch[1].split(',').map(t => t.trim().toLowerCase())
    : [];

  const severityMatch = gptResponse.match(/Severity:\s*(\d)/i);
  console.log("🧪 Severity Match:", severityMatch ? severityMatch[1] : "No match");

  const severityRating = severityMatch && severityMatch[1]
    ? parseInt(severityMatch[1])
    : 1;

   // Parse Entry Type
   const entryTypeMatch = gptResponse.match(/Entry Type:\s*(.+)/i);
   console.log("🧪 Entry Type Match:", entryTypeMatch ? entryTypeMatch[1] : "No match");
   
   const entryType = entryTypeMatch && entryTypeMatch[1]
     ? entryTypeMatch[1].trim()
     : 'Other';
   return { parsedTopics, severityRating, entryType };
};

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

    const { parsedTopics, severityRating, entryType } = await extractTopicsAndSeverity(entry);

    const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry_text: entry,
        tone_mode: forcedTone,
        username,
        user_id: userId,
        severity_override: severityRating,
        entry_type: entryType,
        topic: parsedTopics[0],
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
