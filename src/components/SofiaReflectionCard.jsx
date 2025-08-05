import React from 'react';
import './SofiaReflectionCard.css';

const SofiaReflectionCard = ({ entryText, loopName, themeTags, severity, mirrorResponse, voiceName = "Tony" }) => {
  return (
    <div className="sofia-chat-container">
      {/* User entry bubble */}
      <div className="bubble user">
        <p><em>{entryText}</em></p>
        <div className="metadata">
          🔁 <strong>{loopName}</strong><br />
          🏷️ {themeTags.join(', ')}<br />
          🔥 Severity: {severity}
        </div>
      </div>

      {/* GPT voice response bubble */}
      <div className="bubble ai">
        <div className="voice-name">Mirror (Tony):</div>
        <p>{mirrorResponse}</p>
      </div>
    </div>
  );
};

export default SofiaReflectionCard;
