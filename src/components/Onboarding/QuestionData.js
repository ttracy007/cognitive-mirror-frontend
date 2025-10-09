// Cognitive Mirror - Question Data (Backend Proxy)

// Opening frame - shown before onboarding begins
export const OPENING_FRAME = {
  title: "Three Questions, Three Layers",
  message: "We're going to go deep together—but in stages. First, I'll ask you some quick questions to understand your patterns. Then we'll dig into what's really going on. Finally, you'll tell me what matters most. Sound good?"
};

// Closing frame - shown after voice selection
export const CLOSING_FRAME = {
  title: "Ready to Begin",
  message: "I've got a clear picture now. You've chosen your voice, and we're ready to start this journey together. Remember—this is your space, and you can change direction anytime."
};

// Proxy function - fetches questions from backend
export async function getQuestionsForTier(tier, userId) {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';

  try {
    const response = await fetch(
      `${backendUrl}/api/onboarding/v1/tier${tier}/questions/${userId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch questions');
    }

    return data.questions;

  } catch (error) {
    console.error(`Error fetching Tier ${tier} questions:`, error);
    throw error;
  }
}