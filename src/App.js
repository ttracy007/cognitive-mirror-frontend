import React, { useEffect, useState } from 'react'; 
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import './App.css';
//import AuthForm from './AuthForm';
import LoginPage from './LoginPage';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [forcedTone, setForcedTone] = useState("frank");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [hasUsedOverride, setHasUsedOverride] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [parsedTags, setParsedTags] = useState([]);
  const [severityLevel, setSeverityLevel] = useState('');
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);
  const [username, setUsername] = useState('');
  const prompts = ["What’s weighing you down?", "What needs to come out?"];
  const [placeholderPrompt, setPlaceholderPrompt] = useState(() =>
  prompts[Math.floor(Math.random() * prompts.length)]
);
  const [lastReflectionTime, setLastReflectionTime] = useState(null);



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

    if (error) {
      console.error('Fetch error:', error.message);
    } else {
      setHistory(data || []);
    }
    setHistoryLoaded(true);
  };
useEffect(() => {
  const interval = setInterval(() => {
    if (!lastReflectionTime) return;

    const now = Date.now();
    const timeSince = now - lastReflectionTime;

    // Show prompt again if 3+ minutes of inactivity
    if (timeSince > 3 * 60 * 1000) {
      setPlaceholderPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
      setLastReflectionTime(null); // Reset so it doesn't loop
    }
  }, 10000); // Check every 10 seconds

  return () => clearInterval(interval);
}, [lastReflectionTime]);
  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);

    try {
      const response = await fetch('https://cognitive-mirror-backend.onrender.com/clinical-summary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    history: history.map((e) => ({
      tone: e.tone || 'unknown',
      entry: e.entry_text || e.text,
    })),
  }),
});

      const data = await response.json();
      console.log('SUMMARY FROM BACKEND:', data.summary);

      if (data.summary) {
        setSummaryText(data.summary);
        setShowSummary(true);

        const tagsMatch = data.summary.match(/Tags:\s*(.+)/i);
        const severityMatch = data.summary.match(/Severity Level:\s*(.+)/i);

        if (tagsMatch) {
          const rawTags = tagsMatch[1].split(',').map(tag => tag.trim());
          setParsedTags(rawTags);
        }

        if (severityMatch) {
          setSeverityLevel(severityMatch[1].trim());
        }
      }
    } catch (error) {
      console.error('❌ Error in handleGenerateSummary:', error);
    }

    setLoadingSummary(false);
  };

  const handleExportPDF = () => {
    if (!summaryText) return;

    const doc = new jsPDF();
    const margin = 15;
    const maxWidth = 180;

    const title = 'Cognitive Mirror – Clinical Reflection Summary';
    const date = new Date().toLocaleDateString();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, margin, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${date}`, margin, 28);

    const lines = doc.splitTextToSize(summaryText, maxWidth);
    doc.text(lines, margin, 40, { maxWidth, lineHeightFactor: 1.4 });

    doc.save('clinical_summary.pdf');
  };

  const handleSubmit = async () => {
    const user = session?.user;
    if (!user || !entry.trim()) return;

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
    username: username,  // ✅ this stores the visible identity
    entry_text: entry,
    response_text: responseText,
    tone_mode: data.tone_mode,
  })
  .select();


    if (error) {
      console.error('Save error:', error.message);
    } else if (saved && saved[0]) {
      setLatestEntryId(saved[0].id);
    }
   

    setEntry('');
    setShowSummary(false);
    setSummaryText('');
    setParsedTags([]);
    setSeverityLevel('');
    setTimeout(fetchHistory, 300);
  };
    setLastReflectionTime(Date.now());

  const canGenerateSummary = Array.isArray(history) && history.length >= 10;
  const reflectionCount = history.length;
  const requiredReflections = 10;
  const progressPercent = Math.min((reflectionCount / requiredReflections) * 100, 100);

 if (!session) {
  return (
    <LoginPage
      onAuthSuccess={(session, username) => {
        setSession(session);        // Set the login session
        setUsername(username);      // Capture the passed username
      }}
    />
  );
}


  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <p>✅ Logged in as {session.user.email}</p>
      <br /><br />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <label>Voice (required):</label>
        <select value={forcedTone} onChange={(e) => setForcedTone(e.target.value)}>
          <option value="frank">🔴 Frank Friend</option>
          <option value="stoic">🟢 Stoic Mentor</option>
        </select>
  
  <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
  ✍️ You’ve logged <strong>{reflectionCount}</strong> of <strong>{requiredReflections}</strong> reflections needed for your first clinical summary.
</div>
<div style={{
  width: '100%',
  backgroundColor: '#e0e0e0',
  height: '8px',
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: '1rem'
}}>
  <div style={{
    width: `${progressPercent}%`,
    height: '100%',
    backgroundColor: progressPercent >= 100 ? '#4caf50' : '#ffa500',
    transition: 'width 0.4s ease'
  }}></div>
</div>
<button
  onClick={async () => {
    await supabase.auth.signOut();
    setSession(null); // this triggers return to LoginPage
  }}
  style={{
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    backgroundColor: '#eee',
    color: '#333',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }}
>
  Log Out
</button>
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
  <button
    onClick={() => {
      if (canGenerateSummary) {
        handleGenerateSummary();
      } else {
        setShowBlockedMessage(true);
        setTimeout(() => setShowBlockedMessage(false), 4000); // auto-dismiss
      }
    }}
    style={{
      opacity: canGenerateSummary ? 1 : 0.5,
      cursor: canGenerateSummary ? 'pointer' : 'not-allowed',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      borderRadius: '4px',
      backgroundColor: '#333',
      color: '#fff',
      border: 'none'
    }}
  >
    🔍 Generate Summary
  </button>

  {showBlockedMessage && (
    <div
      style={{
        backgroundColor: '#fffbe6',
        border: '1px solid #ffe58f',
        padding: '1rem',
        borderRadius: '6px',
        marginTop: '0.75rem',
        fontSize: '0.9rem',
        lineHeight: 1.5
      }}
    >
      <strong>🕰 Not Quite Yet</strong><br />
      Cognitive Mirror works best when it sees you over time—not just in a single moment.<br />
      We need <strong>at least ten reflections</strong> to form a meaningful clinical summary.<br />
      The more you write, the clearer the picture gets.
    </div>
  )}
</div>



      </div>

      {showSummary && summaryText && (
  <div className="fade-in" style={{ marginTop: '2rem', backgroundColor: '#f1f1f1', padding: '1.5rem', borderRadius: '8px', fontFamily: 'Georgia, serif', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          <h3>🧠 Clinical Reflection Summary</h3>

          {parsedTags.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Tags:</strong>{' '}
              {parsedTags.map((tag, index) => (
                <span key={index} style={{ display: 'inline-block', backgroundColor: '#ddd', borderRadius: '12px', padding: '0.25rem 0.75rem', marginRight: '0.5rem', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {severityLevel && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Severity:</strong>{' '}
              <span style={{ color: severityLevel === 'severe' ? 'red' : severityLevel === 'moderate' ? 'orange' : 'green', fontWeight: 'bold' }}>
                {severityLevel.toUpperCase()}
              </span>
            </div>
          )}

          <pre style={{ margin: 0 }}>{summaryText}</pre>

          <button onClick={handleExportPDF} style={{ marginTop: '1rem', backgroundColor: '#333', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            📄 Download PDF
          </button>
        </div>
      )}

      {/*
      historyLoaded && !canGenerateSummary && !showSummary && (
        <div style={{ backgroundColor: '#fef9ef', padding: '1.5rem', borderLeft: '5px solid #ffa500', borderRadius: '6px', lineHeight: '1.5', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>🔍 <strong>“Not Quite Yet”</strong></h3>
          <p>
            <strong>Cognitive Mirror</strong> works best when it sees you over time—not just in a single moment.<br />
            We need <strong>at least five days</strong> of journaling to form a meaningful reflection summary.
          </p>
          <p>
            That gives the mirror a chance to detect emotional patterns, shifts, and turning points—not just passing moods.<br />
            The more you write, the clearer the picture gets. Keep going—you’re not just venting, you’re building insight.
          </p>
          {!hasUsedOverride && (
            <button onClick={() => { setShowSummary(true); setHasUsedOverride(true); }} style={{ marginTop: '1rem', backgroundColor: '#ffa500', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
              ✨ Generate Preview Summary →
            </button>
          )}
        </div>
      )
    */}

<div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
  {/* Left: Journal Input */}
  <div style={{ flex: 1 }}>
   <textarea
  rows="6"
  cols="60"
  value={entry}
  onChange={(e) => setEntry(e.target.value)}
  placeholder={
    history.length === 0 ? placeholderPrompt : ''  // Only show on first reflection
  }
  style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
/>
    <button
      onClick={handleSubmit}
      style={{
        marginTop: '0.5rem',
        backgroundColor: '#333',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1.25rem',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Reflect
    </button>
  </div>

  {/* Right: Instructional Message */}
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

      <div style={{ marginTop: '2rem' }}>
        <h3>🧠 Your Reflection Thread</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {history.length > 0 ? (
  history.map((item, index) => {
    const formattedTime = new Date(item.timestamp).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return (
      <div key={index} className={item.id === latestEntryId ? 'fade-in' : ''} style={{ marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
          <p><strong>🧍 You:</strong></p>
          <p>{item.entry_text}</p>
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
            📅 {formattedTime}
          </p>
        </div>

        <div style={{
          backgroundColor: item.tone_mode?.trim() === 'Frank Friend' ? '#fff1f1' : '#f0fdf4',
          padding: '1rem',
          borderRadius: '6px',
          borderLeft: `4px solid ${item.tone_mode?.trim() === 'Frank Friend' ? '#cc0000' : '#2e7d32'}`,
          marginTop: '1rem'
        }}>
          <p><strong>
            {item.tone_mode?.trim() === 'Frank Friend' ? '🔴 Frank Friend' : '🟢 Stoic Mentor'}
          </strong></p>
          <p>{item.response_text}</p>
        </div>

        <hr style={{ marginTop: '2rem' }} />
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
