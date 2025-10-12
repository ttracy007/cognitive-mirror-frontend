import React, { useState } from 'react';

const SingleChoiceInput = ({ question, options, onAnswer, questionId, defaultValue }) => {
  const [selected, setSelected] = useState(defaultValue);

  const handleSelect = (value) => {
    setSelected(value);     // CRITICAL: Update local state first
    onAnswer(value, {});    // Then notify parent
  };

  return (
    <div className="single-choice-input">
      <p className="choice-question">{question}</p>

      <div className="choice-options">
        {options.map((option, index) => (
          <label key={option.value} className={`choice-button ${selected === option.value ? 'selected' : ''}`}>
            <input
              type="radio"
              name={questionId}
              value={option.value}
              checked={selected === option.value}
              onChange={() => handleSelect(option.value)}
            />
            <span className="choice-number">{index + 1}.</span>
            <span className="choice-text">{option.text || option.label}</span>
          </label>
        ))}
      </div>

      {selected && (
        <div className="choice-feedback">
          <p>You selected: <strong>{options.find(o => o.value === selected)?.text || options.find(o => o.value === selected)?.label}</strong></p>
        </div>
      )}
    </div>
  );
};

export default SingleChoiceInput;