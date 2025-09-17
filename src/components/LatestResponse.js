import React from 'react';
import './LatestResponse.css';

const LatestResponse = ({ entry, response, onDismiss }) => {
  if (!response || !entry) return null;

  return (
    <div className="latest-response-container fade-in">
      <div className="latest-response-header">
        <h3 className="latest-response-title">Latest Response</h3>
        <button 
          className="latest-response-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss latest response"
        >
          ✕
        </button>
      </div>
      
      <div className="latest-response-content">
        {/* User's entry */}
        <div className="latest-entry-bubble">
          <div className="latest-entry-label">Your entry:</div>
          <div className="latest-entry-text">{entry}</div>
        </div>

        {/* AI Response */}
        <div className="latest-ai-bubble">
          <div className="latest-ai-header">
            <span className="latest-ai-name">{response.toneName}</span>
            <span className="latest-ai-timestamp">
              {new Date(response.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="latest-ai-text">{response.text}</div>
        </div>
      </div>
    </div>
  );
};

export default LatestResponse;