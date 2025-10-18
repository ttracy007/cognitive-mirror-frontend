// Cognitive Mirror - Question Data (Backend Proxy)
import { API_ENDPOINTS } from '../../shared/onboarding-constants';

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
    // Tier 1 doesn't need userId in URL
    // Tier 2 and Tier 3 need userId for conditional logic
    let endpoint;
    if (tier === 1) {
      endpoint = API_ENDPOINTS.TIER1_QUESTIONS;
    } else if (tier === 2) {
      endpoint = `${API_ENDPOINTS.TIER2_QUESTIONS}/${userId}`;
    } else if (tier === 3) {
      endpoint = `${API_ENDPOINTS.TIER3_QUESTIONS}/${userId}`;
    } else {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const url = `${backendUrl}${endpoint}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch questions');
    }

    // Tier 2 returns domains, Tier 3 returns questions array, Tier 1 returns questions array
    if (tier === 2) {
      return data.domains;
    } else {
      return data.questions || [];
    }

  } catch (error) {
    console.error(`Error fetching Tier ${tier} questions:`, error);
    throw error;
  }
}