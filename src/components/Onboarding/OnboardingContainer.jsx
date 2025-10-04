import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust path as needed
import OnboardingQuestion from './OnboardingQuestion';
import OnboardingProgress from './OnboardingProgress';
import VoiceSelection from './VoiceSelection';
import { ONBOARDING_QUESTIONS, OPENING_FRAME, CLOSING_FRAME, MID_POINT_CHECK } from './QuestionData';
import './onboarding.css';

const OnboardingContainer = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('opening'); // 'opening' | 'questions' | 'midpoint' | 'voice-selection' | 'refined-voice-selection' | 'closing'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [detectedPriority, setDetectedPriority] = useState(null);

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

  // Load saved responses from localStorage on mount
  useEffect(() => {
    const savedResponses = localStorage.getItem('onboarding_responses');
    const savedStep = localStorage.getItem('onboarding_step');
    const savedQuestionIndex = localStorage.getItem('onboarding_question_index');
    const savedVoice = localStorage.getItem('onboarding_selected_voice');
    const savedPriority = localStorage.getItem('onboarding_detected_priority');

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
  }, []);

  // Save responses to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem('onboarding_responses', JSON.stringify(responses));
    }
  }, [responses]);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboarding_step', currentStep);
  }, [currentStep]);

  // Save question index to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboarding_question_index', currentQuestionIndex.toString());
  }, [currentQuestionIndex]);

  // Save selected voice to localStorage whenever it changes
  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('onboarding_selected_voice', selectedVoice);
    }
  }, [selectedVoice]);

  // Save detected priority to localStorage whenever it changes
  useEffect(() => {
    if (detectedPriority) {
      localStorage.setItem('onboarding_detected_priority', JSON.stringify(detectedPriority));
    }
  }, [detectedPriority]);

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
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const handleNext = () => {
    const nextIndex = currentQuestionIndex + 1;

    // After Q5, show voice selection
    if (nextIndex === 5) {
      // Detect priority from Q1-Q5 responses
      const priority = detectPriorityFromResponses(responses);
      setDetectedPriority(priority);
      setCurrentStep('voice-selection');
      return;
    }

    // Check if we finished all questions (Q10)
    if (nextIndex >= ONBOARDING_QUESTIONS.length) {
      // Show refined voice selection with complete Q1-Q10 data
      setCurrentStep('refined-voice-selection');
      return;
    }

    setCurrentQuestionIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleMidPointChoice = (choice) => {
    if (choice === 'continue') {
      setCurrentStep('questions');
      setCurrentQuestionIndex(5); // Continue with Q6
    } else {
      // Skip to final question
      setCurrentQuestionIndex(9); // Q10
      setCurrentStep('questions');
    }
  };

  const handleVoiceSelected = (voice, flowChoice) => {
    setSelectedVoice(voice);

    if (flowChoice === 'continue') {
      // Continue with remaining questions (Q6-Q10)
      setCurrentStep('questions');
      setCurrentQuestionIndex(5);
    } else if (flowChoice === 'journal-now') {
      // Start journaling immediately - submit onboarding
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
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
          selected_voice: selectedVoice
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit onboarding');
      }

      const data = await response.json();
      console.log('Onboarding submitted successfully:', data);

      // Clear localStorage after successful submission
      localStorage.removeItem('onboarding_responses');
      localStorage.removeItem('onboarding_step');
      localStorage.removeItem('onboarding_question_index');
      localStorage.removeItem('onboarding_selected_voice');
      localStorage.removeItem('onboarding_detected_priority');

      setCurrentStep('closing');
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setError(`Failed to save onboarding profile: ${err.message}. Please try again.`);
      // Keep user on the onboarding flow when submission fails
      // Don't change currentStep - they stay on the current question
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    // Clear any remaining localStorage data when user completes onboarding
    localStorage.removeItem('onboarding_responses');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_question_index');
    localStorage.removeItem('onboarding_selected_voice');
    localStorage.removeItem('onboarding_detected_priority');

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

  // Render mid-point check
  if (currentStep === 'midpoint') {
    return (
      <div className="onboarding-container">
        <div className="onboarding-frame midpoint">
          <p>{MID_POINT_CHECK.message}</p>
          <div className="midpoint-buttons">
            <button
              className="onboarding-button secondary"
              onClick={() => handleMidPointChoice('continue')}
            >
              {MID_POINT_CHECK.continueButton}
            </button>
            <button
              className="onboarding-button primary"
              onClick={() => handleMidPointChoice('skip')}
            >
              {MID_POINT_CHECK.skipButton}
            </button>
          </div>
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
        />
      </div>
    );
  }

  // Render refined voice selection (after Q6-Q10)
  if (currentStep === 'refined-voice-selection') {
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

  // Render questions
  const currentQuestion = ONBOARDING_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ONBOARDING_QUESTIONS.length - 1;
  const currentResponse = responses[currentQuestion.id];

  return (
    <div className="onboarding-container">
      <OnboardingProgress
        current={currentQuestionIndex + 1}
        total={ONBOARDING_QUESTIONS.length}
      />

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
          {currentQuestionIndex > 0 && (
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
        </div>
      </div>
    </div>
  );
};

export default OnboardingContainer;