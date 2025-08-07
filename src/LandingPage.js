// LandingPage.js
import React from 'react';

const LandingPage = ({ onStart }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255,0.96)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      padding: '1.5rem',
      textAlign: 'center',
      fontFamily: 'sans-serif',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '600px', width: '90%' }}>
        <h2 style={{ marginBottom: '0.8rem', fontSize: '1.6rem' }}>🪞 Welcome to Cognitive Mirror</h2>
        <p style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>
          <strong>This isn’t a chatbot.</strong><br />
          It’s a place to hear yourself — and be challenged.
        </p>
        <p style={{ fontSize: '0.95rem', marginBottom: '0.8rem' }}>
          Start by dropping one honest thought.<br />
          Nothing fancy. Just what’s actually on your mind.
        </p>
        <blockquote style={{ fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.95rem', color: '#444' }}>
          “I keep going back to the same idiot time after time even though I know he’s a jackass. What’s wrong with me?”
        </blockquote>
        <p style={{ fontSize: '0.95rem', marginBottom: '1.2rem' }}>
          Then click 🧠 <strong>Reflect</strong>.<br />
          Mirror will respond in a voice that cuts through the noise.
        </p>

        <hr style={{ width: '100%', margin: '1.2rem 0' }} />
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>💡 What Happens Next</h3>
        <ul style={{ textAlign: 'left', fontSize: '0.95rem', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
          <li>• Your reflections are remembered — across time.</li>
          <li>• Mirror will track the themes you return to most.</li>
          <li>• When you’re ready, click <strong>See Pattern Insight</strong> to spot emotional loops.</li>
          <li>• Before your next therapy session? Click <strong>Generate Summary</strong>.</li>
        </ul>

        <p style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1.2rem' }}>
          🟢 Ready to try? Just type and Reflect.
        </p>

        <button
          onClick={onStart}
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '0.95rem',
            borderRadius: '6px',
            backgroundColor: '#374151',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Start Reflecting →
        </button>
      </div>
    </div>
  );
};

export default LandingPage;


// import React, { useState } from 'react'; 

// const LandingPage = ({ onStart }) => {
//   const [username, setUsername] = useState('');

//   const handleStart = () => {
//     if (username.trim() !== '') {
//       onStart(username);
//     } else {
//       alert('Please enter a username to begin.');
//     }
//   };

//   return (
//     <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
//       <h1 style={{ fontSize: '2rem' }}>🪞 Meet your Insightful Companion</h1>
//       <p>Cognitive Mirror isn’t just another journaling tool.<br />
//          It’s a reflective companion—powered by AI, shaped by real philosophy and therapy—that listens to what you write and responds like someone who truly sees you.</p>
    
//          <h2>✨ Choose Your Companion</h2>
//     <ul>
//       <li><b>💪🍷 Tony</b> – A frank, no-bullshit friend who’s always honest and supportive, helping you cut through the crap and break free from the loops that keep you stuck.</li>
//       <li><b>🧘 Marcus Aurelius</b> – Speaks like the Stoic philosopher himself—calm, sparse, and deeply rooted in principle. If inspired he may quote from his own journal, Meditations.</li>
//       <li><b>🩺 Clara</b> – A warm, grounded therapist who sees the pattern beneath the panic.</li>
//       <li><b>🎬 Movie Metaphor Man</b> – Only thinks in movie metaphors--no matter what you say.  Your problems are part of the hero's journey.</li>
//       <li><b>🌸 Verena</b> – Verena is a clarity-driven career coach who helps you stop spinning your wheels and start building something real.</li>
//     </ul>


//       <h2>✏️ How It Works</h2>
//       <ul>
//         <li>Just write what’s on your mind. Cognitive Mirror will respond with a voice you choose—offering reflection, not advice.</li>
//         <li>🧠 Generate a summary of your recent reflections</li>
//         <li>🎭 Switch voices at any time</li>
//         <li>🔐 Keep your entries private and secure</li>
//       </ul>

//       <h2>🧭 Ready to begin?</h2>
//       <p>Choose your voice below, start journaling, and let your mirror speak.<br />
//       <b>You might be surprised by what you see.</b></p>

//       <input
//         type="text"
//         placeholder="Username (required)"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         style={{
//           width: '100%',
//           padding: '0.75rem',
//           fontSize: '1rem',
//           borderRadius: '6px',
//           border: '1px solid #ccc',
//           marginTop: '2rem'
//         }}
//       />

//       <button
//         onClick={handleStart}
//         style={{
//           padding: '0.75rem 1.5rem',
//           fontSize: '1rem',
//           backgroundColor: '#000',
//           color: '#fff',
//           border: 'none',
//           borderRadius: '6px',
//           marginTop: '1rem',
//           cursor: 'pointer',
//           width: '100%'
//         }}
//       >
//         Start Journaling →
//       </button>
//     </div>
//   );
// };

// export default LandingPage;
