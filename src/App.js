
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import './App.css';
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
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);

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

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }
      setEntry(interimTranscript);
    };

    recog.onend = () => setIsListening(false);

    setRecognition(recog);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastReflectionTime) return;
      const now = Date.now();
      const timeSince = now - lastReflectionTime;

      if (timeSince > 3 * 60 * 1000) {
        setPlaceholderPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
        setLastReflectionTime(null);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastReflectionTime]);

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
    if (session) fetchHistory();
  }, [session]);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);

    try {
      const response = await fetch('https://cognitive-mirror-backend.onrender.com/clinical-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: history.map((e) => ({
            tone: e.tone || 'unknown',
            entry: e.entry_text || e.text,
          })),
        }),
      });

      const data = await response.json();

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

  // ... other app logic here

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Cognitive Mirror</h1>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder={placeholderPrompt}
        style={{ width: '100%', padding: '1rem' }}
      />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={startListening} disabled={isListening}>🎙️ Start Talking</button>
        <button onClick={stopListening} disabled={!isListening}>🛑 Stop</button>
        {isListening && <span style={{ marginLeft: '1rem' }}>Listening...</span>}
      </div>
    </div>
  );
};

export default App;
