import React, { useEffect, useState } from 'react';

export default function MoodModal({ userId, onClose }) {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  async function load(d) {
    setLoading(true); setErr(''); setData(null);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/mood-stats?user_id=${encodeURIComponent(userId)}&days=${d}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (userId) load(days); }, [userId, days]);

  const Bar = ({ pct, emotion }) => (
    <div className="mood-progress-track">
      <div 
        className="mood-progress-fill" 
        style={{width: `${Math.max(3, pct)}%`}}
      />
    </div>
  );

  const Spark = ({ series }) => {
    const max = Math.max(1, ...series.map(s => s.count));
    return (
      <div className="mood-sparkline">
        {series.map(pt => (
          <div
            key={pt.date}
            className="mood-spark-bar"
            title={`${pt.date}: ${pt.count} entry(ies)`}
            style={{
              height: Math.max(2, Math.round((pt.count / max) * 24))
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="therapy-prep-modal-overlay">
      <div className="therapy-prep-modal mood-tracker-modal">
        <div className="therapy-prep-header">
          <h2 className="therapy-prep-title">Emotional Analytics</h2>
          <p className="therapy-prep-subtitle">
            Track patterns and insights from your emotional journey
          </p>
          <button 
            className="therapy-prep-close"
            onClick={onClose}
            aria-label="Close mood tracker"
          >
            ×
          </button>
        </div>

        <div className="therapy-prep-content">
          <div className="mood-time-selector">
            {[7,30,60].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                disabled={loading}
                className={`mood-time-button ${days === d ? 'active' : ''}`}
              >
                Last {d} days
              </button>
            ))}
          </div>

          {loading && (
            <div className="therapy-prep-loading">
              <div className="loading-spinner"></div>
              <h3>Analyzing your emotional patterns...</h3>
              <p>Gathering insights from your recent entries</p>
            </div>
          )}

          {err && (
            <div className="mood-error">
              <span className="mood-error-icon">⚠️</span>
              Error: {err}
            </div>
          )}

          {data && !loading && (
            <div className="mood-analytics-content">
              {/* Stats Cards */}
              <div className="mood-stats-grid">
                <div className="mood-stat-card entries-card">
                  <div className="mood-stat-header">
                    <span className="mood-stat-icon">📝</span>
                    <div className="mood-stat-label">Journal Entries</div>
                  </div>
                  <div className="mood-stat-value">{data.total_entries}</div>
                  {Array.isArray(data.daily) && data.daily.length > 0 && (
                    <div className="mood-stat-sparkline">
                      <Spark series={data.daily} />
                    </div>
                  )}
                </div>

                <div className="mood-stat-card severity-card">
                  <div className="mood-stat-header">
                    <span className="mood-stat-icon">📊</span>
                    <div className="mood-stat-label">Average Intensity</div>
                  </div>
                  <div className="mood-stat-value">
                    {data.avg_severity}
                    {typeof data.severity_delta === 'number' && (
                      <span className={`mood-delta ${data.severity_delta > 0 ? 'negative' : data.severity_delta < 0 ? 'positive' : 'neutral'}`}>
                        {data.severity_delta > 0 ? '↗' : data.severity_delta < 0 ? '↘' : '→'} {Math.abs(data.severity_delta).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {typeof data.severity_delta === 'number' && (
                    <div className="mood-stat-context">vs prior {data.days} days</div>
                  )}
                </div>
              </div>

              {/* Emotions Section */}
              <div className="mood-emotions-section">
                <div className="section-header">
                  <h3>🎭 Emotional Themes</h3>
                  <p>Your most frequent emotional patterns</p>
                </div>
                
                {Array.isArray(data.top_emotions) && data.top_emotions.length ? (
                  <div className="mood-emotions-list">
                    {(() => {
                      const total = data.top_emotions.reduce((a,b)=>a + (b.count||0), 0) || 1;
                      return data.top_emotions.map((e, index) => {
                        const pct = Math.round(((e.count || 0) / total) * 100);
                        return (
                          <div key={e.emotion} className="mood-emotion-item">
                            <div className="mood-emotion-header">
                              <span className="mood-emotion-name">
                                <span className="mood-emotion-rank">#{index + 1}</span>
                                {e.emotion}
                              </span>
                              <span className="mood-emotion-percentage">{pct}%</span>
                            </div>
                            <Bar pct={pct} emotion={e.emotion} />
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="mood-empty-state">
                    <span className="mood-empty-icon">💭</span>
                    <p>No emotions logged in this window.</p>
                    <p>Keep journaling to see your emotional patterns emerge!</p>
                  </div>
                )}
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
}
