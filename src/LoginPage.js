 
// LoginPage.js
import React, { useState } from 'react';
import { supabase, UsernameStore } from './supabaseClient';

const LoginPage = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginOrSignup = async () => {
    if (isSubmitting) return;
    setErrorMsg('');

    // basic client‐side guard
    const cleanName = (username || '').trim();
    if (!cleanName || !password.trim()) {
      setErrorMsg('Username and password are required.');
      return;
    }

    setIsSubmitting(true);

    const fakeEmail = `${cleanName.toLowerCase().replace(/\s+/g, '')}@cognitivemirror.ai`;
    const authData = { email: fakeEmail, password };

    try {
      // 1) Try sign‑in first
      const { error: loginError } = await supabase.auth.signInWithPassword(authData);

      // 2) If invalid creds, try sign‑up → then sign‑in
      if (loginError) {
        const msg = (loginError.message || '').toLowerCase();

        if (msg.includes('invalid')) {
          const { error: signupError } = await supabase.auth.signUp(authData);
          if (signupError) {
            const s = (signupError.message || '').toLowerCase();
            if (s.includes('already registered') || s.includes('already exists')) {
              setErrorMsg(
                'That username is already taken with a different password. Please enter the same password you used before.'
              );
              return;
            }
            setErrorMsg(signupError.message);
            return;
          }

          // sign‑up succeeded → sign‑in
          const { error: retryLoginError } = await supabase.auth.signInWithPassword(authData);
          if (retryLoginError) {
            setErrorMsg(retryLoginError.message);
            return;
          }
        } else {
          // other sign‑in error
          setErrorMsg(loginError.message);
          return;
        }
      }

      // 3) Confirm we actually have a session
      const { data: sessionRes, error: sessionError } = await supabase.auth.getSession();
      const session = sessionRes?.session || null;
      if (sessionError || !session) {
        setErrorMsg('Authentication failed.');
        return;
      }

      // 4) Persist username locally and (optionally) in Supabase profile
      localStorage.setItem('cm_username', cleanName);
      if (UsernameStore?.set) UsernameStore.set(cleanName);
      await supabase.auth.updateUser({ data: { username: cleanName } }).catch(() => {});

      // 5) Hand back to App
      onAuthSuccess(session, cleanName);
    } catch (err) {
      console.error(err);
      setErrorMsg('Unexpected error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
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
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}
    >
      <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>What should we call you?</h2>
      <p style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>
        Don’t worry — everything you say here is like Vegas. Stays in the Mirror.
      </p>

      <input
        type="text"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter a name"
        style={{
          padding: '0.75rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginBottom: '1.25rem',
          width: '100%',
          maxWidth: '300px'
        }}
      />

      <input
        type={showPassword ? 'text' : 'password'}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter a password"
        style={{
          padding: '0.75rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginBottom: '1.25rem',
          width: '100%',
          maxWidth: '300px'
        }}
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        style={{ cursor: 'pointer', fontSize: '0.95rem', marginBottom: '1.25rem', color: '#555' }}
      >
        {showPassword ? '🙈 Hide password' : '👁️ Show password'}
      </span>

      <button
        onClick={handleLoginOrSignup}
        style={{
          padding: '0.8rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '6px',
          backgroundColor: '#374151',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '300px',
          marginTop: '1rem',
          opacity: isSubmitting ? 0.7 : 1
        }}
        disabled={isSubmitting || !username.trim() || !password.trim()}
      >
        {isSubmitting ? 'Signing in…' : 'Start Reflecting →'}
      </button>

      {errorMsg && (
        <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem' }}>{errorMsg}</p>
      )}
    </div>
  );
};

export default LoginPage;
