import React, { useState, useEffect } from 'react';
import SummaryBlock from './SummaryBlock';


const SummaryViewer = ({ history, onClose }) => {
  const [summaries, setSummaries] = useState({
    insight: null,
    clinical: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const generateAllSummaries = async () => {
  setIsLoading(true);
  setIsModalOpen(true);

  try {
    const types = ['insight', 'clinical'];
    const recentHistory = history.slice(0, 10); // Only last 10

    const fetchSummary = (type) => {
      return fetch(`${process.env.REACT_APP_BACKEND_URL}/generate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: recentHistory,
          summary_type: type,
        }),
      }).then(res => res.json());
    };

    // ✅ Await all fetches properly here
    const results = await Promise.all(types.map(type => fetchSummary(type)));

    setSummaries({
      insight: results[0].summary,
      clinical: results[1].summary,
      narrative: results[2].summary,
    });
  } catch (err) {
    console.error("❌ Failed to generate summaries:", err);
  } finally {
    setIsLoading(false);
  }
};   
       
  // Auto-trigger summaries on mount
 
  useEffect(() => {
    generateAllSummaries();
  }, []);
  
  // React.useEffect(() => {
  //   generateAllSummaries();
  // }, []);

  return (
    <div
      style={{
        maxHeight: '90vh',
        overflowY: 'auto',
        fontFamily: 'sans-serif',
      }}
    >
      <h2>🧾 Handoff Summaries</h2>

      {isLoading ? (
        <p>🔄 Generating summaries...</p>
      ) : (
        <>
          {/* Insight Summary */}
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>🧠 Insight Summary</h3>
          <p style={{ fontSize: '0.9rem', color: '#555', marginTop: 0, marginBottom: '1rem' }}>
            <strong>Empathic. Reflective. Grounded.</strong><br />
            A therapist-to-therapist narrative that distills emotional patterns, protective strategies, and therapeutic needs.
          </p>
          <SummaryBlock
            label="Insight Summary"
            content={summaries.insight|| 'Summary not available.'}
            onCopy={() => copyToClipboard(summaries.insight?.summary)}
          />

          {/* Clinical Summary */}
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>🧠 Clinical Summary</h3>
          <p style={{ fontSize: '0.9rem', color: '#555', marginTop: 0, marginBottom: '1rem' }}>
            <strong>Structured. DSM-Informed. Objective.</strong><br />
            A concise intake-style overview highlighting symptom patterns, cognitive tendencies, and behavioral dynamics.
          </p>
          <SummaryBlock
            label="Clinical Summary"
            content={summaries.clinical || 'Summary not available.'}
            onCopy={() => copyToClipboard(summaries.clinical?.summary)}
          />

          
        </>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#eee',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </div>
  );
};

export default SummaryViewer;
