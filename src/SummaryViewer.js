import React, { useState } from 'react';
import SummaryBlock from './SummaryBlock';
 
const SummaryViewer = ({ history }) => {
  const [summaries, setSummaries] = useState({
    insight: null,
    clinical: null,
    narrative: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const SummaryViewer = ({ history, onClose}) => 

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const generateAllSummaries = async () => {
    setIsLoading(true);
    setIsModalOpen(true);

    try {
      const types = ['insight', 'clinical', 'narrative'];
      const results = await Promise.all(
        types.map(type =>
          fetch(process.env.REACT_APP_BACKEND_URL + '/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history, summary_type: type })
          }).then(res => res.json())
        )
      );

      const [insight, clinical, narrative] = results;
      setSummaries({ insight, clinical, narrative });

    } catch (error) {
      console.error('❌ Error generating summaries:', error);
      setIsModalOpen(false); // ✅ Close the modal on failure
    } finally {
      setIsLoading(false); // ✅ Always stop spinner
    }
  };

  return (
    <div
      style={{
        maxHeight: '90vh',
        overflowY: 'auto',
        fontFamily: 'sans-serif'
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
            content={summaries.insight}
            onCopy={() => copyToClipboard(summaries.insight)}
          />

          {/* Clinical Summary */}
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>🧠 Clinical Summary</h3>
          <p style={{ fontSize: '0.9rem', color: '#555', marginTop: 0, marginBottom: '1rem' }}>
            <strong>Structured. DSM-Informed. Objective.</strong><br />
            A concise intake-style overview highlighting symptom patterns, cognitive tendencies, and behavioral dynamics.
          </p>
          <SummaryBlock
            label="Clinical Summary"
            content={summaries.clinical}
            onCopy={() => copyToClipboard(summaries.clinical)}
          />

          {/* Narrative Voice Summary */}
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>✍️ Narrative Voice Summary</h3>
          <p style={{ fontSize: '0.9rem', color: '#555', marginTop: 0, marginBottom: '1rem' }}>
            A first-person reflection written in the client’s voice. Captures their emotional experience, recurring struggles, and hopes for therapy—offering therapists a direct connection to the client’s inner world.
          </p>
          <SummaryBlock
            label="Narrative Voice Summary"
            content={summaries.narrative}
            onCopy={() => copyToClipboard(summaries.narrative)}
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
          cursor: 'pointer'
        }}
      >
        Close
      </button>
    </div>
  );
};

export default SummaryViewer;
