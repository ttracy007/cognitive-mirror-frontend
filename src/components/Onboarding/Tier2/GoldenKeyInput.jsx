import React, { useState, useEffect } from 'react';

const GoldenKeyInput = ({ question, placeholder, minWords = 40, onSubmit, defaultValue, hideQuestion = false }) => {
  const [text, setText] = useState(defaultValue || '');
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  console.log('[GoldenKey] Component props:', { question, placeholder, minWords });

  useEffect(() => {
    // Count words in real-time
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);

    // Show encouragement when getting close to minimum
    if (words.length >= minWords * 0.75 && words.length < minWords) {
      setShowEncouragement(true);
    } else {
      setShowEncouragement(false);
    }
  }, [text, minWords]);

  const handleChange = (e) => {
    const newText = e.target.value;
    console.log('[GoldenKey] Text changed, length:', newText.length);
    setText(newText);
  };

  const handleSubmit = () => {
    console.log('[GoldenKey] Submit clicked, text length:', text.trim().length, 'isSubmitting:', isSubmitting);

    if (text.trim().length === 0 || isSubmitting) {
      console.log('[GoldenKey] Submit blocked - no text or already submitting');
      return;
    }

    console.log('[GoldenKey] Submitting text:', text.trim());
    setIsSubmitting(true);

    // Brief delay to show loading state
    setTimeout(() => {
      console.log('[GoldenKey] Calling onSubmit with:', text.trim(), wordCount);
      onSubmit(text.trim(), wordCount);
    }, 500);
  };

  const handleKeyDown = (e) => {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && text.trim().length > 0) {
      handleSubmit();
    }
  };

  const hasText = text.trim().length > 0;
  const meetsMinimum = wordCount >= minWords;
  const progressPercentage = Math.min((wordCount / minWords) * 100, 100);

  return (
    <div className="golden-key-input">
      {!hideQuestion && <p className="golden-key-question">{question}</p>}

      <div className="golden-key-textarea-container">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={6}
          disabled={isSubmitting}
          className={`golden-key-textarea ${hasText ? 'valid' : 'invalid'} ${isSubmitting ? 'submitting' : ''}`}
        />

        <div className="word-count-container">
          <div className="word-count-progress">
            <div
              className="word-count-progress-bar"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="word-count-text">
            <span className={wordCount >= minWords ? 'strong-key' : 'light-key'}>
              {wordCount} words {wordCount >= 40 ? '(detailed response ✓)' : ''}
            </span>
          </div>
        </div>

        {showEncouragement && (
          <div className="encouragement-message">
            <p>You're doing great! Just {minWords - wordCount} more words...</p>
          </div>
        )}

        {hasText && !isSubmitting && (
          <div className="golden-key-guidance">
            <p>{wordCount >= 40 ? 'Perfect! This gives me enough to work with.' : 'Great start!'} You can add more if you'd like, or continue.</p>
            <p className="keyboard-hint">
              <strong>Tip:</strong> Press Ctrl+Enter (or Cmd+Enter) to submit quickly
            </p>
          </div>
        )}
      </div>

      <div className="golden-key-actions">
        <button
          onClick={handleSubmit}
          disabled={!hasText || isSubmitting}
          className={`golden-key-submit ${hasText ? 'ready' : 'not-ready'} ${isSubmitting ? 'submitting' : ''}`}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner">⏳</span>
              Processing...
            </>
          ) : (
            hasText ? 'Continue' : 'Enter some text to continue'
          )}
        </button>
      </div>

      {wordCount > 0 && wordCount < 40 && (
        <div className="golden-key-help">
          <p>
            <strong>For best results:</strong> More detail helps me understand the full context
            and emotional impact of what you're experiencing. The more specific you can be,
            the better I can help you work through it.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoldenKeyInput;