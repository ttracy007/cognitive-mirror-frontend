import React, { useState } from 'react';
import './PriorityConfirmation.css';

const PriorityConfirmation = ({
  synthesizedStatement,
  confidence,
  onConfirm,
  onOverride
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [overrideText, setOverrideText] = useState('');

  const handleOptionChange = (value) => {
    setSelectedOption(value);
    if (value === 'confirmed') {
      setOverrideText('');
    }
  };

  const handleSubmit = () => {
    if (selectedOption === 'confirmed') {
      onConfirm();
    } else if (selectedOption === 'override' && overrideText.trim()) {
      onOverride(overrideText);
    }
  };

  const canSubmit =
    selectedOption === 'confirmed' ||
    (selectedOption === 'override' && overrideText.trim().length > 0);

  return (
    <div className="priority-confirmation">
      <p className="priority-intro">
        Based on what you've shared, it sounds like you're most preoccupied with:
      </p>

      <div className="synthesized-statement">
        <p>"{synthesizedStatement}"</p>
      </div>

      <p className="priority-question">
        Is this what's most occupying your thoughts right now?
      </p>

      <div className="priority-options">
        <label className={`option-label ${selectedOption === 'confirmed' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="priority-confirmation"
            value="confirmed"
            checked={selectedOption === 'confirmed'}
            onChange={() => handleOptionChange('confirmed')}
          />
          <span>Yes, that's it</span>
        </label>

        <label className={`option-label ${selectedOption === 'override' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="priority-confirmation"
            value="override"
            checked={selectedOption === 'override'}
            onChange={() => handleOptionChange('override')}
          />
          <span>No, it's something else</span>
        </label>

        {selectedOption === 'override' && (
          <div className="override-input-container">
            <textarea
              className="override-input"
              placeholder="What's most on your mind right now?"
              value={overrideText}
              onChange={(e) => setOverrideText(e.target.value)}
              rows={3}
              autoFocus
            />
            <p className="char-count">{overrideText.length} characters</p>
          </div>
        )}
      </div>

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        Continue
      </button>
    </div>
  );
};

export default PriorityConfirmation;