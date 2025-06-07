import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const LoginPage = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

const handleSignUpOrLogin = async () => {
  setErrorMsg('');

  if (!username || !password || !email) {
    setErrorMsg('All fields are required.');
    return;
  }

  const authData = {
    email: email.trim(),
    password,
  };

  try {
    // Try login first
    let { error: loginError } = await supabase.auth.signInWithPassword(authData);

    if (loginError) {
      // If login fails, try signup
      const { error: signupError } = await supabase.auth.signUp(authData);
      if (signupError && !signupError.message.includes('already registered')) {
        setErrorMsg(signupError.message);
        return;
      }

      // 🔄 Wait briefly for Supabase to activate session
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // Fetch current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setErrorMsg('Authentication failed.');
      return;
    }

    onAuthSuccess(sessionData.session, username);
  } catch (err) {
    console.error(err);
    setErrorMsg('Unexpected error. Please try again.');
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
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <label>Email (required for password recovery)</label><br />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.25rem' }}
        />
        <small style={{ color: '#888' }}>
          We’ll only use this to help you recover your password. Never shared or used for marketing.
        </small>

        <label>Password (required)</label><br />
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', paddingRight: '2.5rem', marginBottom: '1rem' }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#555',
              fontSize: '1rem'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button
          onClick={handleSignUpOrLogin}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            marginTop: '1rem'
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

