import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, FIELD_NAMES, VOICE_IDS } from '../../shared/onboarding-constants';
import './voice-selection.css';

const VoiceSelection = ({ userContext, responses, detectedPriority, voicePreviews, onVoiceSelected, isRefined = false, userId }) => {
  const [voiceResponses, setVoiceResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [adaptiveContext, setAdaptiveContext] = useState(userContext);
  const [inlineResponse, setInlineResponse] = useState('');
  const [showInlineInput, setShowInlineInput] = useState(false);

  useEffect(() => {
    // Only fetch if previews weren't passed as props
    if (!voicePreviews && !voiceResponses) {
      fetchVoicePreviews();
    } else if (voicePreviews) {
      // Use the previews passed from parent
      setVoiceResponses(voicePreviews);
      setLoading(false);
    }
  }, [voicePreviews]);

  const fetchVoicePreviews = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const endpoint = API_ENDPOINTS.VOICE_PREVIEWS_GENERATE;

      // Use the actual user ID from onboarding flow
      if (!userId) {
        throw new Error('User ID is required for voice preview generation');
      }

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [FIELD_NAMES.USER_ID]: userId
        })
      });

      if (!response.ok) throw new Error('Failed to generate previews');

      const data = await response.json();

      // Handle new single voice API format
      if (data.success && data.preview) {
        const voiceData = {
          [VOICE_IDS.TONY_D]: data.preview
        };
        setVoiceResponses(voiceData);
      } else {
        throw new Error(data.error || 'No voice preview data received');
      }

      // Use adaptive context from API response if available
      if (data.metadata?.user_context) {
        setAdaptiveContext(data.metadata.user_context);
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
          <button onClick={() => onVoiceSelected(VOICE_IDS.TONY_D, 'journal-now', null, null)}>
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
          I'm hearing a few things from what you've shared—sounds like you're <strong>{adaptiveContext}</strong>.
          Here's a preview of how I might respond to what you've shared:
        </p>
      </div>

      <div className="voice-preview">
        {/* Single Tony D Preview */}
        <div className="voice-card single-voice">
          <div className="voice-header">
            <h3>Your Cognitive Mirror</h3>
            <p className="voice-subtitle">Personalized therapeutic insights</p>
          </div>
          <div className="voice-response">
            <p>{voiceResponses?.[VOICE_IDS.TONY_D] || 'Loading your personalized response...'}</p>
          </div>
        </div>
      </div>

      {/* Single action section */}
      <div className="voice-actions">
        <div className="inline-response-section">
          <p className="inline-prompt">
            Want to respond to this insight?
            <span className="inline-optional">(Optional - you can skip and start fresh)</span>
          </p>
          <textarea
            className="inline-response-input"
            placeholder="Respond to this insight, or click 'Start Journaling' to begin fresh..."
            value={inlineResponse}
            onChange={(e) => setInlineResponse(e.target.value)}
            rows={4}
          />
        </div>

        <div className="voice-action-buttons">
          <button
            className="voice-button primary"
            onClick={() => onVoiceSelected(VOICE_IDS.TONY_D, 'journal-now', voiceResponses?.[VOICE_IDS.TONY_D], inlineResponse)}
          >
            Start Journaling
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelection;