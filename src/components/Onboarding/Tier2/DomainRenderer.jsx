import React, { useState, useEffect, useCallback } from 'react';
import ScaleInput from './ScaleInput';
import GoldenKeyInput from './GoldenKeyInput';
import SingleChoiceInput from './SingleChoiceInput';

const DomainRenderer = ({ domain, domainKey, onComplete, onSkip, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [goldenKeyText, setGoldenKeyText] = useState('');
  const [navigationHistory, setNavigationHistory] = useState([0]); // Track actual navigation path

  const questions = domain?.questions || [];

  // Reset state when domain changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setGoldenKeyText('');
    setNavigationHistory([0]); // Reset navigation history to start with first question
  }, [domainKey]); // ✅ Only run when domain changes

  // Function to handle navigation logic
  const processQuestionLogic = useCallback((questionId, value) => {
    const currentQuestion = questions[currentQuestionIndex];

    // Check for skip logic on scale questions (only for single values, not arrays)
    if (currentQuestion?.logic && !Array.isArray(value)) {
      const scoreRange = Object.keys(currentQuestion.logic).find(range => {
        if (range.includes('-')) {
          const [min, max] = range.split('-').map(Number);
          return value >= min && value <= max;
        }
        return false;
      });

      if (scoreRange) {
        const action = currentQuestion.logic[scoreRange];

        if (action.startsWith('skip_to_')) {
          onSkip(domainKey, action);
          return;
        } else if (action.startsWith('continue_')) {
          // continue_q3a_alt, continue_q3b, etc. - find the target question
          const targetQuestionId = action.replace('continue_', '');

          // Find the question index by ID
          const targetIndex = questions.findIndex(q => {
            // Handle both direct ID match and partial suffix match
            return q.id === targetQuestionId || q.id.includes(targetQuestionId);
          });

          if (targetIndex !== -1) {
            setCurrentQuestionIndex(targetIndex);
            setNavigationHistory(prev => [...prev, targetIndex]); // Add to navigation history
            return;
          } else {
            // Fallback: advance to next question
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setNavigationHistory(prev => [...prev, nextIndex]); // Add to navigation history
            return;
          }
        }
      }
    }

    // Check for next action in single choice questions
    if (currentQuestion.type === 'single_choice') {
      const selectedOption = currentQuestion.options?.find(opt => opt.value === value);
      if (selectedOption?.next) {

        if (selectedOption.next.startsWith('skip_to_')) {
          onSkip(domainKey, selectedOption.next);
          return;
        } else if (selectedOption.next.startsWith('continue_')) {
          // continue_q3c, etc. - find the target question
          const targetQuestionId = selectedOption.next.replace('continue_', '');

          // Find the question index by ID
          const targetIndex = questions.findIndex(q => {
            // Handle both direct ID match and partial suffix match
            return q.id === targetQuestionId || q.id.includes(targetQuestionId);
          });

          if (targetIndex !== -1) {
            setCurrentQuestionIndex(targetIndex);
            setNavigationHistory(prev => [...prev, targetIndex]); // Add to navigation history
            return;
          } else {
            // Fallback: advance to next question
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setNavigationHistory(prev => [...prev, nextIndex]); // Add to navigation history
            return;
          }
        }
      }
    }

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setNavigationHistory(prev => [...prev, nextIndex]); // Add to navigation history
  }, [domainKey, questions, currentQuestionIndex, onSkip]);

  const handleAnswer = useCallback((questionId, value, additionalData = {}) => {
    // Simple state update without localStorage
    const newResponses = {
      ...responses,
      [questionId]: value,
      ...additionalData
    };
    setResponses(newResponses);

    // Auto-navigate immediately when answer is given (restored behavior)
    console.log(`[DomainRenderer] Answer recorded for ${questionId}:`, value, '- processing navigation logic');
    processQuestionLogic(questionId, value);
  }, [responses, processQuestionLogic]);

  // Early return if domain is undefined or null - AFTER all hooks
  if (!domain) {
    return (
      <div className="domain-renderer">
        <div className="error-message">
          <h3>Domain Loading Error</h3>
          <p>Unable to load domain data. This is usually due to a database schema issue.</p>
          <p>Domain Key: {domainKey}</p>
        </div>
      </div>
    );
  }

  // Helper function to resolve dynamic question text
  const resolveQuestionText = (question) => {
    if (!question.dynamic_question || !question.question_map) {
      return question.question;
    }

    // Look for the previous question's response to determine which text to use
    const previousQuestionId = question.id.replace('c_', 'b_'); // e.g., q2c_rumination_golden_key -> q2b_rumination_scenario
    const previousResponse = responses[previousQuestionId];

    if (previousResponse && question.question_map[previousResponse]) {
      return question.question_map[previousResponse];
    }

    return question.question; // fallback to default
  };

  // Helper function to resolve dynamic placeholder text
  const resolvePlaceholderText = (question) => {
    if (!question.dynamic_question || !question.placeholder_map) {
      return question.placeholder;
    }

    // Look for the previous question's response to determine which placeholder to use
    const previousQuestionId = question.id.replace('c_', 'b_'); // e.g., q2c_rumination_golden_key -> q2b_rumination_scenario
    const previousResponse = responses[previousQuestionId];

    if (previousResponse && question.placeholder_map[previousResponse]) {
      return question.placeholder_map[previousResponse];
    }

    return question.placeholder; // fallback to default
  };

  // Check if current question should be shown based on conditions
  const shouldShowQuestion = (question) => {
    if (!question) {
      return false;
    }

    if (!question.condition) {
      return true;
    }

    // Handle "in [...]" syntax (e.g., "q1b_sleep_difficulty in [wake_middle_night, both]")
    const inMatch = question.condition.match(/(\w+)\s+in\s+\[([^\]]+)\]/);
    if (inMatch) {
      const [, varName, valuesStr] = inMatch;
      const allowedValues = valuesStr.split(',').map(v => v.trim());
      const actualValue = responses[varName];

      return allowedValues.includes(actualValue);
    }

    // Handle comparison operators (==, <=, >=, <, >)
    const compMatch = question.condition.match(/(\w+)\s*(==|<=|>=|<|>)\s*(\w+)/);
    if (compMatch) {
      const [, leftVar, operator, rightValue] = compMatch;
      const leftValue = responses[leftVar];

      // If leftValue is undefined, condition fails
      if (leftValue === undefined || leftValue === null) {
        return false;
      }

      // Convert to numbers for numeric comparison
      const left = Number(leftValue);
      const right = Number(rightValue);

      let result;
      switch (operator) {
        case '==': result = left == right; break;
        case '<=': result = left <= right; break;
        case '>=': result = left >= right; break;
        case '<': result = left < right; break;
        case '>': result = left > right; break;
        default: result = true;
      }

      return result;
    }

    return true;
  };

  const findNextQuestionIndex = (startIndex) => {
    // DON'T loop through all questions - just check the immediate next one
    const nextIndex = startIndex;

    if (nextIndex >= questions.length) {
      return questions.length; // Domain complete
    }

    const nextQuestion = questions[nextIndex];

    if (shouldShowQuestion(nextQuestion)) {
      return nextIndex;
    } else {
      return findNextQuestionIndex(nextIndex + 1); // Recursively check next
    }
  };

  const handleGoldenKeySubmit = (text, wordCount) => {

    const goldenKey = {
      domain: domainKey.replace('domain', '').replace(/\d+_/, ''), // Extract domain name
      text,
      word_count: wordCount,
      timestamp: new Date().toISOString(),
      question_id: questions[currentQuestionIndex]?.id
    };

    const finalResponses = {
      ...responses,
      [questions[currentQuestionIndex].id]: text
    };


    onComplete(domainKey, finalResponses, goldenKey);
  };

  const handleDomainComplete = () => {

    // Domain complete without golden key
    onComplete(domainKey, responses, null);
  };

  // Method to get current response for the footer Next button
  const getCurrentResponse = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;
    return responses[currentQuestion.id] || null;
  };

  // Check if we have a response for the current question
  const hasCurrentResponse = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return false;
    const response = responses[currentQuestion.id];
    return response !== undefined && response !== null && response !== '';
  };

  // Method to handle footer Next button click
  const handleFooterNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentResponse = getCurrentResponse();

    if (currentResponse) {
      // Process question logic and navigation
      processQuestionLogic(currentQuestion.id, currentResponse);
    }
  };

  // Method to handle footer Back button click
  const handleBack = () => {
    if (navigationHistory.length > 1) {
      // Go back within current domain
      const newHistory = navigationHistory.slice(0, -1);
      const previousQuestionIndex = newHistory[newHistory.length - 1];

      setNavigationHistory(newHistory);
      setCurrentQuestionIndex(previousQuestionIndex);
    } else if (currentQuestionIndex === 0 && onBack) {
      // At first question of domain - go back to previous domain/tier
      console.log('[DomainRenderer] Going back to previous domain/tier');
      onBack();
    }
  };

  // Check if back button should be enabled - always enabled in Tier 2
  const canGoBack = () => {
    return navigationHistory.length > 1 || (currentQuestionIndex === 0 && onBack);
  };

  // Check if we've gone past all questions
  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="domain-complete">
        <div className="domain-renderer">
          <h3>{domain?.name || 'Domain'}</h3>
          <p>Domain complete</p>
          <button
            onClick={handleDomainComplete}
            className="continue-button"
          >
            Continue to Next Domain
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }


  return (
    <div className="domain-renderer">
      <div className="domain-header">
        <h3>{domain?.name || 'Domain'}</h3>
        <span className="question-indicator">
          {domain?.name || 'Domain'} - Question {currentQuestionIndex + 1}
        </span>
      </div>

      <div className="question-content">
        {currentQuestion?.type === 'scale' && currentQuestion.question && (
          <ScaleInput
            question={currentQuestion.question}
            scale={currentQuestion.scale}
            onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
            defaultValue={responses[currentQuestion.id]}
          />
        )}

        {currentQuestion?.type === 'single_choice' && currentQuestion.question && (
          <SingleChoiceInput
            question={currentQuestion.question}
            options={currentQuestion.options || []}
            questionId={currentQuestion.id}
            onAnswer={(value, additionalData = {}) => {
              handleAnswer(currentQuestion.id, value, additionalData);
            }}
          />
        )}


        {currentQuestion?.type === 'text_input' && currentQuestion.golden_key && currentQuestion.question && (
          <GoldenKeyInput
            question={resolveQuestionText(currentQuestion)}
            placeholder={resolvePlaceholderText(currentQuestion)}
            minWords={currentQuestion.min_words || 40}
            defaultValue={responses[currentQuestion.id] || ''}
            onSubmit={handleGoldenKeySubmit}
          />
        )}
      </div>

      {/* Footer with Back and Next buttons */}
      <div className="question-footer" style={{ marginTop: '30px', textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handleBack}
          disabled={!canGoBack()}
          className="footer-back-button"
          style={{
            padding: '12px 24px',
            backgroundColor: canGoBack() ? '#6c757d' : '#bdc3c7',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: canGoBack() ? 'pointer' : 'not-allowed'
          }}
        >
          Back
        </button>
        <button
          onClick={handleFooterNext}
          disabled={!hasCurrentResponse()}
          className="footer-next-button"
          style={{
            padding: '12px 24px',
            backgroundColor: hasCurrentResponse() ? '#4A90E2' : '#bdc3c7',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: hasCurrentResponse() ? 'pointer' : 'not-allowed'
          }}
        >
          Next
        </button>
      </div>

      <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
        <details>
          <summary>Debug Info</summary>
          <pre>{JSON.stringify({
            currentQuestionId: currentQuestion?.id,
            currentQuestionIndex,
            navigationHistory,
            currentResponses: responses,
            questionType: currentQuestion?.type,
            condition: currentQuestion?.condition,
            shouldShow: currentQuestion ? shouldShowQuestion(currentQuestion) : 'N/A',
            canGoBack: canGoBack(),
            hasResponse: hasCurrentResponse(),
            nextButtonEnabled: hasCurrentResponse(),
            backButtonEnabled: canGoBack()
          }, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default DomainRenderer;