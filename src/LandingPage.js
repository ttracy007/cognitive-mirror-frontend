import React, { useState } from 'react';

const LandingPage = ({ onStart }) => {
  const [username, setUsername] = useState('');

  const handleStart = () => {
    if (username.trim() !== '') {
      onStart(username);
    } else {
      alert('Please enter a username to begin.');
    }
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        fontFamily: 'sans-serif',
        maxWidth: '700px',
        margin: '0 auto',
        lineHeight: '1.6',
        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
      }}
    >
      <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold' }}>
        🪞 Welcome to Cognitive Mirror (Beta)
      </h1>

      <p>
        <strong>Cognitive Mirror</strong> is a journaling experiment designed for anyone who wants to understand themselves more clearly—
        and for therapists looking to track what happens between sessions.
      </p>
      <p>
        <strong>It’s not a substitute for professional help.</strong> If you're in serious distress, please reach out to a licensed mental health provider.
        But if you’re simply stuck, spiraling, or unsure what’s going on inside you—this mirror might help you see it.
      </p>
      <p>You can write freely, or speak your thoughts aloud. Either way, the mirror listens.</p>

      <h3 style={{ marginTop: '2rem', fontSize: 'clamp(1.1rem, 4vw, 1.25rem)' }}>
        Choose an assistant’s tone:
      </h3>

      <div style={{ marginBottom: '1.5rem', padding: '0.5rem 0.25rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>💪🍷 Frank Friend</p>
        <p>
          A fiercely loyal, no-bullshit friend. Cuts through avoidance and calls out self-defeating patterns.
          Speaks with brutal clarity and humor.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '0.5rem 0.25rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🧘 Stoic Mentor</p>
        <p>
          A calm, wise mentor in the spirit of Stoic philosophy. Helps user find clarity in discomfort.
          Offers grounded truths with simplicity and stillness.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '0.5rem 0.25rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🧑🏽‍⚕️ Therapist</p>
        <p>
          A warm, nonjudgmental listener. Assists user in exploring emotions, providing validation,
          and nudging toward gentle self-awareness.
        </p>
      </div>

      <div style={{ marginBottom: '2rem', padding: '0.5rem 0.25rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🎬 Movie Metaphors Man</p>
        <p>
          A cinema buff who speaks almost entirely in movie quotes. Finds the plot hole and helps user rewrite their story.
          May get emotional.
        </p>
      </div>

      <p>The more honest you are, the more the mirror reflects back what really matters.</p>

      <input
        type="text"
        placeholder="Username (required)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginTop: '2rem'
        }}
      />

      <button
        onClick={handleStart}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          marginTop: '1rem',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Start Journaling →
      </button>
    </div>
  );
};

export default LandingPage;
