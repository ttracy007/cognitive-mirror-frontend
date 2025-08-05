// src/components/SofiaReflectionCard.jsx

import React from 'react';
import './SofiaReflectionCard.css';

const SofiaReflectionCard = ({ entryText, loopName, themeTags, severity, mirrorResponse }) => {
  return (
    <div className="sofia-card">
      <div className="entry-text">
        <em>“{entryText}”</em>
      </div>

      <div className="mirror-response">
        <strong>Mirror:</strong> {mirrorResponse}
      </div>

      <div className="loop-name">🔁 {loopName}</div>
      <div className="tags">🏷️ {themeTags.join(', ')}</div>
      <div className="severity">🔥 Severity: {severity}</div>
    </div>
  );
};

export default SofiaReflectionCard;
