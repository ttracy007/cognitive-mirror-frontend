import React, { useEffect, useState } from 'react';
import './App.css';
import AuthForm from './AuthForm';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [forcedTone, setForcedTone] = useState("frank");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [hasUsedOverride, setHasUsedOverride] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [parsedTags, setParsedTags] = useState([]);
  const [severityLevel, setSeverityLevel] = useState('');

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
  };

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

  const canGenerateSummary = Array.isArray(history) && history.length >= 5;

  if (!session) return <AuthForm />;

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

        <button
  onClick={handleGenerateSummary}
  disabled={!canGenerateSummary}
  style={{
    opacity: canGenerateSummary ? 1 : 0.5,
    cursor: canGenerateSummary ? 'pointer' : 'not-allowed'
  }}
>
  🔍 Generate Summary
</button>

      </div>

      {showSummary && summaryText && (
        <div style={{ marginTop: '2rem', backgroundColor: '#f1f1f1', padding: '1.5rem', borderRadius: '8px', fontFamily: 'Georgia, serif', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
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

      {!canGenerateSummary && !showSummary && (
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
      )}

      <textarea rows="6" cols="60" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="What's on your mind?" />
      <br /><br />
      <button onClick={handleSubmit}>Reflect</button>

      <div style={{ marginTop: '2rem' }}>
        <h3>🧠 Your Reflection Thread</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {history.length > 0 ? (
            history.map((item, index) => (
              <div key={index} className={item.id === latestEntryId ? 'fade-in' : ''} style={{ marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
                  <p><strong>🧍 You:</strong></p>
                  <p>{item.entry_text}</p>
                </div>
                <div style={{
                  backgroundColor: item.tone_mode?.trim() === 'Frank Friend' ? '#fff1f1' : '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '6px',
                  borderLeft: `4px solid ${item.tone_mode?.trim() === 'Frank Friend' ? '#cc0000' : '#2e7d32'}`,
                  marginTop: '1rem'
                }}>
                  <p><strong>
                    {item.tone_mode?.trim() === 'Frank Friend'
                      ? '🔴 Frank Friend'
                      : '🟢 Stoic Mentor'}
                  </strong></p>
                  <p>{item.response_text}</p>
                </div>
                <hr style={{ marginTop: '2rem' }} />
              </div>
            ))
          ) : (
            <p style={{ color: '#777' }}><em>No reflections yet.</em></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
