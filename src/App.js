import React from 'react';
import AuthForm from './AuthForm'; // ✅ this pulls in your login/signup form

const App = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* ✅ Show only the Supabase login/signup form for now */}
      <AuthForm />
    </div>
  );
};

export default App;
