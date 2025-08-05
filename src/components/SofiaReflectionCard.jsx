// src/components/SofiaReflectionCard.jsx

import React from 'react';
import '../pages/DemoSofia.css';

const SofiaReflectionCard = ({ entryText, loopName, themeTags, severity, mirrorResponse }) => {
  return (
    <div className="sofia-card">
      <div className="sofia-entry">
        <em>“{entryText}”</em>
        <div className="sofia-meta">
          <div>🔁 <strong>{loopName}</strong></div>
          <div>🏷️ {themeTags.join(', ')}</div>
          <div>🔥 Severity: {severity}</div>
        </div>
      </div>

      <div className="sofia-response">
        <strong>Mirror:</strong>
        <p>{mirrorResponse}</p>
      </div>
    </div>
  );
};

export default SofiaReflectionCard;
