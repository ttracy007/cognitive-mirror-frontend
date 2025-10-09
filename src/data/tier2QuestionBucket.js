// TIER 2 QUESTION BUCKET
// Open-ended clinical questions that adapt based on Tier 1 patterns

export const TIER2_BASE_QUESTIONS = [
  {
    id: 'sleep',
    question: "Do you sleep through the night, or wake up?",
    type: 'text_area',
    placeholder: "Tell me about your sleep...",
    followUp: {
      trigger: "wake",  // If response contains "wake" or "waking"
      question: "What's usually weighing on you when you wake up?",
      placeholder: "What's on your mind?..."
    }
  },
  {
    id: 'rumination',
    question: "Do you ever catch yourself stuck thinking about someone or something from the past - know it's probably not helpful but can't seem to stop?",
    type: 'text_area',
    placeholder: "You don't have to share details, but what keeps replaying?...",
    followUp: {
      trigger: "yes|yeah|sometimes|often",  // If response indicates yes
      question: "What is it?",
      placeholder: "What keeps pulling you back to it?..."
    }
  },
  {
    id: 'worry',
    question: "Is there something you worry about that you don't really talk about with people, but it takes up mental space?",
    type: 'text_area',
    placeholder: "What weighs on you that you keep to yourself?...",
    followUp: {
      trigger: "yes|yeah|sometimes|there is",
      question: "What is it?",
      placeholder: "What's the worst part of it for you?..."
    }
  },
  {
    id: 'relationships',
    question: null,  // Will be set by adaptive logic
    type: 'text_area',
    placeholder: "What's happening that's on your mind?...",
    adaptive: {
      ageRanges: {
        '18_25': "Any relationship stuff - past or present - that you think about more than you'd like to?",
        '26_35': "Anything in your relationships that you replay in your head in ways that probably aren't helpful?",
        '36_50': "Any relationship patterns you've noticed in yourself that you wish you could change?",
        '50_plus': "Any relationship patterns you've noticed in yourself that you wish you could change?"
      }
    },
    followUp: {
      trigger: "yes|yeah|sometimes|relationship",
      question: "What about it?",
      placeholder: "When did you start noticing this pattern?..."
    }
  }
];

// Optional 5th question - adapts based on detected patterns
export const TIER2_ADAPTIVE_QUESTION = {
  id: 'stress_pressure',
  type: 'text_area',
  placeholder: "What makes it feel stuck?...",
  patternVariants: {
    executive_function: {
      threshold: 3,
      question: "What's the thing creating the most pressure for you right now?"
    },
    perfectionism: {
      threshold: 3,
      question: "What are you hardest on yourself about these days?"
    },
    social_anxiety: {
      threshold: 3,
      question: "What social situation makes you most anxious?"
    },
    default: "What's stressing you out most right now?"
  }
};

// Function to generate Tier 2 questions based on Tier 1 data
export function generateTier2Questions(tier1Responses, detectedPatterns) {
  const questions = [];

  // Always include base questions
  TIER2_BASE_QUESTIONS.forEach((q, index) => {
    const question = { ...q, number: index + 1, required: true };

    // Handle adaptive relationship question
    if (q.id === 'relationships' && q.adaptive) {
      const age = tier1Responses.age || tier1Responses.q2_age;
      question.question = q.adaptive.ageRanges[age] || q.adaptive.ageRanges['26_35'];
    }

    questions.push(question);
  });

  // Add adaptive stress question if patterns warrant it
  if (shouldIncludeAdaptiveQuestion(detectedPatterns)) {
    const adaptiveQ = {
      ...TIER2_ADAPTIVE_QUESTION,
      number: questions.length + 1,
      required: true
    };

    // Find which pattern triggered
    for (const [pattern, config] of Object.entries(TIER2_ADAPTIVE_QUESTION.patternVariants)) {
      if (pattern === 'default') continue;
      if (detectedPatterns[pattern] >= config.threshold) {
        adaptiveQ.question = config.question;
        break;
      }
    }

    // Use default if no specific pattern matched
    if (!adaptiveQ.question) {
      adaptiveQ.question = TIER2_ADAPTIVE_QUESTION.patternVariants.default;
    }

    questions.push(adaptiveQ);
  }

  return questions;
}

function shouldIncludeAdaptiveQuestion(patterns) {
  // Include if any pattern score is >= 3
  return Object.values(patterns).some(score => score >= 3);
}

// Backward compatibility functions
export function getTier2Questions() {
  // Return base questions without adaptive logic for compatibility
  return TIER2_BASE_QUESTIONS.map((q, index) => ({
    ...q,
    number: index + 1,
    required: true,
    question: q.question || q.adaptive?.ageRanges['26_35'] || "Relationship question"
  }));
}

export function getAdaptiveTier2Questions(tier1Responses) {
  const patterns = { executive_function: 0, perfectionism: 0, social_anxiety: 0 };
  return generateTier2Questions(tier1Responses, patterns);
}