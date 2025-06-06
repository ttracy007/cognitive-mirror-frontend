import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const LoginPage = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUpOrLogin = async () => {
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('Username and password are required.');
      return;
    }

    // Email is optional
    const authData = {
      email: email || `${username}@demo.cognitive`,
      password,
    };

    try {
      // Try login first
      let { error, data } = await supabase.auth.signInWithPassword(authData);

      if (error) {
        // Try sign-up if login fails
        const { error: signupError } = await supabase.auth.signUp(authData);
        if (signupError) {
          setErrorMsg(signupError.message);
          return;
        }
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        setErrorMsg('Authentication failed.');
        return;
      }

      onAuthSuccess(sessionData.session);
    } catch (err) {
      setErrorMsg('Unexpected error. Please try again.');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '3rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Cognitive Mirror</h1>
      <p style={{ fontSize: '1.1rem', lineHeight: 1.5 }}>
        <strong>It’s not a chatbot. It’s a mirror with memory.</strong><br />
        Cognitive Mirror listens across days—not minutes. It sees what loops you’re stuck in, and it nudges you forward.
      </p>

      <p style={{ marginTop: '1rem', color: '#444', fontSize: '0.95rem' }}>
        Everything you write is private, encrypted, and only visible to you.<br />
        Be fully honest—your reflections don’t leave this mirror.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <label>Username (required)</label><br />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <label>Password (required)</label><br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <label>Email (optional)</label><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <button
          onClick={handleSignUpOrLogin}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Start Journaling →
        </button>

        {errorMsg && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
