import React from 'react';
import './AlternativeVoicesSelector.css';

const AlternativeVoicesSelector = ({
  availableVoices,  // Array of {id, name, description} for voices not yet tried
  onVoiceSelect     // Callback when user clicks a voice option
}) => {
  return (
    <div className="alternative-voices-selector">
      <h3>Choose a different voice:</h3>

      <div className="voice-options">
        {availableVoices.map(voice => (
          <div
            key={voice.id}
            className="voice-option"
            onClick={() => onVoiceSelect(voice.id)}
          >
            <input
              type="radio"
              name="alternative-voice"
              value={voice.id}
              readOnly
            />
            <div className="voice-info">
              <h4>{voice.name}</h4>
              <p className="voice-description">{voice.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternativeVoicesSelector;