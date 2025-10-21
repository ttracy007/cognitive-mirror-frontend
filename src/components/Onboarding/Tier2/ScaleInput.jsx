import React, { useState, useEffect } from 'react';

const ScaleInput = ({ question, scale, onAnswer, defaultValue }) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  // Reset selection when defaultValue changes (e.g., domain change or question reset)
  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const handleSelect = (value) => {
    setSelectedValue(value);
    // Immediately call onAnswer to enable Next button
    onAnswer(value);
  };

  const { min, max, labels } = scale;
  const range = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="scale-input">
      <p className="scale-question">{question}</p>

      <div className="scale-container">
        <div className="scale-buttons-with-labels">
          {range.map(value => (
            <div key={value} className="scale-button-container">
              <button
                className={`scale-button ${selectedValue === value ? 'selected' : ''}`}
                onClick={() => handleSelect(value)}
              >
                {value}
              </button>
              {labels && labels[value] && (
                <span className="scale-inline-label">
                  {labels[value]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Keep legacy min/max labels for scales without inline labels */}
        {labels && !Object.keys(labels).some(key => parseInt(key) > min && parseInt(key) < max) && (
          <div className="scale-labels">
            <span className="scale-label-left">{labels[min]}</span>
            <span className="scale-label-right">{labels[max]}</span>
          </div>
        )}
      </div>

      {selectedValue && (
        <div className="scale-feedback">
          <p>You selected: <strong>{selectedValue}</strong></p>
          {labels && labels[selectedValue] && (
            <p className="scale-meaning">"{labels[selectedValue]}"</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScaleInput;