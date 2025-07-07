import React, { useState } from 'react';

export default function LandingPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleEnter = () => {
    if (username.trim()) {
      onLogin(username.trim(), password); // Pass both
    }
  };
 return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem' }}>🪞 Meet your Insightful Companion</h1>
      <p>Cognitive Mirror isn’t just another journaling tool.<br />
         It’s a reflective companion—powered by AI, shaped by real philosophy and therapy—that listens to what you write and responds like someone who truly sees you.</p>

      <h2>✨ Choose Your Companion</h2>
      <ul>
        <li><b>💪🍷 Tony</b> – A frank, no-bullshit friend who’s always honest and supportive, helping you cut through the crap and break free from the loops that keep you stuck.</li>
        <li><b>🧘 Marcus Aurelius</b> – Speaks like the Stoic philosopher himself—calm, sparse, and deeply rooted in principle. A journal within a journal.</li>
        <li><b>🧑🏽‍⚕️ Etty</b> – Emotionally attuned, psychologically wise. Named after Etty Hillesum, who chronicled the depths of meaning amidst despair. She doesn’t analyze—she understands.</li>
        <li><b>🎬 Movie Metaphor Man</b> – Brings cinematic storytelling to your reflections, offering creative, movie-inspired insights that help you see your life as a story worth telling.</li>
      </ul>

      <h2>✏️ How It Works</h2>
      <ul>
        <li>Just write what’s on your mind. Cognitive Mirror will respond with a voice you choose—offering reflection, not advice.</li>
        <li>🧠 Generate a summary of your recent reflections</li>
        <li>🎭 Switch voices at any time</li>
        <li>🔐 Keep your entries private and secure</li>
      </ul>

      <h2>🧭 Ready to begin?</h2>
      <p>Choose your voice below, start journaling, and let your mirror speak.<br />
      <b>You might be surprised by what you see.</b></p>

      <div style={{ marginTop: '2rem' }}>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
        />
        <input
          type="password"
          placeholder="Optional: enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
        />
        <button onClick={handleEnter} style={{ padding: '0.6rem 1.5rem' }}>
          Start Journaling →
        </button>
      </div>
    </div>
  );
}
