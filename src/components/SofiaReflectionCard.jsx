import React from 'react';
import './SofiaReflectionCard.css';

const SofiaReflectionCard = ({ entryText, loopName, themeTags, severity, mirrorResponse }) => {
  return (
    <div className="sofia-card">
      <div className="entry-block">
        <p className="entry-text">“{entryText}”</p>
        <div className="metadata">
          <div className="loop">🔁 {loopName}</div>
          <div className="themes">🏷️ {themeTags.join(', ')}</div>
          <div className="severity">🔥 Severity: {severity}</div>
        </div>
      </div>
      <div className="mirror-block">
        <strong>Mirror:</strong>
        <p>{mirrorResponse}</p>
      </div>
    </div>
  );
};

export default SofiaReflectionCard;
