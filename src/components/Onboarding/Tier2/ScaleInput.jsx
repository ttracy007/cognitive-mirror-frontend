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
        <div className="scale-buttons">
          {range.map(value => (
            <button
              key={value}
              className={`scale-button ${selectedValue === value ? 'selected' : ''}`}
              onClick={() => handleSelect(value)}
            >
              {value}
            </button>
          ))}
        </div>

        {labels && (
          <div className="scale-labels">
            <span className="scale-label-left">{labels[min]}</span>
            <span className="scale-label-right">{labels[max]}</span>
          </div>
        )}

        {/* Show intermediate labels if they exist */}
        {labels && Object.keys(labels).length > 2 && (
          <div className="scale-labels-detailed">
            {Object.entries(labels).map(([value, label]) => (
              <div key={value} className="scale-label-item">
                <strong>{value}:</strong> {label}
              </div>
            ))}
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