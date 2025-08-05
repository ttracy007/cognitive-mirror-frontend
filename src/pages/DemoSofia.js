// src/pages/DemoSofia.js 
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';
import './DemoSofia.css';

const sofiaUserId = '372d20c2-4c5b-4bfc-8a70-bd88a7e84190';

export default function DemoSofia() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', sofiaUserId)
        .order('timestamp', { ascending: true }); // ordered by time

      if (error) {
        console.error('Error fetching Sofia entries:', error.message);
      } else {
        setEntries(data);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="demo-sofia-container">
      <h1 className="demo-heading">🧠 Sofia's Reflections: The Loyalty Trap</h1>
      <p className="demo-subtext">This is a demo story. Each entry reveals how Cognitive Mirror tracks emotional loops over time.</p>

      {entries.map((entry, index) => (
        <div key={entry.id || index} className="demo-entry-card">
          <div className="demo-entry-text">"{entry.entry_text}"</div>
          <div className="demo-entry-meta">
            <span>🌀 Loop: {entry.loop_name || '—'}</span>
            <span>🎭 Theme: {entry.primary_theme}</span>
            <span>🔥 Severity: {entry.severity_rating}</span>
          </div>
          <div className="demo-entry-response">{entry.response_text}</div>
        </div>
      ))}
    </div>
  );
}
