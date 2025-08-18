// src/pages/LandingPage.js  (replace the main content area)
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing wrap">
      <header className="landing-hero">
        <h1 className="brand"><span className="mirror-emoji" aria-hidden> </span> Cognitive Mirror</h1>
        <p className="beta-chip">🚧 Rough Beta: responses can take up to a minute.</p>
        <p className="sub">Thanks for helping us test—your reflections and feedback are what make this useful.</p>
        <div className="cta">
          <Link to="/login" className="btn btn-primary">Start the Beta</Link>
        </div>
      </header>

      {/* What this is */}
      <section className="block">
        <h2>What is this?</h2>
        <p>
          Cognitive Mirror is a journaling companion. You paste a thought or situation and it reflects back
          patterns, questions, or re-frames (not advice). It’s designed to help you see your own mind more clearly.
        </p>
      </section>

      {/* How to get the most useful entries */}
      <section className="block">
        <h2>How to get the most from the beta</h2>
        <ul className="bullets">
          <li><strong>Keep entries concrete.</strong> “My manager changed the deadline at 4pm and I froze,” beats “work is stressful.”</li>
          <li><strong>1–3 sentences is plenty.</strong> You can send more, but short + specific works best.</li>
          <li><strong>Say what felt at stake.</strong> e.g., “I worried I’d look incompetent.”</li>
          <li><strong>When a response lands (or misses), rate it.</strong> Use 👍 / ↔ / 👎 and add a short note.</li>
        </ul>
      </section>

      {/* Voices preview (read-only on landing; choose inside the app) */}
      <section className="block">
        <h2>Choose a voice that fits you</h2>
        <div className="voices-grid">
          <div className="voice-card">
            <div className="title">Clara</div>
            <div className="desc">Warm, grounded therapist—gentle questions and nervous-system aware.</div>
          </div>
          <div className="voice-card">
            <div className="title">Marcus</div>
            <div className="desc">Stoic mentor—short, direct, values clarity and action.</div>
          </div>
          <div className="voice-card">
            <div className="title">Movie Metaphor™</div>
            <div className="desc">Reflects with quick story beats to reframe stakes and momentum.</div>
          </div>
        </div>
        <p className="muted">You’ll be able to switch voices any time inside the app.</p>
      </section>

      {/* Feedback ask */}
      <section className="block">
        <h2>What we’re testing</h2>
        <ul className="bullets">
          <li>Did the reflection feel <em>helpful</em> for your specific entry?</li>
          <li>What part helped: <em>saw a pattern</em>, <em>reframed</em>, <em>actionable next step</em>, or <em>felt seen</em>?</li>
          <li>If it missed, was it <em>too generic</em>, <em>missed context</em>, <em>patronizing</em>, or <em>too long</em>?</li>
        </ul>
        <p className="muted">Your quick note in the feedback bar is gold for us.</p>
      </section>

      {/* Privacy + safety */}
      <section className="block">
        <h2>Privacy & boundaries</h2>
        <p className="muted">
          Please avoid sharing sensitive personal data. Cognitive Mirror is not a crisis service or medical advice.
          If you’re in immediate danger, contact local emergency services.
        </p>
      </section>

      <footer className="footer">
        <Link to="/login" className="btn btn-primary">Log in to start</Link>
      </footer>
    </div>
  );
}
