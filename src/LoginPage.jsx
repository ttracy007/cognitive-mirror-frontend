
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
      // Try to sign up first
      let { error: signupError } = await supabase.auth.signUp(authData);
      if (signupError && !signupError.message.includes('already registered')) {
        setErrorMsg(signupError.message);
        return;
      }

      // Then try to sign in
      let { error: loginError } = await supabase.auth.signInWithPassword(authData);
      if (loginError) {
        setErrorMsg(loginError.message);
        return;
      }

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
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', fontFamily: 'sans-serif', color: '#333' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🪞 Welcome to <strong>Cognitive Mirror (Beta)</strong></h1>

      <p style={{ lineHeight: 1.6, fontSize: '1rem' }}>
        <strong>Cognitive Mirror</strong> is a journaling experiment designed for anyone who wants to understand themselves more clearly—
        and for therapists looking to track what happens between sessions.
      </p>

      <p style={{ lineHeight: 1.6, fontSize: '1rem' }}>
        It’s <strong>not a substitute for professional help</strong>. If you're in serious distress, please reach out to a licensed mental health provider.
        But if you’re simply stuck, spiraling, or unsure what’s going on inside you—this mirror might help you see it.
      </p>

      <p style={{ lineHeight: 1.6, fontSize: '1rem' }}>
        You can write freely, or speak your thoughts aloud. Either way, the mirror listens.
      </p>

      <p style={{ lineHeight: 1.6, fontSize: '1rem' }}>It currently offers two voices:</p>
      <ul style={{ lineHeight: 1.6, fontSize: '1rem', marginLeft: '1.25rem' }}>
        <li><strong>🔴 Frank Friend</strong> – direct, compassionate, and unfiltered. Think: the loyal friend who doesn’t let you lie to yourself.</li>
        <li><strong>🟢 Stoic Mentor</strong> – grounded, steady, and clear-eyed. Less about comfort, more about clarity.</li>
      </ul>

      <p style={{ lineHeight: 1.6, fontSize: '1rem' }}>
        Try both. See what resonates. The more honest you are, the more the mirror reflects back what really matters.
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

        <label>Email (required for login)</label><br />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.25rem' }}
        />
        <small style={{ color: '#888' }}>
          Used only to log you in and recover your account if needed. Never shared or sold.
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
