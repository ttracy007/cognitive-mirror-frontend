/**
 * VoiceModal Component
 * Clean voice recording modal using the new useVoiceWithCleaning hook
 */

import React, { useState, useEffect } from 'react';
import useVoiceWithCleaning from '../hooks/useVoiceWithCleaning';
import './VoiceModal.css';

const VoiceModal = ({ isOpen, onClose, onSubmit }) => {
  const {
    transcript,
    rawTranscript,
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    updateTranscript
  } = useVoiceWithCleaning();

  // Local state for user edits
  const [editedTranscript, setEditedTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  // Update edited transcript when cleaned transcript changes
  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

  // Timer for recording duration
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format recording time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle start recording
  const handleStartRecording = () => {
    setEditedTranscript('');
    setRecordingTime(0);
    startRecording();
  };

  // Handle stop recording
  const handleStopRecording = () => {
    stopRecording();
  };

  // Handle cancel
  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    setEditedTranscript('');
    setRecordingTime(0);
    onClose();
  };

  // Handle submit
  const handleSubmit = () => {
    if (editedTranscript.trim()) {
      onSubmit(editedTranscript.trim());
      setEditedTranscript('');
      setRecordingTime(0);
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay">
      <div className="voice-modal">
        <div className="voice-modal-header">
          <h3>🎙️ Voice Input</h3>
          <button
            className="voice-modal-close"
            onClick={handleCancel}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="voice-modal-content">
          {/* Error state */}
          {!isSupported && (
            <div className="voice-not-supported">
              <p>Voice input is not supported in this browser.</p>
              <p>Please use Chrome or Safari on desktop, or Safari on mobile.</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="voice-error">
              <p>{error}</p>
            </div>
          )}

          {/* Supported and no errors */}
          {isSupported && !error && (
            <>
              {/* Recording controls */}
              <div className="voice-controls">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="voice-record-button"
                    type="button"
                  >
                    🎤 Start Recording
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="voice-stop-button"
                    type="button"
                  >
                    ⏹ Stop Recording
                  </button>
                )}
              </div>

              {/* Recording indicator and timer */}
              {isRecording && (
                <div className="voice-recording-status">
                  <div className="recording-indicator">
                    <span className="recording-dot"></span>
                    Recording...
                  </div>
                  <div className="voice-timer">
                    {formatTime(recordingTime)}
                  </div>
                </div>
              )}

              {/* Voice visualizer when recording */}
              {isRecording && (
                <div className="voice-visualizer">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="voice-line"
                      style={{ '--delay': i }}
                    ></div>
                  ))}
                </div>
              )}

              {/* Transcript area */}
              <div className="voice-transcript-area">
                <label htmlFor="voice-transcript">
                  {isRecording ? 'Speak now...' : 'Your transcript (editable):'}
                </label>
                <textarea
                  id="voice-transcript"
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  placeholder={isRecording ? "Your words will appear here..." : "Click 'Start Recording' to begin"}
                  rows={6}
                  className="voice-transcript-input"
                />
              </div>

              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && rawTranscript && (
                <details className="voice-debug">
                  <summary>🐛 Debug Info</summary>
                  <div className="voice-debug-content">
                    <p><strong>Raw:</strong> "{rawTranscript}"</p>
                    <p><strong>Cleaned:</strong> "{transcript}"</p>
                  </div>
                </details>
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="voice-modal-actions">
          <button
            onClick={handleCancel}
            className="voice-cancel-button"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!editedTranscript.trim()}
            className="voice-submit-button"
            type="button"
          >
            Add to Journal
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;