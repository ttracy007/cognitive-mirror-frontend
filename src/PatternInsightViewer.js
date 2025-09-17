import React, { useState, useEffect } from 'react'; 

const PatternInsightViewer = ({ onClose, userId, toneMode }) => {
  const [insight, setInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const generatePatternInsight = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/generate-pattern-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          tone_mode: toneMode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setInsight(data.insight);
      } else {
        console.error('❌ Insight error:', data.error);
      }
    } catch (err) {
      console.error('❌ Insight fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generatePatternInsight();
  }, []);

  return (
    <div className="therapy-prep-modal-overlay">
      <div className="therapy-prep-modal">
        <div className="therapy-prep-header">
          <h2 className="therapy-prep-title">Pattern Insights</h2>
          <p className="therapy-prep-subtitle">
            Discover patterns and themes in your recent reflections
          </p>
          <button 
            className="therapy-prep-close"
            onClick={onClose}
            aria-label="Close insights"
          >
            ×
          </button>
        </div>

        <div className="therapy-prep-content">
          {isLoading ? (
            <div className="therapy-prep-loading">
              <div className="loading-spinner"></div>
              <h3>Analyzing your patterns...</h3>
              <p>Looking for themes and insights in your journal entries</p>
            </div>
          ) : (
            <div className="therapy-prep-sections">
              <div className="therapy-prep-section">
                <div className="section-header">
                  <h3>🔍 What I've Discovered</h3>
                  <p>Patterns, themes, and insights from your recent journal entries</p>
                </div>
                <div className="summary-card insight-card">
                  <div className="summary-content">
                    {insight || 'No patterns identified at this time. Try journaling more to discover insights.'}
                  </div>
                  <button 
                    className="copy-button"
                    onClick={() => copyToClipboard(insight)}
                    disabled={!insight}
                  >
                    📋 Copy Insights
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
            Continue Journaling
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatternInsightViewer;