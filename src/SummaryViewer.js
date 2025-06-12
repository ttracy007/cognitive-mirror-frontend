import React, { useState } from 'react';

const SummaryViewer = ({ history }) => {
  const [summaries, setSummaries] = useState({
    insight: null,
    clinical: null,
    narrative: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      setSummaries({
        insight: results[0].summary,
        clinical: results[1].summary,
        narrative: results[2].summary
      });
    } catch (err) {
      console.error("Summary generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Summary copied to clipboard');
  };

  return (
    <div>
      <button
        onClick={generateAllSummaries}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#444',
          color: '#fff',
          fontSize: '1rem',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Generate Handoff Summaries
      </button>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            fontFamily: 'sans-serif'
          }}>
            <h2>🪞 Handoff Summaries</h2>

            {isLoading ? (
              <p>Generating summaries...</p>
            ) : (
              <>
                <SummaryBlock
                  label="🧠 Insight Summary"
                  content={summaries.insight}
                  onCopy={() => copyToClipboard(summaries.insight)}
                />
                <SummaryBlock
                  label="📋 Clinical Summary"
                  content={summaries.clinical}
                  onCopy={() => copyToClipboard(summaries.clinical)}
                />
                <SummaryBlock
                  label="📝 Narrative Voice Summary"
                  content={summaries.narrative}
                  onCopy={() => copyToClipboard(summaries.narrative)}
                />
              </>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                marginTop: '1rem',
                backgroundColor: '#888',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryBlock = ({ label, content, onCopy }) => (
  <div style={{ marginTop: '2rem' }}>
    <h3>{label}</h3>
    <pre style={{
      whiteSpace: 'pre-wrap',
      backgroundColor: '#f9f9f9',
      padding: '1rem',
      borderRadius: '6px',
      border: '1px solid #ddd'
    }}>{content}</pre>
    <button
      onClick={onCopy}
      style={{
        marginTop: '0.5rem',
        backgroundColor: '#333',
        color: '#fff',
        border: 'none',
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Copy
    </button>
  </div>
);

export default SummaryViewer;
