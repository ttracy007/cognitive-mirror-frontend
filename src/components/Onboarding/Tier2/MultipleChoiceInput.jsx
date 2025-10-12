import React, { useState } from 'react';

const MultipleChoiceInput = ({ question, options, onAnswer, onSelectionChange }) => {
  const [selected, setSelected] = useState([]);

  const toggleOption = (value) => {
    console.log('[MultipleChoice] Toggling option:', value);
    console.log('[MultipleChoice] Current selected:', selected);

    setSelected(prev => {
      const newSelected = prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value];

      console.log('[MultipleChoice] New selected:', newSelected);

      // Notify parent component of selection change
      if (onSelectionChange) {
        onSelectionChange(newSelected);
      }

      return newSelected;
    });
  };

  return (
    <div className="multiple-choice" onClick={() => console.log('[MultipleChoice] Container clicked')}>
      <p onClick={() => console.log('[MultipleChoice] Question text clicked')}>{question}</p>
      <div className="options-list">
        {options.map(option => (
          <button
            key={option.value}
            className={`choice-button ${selected.includes(option.value) ? 'selected' : ''}`}
            onClick={() => toggleOption(option.value)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceInput;