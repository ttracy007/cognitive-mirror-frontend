import React, { useState } from 'react';

const App = () => {
  const [entry, setEntry] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [entryHistory, setEntryHistory] = useState([]);
  const [tone, setTone] = useState("warm-therapist"); // default tone

function detectLoop(entries) {
  const loopTriggers = ["stuck", "numb", "hopeless", "can't focus", "pointless", "exhausted"];
  const counts = {};

  entries.forEach(text => {
    loopTriggers.forEach(trigger => {
      if (text.toLowerCase().includes(trigger)) {
        counts[trigger] = (counts[trigger] || 0) + 1;
      }
    });
  });

  const frequent = Object.entries(counts).filter(([_, count]) => count >= 3);
  return frequent.map(([word]) => word);
}
  const handleSubmit = async () => {
    setLoading(true);
    setResponse('');
    try {
      const loopWords = detectLoop(entryHistory);
      const isLoop = loopWords.length > 0;
      const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({ entry, tone, isLoop }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text}`);
      }

      const data = await res.json();
      setResponse(data.response || 'No message from GPT.');
      setEntryHistory(prev => [...prev, entry]);
    } catch (error) {
      setResponse(`⚠️ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
    <h1>Cognitive Mirror</h1>

    <label style={{ marginBottom: '0.5rem', display: 'block' }}>Choose Your Voice:</label>
    <select value={tone} onChange={(e) => setTone(e.target.value)}>
      <option value="warm-therapist">Warm Therapist</option>
      <option value="stoic-mentor">Stoic Mentor</option>
      <option value="frank-friend">Frank-but-Kind Friend</option>
    </select>

    <br /><br />

    <textarea
      rows="6"
      cols="60"
      value={entry}
      onChange={(e) => setEntry(e.target.value)}
      placeholder="What's on your mind?"
    />
      <br /><br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Thinking...' : 'Reflect'}
      </button>
      <div style={{ marginTop: '2rem' }}>
        <strong>AI Response:</strong>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default App;
