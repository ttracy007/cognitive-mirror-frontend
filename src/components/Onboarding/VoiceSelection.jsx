import React, { useState, useEffect } from 'react';
import './voice-selection.css';

const VoiceSelection = ({ userContext, responses, detectedPriority, onVoiceSelected, isRefined = false }) => {
  const [voiceResponses, setVoiceResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    fetchVoicePreviews();
  }, []);

  const fetchVoicePreviews = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const endpoint = isRefined ? '/api/voice-previews/generate-refined' : '/api/voice-previews/generate';

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'temp', // Not critical for preview generation
          responses,
          detected_priority: detectedPriority
        })
      });

      if (!response.ok) throw new Error('Failed to generate previews');

      const data = await response.json();
      setVoiceResponses(data.voice_responses);
      setLoading(false);
    } catch (err) {
      console.error('Voice preview error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice);
  };

  const handleContinue = () => {
    if (selectedVoice) {
      onVoiceSelected(selectedVoice, 'continue');
    }
  };

  const handleJournalNow = () => {
    if (selectedVoice) {
      onVoiceSelected(selectedVoice, 'journal-now');
    }
  };

  if (loading) {
    return (
      <div className="voice-selection-container">
        <div className="voice-loading">
          <p>Preparing your personalized voice previews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voice-selection-container">
        <div className="voice-error">
          <p>Unable to load voice previews. Please continue with the questionnaire.</p>
          <button onClick={() => onVoiceSelected(null, 'continue')}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-selection-container">
      <div className="voice-intro">
        {isRefined ? (
          <>
            <p className="voice-intro-text">
              Thanks for sharing more about yourself. Based on your complete responses, I now have a deeper understanding
              that you're <strong>{userContext}</strong>.
            </p>
            <p className="voice-intro-text">
              Here are your three voices again, but this time with insights that draw from everything you've shared.
              Notice how much more specific and tailored they are now:
            </p>
          </>
        ) : (
          <>
            <p className="voice-intro-text">
              I'm hearing a few things from what you've shared—sounds like you're <strong>{userContext}</strong>.
              Here's the thing: you don't have to navigate this alone, and you're not stuck with just one perspective.
            </p>
            <p className="voice-intro-text">
              Let me introduce you to three different voices, and I'll show you how each of them might respond
              to what you just shared. See which one feels right:
            </p>
          </>
        )}
      </div>

      <div className="voice-cards">
        {/* Marcus */}
        <div
          className={`voice-card ${selectedVoice === 'marcus' ? 'selected' : ''}`}
          onClick={() => handleVoiceSelect('marcus')}
        >
          <div className="voice-header">
            <h3>Marcus Aurelius 🏛️</h3>
            <p className="voice-subtitle">The Stoic Philosopher</p>
          </div>
          <div className="voice-response">
            <p>{voiceResponses.marcus}</p>
          </div>
          <div className="voice-when">
            <strong>Choose Marcus when you need:</strong>
            <ul>
              <li>Perspective on what you can/can't control</li>
              <li>Wisdom without emotional intensity</li>
            </ul>
          </div>
          {selectedVoice === 'marcus' && (
            <div className="voice-selected-indicator">✓ Selected</div>
          )}
        </div>

        {/* Tony D */}
        <div
          className={`voice-card ${selectedVoice === 'tony_d' ? 'selected' : ''}`}
          onClick={() => handleVoiceSelect('tony_d')}
        >
          <div className="voice-header">
            <h3>Tony D 🎯</h3>
            <p className="voice-subtitle">The No-Bullshit Friend</p>
          </div>
          <div className="voice-response">
            <p>{voiceResponses.tony_d}</p>
          </div>
          <div className="voice-when">
            <strong>Choose Tony D when you need:</strong>
            <ul>
              <li>A swift kick in the ass</li>
              <li>Someone to call out your excuses</li>
            </ul>
          </div>
          {selectedVoice === 'tony_d' && (
            <div className="voice-selected-indicator">✓ Selected</div>
          )}
        </div>

        {/* Clara */}
        <div
          className={`voice-card ${selectedVoice === 'clara' ? 'selected' : ''}`}
          onClick={() => handleVoiceSelect('clara')}
        >
          <div className="voice-header">
            <h3>Clara 🌿</h3>
            <p className="voice-subtitle">The Compassionate Therapist</p>
          </div>
          <div className="voice-response">
            <p>{voiceResponses.clara}</p>
          </div>
          <div className="voice-when">
            <strong>Choose Clara when you need:</strong>
            <ul>
              <li>Gentleness and validation</li>
              <li>Therapeutic exploration without pressure</li>
            </ul>
          </div>
          {selectedVoice === 'clara' && (
            <div className="voice-selected-indicator">✓ Selected</div>
          )}
        </div>
      </div>

      {selectedVoice && (
        <div className="voice-actions">
          {isRefined ? (
            <>
              <p className="voice-choice-prompt">
                Perfect! You've completed the full questionnaire and selected your voice. Ready to start journaling?
              </p>
              <div className="voice-action-buttons">
                <button
                  className="voice-button primary"
                  onClick={handleJournalNow}
                >
                  Start Journaling
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="voice-choice-prompt">
                Great choice. Here are your options:
              </p>
              <div className="voice-action-buttons">
                <button
                  className="voice-button secondary"
                  onClick={handleContinue}
                  title="Answer 5 more questions for deeper, more personalized voice insights"
                >
                  Continue Questions
                  <span className="button-subtitle">Get deeper insights (5 more questions)</span>
                </button>
                <button
                  className="voice-button primary"
                  onClick={handleJournalNow}
                  title="Start journaling now with current insights"
                >
                  Journal Now
                  <span className="button-subtitle">Start with what we know</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSelection;