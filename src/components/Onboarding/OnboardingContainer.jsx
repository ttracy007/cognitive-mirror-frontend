import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust path as needed
import OnboardingQuestion from './OnboardingQuestion';
import Tier2Container from './Tier2/Tier2Container';
import OnboardingProgress from './OnboardingProgress';
import VoiceSelection from './VoiceSelection';
import VoiceSelectionFlow from './VoiceSelectionFlow';
import PriorityConfirmation from './PriorityConfirmation';
import { getQuestionsForTier, OPENING_FRAME, CLOSING_FRAME } from './QuestionData';
import { detectPatterns } from '../../data/tier1QuestionBucket';
import { generateTier2Questions } from '../../data/tier2QuestionBucket';
import { detectGoldenKey, shouldTriggerFollowUp, analyzeResponse } from '../../utils/goldenKeyDetection';
import './onboarding.css';

const OnboardingContainer = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('opening'); // 'opening' | 'questions' | 'tier3-priority' | 'tier3-advice-style' | 'voice-selection' | 'closing'
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
  const [voicePreviews, setVoicePreviews] = useState(null);
  const [adviceStyle, setAdviceStyle] = useState(null);
  const [tier3Questions, setTier3Questions] = useState(null);
  const [synthesizedPriority, setSynthesizedPriority] = useState(null);
  const [tier3Responses, setTier3Responses] = useState({});
  const [loadingTier3, setLoadingTier3] = useState(false);

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
    if (currentTier && userId) {
      // Fetch questions from backend for all tiers
      fetchQuestionsForCurrentTier();
    }
  }, [currentTier, userId]);

  // Fetch questions for current tier from backend
  const fetchQuestionsForCurrentTier = async () => {
    try {
      setError(null);
      const questions = await getQuestionsForTier(currentTier, userId);
      setCurrentTierQuestions(questions);
      console.log(`[Tier ${currentTier}] Loaded questions from backend:`, questions.length, 'questions');
    } catch (error) {
      console.error(`[Tier ${currentTier}] Failed to fetch questions:`, error);
      setError(`Failed to load Tier ${currentTier} questions: ${error.message}`);
    }
  };

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

  // Fetch Tier 3 questions when currentTier === 3
  useEffect(() => {
    if (currentTier === 3 && userId) {
      setLoadingTier3(true);
      setError(null);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      console.log('[Tier 3] Fetching questions for userId:', userId);
      console.log('[Tier 3] Request URL:', `${backendUrl}/api/onboarding/v1/tier3/questions/${userId}`);

      fetch(`${backendUrl}/api/onboarding/v1/tier3/questions/${userId}`)
        .then(res => {
          console.log('[Tier 3] Response status:', res.status);
          console.log('[Tier 3] Response headers:', Object.fromEntries(res.headers.entries()));
          return res.json();
        })
        .then(data => {
          console.log('[Tier 3] Full response data:', data);
          console.log('[Tier 3] Questions array:', data.questions);
          console.log('[Tier 3] First question:', data.questions?.[0]);

          if (data.success && data.questions) {
            setTier3Questions(data.questions);

            // Extract synthesized priority from first question
            const priorityQuestion = data.questions.find(q => q.id === 'priority_confirmation');
            console.log('[Tier 3] Priority question found:', priorityQuestion);
            console.log('[Tier 3] Synthesized statement:', priorityQuestion?.synthesized_statement);
            console.log('[Tier 3] DEBUGGING: All question IDs:', data.questions.map(q => q.id));

            if (priorityQuestion?.synthesized_statement) {
              setSynthesizedPriority({
                statement: priorityQuestion.synthesized_statement,
                confidence: priorityQuestion.synthesis_confidence
              });
              console.log('[Tier 3] Priority synthesis set successfully');
            } else {
              console.warn('[Tier 3] No synthesized statement found in priority question');
            }
            console.log('[Tier 3] Loaded questions from backend:', data.questions.length, 'questions');
          } else {
            console.error('[Tier 3] Invalid response structure:', data);
            console.error('[Tier 3] Failed to load questions:', data.error);
            setError(`Failed to load Tier 3 questions: ${data.error || 'Unknown error'}`);
          }
          setLoadingTier3(false);
        })
        .catch(err => {
          console.error('[Tier 3] Fetch error:', err);
          console.error('[Tier 3] Network error loading questions:', err);
          setError(`Failed to load Tier 3 questions: ${err.message}`);
          setLoadingTier3(false);
        });
    }
  }, [currentTier, userId]);


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

  const handleTier3Response = (field, value) => {
    setTier3Responses(prev => ({
      ...prev,
      [field]: value
    }));
    console.log(`[Tier 3] Response updated: ${field} = ${value}`);

    // Auto-advance to advice style stage after priority is confirmed or overridden
    if (field === 'priority_confirmation' && value === 'confirmed') {
      setTimeout(() => setCurrentStep('tier3-advice-style'), 500);
    } else if (field === 'priority_override_text' && value.trim().length > 10) {
      setTimeout(() => setCurrentStep('tier3-advice-style'), 500);
    }
  };

  const handleNext = () => {
    const nextIndex = currentQuestionIndex + 1;

    // Check if we finished current tier questions
    if (nextIndex >= (currentTierQuestions?.length || 0)) {
      // Submit current tier and move to next tier or finish
      if (currentTier === 1) {
        // Submit tier 1 - this will advance to tier 2
        submitTier1();
      } else if (currentTier === 2) {
        // Tier 2 is handled by Tier2Container - should not reach here
        console.warn('[OnboardingContainer] Tier 2 completion should be handled by Tier2Container');
        return;
      } else if (currentTier === 3) {
        // Submit tier 3 - this will generate voice previews and move to voice selection
        submitTier3();
      }
      return;
    }

    setCurrentQuestionIndex(nextIndex);
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));  // ✅ Go back one question, never below 0
  };


  const handleVoiceSelected = (voice, flowChoice, voicePreview = null, inlineResponse = null) => {
    setSelectedVoice(voice);

    if (flowChoice === 'journal-now') {
      // Start journaling immediately with the selected voice and preview
      handleSubmitAndStartJournal(voice, voicePreview, inlineResponse);
    }
  };

  // New handler for progressive voice selection flow
  const handleVoiceConfirmed = async (voiceType, voicePreview) => {
    try {
      setSelectedVoice(voiceType);
      setIsSubmitting(true);

      console.log(`[Voice Confirmed] User selected: ${voiceType}`);
      console.log(`[Voice Confirmed] Preview content:`, voicePreview);

      // Save voice selection (placeholder for now)
      // TODO: Implement actual backend save if needed

      // Start journaling with the confirmed voice and preview
      onComplete({
        selectedVoice: voiceType,
        voicePreview: voicePreview,
        startJournalImmediately: true,
        responses: responses,
        detectedPriority: detectedPriority,
        adviceStyle: adviceStyle
      });

    } catch (error) {
      console.error('Error confirming voice selection:', error);
      setError('Failed to save your voice selection. Please try again.');
      setIsSubmitting(false);
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

      // Extract voice preview text with proper fallback handling
      const voicePreviewText = voicePreviews?.[selectedVoice]?.text ||
                              voicePreviews?.[selectedVoice] ||
                              '';

      // Validate we have content to send
      if (!voicePreviewText || voicePreviewText.trim().length === 0) {
        throw new Error('No voice preview text available. Please regenerate voice previews.');
      }

      console.log('[Voice Selection] Submitting:', {
        userId,
        selectedVoice,
        textLength: voicePreviewText.length,
        hasAllPreviews: !!voicePreviews
      });

      const response = await fetch(`${backendUrl}/api/onboarding/v1/voice-previews/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          selected_voice: selectedVoice,
          voice_preview_text: voicePreviewText,
          voice_previews: voicePreviews // Send all previews for storage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save voice selection');
      }

      const data = await response.json();
      console.log('✅ Voice selection response:', data);

      // Check if journal entry was created successfully
      if (data.warning) {
        console.warn('⚠️ Backend warning:', data.warning);
        console.warn('⚠️ Journal error details:', data.journal_error);

        // Show warning to user but allow them to continue
        setError(`Voice saved, but timeline entry may be missing: ${data.journal_error || 'Unknown error'}`);

        // Optional: You could add a "Continue Anyway" button here
        // For now, we'll just show the warning and proceed after 3 seconds
        setTimeout(() => {
          clearOnboardingData();
          setCurrentStep('closing');
        }, 3000);

        return; // Exit early to show the warning
      }

      // Verify journal was created
      if (!data.journal_created) {
        console.warn('⚠️ Journal entry was not created (no error but journal_created: false)');
        setError('Voice saved to profile, but timeline entry is missing. You may not see this in your journal history.');

        // Still proceed but show warning
        setTimeout(() => {
          clearOnboardingData();
          setCurrentStep('closing');
        }, 3000);

        return;
      }

      // SUCCESS: Both profile and journal entry created
      console.log('✅ Voice selection complete:', {
        voice: data.selected_voice,
        journalId: data.journal_entry_id,
        timestamp: data.stored_at
      });

      // Clear localStorage after successful submission
      clearOnboardingData();

      // Proceed to closing frame
      setCurrentStep('closing');

    } catch (err) {
      console.error('❌ Voice selection error:', err);
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
          userId: userId,
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
    console.warn('[DEPRECATED] OnboardingContainer.submitTier2() should not be called - Tier2Container handles its own submission');
    // This function is deprecated - Tier2Container now handles its own submission
    // and calls onComplete() when done, which advances to Tier 3
  };

  const submitTier3 = async () => {
    console.log('[Tier 3] Submitting:', tier3Responses);

    try {
      setIsSubmitting(true);
      setError(null);

      // Validate priority
      const hasPriorityConfirmation = tier3Responses.priority_confirmation === 'confirmed';
      const hasOverride = tier3Responses.priority_confirmation === 'override' && tier3Responses.priority_override_text;

      if (!hasPriorityConfirmation && !hasOverride) {
        setError('Please confirm the priority or provide your own');
        return;
      }

      // Validate advice style
      if (!tier3Responses.advice_style) {
        setError('Please select an advice style');
        return;
      }

      // Submit to backend
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(`${backendUrl}/api/onboarding/v1/tier3/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          responses: tier3Responses
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Tier 3] Submission successful');

        // Store advice style for voice selection flow
        setAdviceStyle(tier3Responses.advice_style);

        // Move to voice selection
        setCurrentStep('voice-selection');
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

        // Backend returns all three voices under data.previews, but we only use tony_d for single voice display
        const previews = {
          tony_d: data.previews?.tony_d
        };

        setVoicePreviews(previews);
        console.log('[Voice Previews] Available voices:', Object.keys(previews));
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
      onComplete({ userId });
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


  // Render Tier 3 priority confirmation
  if (currentStep === 'tier3-priority') {
    return (
      <div className="onboarding-container">
        <OnboardingProgress
          current={14}
          total={14}
        />

        <div className="tier-indicator">
          <p>Tier 3 of 3 - Priority Confirmation</p>
        </div>

        <div className="onboarding-content">
          {loadingTier3 ? (
            <div className="loading-state">
              <p>Loading your personalized questions...</p>
            </div>
          ) : synthesizedPriority ? (
            <div className="priority-confirmation">
              <h3>Priority Confirmation</h3>
              <p>Based on what you've shared, it sounds like you're most preoccupied with:</p>
              <div className="synthesized-statement" style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                margin: '15px 0',
                fontStyle: 'italic',
                border: '1px solid #ddd'
              }}>
                "{synthesizedPriority.statement}"
              </div>
              <p>Is this what's most occupying your thoughts right now?</p>

              <div className="radio-group" style={{ margin: '20px 0' }}>
                <label style={{ display: 'block', margin: '10px 0' }}>
                  <input
                    type="radio"
                    name="priority_confirmation"
                    value="confirmed"
                    checked={tier3Responses.priority_confirmation === 'confirmed'}
                    onChange={(e) => handleTier3Response('priority_confirmation', 'confirmed')}
                    style={{ marginRight: '10px' }}
                  />
                  Yes, that's it
                </label>

                <label style={{ display: 'block', margin: '10px 0' }}>
                  <input
                    type="radio"
                    name="priority_confirmation"
                    value="override"
                    checked={tier3Responses.priority_confirmation === 'override'}
                    onChange={(e) => handleTier3Response('priority_confirmation', 'override')}
                    style={{ marginRight: '10px' }}
                  />
                  No, it's something else:
                </label>
              </div>

              {tier3Responses.priority_confirmation === 'override' && (
                <textarea
                  placeholder="What's most on your mind right now?"
                  value={tier3Responses.priority_override_text || ''}
                  onChange={(e) => handleTier3Response('priority_override_text', e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    marginTop: '10px'
                  }}
                />
              )}
            </div>
          ) : (
            <div className="error-state">
              <p>Failed to load questions. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Tier 3 advice style selection
  if (currentStep === 'tier3-advice-style') {
    return (
      <div className="onboarding-container">
        <OnboardingProgress
          current={14}
          total={14}
        />

        <div className="tier-indicator">
          <p>Tier 3 of 3 - Advice Style</p>
        </div>

        <div className="onboarding-content">
          {tier3Questions && tier3Questions.find(q => q.id === 'advice_style') ? (
            <div className="advice-style">
              <h3>Advice Style Preference</h3>
              <p>When you're receiving advice, do you prefer:</p>
              <div className="radio-group" style={{ margin: '20px 0' }}>
                {tier3Questions && tier3Questions.find(q => q.id === 'advice_style')?.options?.map(option => (
                  <label key={option.value} style={{ display: 'block', margin: '10px 0' }}>
                    <input
                      type="radio"
                      name="advice_style"
                      value={option.value}
                      checked={tier3Responses.advice_style === option.value}
                      onChange={(e) => handleTier3Response('advice_style', option.value)}
                      style={{ marginRight: '10px' }}
                    />
                    {option.text}
                  </label>
                ))}
              </div>

              <div className="onboarding-navigation" style={{ marginTop: '30px' }}>
                <button
                  className="onboarding-button secondary"
                  onClick={() => setCurrentStep('tier3-priority')}
                >
                  Back
                </button>

                <button
                  className="onboarding-button primary"
                  onClick={submitTier3}
                  disabled={isSubmitting || !tier3Responses.advice_style}
                >
                  {isSubmitting ? 'Submitting...' : 'Continue to Voice Selection'}
                </button>
              </div>
            </div>
          ) : (
            <div className="error-state">
              <p>Loading advice style options...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render progressive voice selection
  if (currentStep === 'voice-selection') {
    return (
      <div className="onboarding-container">
        <VoiceSelectionFlow
          userId={userId}
          initialVoiceChoice={adviceStyle}
          responses={responses}
          onVoiceConfirmed={handleVoiceConfirmed}
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

  // Don't render if questions haven't loaded yet (except for Tier 2 which handles its own loading)
  if ((!currentTierQuestions || currentTierQuestions.length === 0) && currentTier !== 2) {
    return <div className="onboarding-container">Loading...</div>;
  }

  // Render questions
  const currentQuestion = currentTier === 2 ? null : currentTierQuestions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (currentTierQuestions?.length || 0) - 1 && currentTier === 3;
  const currentResponse = currentQuestion ? responses[currentQuestion.id] : null;

  // Calculate total progress across all tiers
  // Use estimated counts since we can't synchronously get backend counts
  const tier1Count = 7; // Framework questions
  const tier2Count = 4; // Golden Key Excavation domains
  const tier3Count = 3; // Estimated tier 3 questions
  const totalQuestions = tier1Count + tier2Count + tier3Count;

  let completedQuestions = 0;
  if (currentTier === 1) {
    completedQuestions = currentQuestionIndex + 1;
  } else if (currentTier === 2) {
    // Tier 2 progress is handled internally by Tier2Container
    completedQuestions = tier1Count + 2; // Show some progress for Tier 2
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
        {currentTier === 2 ? (
          <Tier2Container
            userId={userId}
            onComplete={(tier2GoldenKeys = []) => {
              // Tier 2 completed, move to Tier 3
              // Store the golden keys from Tier 2
              if (tier2GoldenKeys && tier2GoldenKeys.length > 0) {
                setGoldenKeys(prev => [...prev, ...tier2GoldenKeys]);
                console.log('[Onboarding] Tier 2 golden keys received:', tier2GoldenKeys.length);
              }
              setCurrentTier(3);
              setCurrentQuestionIndex(0);
              setCurrentStep('tier3-priority'); // Go to priority confirmation stage
              console.log('[Onboarding] Tier 2 completed, advancing to Tier 3 priority confirmation');
            }}
            onBack={() => {
              // Go back to Tier 1
              setCurrentTier(1);
              setCurrentQuestionIndex(tier1Questions.length - 1); // Go to last question of Tier 1
              console.log('[Onboarding] Going back from Tier 2 to Tier 1');
            }}
          />
        ) : (
          // Tier 1: Regular questions
          <OnboardingQuestion
            question={currentQuestion}
            response={currentResponse}
            onResponseChange={(response) => handleQuestionResponse(currentQuestion.id, response)}
          />
        )}

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

        {/* Only show OnboardingContainer navigation for Tier 1 and 3 - Tier 2 has its own navigation */}
        {currentTier !== 2 && (
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

            {/* Dev mode reset button - only show for Tier 1 and 3 */}
            {process.env.NODE_ENV === 'development' && (
              <button
                className="onboarding-button reset"
                onClick={handleResetForTesting}
                title="Reset onboarding (dev only)"
              >
                🔄 Reset
              </button>
            )}

            <button
              className="onboarding-button primary"
              onClick={currentTier === 3 ? submitTier3 : handleNext}
              disabled={
                isSubmitting ||
                (currentTier === 3 ? (
                  !tier3Responses.priority_confirmation ||
                  (tier3Responses.priority_confirmation === 'override' && !tier3Responses.priority_override_text) ||
                  !tier3Responses.advice_style
                ) : (currentQuestion?.required && !currentResponse))
              }
            >
              {isSubmitting ? 'Submitting...' :
               currentTier === 3 ? 'Continue to Voice Selection' :
               isLastQuestion ? 'Finish' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingContainer;