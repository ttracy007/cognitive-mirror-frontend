// LandingPage.js
import React from 'react';
import './App.css'; 

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
            <li><b>Marcus</b> — stoic, Marcus Aurelius (may quote Meditations).</li>
            <li><b>Tony</b> — frank, no-bullshit friend who shoots you straight even when it hurts.</li>
            <li><b>Movie Metaphor</b> — sees your problem as a movie metaphor that's been solved before.</li>
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
