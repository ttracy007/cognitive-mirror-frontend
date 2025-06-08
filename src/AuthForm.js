
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const AuthForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: username + '@mirror.app',
      password,
    });
    if (error) alert(error.message);
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email: username + '@mirror.app',
      password,
    });
    if (error) alert(error.message);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'left' }}>
      <h1>Cognitive Mirror</h1>
      <p>🧠 A journaling experiment. It listens across days—not minutes—and helps you see patterns that weigh you down.</p>
      <div>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button onClick={handleLogin}>Start Journaling</button>
      <button onClick={handleSignup} style={{ marginLeft: '10px' }}>Sign Up</button>
    </div>
  );
};

export default AuthForm;
