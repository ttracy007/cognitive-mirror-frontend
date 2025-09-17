import React, { useState, useEffect } from 'react'; 
import SummaryBlock from './SummaryBlock';


const SummaryViewer = ({ history, onClose }) => {
  const [summaries, setSummaries] = useState({
    insight: null,
    clinical: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const generateAllSummaries = async () => {
  setIsLoading(true);

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

  return (
    <div className="therapy-prep-modal-overlay">
      <div className="therapy-prep-modal">
        <div className="therapy-prep-header">
          <h2 className="therapy-prep-title">Session Prep Summary</h2>
          <p className="therapy-prep-subtitle">
            Key insights to bring to your therapy session
          </p>
          <button 
            className="therapy-prep-close"
            onClick={onClose}
            aria-label="Close summary"
          >
            ×
          </button>
        </div>

        <div className="therapy-prep-content">
          {isLoading ? (
            <div className="therapy-prep-loading">
              <div className="loading-spinner"></div>
              <h3>Preparing your insights...</h3>
              <p>Analyzing patterns from your recent reflections</p>
            </div>
          ) : (
            <div className="therapy-prep-sections">
              {/* Key Themes Section */}
              <div className="therapy-prep-section">
                <div className="section-header">
                  <h3>🎯 Key Themes This Week</h3>
                  <p>What patterns have emerged in your thoughts and feelings</p>
                </div>
                <div className="summary-card insight-card">
                  <div className="summary-content">
                    {summaries.insight || 'Generating insights from your recent reflections...'}
                  </div>
                  <button 
                    className="copy-button"
                    onClick={() => copyToClipboard(summaries.insight)}
                    disabled={!summaries.insight}
                  >
                    📋 Copy for Session
                  </button>
                </div>
              </div>

              {/* Patterns Section */}
              <div className="therapy-prep-section">
                <div className="section-header">
                  <h3>📊 Patterns I've Noticed</h3>
                  <p>Behavioral and emotional patterns worth exploring together</p>
                </div>
                <div className="summary-card clinical-card">
                  <div className="summary-content">
                    {summaries.clinical || 'Analyzing behavioral patterns and themes...'}
                  </div>
                  <button 
                    className="copy-button"
                    onClick={() => copyToClipboard(summaries.clinical)}
                    disabled={!summaries.clinical}
                  >
                    📋 Copy for Session
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="therapy-prep-footer">
          <button
            className="therapy-prep-done-button"
            onClick={onClose}
          >
            Ready for My Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryViewer;