/**
 * useVoiceWithCleaning Hook
 * React hook that integrates voice recognition with transcription cleaning
 * CRITICAL: Does NOT use async/await with recognition.start() - it's synchronous!
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import VoiceTranscriptionCleaner from '../utils/voiceTranscriptionCleaner';

const useVoiceWithCleaning = (options = {}) => {
  // State
  const [transcript, setTranscript] = useState('');
  const [rawTranscript, setRawTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');

  // Refs to avoid closure issues
  const recognitionRef = useRef(null);
  const cleanerRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Initialize cleaner and check support
  useEffect(() => {
    // Initialize transcription cleaner
    cleanerRef.current = new VoiceTranscriptionCleaner(options);

    // Check if speech recognition is supported
    const checkSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        console.log('🔇 Speech Recognition not supported in this browser');
        return;
      }

      // Platform detection (same as in your existing code)
      const ua = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
      const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
      const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua);
      const isFirefox = /Firefox/i.test(ua);
      const isChromeMobile = isChrome && isMobile;

      // Block Chrome mobile (poor transcription quality)
      if (isChromeMobile) {
        setIsSupported(false);
        console.log('🚫 Chrome mobile blocked: Use Safari for better voice quality');
        return;
      }

      // Desktop: Chrome and Safari only
      if (!isMobile) {
        const supported = isChrome || isSafari;
        setIsSupported(supported);
        console.log(supported ? `✅ Voice supported: Desktop ${isChrome ? 'Chrome' : 'Safari'}` : '🔇 Desktop requires Chrome or Safari');
        return;
      }

      // Mobile: Safari only
      if (isMobile) {
        if (isFirefox) {
          setIsSupported(false);
          console.log('🦊 Firefox mobile: Voice not supported - use Safari');
        } else {
          const supported = isSafari;
          setIsSupported(supported);
          console.log(supported ? '✅ Voice supported: Mobile Safari' : '🔇 Mobile requires Safari');
        }
        return;
      }

      setIsSupported(true);
    };

    checkSupport();
  }, [options]);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('SpeechRecognition not available');
      return null;
    }

    // CRITICAL: Use 'new' operator - don't call as function
    const recognition = new SpeechRecognition();

    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    recognition.maxAlternatives = 1;

    // Event handlers
    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsRecording(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update final transcript accumulator
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
      }

      // Combine final and interim
      const currentRaw = finalTranscriptRef.current + interimTranscript;
      setRawTranscript(currentRaw);

      // Clean the transcript in real-time
      if (cleanerRef.current && currentRaw.trim()) {
        const cleaned = cleanerRef.current.cleanTranscription(currentRaw);
        setTranscript(cleaned);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      let errorMessage = 'Voice recognition error occurred.';

      switch (event.error) {
        case 'network':
          errorMessage = 'Network error - check your internet connection.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          setIsSupported(false);
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.';
          break;
        default:
          errorMessage = `Voice recognition error: ${event.error}`;
      }

      setError(errorMessage);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      setIsRecording(false);
    };

    return recognition;
  }, [isSupported]);

  // Start recording function
  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    try {
      // Reset transcript state
      setTranscript('');
      setRawTranscript('');
      setError('');
      finalTranscriptRef.current = '';

      // Initialize recognition
      const recognition = initializeRecognition();
      if (!recognition) {
        throw new Error('Failed to initialize speech recognition');
      }

      recognitionRef.current = recognition;

      // CRITICAL: start() is synchronous - do NOT use await!
      recognition.start();
      console.log('🚀 Starting voice recognition...');

    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start voice recording. Please try again.');
      setIsRecording(false);
    }
  }, [isSupported, initializeRecognition]);

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      try {
        // CRITICAL: stop() is synchronous - do NOT use await!
        recognitionRef.current.stop();
        console.log('🛑 Stopping voice recognition...');
      } catch (error) {
        console.error('Failed to stop recording:', error);
        setError('Failed to stop recording properly.');
      }
    }

    // Clean up
    recognitionRef.current = null;
    setIsRecording(false);
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  // Manual transcript update (for user edits)
  const updateTranscript = useCallback((newTranscript) => {
    setTranscript(newTranscript);
  }, []);

  // Get cleaned version of any text
  const cleanText = useCallback((text) => {
    if (cleanerRef.current) {
      return cleanerRef.current.cleanTranscription(text);
    }
    return text;
  }, []);

  return {
    // Current state
    transcript,         // Cleaned transcript
    rawTranscript,      // Original raw transcript
    isRecording,        // Is currently recording
    isSupported,        // Is voice recognition supported
    error,              // Any error messages

    // Control functions
    startRecording,     // Start voice recording
    stopRecording,      // Stop voice recording
    updateTranscript,   // Manually update transcript
    cleanText,          // Clean any text manually

    // Utility
    cleaner: cleanerRef.current  // Access to cleaner instance
  };
};

export default useVoiceWithCleaning;