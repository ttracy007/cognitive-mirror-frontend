
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const LoginPage = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        setErrorMsg('Authentication failed.');
      } else {
        onAuthSuccess(data.session, username);
      }
    } catch (err) {
      setErrorMsg('An error occurred during login.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Cognitive Mirror</h1>
      <p>🪞 A journaling experiment. It listens across days—not minutes—and helps you see patterns that weigh you down.</p>

      <label>Username</label><br />
      <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }} /><br />

      <label>Email</label><br />
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ width: '100%', marginBottom: '1rem' }} /><br />

      <label>Password</label><br />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={{ width: '100%', marginBottom: '1rem' }} /><br />

      <button onClick={handleLogin}>Start Journaling</button>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </div>
  );
};

export default LoginPage;
