import React from 'react';
import './VoicePreviewDisplay.css';

const VoicePreviewDisplay = ({
  voiceType,      // 'tony', 'clara', or 'marcus'
  previewText,    // The 150-200 word preview from backend
  description,    // "Choose Tony D when..." text
  onAccept,       // Callback for Yes button
  onReject        // Callback for No button
}) => {
  const voiceNames = {
    tony: 'Tony D',
    clara: 'Clara',
    marcus: 'Marcus'
  };

  // Extract text from preview object if needed
  const displayText = typeof previewText === 'object' && previewText.text
    ? previewText.text
    : previewText;

  return (
    <div className="voice-preview-display">
      <div className="preview-content">
        <p className="preview-text">{displayText}</p>
      </div>

      <div className="voice-description">
        <p>{description}</p>
      </div>

      <div className="confirmation-section">
        <p className="confirmation-question">
          Do you like {voiceNames[voiceType]}?
        </p>
        <div className="confirmation-buttons">
          <button
            className="btn-yes"
            onClick={onAccept}
          >
            Yes
          </button>
          <button
            className="btn-no"
            onClick={onReject}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoicePreviewDisplay;