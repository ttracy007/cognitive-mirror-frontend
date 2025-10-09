import React, { useState, useEffect } from 'react';
import './voice-selection.css';

const VoiceSelection = ({ userContext, responses, detectedPriority, onVoiceSelected, isRefined = false }) => {
  const [voiceResponses, setVoiceResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [adaptiveContext, setAdaptiveContext] = useState(userContext);
  const [inlineResponse, setInlineResponse] = useState('');
  const [showInlineInput, setShowInlineInput] = useState(false);

  useEffect(() => {
    fetchVoicePreviews();
  }, []);

  const fetchVoicePreviews = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const endpoint = '/api/onboarding/v1/voice-previews/generate';

      // Generate a proper UUID for the request
      const tempUserId = crypto.randomUUID();

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: tempUserId,
          responses: responses || {},
          detected_priority: detectedPriority || { priority: 'general_wellness', context: 'exploring general mental wellness' }
        })
      });

      if (!response.ok) throw new Error('Failed to generate previews');

      const data = await response.json();

      // Use the voice_responses from the original API format
      if (data.voice_responses) {
        setVoiceResponses(data.voice_responses);
      }

      // Use adaptive context from API response if available
      if (data.user_context) {
        setAdaptiveContext(data.user_context);
      }

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


  const handleJournalNow = () => {
    if (selectedVoice) {
      // Get the selected voice preview text
      const selectedPreview = voiceResponses?.[selectedVoice];
      onVoiceSelected(selectedVoice, 'journal-now', selectedPreview, inlineResponse);
    }
  };

  // Additional voice functionality removed - not available in Phase 2 backend

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
          <button onClick={() => onVoiceSelected('clara', 'journal-now', null, null)}>
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
              that you're <strong>{adaptiveContext}</strong>.
            </p>
            <p className="voice-intro-text">
              Here are your three voices again, but this time with insights that draw from everything you've shared.
              Notice how much more specific and tailored they are now:
            </p>
          </>
        ) : (
          <>
            <p className="voice-intro-text">
              I'm hearing a few things from what you've shared—sounds like you're <strong>{adaptiveContext}</strong>.
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

      {/* Action buttons when voice is selected OR skip option */}
      {selectedVoice ? (
        <div className="voice-actions">
          <p className="voice-choice-prompt">
            Perfect! Ready to start journaling with your selected voice?
          </p>

          <div className="inline-response-section">
            <p className="inline-prompt">
              Want to respond to {selectedVoice === 'tony_d' ? 'Tony D' : selectedVoice === 'clara' ? 'Clara' : 'Marcus'}?
              <span className="inline-optional">(Optional - you can skip and start fresh)</span>
            </p>
            <textarea
              className="inline-response-input"
              placeholder={`Respond to ${selectedVoice === 'tony_d' ? 'Tony D' : selectedVoice === 'clara' ? 'Clara' : 'Marcus'}'s insight, or click "Start Journaling" to begin fresh...`}
              value={inlineResponse}
              onChange={(e) => setInlineResponse(e.target.value)}
              rows={4}
            />
          </div>

          <div className="voice-action-buttons">
            <button
              className="voice-button primary"
              onClick={handleJournalNow}
            >
              Start Journaling
            </button>
          </div>
        </div>
      ) : (
        <div className="skip-section">
          <button
            className="skip-button"
            onClick={() => onVoiceSelected('clara', 'journal-now', null, null)}
          >
            Start Journaling
          </button>
          <p className="skip-text">You can always change your voice later in settings</p>
        </div>
      )}
    </div>
  );
};

export default VoiceSelection;