
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './DemoSofia.css';

const DemoSofiaPage = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', '372d20c2-4c5b-4bfc-8a70-bd88a7e84190')
        .order('timestamp', { ascending: true });

      if (!error && data) setEntries(data);
    };
    fetchEntries();
  }, []);

  return (
    <div className="sofia-container">
      <div className="sofia-left-column">
        <h2>📓 Sofia’s Reflections</h2>
        {entries.map((entry) => (
          <div key={entry.id} className="sofia-entry-card">
            <p className="entry-text">"{entry.entry_text}"</p>
            <p className="loop">🔁 {entry.loop_name}</p>
            <p className="tags">🏷️ {entry.primary_theme}, {entry.secondary_theme}</p>
            <p className="severity">🔥 Severity: {entry.severity_rating}</p>
            <div className="mirror-reply">
              <strong>Mirror:</strong> {entry.mirror_response}
            </div>
          </div>
        ))}
      </div>
      <div className="sofia-right-sidebar">
        <h3>🧠 Therapist Summary</h3>
        <p>Detected Loops:</p>
        <ul>
          {[...new Set(entries.map((e) => e.loop_name))].map((loop) => (
            <li key={loop}>🔁 {loop}</li>
          ))}
        </ul>
        <p>Dominant Themes:</p>
        <ul>
          {[...new Set(entries.map((e) => e.primary_theme))].map((theme) => (
            <li key={theme}>🏷️ {theme}</li>
          ))}
        </ul>
        <button className="summary-btn">Generate Handoff Summary</button>
      </div>
    </div>
  );
};

export default DemoSofiaPage;
