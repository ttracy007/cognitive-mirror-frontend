// Golden Key Detection Utility
// Detects high-value responses that indicate deep sharing or emotional significance

export function detectGoldenKey(response) {
  if (!response || typeof response !== 'string') return false;

  const wordCount = response.split(/\s+/).length;
  if (wordCount < 40) return false;

  // Emotional language patterns
  const emotionalPatterns = [
    /i hate/i,
    /it kills me/i,
    /i'm afraid/i,
    /i can't stop/i,
    /i always/i,
    /i never/i,
    /it's like/i,
    /i feel like/i,
    /makes me feel/i,
    /i'm scared/i,
    /i worry/i,
    /bothers me/i,
    /drives me crazy/i
  ];

  // Vulnerability markers
  const vulnerabilityPatterns = [
    /never told anyone/i,
    /sounds stupid/i,
    /sounds crazy/i,
    /don't usually talk about/i,
    /hard to admit/i,
    /embarrassing/i,
    /ashamed/i,
    /guilty/i,
    /secret/i,
    /don't like to think about/i,
    /try not to/i
  ];

  // Specific detail indicators (names, places, specific situations)
  const specificityPatterns = [
    /my (mom|dad|mother|father|ex|boss|friend)/i,
    /at work/i,
    /last (week|month|year)/i,
    /when i was/i,
    /he said|she said/i,
    /happened when/i,
    /remember when/i
  ];

  const hasEmotionalLanguage = emotionalPatterns.some(pattern => pattern.test(response));
  const hasVulnerability = vulnerabilityPatterns.some(pattern => pattern.test(response));
  const hasSpecificity = specificityPatterns.some(pattern => pattern.test(response));

  // Golden key criteria: must have length + (emotional OR vulnerability OR specificity)
  return hasEmotionalLanguage || hasVulnerability || hasSpecificity;
}

// Check if response should trigger a follow-up question
export function shouldTriggerFollowUp(response, triggerPattern) {
  if (!response || !triggerPattern) return false;

  const patterns = triggerPattern.split('|');
  return patterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(response);
  });
}

// Analyze response quality and significance
export function analyzeResponse(questionId, response) {
  const analysis = {
    isGoldenKey: detectGoldenKey(response),
    wordCount: response ? response.split(/\s+/).length : 0,
    hasEmotionalContent: false,
    hasVulnerability: false,
    hasSpecificity: false
  };

  if (response) {
    // Check for emotional content
    analysis.hasEmotionalContent = /i hate|kills me|afraid|can't stop|always|never|feel like|scared|worry|bothers|crazy/i.test(response);

    // Check for vulnerability markers
    analysis.hasVulnerability = /never told|sounds stupid|don't talk about|hard to admit|embarrassing|ashamed|guilty|secret/i.test(response);

    // Check for specificity
    analysis.hasSpecificity = /my (mom|dad|mother|father|ex|boss)|at work|last (week|month|year)|when i|said|happened when|remember when/i.test(response);
  }

  return analysis;
}