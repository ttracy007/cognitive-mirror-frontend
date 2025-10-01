/**
 * VoiceRecorder - Minimal Claude-style voice recording interface
 * Bottom-anchored, auto-start recording with clean design
 */

import React, { useState, useEffect } from 'react';
import useVoiceWithCleaning from '../hooks/useVoiceWithCleaning';
import './VoiceRecorder.css';

const VoiceRecorder = ({ isOpen, onClose, onComplete }) => {
  const {
    transcript,
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    resetRecording
  } = useVoiceWithCleaning();

  const [recordingTime, setRecordingTime] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Auto-start recording when component opens
  useEffect(() => {
    if (isOpen && isSupported) {
      console.log('🎙️ Auto-starting voice recording');
      setIsVisible(true);
      setRecordingTime(0);

      // Small delay to allow animation to start
      setTimeout(() => {
        startRecording();
      }, 100);
    } else if (!isOpen) {
      setIsVisible(false);
      setRecordingTime(0);
    }
  }, [isOpen, isSupported, startRecording]);

  // Timer for recording duration
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format time as M:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle cancel (X button)
  const handleCancel = () => {
    console.log('❌ Canceling voice recording');
    if (isRecording) {
      stopRecording();
    }
    resetRecording();
    setRecordingTime(0);
    onClose();
  };

  // Handle submit (arrow button)
  const handleSubmit = () => {
    console.log('✅ Submitting voice recording');
    if (isRecording) {
      stopRecording();
    }

    // Wait a moment for final processing then complete
    setTimeout(() => {
      onComplete(transcript);
      resetRecording();
      setRecordingTime(0);
    }, 200);
  };

  // Handle unsupported browsers
  if (isOpen && !isSupported) {
    return (
      <div className={`voice-recorder ${isOpen ? 'voice-recorder--open' : ''}`}>
        <div className="voice-recorder__content voice-recorder__content--error">
          <button
            className="voice-recorder__cancel"
            onClick={handleCancel}
            aria-label="Close"
          >
            ✕
          </button>
          <div className="voice-recorder__error">
            Voice not supported in this browser
          </div>
        </div>
      </div>
    );
  }

  // Handle errors
  if (isOpen && error) {
    return (
      <div className={`voice-recorder ${isOpen ? 'voice-recorder--open' : ''}`}>
        <div className="voice-recorder__content voice-recorder__content--error">
          <button
            className="voice-recorder__cancel"
            onClick={handleCancel}
            aria-label="Close"
          >
            ✕
          </button>
          <div className="voice-recorder__error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className={`voice-recorder ${isVisible ? 'voice-recorder--open' : ''}`}>
      <div className="voice-recorder__content">
        {/* Cancel button (left) */}
        <button
          className="voice-recorder__cancel"
          onClick={handleCancel}
          aria-label="Cancel recording"
        >
          ✕
        </button>

        {/* Waveform animation (center) */}
        <div className="voice-recorder__waveform">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="voice-recorder__wave-bar"
              style={{
                '--delay': i * 0.1,
                '--height': isRecording ? Math.random() * 0.8 + 0.2 : 0.3
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="voice-recorder__timer">
          {formatTime(recordingTime)}
        </div>

        {/* Submit button (right) */}
        <button
          className="voice-recorder__submit"
          onClick={handleSubmit}
          aria-label="Complete recording"
          disabled={recordingTime === 0}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="voice-recorder__submit-icon"
          >
            <path
              d="M8 1L15 8L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="rotate(90 8 8)"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VoiceRecorder;