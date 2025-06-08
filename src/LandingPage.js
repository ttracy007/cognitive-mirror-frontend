// src/LandingPage.js
import React from 'react';

const LandingPage = ({ onStart }) => (
  <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
    <h1>🪞 Welcome to Cognitive Mirror (Beta)</h1>
    <p><strong>Cognitive Mirror</strong> is a journaling experiment designed for anyone who wants to understand themselves more clearly—and for therapists looking to track what happens between sessions.</p>
    <p><strong>It’s not a substitute for professional help.</strong> If you're in serious distress, please reach out to a licensed mental health provider. But if you’re simply stuck, spiraling, or unsure what’s going on inside you—this mirror might help you see it.</p>
    <p>You can write freely, or speak your thoughts aloud. Either way, the mirror listens.</p>
    <p>It currently offers two voices:</p>
    <ul>
      <li>🔴 <strong>Frank Friend</strong> – direct, compassionate, and unfiltered.</li>
      <li>🟢 <strong>Stoic Mentor</strong> – grounded, steady, and clear-eyed.</li>
    </ul>
    <p>Try both. See what resonates. The more honest you are, the more the mirror reflects back what really matters.</p>
    <button onClick={onStart} style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1rem' }}>
      Start Journaling
    </button>
  </div>
);

export default LandingPage;
