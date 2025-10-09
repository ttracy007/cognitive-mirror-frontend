import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust path as needed
import OnboardingQuestion from './OnboardingQuestion';
import OnboardingProgress from './OnboardingProgress';
import VoiceSelection from './VoiceSelection';
import { getQuestionsForTier, getQuestionsForTierStatic, generateOnboardingQuestions, OPENING_FRAME, CLOSING_FRAME } from './QuestionData';
import { detectPatterns } from '../../data/tier1QuestionBucket';
import { generateTier2Questions } from '../../data/tier2QuestionBucket';
import { detectGoldenKey, shouldTriggerFollowUp, analyzeResponse } from '../../utils/goldenKeyDetection';
import './onboarding.css';

const OnboardingContainer = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('opening'); // 'opening' | 'questions' | 'voice-selection' | 'closing'
  const [currentTier, setCurrentTier] = useState(1); // 1, 2, or 3
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [detectedPriority, setDetectedPriority] = useState(null);
  const [currentTierQuestions, setCurrentTierQuestions] = useState([]);
  const [detectedPatterns, setDetectedPatterns] = useState(null);
  const [goldenKeys, setGoldenKeys] = useState([]);
  const [tier1Responses, setTier1Responses] = useState({});

  useEffect(() => {
    // Get user_id from Supabase auth
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('No authenticated user found:', error);
        setError('Please log in to continue');
        return;
      }
      setUserId(user.id);
    };
    getUser();
  }, []);

  // Load questions when tier changes
  useEffect(() => {
    if (currentTier === 1 && userId) {
      // Fetch Tier 1 questions from backend
      fetchTier1Questions();
    } else if (currentTier === 2) {
      // Use adaptive Tier 2 questions if we have Tier 1 responses
      if (tier1Responses && Object.keys(tier1Responses).length > 0) {
        const patterns = detectPatterns(tier1Responses);
        setDetectedPatterns(patterns);
        const adaptiveQuestions = generateTier2Questions(tier1Responses, patterns);
        setCurrentTierQuestions(adaptiveQuestions);
        console.log('Generated adaptive Tier 2 questions:', adaptiveQuestions);
        console.log('Detected patterns:', patterns);
      } else {
        // Fallback to static questions if no Tier 1 responses
        const questions = getQuestionsForTierStatic(2);
        setCurrentTierQuestions(questions);
      }
    } else {
      // Tier 3 and others use static questions
      const questions = getQuestionsForTierStatic(currentTier);
      setCurrentTierQuestions(questions);
    }
  }, [currentTier, tier1Responses, userId]);

  // Load saved responses from localStorage on mount (only after userId is set)
  useEffect(() => {
    if (!userId) return; // Wait for userId to be set

    // Check if stored data belongs to current user
    const storedUserId = localStorage.getItem('onboarding_user_id');

    // If different user or no stored user, clear old data
    if (storedUserId !== userId) {
      console.log('Different user detected, clearing onboarding data');
      clearOnboardingData();
      localStorage.setItem('onboarding_user_id', userId);
      return;
    }

    // Load saved data for current user
    const savedResponses = localStorage.getItem(`onboarding_responses_${userId}`);
    const savedStep = localStorage.getItem(`onboarding_step_${userId}`);
    const savedQuestionIndex = localStorage.getItem(`onboarding_question_index_${userId}`);
    const savedVoice = localStorage.getItem(`onboarding_selected_voice_${userId}`);
    const savedPriority = localStorage.getItem(`onboarding_detected_priority_${userId}`);
    const savedPatterns = localStorage.getItem(`onboarding_detected_patterns_${userId}`);
    const savedGoldenKeys = localStorage.getItem(`onboarding_golden_keys_${userId}`);
    const savedTier1Responses = localStorage.getItem(`onboarding_tier1_responses_${userId}`);

    if (savedResponses) {
      try {
        setResponses(JSON.parse(savedResponses));
      } catch (e) {
        console.warn('Failed to parse saved responses:', e);
      }
    }

    if (savedStep) {
      setCurrentStep(savedStep);
    }

    if (savedQuestionIndex) {
      setCurrentQuestionIndex(parseInt(savedQuestionIndex, 10));
    }

    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }

    if (savedPriority) {
      try {
        setDetectedPriority(JSON.parse(savedPriority));
      } catch (e) {
        console.warn('Failed to parse saved priority:', e);
      }
    }

    if (savedPatterns) {
      try {
        setDetectedPatterns(JSON.parse(savedPatterns));
      } catch (e) {
        console.warn('Failed to parse saved patterns:', e);
      }
    }

    if (savedGoldenKeys) {
      try {
        setGoldenKeys(JSON.parse(savedGoldenKeys));
      } catch (e) {
        console.warn('Failed to parse saved golden keys:', e);
      }
    }

    if (savedTier1Responses) {
      try {
        setTier1Responses(JSON.parse(savedTier1Responses));
      } catch (e) {
        console.warn('Failed to parse saved tier1 responses:', e);
      }
    }
  }, [userId]);

  // Save responses to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (userId && Object.keys(responses).length > 0) {
      localStorage.setItem(`onboarding_responses_${userId}`, JSON.stringify(responses));
    }
  }, [responses, userId]);

  // Save current step to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`onboarding_step_${userId}`, currentStep);
    }
  }, [currentStep, userId]);

  // Save question index to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`onboarding_question_index_${userId}`, currentQuestionIndex.toString());
    }
  }, [currentQuestionIndex, userId]);

  // Save selected voice to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (userId && selectedVoice) {
      localStorage.setItem(`onboarding_selected_voice_${userId}`, selectedVoice);
    }
  }, [selectedVoice, userId]);

  // Save detected priority to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (userId && detectedPriority) {
      localStorage.setItem(`onboarding_detected_priority_${userId}`, JSON.stringify(detectedPriority));
    }
  }, [detectedPriority, userId]);

  // Save detected patterns to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (userId && detectedPatterns) {
      localStorage.setItem(`onboarding_detected_patterns_${userId}`, JSON.stringify(detectedPatterns));
    }
  }, [detectedPatterns, userId]);

  // Save golden keys to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (userId && goldenKeys.length > 0) {
      localStorage.setItem(`onboarding_golden_keys_${userId}`, JSON.stringify(goldenKeys));
    }
  }, [goldenKeys, userId]);

  // Save tier1 responses separately to localStorage (user-specific)
  useEffect(() => {
    if (userId && Object.keys(tier1Responses).length > 0) {
      localStorage.setItem(`onboarding_tier1_responses_${userId}`, JSON.stringify(tier1Responses));
    }
  }, [tier1Responses, userId]);

  // Fetch Tier 1 questions from backend
  const fetchTier1Questions = async () => {
    try {
      setError(null);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(
        `${backendUrl}/api/onboarding/v1/tier1/questions/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.questions) {
        setCurrentTierQuestions(data.questions);
        console.log('[Tier 1] Loaded questions from backend:', data.questions.length, 'questions');
      } else {
        throw new Error(data.error || 'Failed to load questions');
      }
    } catch (error) {
      console.error('[Tier 1] Failed to fetch questions:', error);
      setError(`Failed to load questions: ${error.message}`);

      // Fallback to static questions
      console.log('[Tier 1] Falling back to static questions');
      const questions = getQuestionsForTierStatic(1);
      setCurrentTierQuestions(questions);
    }
  };

  // Clear all onboarding data from localStorage
  const clearOnboardingData = () => {
    // Clear old non-user-specific keys
    localStorage.removeItem('onboarding_responses');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_question_index');
    localStorage.removeItem('onboarding_selected_voice');
    localStorage.removeItem('onboarding_detected_priority');

    // Clear current user-specific keys if userId exists
    if (userId) {
      localStorage.removeItem(`onboarding_responses_${userId}`);
      localStorage.removeItem(`onboarding_step_${userId}`);
      localStorage.removeItem(`onboarding_question_index_${userId}`);
      localStorage.removeItem(`onboarding_selected_voice_${userId}`);
      localStorage.removeItem(`onboarding_detected_priority_${userId}`);
      localStorage.removeItem(`onboarding_detected_patterns_${userId}`);
      localStorage.removeItem(`onboarding_golden_keys_${userId}`);
      localStorage.removeItem(`onboarding_tier1_responses_${userId}`);
    }

    // Reset component state
    setResponses({});
    setCurrentStep('opening');
    setCurrentTier(1);
    setCurrentQuestionIndex(0);
    setSelectedVoice(null);
    setDetectedPriority(null);
    setDetectedPatterns(null);
    setGoldenKeys([]);
    setTier1Responses({});
  };

  // Reset onboarding for testing (dev mode only)
  const handleResetForTesting = () => {
    if (window.confirm('Reset onboarding progress? This will clear all answers.')) {
      clearOnboardingData();
    }
  };

  // Detect priority from Q1-Q5 responses
  const detectPriorityFromResponses = (responses) => {
    // Simplified inline detection - use same logic as backend
    const keywords = {
      self_criticism: ['failing', 'not good enough', 'disappointing', 'hard on myself'],
      overwhelm: ['overwhelmed', 'too much', 'can\'t focus', 'stressed'],
      relationships: ['ex', 'partner', 'family', 'relationship'],
      purpose_meaning: ['meaning', 'purpose', 'direction', 'lost'],
      isolation: ['alone', 'isolated', 'solo', 'no one']
    };

    const responseText = JSON.stringify(responses).toLowerCase();
    let highestMatch = { priority: 'general_wellness', count: 0 };

    for (const [priority, words] of Object.entries(keywords)) {
      const matchCount = words.filter(word => responseText.includes(word)).length;
      if (matchCount > highestMatch.count) {
        highestMatch = { priority, count: matchCount };
      }
    }

    const contexts = {
      self_criticism: 'struggling with self-criticism and feelings of inadequacy',
      overwhelm: 'feeling overwhelmed and struggling to manage demands',
      relationships: 'navigating complicated relationship dynamics',
      purpose_meaning: 'dealing with uncertainty about direction and purpose',
      isolation: 'feeling isolated and lacking support',
      general_wellness: 'exploring general mental wellness'
    };

    return {
      priority: highestMatch.priority,
      context: contexts[highestMatch.priority]
    };
  };

  const handleStartOnboarding = () => {
    setCurrentStep('questions');
  };

  const handleQuestionResponse = (questionId, response) => {
    // Update all responses
    setResponses(prev => {
      const newResponses = {
        ...prev,
        [questionId]: response
      };

      // If this is a Tier 1 question, update tier1Responses separately
      if (currentTier === 1) {
        setTier1Responses(newResponses);
      }

      return newResponses;
    });

    // Detect golden keys and analyze response quality
    if (response && typeof response === 'string' && response.trim().length > 0) {
      const analysis = analyzeResponse(questionId, response);

      if (analysis.isGoldenKey) {
        console.log('Golden key detected for question:', questionId);
        setGoldenKeys(prev => [...prev, {
          questionId,
          response,
          analysis,
          tier: currentTier
        }]);
      }

      // Check for follow-up triggers
      const currentQuestion = currentTierQuestions[currentQuestionIndex];
      if (currentQuestion?.followUp?.trigger) {
        const shouldFollow = shouldTriggerFollowUp(response, currentQuestion.followUp.trigger);
        if (shouldFollow) {
          console.log('Follow-up triggered for question:', questionId);
          // TODO: Implement follow-up question display logic
        }
      }
    }
  };

  const handleNext = () => {
    const nextIndex = currentQuestionIndex + 1;

    // Check if we finished current tier questions
    if (nextIndex >= currentTierQuestions.length) {
      // Submit current tier and move to next tier or finish
      if (currentTier === 1) {
        // Submit tier 1 - this will advance to tier 2
        submitTier1();
      } else if (currentTier === 2) {
        // Submit tier 2 - this will advance to tier 3
        submitTier2();
      } else if (currentTier === 3) {
        // Submit tier 3 - this will generate voice previews and move to voice selection
        submitTier3();
      }
      return;
    }

    setCurrentQuestionIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentTier > 1) {
      // Go back to previous tier's last question
      const prevTier = currentTier - 1;
      setCurrentTier(prevTier);
      const prevTierQuestions = getQuestionsForTierStatic(prevTier);
      setCurrentQuestionIndex(prevTierQuestions.length - 1);
    }
  };


  const handleVoiceSelected = (voice, flowChoice, voicePreview = null, inlineResponse = null) => {
    setSelectedVoice(voice);

    if (flowChoice === 'journal-now') {
      // Start journaling immediately with the selected voice and preview
      handleSubmitAndStartJournal(voice, voicePreview, inlineResponse);
    }
  };

  const handleSubmitAndStartJournal = async (voice, voicePreview, inlineResponse = null) => {
    try {
      setIsSubmitting(true);

      // First submit the onboarding data
      await handleSubmit();

      // Then transition to journal with the selected voice and preview
      onComplete({
        selectedVoice: voice,
        voicePreview: voicePreview,
        inlineResponse: inlineResponse,
        startJournalImmediately: true,
        responses: responses,
        detectedPriority: detectedPriority
      });

    } catch (error) {
      console.error('Error submitting onboarding and starting journal:', error);
      setError('Failed to save your responses. Please try again.');
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // DEPRECATED: LEGACY SINGLE SUBMISSION
  // ==========================================
  // REPLACED BY: 3-tier submission flow (submitTier1, submitTier2, submitTier3)
  // This function is kept for reference and potential rollback

  const handleSubmitLegacy = async () => {
    console.warn('[DEPRECATED] Using legacy single submission endpoint. This should not be called in 3-tier flow.');

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(`${backendUrl}/api/onboarding/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          responses: responses,
          selected_voice: selectedVoice,
          detected_patterns: detectedPatterns,
          golden_keys: goldenKeys,
          tier1_responses: tier1Responses
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit onboarding');
      }

      const data = await response.json();
      console.log('Onboarding submitted successfully (legacy):', data);

      // Clear localStorage after successful submission
      clearOnboardingData();

      setCurrentStep('closing');
    } catch (err) {
      console.error('Legacy onboarding submission error:', err);
      setError(`Failed to save onboarding profile: ${err.message}. Please try again.`);
      // Keep user on the onboarding flow when submission fails
      // Don't change currentStep - they stay on the current question
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Handle voice selection submission
  const handleSubmit = async () => {
    if (!selectedVoice) {
      setError('Please select a voice to continue');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(`${backendUrl}/api/onboarding/v1/voice-previews/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          selected_voice: selectedVoice
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save voice selection');
      }

      const data = await response.json();
      console.log('Voice selection saved successfully:', data);

      // Clear localStorage after successful submission
      clearOnboardingData();

      setCurrentStep('closing');
    } catch (err) {
      console.error('Voice selection error:', err);
      setError(`Failed to save voice selection: ${err.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // NEW 3-TIER SUBMISSION SYSTEM
  // ==========================================

  const submitTier1 = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(`${backendUrl}/api/onboarding/v1/tier1/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          responses: tier1Responses,
          detected_patterns: detectedPatterns,
          skipped_at: null, // TODO: Add tier1SkippedAt state if needed
          completion_time: Date.now() // TODO: Add proper tier1CompletionTime tracking
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Tier 1] Submitted successfully', data);

        // Backend returns adaptive guidance for tier2
        if (data.adaptive_guidance) {
          // TODO: Use adaptive guidance to customize tier2 questions
          console.log('[Tier 1] Received adaptive guidance:', data.adaptive_guidance);
        }

        // Proceed to tier2
        setCurrentTier(2);
        setCurrentQuestionIndex(0);
      } else {
        console.error('[Tier 1] Submission failed:', data);
        setError(`Tier 1 submission failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Tier 1] Network error:', error);
      setError(`Tier 1 network error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTier2 = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';

      // Extract tier2 responses from main responses object
      const tier2Responses = Object.keys(responses)
        .filter(key => key.startsWith('tier2_') || (parseInt(key) >= 8 && parseInt(key) <= 20)) // Adjust range as needed
        .reduce((obj, key) => {
          obj[key] = responses[key];
          return obj;
        }, {});

      const response = await fetch(`${backendUrl}/api/onboarding/v1/tier2/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          responses: tier2Responses  // Backend will detect golden keys automatically
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Tier 2] Submitted successfully', data);
        console.log('[Tier 2] Golden keys detected:', data.golden_keys_detected);

        // Store golden keys info if needed
        if (data.golden_keys) {
          setGoldenKeys(data.golden_keys);
        }

        // Proceed to tier3
        setCurrentTier(3);
        setCurrentQuestionIndex(0);
      } else {
        console.error('[Tier 2] Submission failed:', data);
        setError(`Tier 2 submission failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Tier 2] Network error:', error);
      setError(`Tier 2 network error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTier3 = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';

      // Extract tier3 responses from main responses object
      const tier3Responses = Object.keys(responses)
        .filter(key => key.startsWith('tier3_') || parseInt(key) >= 21) // Adjust range as needed
        .reduce((obj, key) => {
          obj[key] = responses[key];
          return obj;
        }, {});

      const response = await fetch(`${backendUrl}/api/onboarding/v1/tier3/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          responses: tier3Responses  // Should include q27_stated_priority
        })
      });

      const data = await response.json();

      if (data.success && data.onboarding_complete) {
        console.log('[Tier 3] Onboarding complete', data);

        // Proceed to voice preview generation
        await generateVoicePreviews();
      } else {
        console.error('[Tier 3] Submission failed:', data);
        setError(`Tier 3 submission failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Tier 3] Network error:', error);
      setError(`Tier 3 network error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateVoicePreviews = async () => {
    try {
      setIsSubmitting(true); // Reuse existing loading state
      setError(null);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(`${backendUrl}/api/onboarding/v1/voice-previews/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Voice Previews] Generated successfully', data);

        // Store voice previews for display
        // TODO: Add setVoicePreviews state if not already present
        if (data.previews) {
          console.log('[Voice Previews] Available voices:', Object.keys(data.previews));
        }

        setCurrentStep('voice-selection');
      } else {
        console.error('[Voice Previews] Generation failed:', data);
        setError(`Voice preview generation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Voice Previews] Network error:', error);
      setError(`Voice preview network error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // END NEW 3-TIER SUBMISSION SYSTEM
  // ==========================================

  const handleComplete = () => {
    // Clear any remaining localStorage data when user completes onboarding
    clearOnboardingData();

    // Call the parent callback to return to main app
    if (onComplete) {
      onComplete();
    }
  };

  // Render opening frame
  if (currentStep === 'opening') {
    return (
      <div className="onboarding-container">
        <div className="onboarding-frame">
          <h1>{OPENING_FRAME.title}</h1>
          <p>{OPENING_FRAME.message}</p>
          <button
            className="onboarding-button primary"
            onClick={handleStartOnboarding}
          >
            Let's Go
          </button>
        </div>
      </div>
    );
  }


  // Render voice selection
  if (currentStep === 'voice-selection') {
    return (
      <div className="onboarding-container">
        <VoiceSelection
          userContext={detectedPriority?.context}
          responses={responses}
          detectedPriority={detectedPriority}
          onVoiceSelected={handleVoiceSelected}
          isRefined={true}
        />
      </div>
    );
  }


  // Render closing frame
  if (currentStep === 'closing') {
    return (
      <div className="onboarding-container">
        <div className="onboarding-frame">
          <h1>{CLOSING_FRAME.title}</h1>
          <p>{CLOSING_FRAME.message}</p>
          <button
            className="onboarding-button primary"
            onClick={handleComplete}
          >
            Start Journaling
          </button>
        </div>
      </div>
    );
  }

  // Don't render if questions haven't loaded yet
  if (currentTierQuestions.length === 0) {
    return <div className="onboarding-container">Loading...</div>;
  }

  // Render questions
  const currentQuestion = currentTierQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentTierQuestions.length - 1 && currentTier === 3;
  const currentResponse = responses[currentQuestion.id];

  // Calculate total progress across all tiers
  const tier1Count = getQuestionsForTierStatic(1).length;
  const tier2Count = getQuestionsForTierStatic(2).length;
  const tier3Count = getQuestionsForTierStatic(3).length;
  const totalQuestions = tier1Count + tier2Count + tier3Count;

  let completedQuestions = 0;
  if (currentTier === 1) {
    completedQuestions = currentQuestionIndex + 1;
  } else if (currentTier === 2) {
    completedQuestions = tier1Count + currentQuestionIndex + 1;
  } else if (currentTier === 3) {
    completedQuestions = tier1Count + tier2Count + currentQuestionIndex + 1;
  }

  return (
    <div className="onboarding-container">
      <OnboardingProgress
        current={Math.min(completedQuestions, totalQuestions)}
        total={totalQuestions}
      />

      <div className="tier-indicator">
        <p>Tier {currentTier} of 3</p>
      </div>

      <div className="onboarding-content">
        <OnboardingQuestion
          question={currentQuestion}
          response={currentResponse}
          onResponseChange={(response) => handleQuestionResponse(currentQuestion.id, response)}
        />

        {error && (
          <div className="onboarding-error">
            {error}
            {error.includes('Failed to save onboarding profile') && (
              <button
                className="onboarding-button secondary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ marginTop: '10px', display: 'block' }}
              >
                {isSubmitting ? 'Retrying...' : 'Retry Submission'}
              </button>
            )}
          </div>
        )}

        <div className="onboarding-navigation">
          {(currentQuestionIndex > 0 || currentTier > 1) && (
            <button
              className="onboarding-button secondary"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              Back
            </button>
          )}

          <button
            className="onboarding-button primary"
            onClick={handleNext}
            disabled={isSubmitting || (currentQuestion.required && !currentResponse)}
          >
            {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Finish' : 'Next'}
          </button>

          {/* Dev mode reset button */}
          {process.env.NODE_ENV === 'development' && (
            <button
              className="onboarding-button reset"
              onClick={handleResetForTesting}
              title="Reset onboarding (dev only)"
            >
              🔄 Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingContainer;