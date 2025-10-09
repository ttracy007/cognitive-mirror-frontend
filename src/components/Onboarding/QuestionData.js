// src/components/Onboarding/QuestionData.js
import { selectTier1Questions, detectPatterns } from '../../data/tier1QuestionBucket.js';
import { getTier2Questions, generateTier2Questions } from '../../data/tier2QuestionBucket.js';
import { getTier3Questions, detectPriorityFromAllTiers } from '../../data/tier3QuestionBucket.js';

export const OPENING_FRAME = {
  title: "Let's Get to Know You",
  message: "Hey there. Before we dive in, I'd love to get to know you a bit. Think of this as a conversation with a friend who's genuinely curious about how you're doing. No judgment, no pressure—just honest reflection. Sound good?"
};

export const CLOSING_FRAME = {
  title: "You're All Set",
  message: "Thanks for sharing all that. I'll remember what matters most to you, and we can keep coming back to it as things shift. You're not locked into anything—this is just a starting point. Ready to dive in?"
};

// Add proxy function to get questions from backend
export async function getQuestionsForTier(tier, userId) {
  if (tier === 1 && userId) {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(
        `${backendUrl}/api/onboarding/v1/tier${tier}/questions/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.questions) {
        return data.questions;
      } else {
        throw new Error(data.error || 'Failed to load questions');
      }
    } catch (error) {
      console.error(`[Tier ${tier}] Failed to fetch questions from backend:`, error);
      // Fallback to static questions
      return getQuestionsForTierStatic(tier);
    }
  } else {
    // For Tier 2, 3 or when no userId, use static questions
    return getQuestionsForTierStatic(tier);
  }
}

// Generate tier 1 questions (multiple choice, 8-10 questions)
function getTier1Questions() {
  const selectedQuestions = selectTier1Questions();
  return selectedQuestions.map((q, index) => ({
    ...q,
    number: index + 1,
    type: 'multiple_choice'
  }));
}

// Get tier questions from modular buckets
export const TIER2_QUESTIONS = getTier2Questions();
export const TIER3_QUESTIONS = getTier3Questions();

// Static function to get questions for current tier (fallback)
export function getQuestionsForTierStatic(tier) {
  switch (tier) {
    case 1:
      return getTier1Questions();
    case 2:
      return TIER2_QUESTIONS;
    case 3:
      return TIER3_QUESTIONS;
    default:
      return getTier1Questions();
  }
}

// Generate questions based on user's Tier 1 responses
export function generateOnboardingQuestions(tier1Responses = null) {
  const tier1Questions = selectTier1Questions();

  // If we have Tier 1 responses, generate adaptive Tier 2
  if (tier1Responses) {
    const detectedPatterns = detectPatterns(tier1Responses);
    const tier2Questions = generateTier2Questions(tier1Responses, detectedPatterns);

    return {
      tier1: tier1Questions,
      tier2: tier2Questions,
      tier3: getTier3Questions(),
      patterns: detectedPatterns  // Include for backend
    };
  }

  // If no Tier 1 responses yet, just return Tier 1
  return {
    tier1: tier1Questions,
    tier2: null,
    tier3: null,
    patterns: null
  };
}

// Enhanced priority detection using all tiers
export { detectPriorityFromAllTiers };

// Legacy export for backward compatibility
export const ONBOARDING_QUESTIONS = getTier1Questions();