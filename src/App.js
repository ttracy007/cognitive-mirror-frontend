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
      const response = await fetch('https://your-backend-url.com/clinical-summary', {
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
    setTimeout(fetchHistory, 300);
  };

  if (!session) return <AuthForm />;

  // UI and JSX remains the same
  return (
  <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
    <p>✅ Logged in as {session.user.email}</p>
    ...
  </div>
);
};

export default App;
