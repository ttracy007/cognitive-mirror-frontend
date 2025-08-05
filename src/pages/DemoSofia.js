import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ChatBubble from '../components/ChatBubble';
import './DemoSofia.css';

const DemoSofia = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', '372d20c2-4c5b-4bfc-8a70-bd88a7e84190')
        .order('timestamp', { ascending: true });
      if (data) setEntries(data);
    };
    fetchEntries();
  }, []);

  // flatten entries into chat messages
  const messages = [];
  entries.forEach(entry => {
    if (entry.entry_text) {
      messages.push({ id: `${entry.id}-user`, entry_text: entry.entry_text, tone_mode: 'user', timestamp: entry.timestamp });
    }
    if (entry.response_text) {
      messages.push({
        id: `${entry.id}-mirror`,
        response_text: entry.response_text,
        tone_mode: entry.tone_mode || 'frank',
        entry_type: entry.entry_type || null,
        timestamp: entry.timestamp
      });
    }
  });

  return (
    <div className="chat-container background-option-1" style={{ minHeight: '100vh', padding: '2rem', boxSizing:'border-box' }}>
      <h2>🌸 Sofia — The Loyalty Trap</h2>
      <p>…intro text…</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {messages.map(msg => (
          <ChatBubble key={msg.id} entry={msg} styleVariant="D" />
        ))}
      </div>
    </div>
  );
};

export default DemoSofia;
