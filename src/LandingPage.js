// src/LandingPage.js
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Cognitive Mirror</h1>
      <p style={{ marginBottom: '2rem' }}>Choose an assistant's tone:</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>💪🍷 Frank Friend</p>
        <p>A fiercely loyal, no-bullshit friend. Cuts through avoidance and calls out self-defeating patterns. Speaks with brutal clarity and humor.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🧘 Stoic Mentor</p>
        <p>A calm, wise mentor in the spirit of Stoic philosophy. Helps user find clarity in discomfort. Offers grounded truths with simplicity and stillness.</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🧑🏽‍⚕️ Therapist</p>
        <p>A warm, nonjudgmental listener. Assists user in exploring emotions, providing validation, and nudging toward gentle self-awareness.</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🎬 Movie Metaphors Man</p>
        <p>A cinema buff who speaks almost entirely in movie quotes. Finds the plot hole and helps user rewrite their story. May get emotional.</p>
      </div>

      <input
        type="text"
        placeholder="Username (required)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '1rem',
          marginBottom: '1rem',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />
      <button
        onClick={handleStart}
        style={{
          padding: '0.6rem 1.2rem',
          fontSize: '1rem',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Start Journaling →
      </button>
    </div>
  );
};

export default LandingPage;
