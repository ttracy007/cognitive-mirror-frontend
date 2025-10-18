import React, { useState, useEffect } from 'react';
import VoicePreviewDisplay from './VoicePreviewDisplay';
import AlternativeVoicesSelector from './AlternativeVoicesSelector';
import { VOICE_IDS, VOICE_NAMES, VOICE_DESCRIPTIONS, API_ENDPOINTS, FIELD_NAMES } from '../../shared/onboarding-constants';
import './VoiceSelectionFlow.css';

const VoiceSelectionFlow = ({
  userId,
  initialVoiceChoice,  // From advice_style question (tony/clara/marcus)
  responses,           // All user responses for voice preview generation
  onVoiceConfirmed     // Callback when user confirms final choice
}) => {

  // Debug logging
  console.log('[VoiceSelectionFlow] Props:', { userId, initialVoiceChoice, responses: Object.keys(responses || {}) });
  const [currentPreview, setCurrentPreview] = useState(null);
  const [currentVoiceType, setCurrentVoiceType] = useState(null);
  const [triedVoices, setTriedVoices] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [error, setError] = useState(null);

  // Voice data using shared constants
  const voiceData = {
    [VOICE_IDS.TONY]: {
      id: VOICE_IDS.TONY,
      name: VOICE_NAMES[VOICE_IDS.TONY],
      description: VOICE_DESCRIPTIONS[VOICE_IDS.TONY]
    },
    [VOICE_IDS.CLARA]: {
      id: VOICE_IDS.CLARA,
      name: VOICE_NAMES[VOICE_IDS.CLARA],
      description: VOICE_DESCRIPTIONS[VOICE_IDS.CLARA]
    },
    [VOICE_IDS.MARCUS]: {
      id: VOICE_IDS.MARCUS,
      name: VOICE_NAMES[VOICE_IDS.MARCUS],
      description: VOICE_DESCRIPTIONS[VOICE_IDS.MARCUS]
    }
  };

  // Generate initial voice preview on mount
  useEffect(() => {
    if (initialVoiceChoice) {
      generateVoicePreview(initialVoiceChoice);
    } else {
      // If no initial voice choice, default to showing alternatives for manual selection
      console.log('[VoiceSelectionFlow] No initial voice choice, showing alternatives');
      setShowAlternatives(true);
    }
  }, [initialVoiceChoice]);

  // Generate voice preview for specified voice
  const generateVoicePreview = async (voiceType) => {
    setIsGenerating(true);
    setShowAlternatives(false);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `${backendUrl}${API_ENDPOINTS.VOICE_PREVIEWS_GENERATE}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [FIELD_NAMES.USER_ID]: userId,
            voices: [voiceType]
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.previews && data.previews[voiceType]) {
        setCurrentPreview(data.previews[voiceType]);
        setCurrentVoiceType(voiceType);
        setTriedVoices(prev => [...prev, voiceType]);
      } else {
        throw new Error(data.error || 'No voice preview data received');
      }
    } catch (error) {
      console.error('Error generating voice preview:', error);
      if (error.name === 'AbortError') {
        setError('Voice preview generation timed out. Please try again.');
      } else {
        setError(`Failed to generate voice preview: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle user accepting current voice
  const handleAcceptVoice = () => {
    onVoiceConfirmed(currentVoiceType, currentPreview);
  };

  // Handle user rejecting current voice
  const handleRejectVoice = () => {
    setShowAlternatives(true);
  };

  // Handle user selecting an alternative voice
  const handleAlternativeSelect = (voiceType) => {
    generateVoicePreview(voiceType);
  };

  // Get voices that haven't been tried yet
  const getRemainingVoices = () => {
    return Object.values(voiceData).filter(
      voice => !triedVoices.includes(voice.id)
    );
  };

  // Render error state
  if (error) {
    return (
      <div className="voice-selection-error">
        <h3>Unable to generate voice preview</h3>
        <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
        <button
          onClick={() => {
            setError(null);
            if (initialVoiceChoice) {
              generateVoicePreview(initialVoiceChoice);
            }
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render loading state
  if (isGenerating) {
    return (
      <div className="voice-selection-loading">
        <div className="loading-spinner">⏳</div>
        <p>Generating your personalized preview...</p>
      </div>
    );
  }

  // Render alternative voices selector
  if (showAlternatives) {
    const remainingVoices = getRemainingVoices();

    if (remainingVoices.length === 0) {
      // Edge case: User rejected all 3 voices
      return (
        <div className="all-voices-rejected">
          <p>You've seen all three voices. Please select one to continue:</p>
          <AlternativeVoicesSelector
            availableVoices={Object.values(voiceData)}
            onVoiceSelect={handleAlternativeSelect}
          />
        </div>
      );
    }

    return (
      <AlternativeVoicesSelector
        availableVoices={remainingVoices}
        onVoiceSelect={handleAlternativeSelect}
      />
    );
  }

  // Render voice preview with Yes/No
  if (currentPreview && currentVoiceType) {
    return (
      <VoicePreviewDisplay
        voiceType={currentVoiceType}
        previewText={currentPreview}
        description={voiceData[currentVoiceType].description}
        onAccept={handleAcceptVoice}
        onReject={handleRejectVoice}
      />
    );
  }

  // Initial state - shouldn't normally reach here
  return (
    <div className="voice-selection-loading">
      <p>Preparing your voice preview...</p>
    </div>
  );
};

export default VoiceSelectionFlow;