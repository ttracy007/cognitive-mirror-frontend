// TIER 3 QUESTION BUCKET
// Priority and limiting belief questions that synthesize everything learned
// These questions help identify what matters most and what's holding them back

const tier3Questions = [
  {
    id: 'priority',
    category: 'synthesis',
    number: 1,
    question: "Of everything we've talked about—or anything else—what feels like the thing you'd most want to work on right now?",
    type: 'text_area',
    placeholder: "What matters most to you right now? What would you like to focus on?",
    required: true,
    reveals: ['core_priorities', 'motivation_drivers', 'readiness_for_change']
  },
  {
    id: 'limiting_belief',
    category: 'self_perception',
    number: 2,
    question: "What belief about yourself might be holding you back from that? What story do you tell yourself?",
    type: 'text_area',
    placeholder: "What do you believe about yourself that might be getting in the way?",
    required: true,
    reveals: ['limiting_beliefs', 'self_concept', 'internal_barriers']
  }
];

// Get all Tier 3 questions (static for now, but could be adaptive later)
function getTier3Questions() {
  return tier3Questions.map((q, index) => ({
    ...q,
    number: index + 1
  }));
}

// Future: Adaptive questions based on Tier 1 + Tier 2 responses
function getAdaptiveTier3Questions(tier1Responses, tier2Responses) {
  // For now, return all questions
  // Future implementation could customize based on patterns from both tiers
  return getTier3Questions();
}

// Priority detection based on responses across all tiers
function detectPriorityFromAllTiers(tier1Responses, tier2Responses, tier3Responses) {
  // Enhanced detection logic that considers all three tiers
  const keywords = {
    sleep_issues: ['sleep', 'insomnia', 'wake up', 'tired', 'exhausted'],
    rumination: ['past', 'over and over', 'replaying', 'can\'t stop thinking'],
    relationships: ['relationship', 'family', 'partner', 'friends', 'conflict'],
    anxiety: ['worry', 'anxious', 'stressed', 'overwhelmed', 'panic'],
    self_criticism: ['not good enough', 'failure', 'worthless', 'disappointing']
  };

  const allResponseText = JSON.stringify({
    ...tier1Responses,
    ...tier2Responses,
    ...tier3Responses
  }).toLowerCase();

  let highestMatch = { priority: 'general_wellness', count: 0 };

  for (const [priority, words] of Object.entries(keywords)) {
    const matchCount = words.filter(word => allResponseText.includes(word)).length;
    if (matchCount > highestMatch.count) {
      highestMatch = { priority, count: matchCount };
    }
  }

  const contexts = {
    sleep_issues: 'struggling with sleep and rest patterns',
    rumination: 'dealing with repetitive thoughts and past experiences',
    relationships: 'navigating relationship challenges and dynamics',
    anxiety: 'managing anxiety and worry patterns',
    self_criticism: 'working through self-critical thoughts and beliefs',
    general_wellness: 'exploring general mental wellness and growth'
  };

  return {
    priority: highestMatch.priority,
    context: contexts[highestMatch.priority]
  };
}

export { tier3Questions, getTier3Questions, getAdaptiveTier3Questions, detectPriorityFromAllTiers };