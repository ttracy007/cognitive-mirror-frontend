import React, { useState } from 'react';

const App = () => {
  const [entry, setEntry] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("warm-therapist"); // default tone


  const handleSubmit = async () => {
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch(process.env.REACT_APP_BACKEND_URL + '/journal-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entry, tone }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text}`);
      }

      const data = await res.json();
      setResponse(data.response || 'No message from GPT.');
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
