// src/SummaryBlock.js
import React from 'react';

const SummaryBlock = ({ label, content, onCopy }) => (
  <div style={{ marginBottom: '2rem', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
    <h4>{label}</h4>
    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#f9f9f9', padding: '1rem' }}>
      {content || 'Loading...'}
    </pre>
    <button onClick={onCopy} style={{ marginTop: '0.5rem' }}>Copy</button>
  </div>
);

export default SummaryBlock;
