// LandingPage.js
import React from 'react';

export default function LandingPage({ onStart }) {
  return (
    <div className="page-soft">
      <div style={wrap}>
        <div style={card}>
          <h1 style={h1}>🔎 Cognitive Mirror</h1>

          {/* What this is */}
          <p style={p}>
            <strong>This isn’t a chatbot.</strong> It’s a fast way to hear yourself—and get a
            nudge that breaks the loop you’re stuck in.
          </p>

          {/* How to start */}
          <h3 style={h3}>How to try it (takes ~30s)</h3>
          <ol style={ol}>
            <li>Type one honest thought or problem (1–2 sentences is perfect).</li>
            <li>Pick a <em>Voice</em> (therapist, stoic, blunt friend, etc.).</li>
            <li>Click 🧠 <strong>Reflect</strong>. Replies may take up to a minute.</li>
          </ol>

          {/* What to expect */}
          <h3 style={h3}>What to expect</h3>
          <ul style={ul}>
            <li>It mirrors what you said, names the pattern, and asks a pointed question.</li>
            <li>Your entries are saved so you can generate a summary later.</li>
            <li>Use the thumbs to rate the reply—this helps us tune the system.</li>
          </ul>

          {/* Voices */}
          <h3 style={h3}>Voices you can choose</h3>
          <ul style={ul}>
            <li><b>Clara</b> — warm, grounded therapist who spots the loop.</li>
            <li><b>Marcus</b> — stoic; short, steady reflections.</li>
            <li><b>Tony</b> — blunt, no-nonsense straight shooter.</li>
            <li><b>Movie Metaphor</b> — frames your situation like a film arc.</li>
            <li><b>Verena</b> — clarity-driven career coach for momentum.</li>
          </ul>

          {/* Best-use tips */}
          <h3 style={h3}>Tips for best results</h3>
          <ul style={ul}>
            <li>Be specific: “I’m dreading Monday because ____.”</li>
            <li>Name the fear or stake if you can.</li>
            <li>If a reply misses, rate it and add a short note—tell us why.</li>
          </ul>

          <button style={cta} onClick={onStart}>Start reflecting →</button>
          <div style={finePrint}>Rough Beta: responses can take up to a minute.</div>
        </div>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1.25rem'
};
const card = { width: 'min(760px, 92%)', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', color: '#111' };
const h1 = { margin: '0 0 .6rem', fontSize: '2rem', fontWeight: 700, letterSpacing: '.3px' };
const h3 = { margin: '1.1rem 0 .5rem', fontSize: '1.05rem' };
const p  = { margin: '.5rem 0', fontSize: '1rem' };
const ul = { margin: '.2rem 0 .6rem 1rem', padding: 0, fontSize: '.96rem', lineHeight: 1.45 };
const ol = { ...ul };
const cta = {
  marginTop: '1rem', padding: '.65rem 1rem', fontSize: '.95rem',
  background: '#1f2937', color: '#fff', border: 0, borderRadius: 8, cursor: 'pointer'
};
const finePrint = { marginTop: '.5rem', fontSize: '.85rem', color: '#6b7280', fontStyle: 'italic' };
