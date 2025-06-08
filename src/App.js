
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import './App.css';
import LoginPage from './LoginPage';

const App = () => {
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [forcedTone, setForcedTone] = useState('frank');
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const prompts = ["What’s weighing you down?", "What needs to come out?"];
  const [placeholderPrompt, setPlaceholderPrompt] = useState(() =>
    prompts[Math.floor(Math.random() * prompts.length)]
  );

  let transcriptBuffer = '';

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

  const handleSubmit = async () => {
    if (!entry.trim()) return;

    setIsProcessing(true);

    // Simulate async processing
    setTimeout(() => {
      setIsProcessing(false);
      alert("Reflection submitted! (simulated)");
      setEntry('');
    }, 2000);
  };

  if (!session) {
    return (
      <LoginPage
        onAuthSuccess={(session, username) => {
          setSession(session);
        }}
      />
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Cognitive Mirror</h1>

      <textarea
        rows="6"
        cols="60"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder={placeholderPrompt}
        style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
      />

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={startListening} disabled={isListening}>
          🎙️ Start Talking
        </button>
        <button onClick={stopListening} disabled={!isListening}>
          🛑 Stop
        </button>
        <button onClick={handleSubmit} disabled={isProcessing || !entry.trim()}>
          🧠 Reflect
        </button>
        {isListening && <span>🎧 Listening…</span>}
        {isProcessing && <span style={{ color: '#888' }}>⏳ Processing reflection…</span>}
      </div>
    </div>
  );
};

export default App;
