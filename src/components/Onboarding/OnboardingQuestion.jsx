import React, { useState } from 'react';
import VoiceRecorder from '../VoiceRecorder';

const OnboardingQuestion = ({ question, response, onResponseChange }) => {
  const [activeVoiceInput, setActiveVoiceInput] = useState(null);

  const handleVoiceComplete = (transcript, fieldPath) => {
    // Extract nested field updates based on field path
    if (fieldPath === 'notes') {
      onResponseChange({
        ...response,
        notes: transcript
      });
    } else if (fieldPath === 'source') {
      onResponseChange({
        ...response,
        source: transcript
      });
    } else if (fieldPath === 'description') {
      onResponseChange({
        ...response,
        description: transcript
      });
    } else if (fieldPath === 'text_area') {
      onResponseChange(transcript);
    }
    setActiveVoiceInput(null);
  };

  const renderScaleWithNotes = () => (
    <div className="question-input scale-with-notes">
      <div className="scale-input">
        <label className="scale-label">
          <span>{question.scale.labels[question.scale.min]}</span>
          <input
            type="range"
            min={question.scale.min}
            max={question.scale.max}
            value={response?.score || 5}
            onChange={(e) => onResponseChange({
              ...response,
              score: parseInt(e.target.value)
            })}
          />
          <span>{question.scale.labels[question.scale.max]}</span>
        </label>
        <div className="scale-value">{response?.score || 5}</div>
      </div>
      <div className="textarea-with-voice">
        <textarea
          className="notes-input"
          placeholder={question.placeholder}
          value={response?.notes || ''}
          onChange={(e) => onResponseChange({
            ...response,
            notes: e.target.value
          })}
          rows={3}
        />
        <button
          type="button"
          className="voice-input-button"
          onClick={() => setActiveVoiceInput('notes')}
          title="Voice input"
        >
          🎤
        </button>
      </div>
    </div>
  );

  const renderSelectWithNotes = () => {
    const showFollowUp = question.followUpTriggers?.includes(response?.level);

    return (
      <div className="question-input select-with-notes">
        <select
          value={response?.level || ''}
          onChange={(e) => onResponseChange({
            ...response,
            level: e.target.value
          })}
          className="select-input"
        >
          <option value="">Select...</option>
          {question.options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {showFollowUp && (
          <div className="follow-up">
            <p className="follow-up-question">{question.followUpQuestion}</p>
            <div className="textarea-with-voice">
              <textarea
                className="notes-input"
                placeholder={question.placeholder}
                value={response?.source || ''}
                onChange={(e) => onResponseChange({
                  ...response,
                  source: e.target.value
                })}
                rows={3}
              />
              <button
                type="button"
                className="voice-input-button"
                onClick={() => setActiveVoiceInput('source')}
                title="Voice input"
              >
                🎤
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBooleanWithNotes = () => (
    <div className="question-input boolean-with-notes">
      <div className="boolean-options">
        {question.options.map(opt => (
          <button
            key={opt.value.toString()}
            className={`option-button ${response?.struggles === opt.value ? 'selected' : ''}`}
            onClick={() => onResponseChange({
              ...response,
              struggles: opt.value
            })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="textarea-with-voice">
        <textarea
          className="notes-input"
          placeholder={question.placeholder}
          value={response?.description || ''}
          onChange={(e) => onResponseChange({
            ...response,
            description: e.target.value
          })}
          rows={3}
        />
        <button
          type="button"
          className="voice-input-button"
          onClick={() => setActiveVoiceInput('description')}
          title="Voice input"
        >
          🎤
        </button>
      </div>
    </div>
  );

  const renderTagsWithNotes = () => (
    <div className="question-input tags-with-notes">
      <input
        type="text"
        className="tags-input"
        placeholder={question.placeholder}
        value={response?.occupying_mind?.join(', ') || ''}
        onChange={(e) => onResponseChange({
          ...response,
          occupying_mind: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
        })}
      />
      <div className="textarea-with-voice">
        <textarea
          className="notes-input"
          placeholder={question.notesPlaceholder}
          value={response?.description || ''}
          onChange={(e) => onResponseChange({
            ...response,
            description: e.target.value
          })}
          rows={3}
        />
        <button
          type="button"
          className="voice-input-button"
          onClick={() => setActiveVoiceInput('description')}
          title="Voice input"
        >
          🎤
        </button>
      </div>
    </div>
  );

  const renderTextArea = () => (
    <div className="question-input text-area">
      <div className="textarea-with-voice">
        <textarea
          className="notes-input large"
          placeholder={question.placeholder}
          value={response || ''}
          onChange={(e) => onResponseChange(e.target.value)}
          rows={5}
          required={question.required}
        />
        <button
          type="button"
          className="voice-input-button"
          onClick={() => setActiveVoiceInput('text_area')}
          title="Voice input"
        >
          🎤
        </button>
      </div>
    </div>
  );

  return (
    <div className="onboarding-question">
      <h2 className="question-text">{question.question}</h2>

      {question.type === 'scale_with_notes' && renderScaleWithNotes()}
      {question.type === 'select_with_notes' && renderSelectWithNotes()}
      {question.type === 'boolean_with_notes' && renderBooleanWithNotes()}
      {question.type === 'tags_with_notes' && renderTagsWithNotes()}
      {question.type === 'text_area' && renderTextArea()}

      <VoiceRecorder
        isOpen={activeVoiceInput !== null}
        onClose={() => setActiveVoiceInput(null)}
        onComplete={(transcript) => handleVoiceComplete(transcript, activeVoiceInput)}
      />
    </div>
  );
};

export default OnboardingQuestion;