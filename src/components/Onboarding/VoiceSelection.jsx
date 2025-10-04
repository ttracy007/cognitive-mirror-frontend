import React, { useState, useEffect } from 'react';
import './voice-selection.css';

const VoiceSelection = ({ userContext, responses, detectedPriority, onVoiceSelected }) => {
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
      const response = await fetch(`${backendUrl}/api/voice-previews/generate`, {
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

  const handleDiveIn = () => {
    if (selectedVoice) {
      onVoiceSelected(selectedVoice, 'dive-in');
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
        <p className="voice-intro-text">
          I'm hearing a few things from what you've shared—sounds like you're <strong>{userContext}</strong>.
          Here's the thing: you don't have to navigate this alone, and you're not stuck with just one perspective.
        </p>
        <p className="voice-intro-text">
          Let me introduce you to three different voices, and I'll show you how each of them might respond
          to what you just shared. See which one feels right:
        </p>
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
          <p className="voice-choice-prompt">
            Great choice. What sounds better—finish up with a few more questions, or jump straight into journaling?
          </p>
          <div className="voice-action-buttons">
            <button
              className="voice-button secondary"
              onClick={handleContinue}
            >
              Continue Questions
            </button>
            <button
              className="voice-button primary"
              onClick={handleDiveIn}
            >
              Start Journaling
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSelection;