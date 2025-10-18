// ============================================================================
// ONBOARDING CONSTANTS - SHARED BETWEEN FRONTEND AND BACKEND
// ============================================================================
// CRITICAL: This file must be IDENTICAL between frontend and backend
// When migrating to wellness naming, update this ONE file and both sides sync
// ============================================================================

// TIER 2 DOMAIN IDENTIFIERS
export const TIER2_DOMAINS = {
  SLEEP: 'domain1_sleep',
  RUMINATION: 'domain2_rumination',
  WORK: 'domain3_work',
  RELATIONSHIPS: 'domain4_relationships'
};

// TIER 3 QUESTION IDENTIFIERS
export const TIER3_QUESTIONS = {
  PRIORITY_CONFIRMATION: 'priority_confirmation',
  ADVICE_STYLE: 'advice_style'
};

// VOICE IDENTIFIERS - ALL SUPPORTED VOICES
export const VOICE_IDS = {
  // Primary voices (main onboarding)
  TONY: 'tony',
  CLARA: 'clara',
  MARCUS: 'marcus',

  // Legacy/alternate voice IDs (for backward compatibility)
  FRANK: 'frank',           // Maps to Tony
  THERAPIST: 'therapist',   // Maps to Clara
  TONY_D: 'tony_d',         // Legacy Tony ID
  MARCUS_AURELIUS: 'marcus_aurelius', // Legacy Marcus ID

  // Additional voices
  VERENA: 'verena',
  MOVIES: 'movies',
  MIRROR: 'mirror'          // Default/fallback
};

// VOICE DISPLAY NAMES
export const VOICE_NAMES = {
  [VOICE_IDS.TONY]: 'Tony',
  [VOICE_IDS.CLARA]: 'Clara',
  [VOICE_IDS.MARCUS]: 'Marcus',
  [VOICE_IDS.FRANK]: 'Tony',
  [VOICE_IDS.THERAPIST]: 'Clara',
  [VOICE_IDS.TONY_D]: 'Tony',
  [VOICE_IDS.MARCUS_AURELIUS]: 'Marcus',
  [VOICE_IDS.VERENA]: '🌸 Verena',
  [VOICE_IDS.MOVIES]: 'Movie Metaphor™',
  [VOICE_IDS.MIRROR]: 'Mirror'
};

// VOICE DESCRIPTIONS
export const VOICE_DESCRIPTIONS = {
  [VOICE_IDS.THERAPIST]: "🩺 Clara – A warm, grounded therapist who sees the pattern beneath the panic.",
  [VOICE_IDS.CLARA]: "🩺 Clara – A warm, grounded therapist who sees the pattern beneath the panic.",
  [VOICE_IDS.MARCUS]: "🧘 Marcus – Speaks like the Stoic philosopher himself. Will quote Meditations.",
  [VOICE_IDS.MARCUS_AURELIUS]: "🧘 Marcus – Speaks like the Stoic philosopher himself. Will quote Meditations.",
  [VOICE_IDS.FRANK]: "💪🍷 Tony – A frank, no-bullshit friend who tells you what you need to hear.",
  [VOICE_IDS.TONY]: "💪🍷 Tony – A frank, no-bullshit friend who tells you what you need to hear.",
  [VOICE_IDS.MOVIES]: "🎬 Movies – A movie buff who only speaks through movie metaphors.",
  [VOICE_IDS.VERENA]: "🌸 Verena – A clarity-driven life coach unphased by self-pity."
};

// VOICE STYLE CONFIGURATIONS
export const VOICE_STYLES = {
  [VOICE_IDS.TONY]: { backgroundColor: '#fff3e0', borderColor: '#fb8c00', label: 'Tony' },
  [VOICE_IDS.FRANK]: { backgroundColor: '#fff3e0', borderColor: '#fb8c00', label: 'Tony' },
  [VOICE_IDS.TONY_D]: { backgroundColor: '#fff3e0', borderColor: '#fb8c00', label: 'Tony' },

  [VOICE_IDS.CLARA]: { backgroundColor: '#e0f7f6', borderColor: '#673ab7', label: 'Clara' },
  [VOICE_IDS.THERAPIST]: { backgroundColor: '#e0f7f6', borderColor: '#673ab7', label: 'Clara' },

  [VOICE_IDS.MARCUS]: { backgroundColor: '#e8f5e9', borderColor: '#388e3c', label: 'Marcus' },
  [VOICE_IDS.MARCUS_AURELIUS]: { backgroundColor: '#e8f5e9', borderColor: '#388e3c', label: 'Marcus' },

  [VOICE_IDS.VERENA]: { backgroundColor: '#ffeaf0', borderColor: '#ec407a', label: '🌸 Verena' },
  [VOICE_IDS.MOVIES]: { backgroundColor: '#fce4ec', borderColor: '#c2185b', label: 'Movie Metaphor™' },
  [VOICE_IDS.MIRROR]: { backgroundColor: '#f0f0f0', borderColor: '#ccc', label: 'Mirror' }
};

// VOICE MAPPING - ONBOARDING TO APP FORMAT
export const VOICE_MAPPING = {
  [VOICE_IDS.MARCUS]: VOICE_IDS.MARCUS,
  [VOICE_IDS.CLARA]: VOICE_IDS.THERAPIST,
  [VOICE_IDS.TONY]: VOICE_IDS.FRANK,
  [VOICE_IDS.MARCUS_AURELIUS]: VOICE_IDS.MARCUS,
  [VOICE_IDS.TONY_D]: VOICE_IDS.FRANK
};

// API ENDPOINTS
export const API_ENDPOINTS = {
  TIER1_QUESTIONS: '/api/onboarding/v1/tier1/questions',
  TIER1_SUBMIT: '/api/onboarding/v1/tier1/submit',
  TIER2_QUESTIONS: '/api/onboarding/v1/tier2/questions',
  TIER2_SUBMIT: '/api/onboarding/v1/tier2/submit',
  TIER3_QUESTIONS: '/api/onboarding/v1/tier3/questions',
  TIER3_SUBMIT: '/api/onboarding/v1/tier3/submit',
  VOICE_PREVIEWS_GENERATE: '/api/onboarding/v1/voice-previews/generate',
  VOICE_PREVIEWS_SELECT: '/api/onboarding/v1/voice-previews/select',
  VOICE_PREVIEW_RETRIEVE: '/api/onboarding/v1/voice-preview/retrieve',
  VOICE_PREVIEWS_STORED: '/api/onboarding/v1/voice-previews/stored',
  USER_PROFILE: '/api/user/profile'
};

// FIELD NAMES - DATABASE/API FIELD IDENTIFIERS
export const FIELD_NAMES = {
  USER_ID: 'user_id',
  USER_ID_CAMEL: 'userId',
  SELECTED_VOICE: 'selected_voice',
  TIER2_RESPONSES: 'tier2_responses',
  TIER2_GOLDEN_KEYS: 'tier2_golden_keys',
  USER_STATED_PRIORITY: 'user_stated_priority',
  PRIORITY_CONFIRMATION: 'priority_confirmation',
  PRIORITY_OVERRIDE_TEXT: 'priority_override_text',
  ADVICE_STYLE: 'advice_style',
  VOICE_PREVIEW_TEXT: 'voice_preview_text',
  VOICE_PREVIEWS: 'voice_previews',
  RESPONSES: 'responses',
  SUCCESS: 'success',
  ERROR: 'error',
  DATA: 'data',
  PREVIEWS: 'previews',
  TONE_MODE: 'tone_mode'
};

// TIER 1 QUESTION IDS
export const TIER1_QUESTION_IDS = {
  Q1A_SLEEP_QUALITY: 'q1a_sleep_quality',
  Q1B_SLEEP_ROUTINE: 'q1b_sleep_routine',
  Q1C_SLEEP_ENVIRONMENT: 'q1c_sleep_environment',
  Q2A_RUMINATION_FREQUENCY: 'q2a_rumination_frequency',
  Q2B_RUMINATION_TRIGGERS: 'q2b_rumination_triggers',
  Q2C_RUMINATION_CONTENT: 'q2c_rumination_content',
  Q3A_WORK_SATISFACTION: 'q3a_work_satisfaction',
  Q3B_WORK_STRESS: 'q3b_work_stress',
  Q3C_WORK_BALANCE: 'q3c_work_balance',
  Q4A_RELATIONSHIP_SATISFACTION: 'q4a_relationship_satisfaction',
  Q4B_RELATIONSHIP_COMMUNICATION: 'q4b_relationship_communication',
  Q4C_RELATIONSHIP_SUPPORT: 'q4c_relationship_support'
};

// ONBOARDING STEPS
export const ONBOARDING_STEPS = {
  OPENING: 'opening',
  QUESTIONS: 'questions',
  TIER3_PRIORITY: 'tier3-priority',
  TIER3_ADVICE_STYLE: 'tier3-advice-style',
  VOICE_SELECTION: 'voice-selection',
  CLOSING: 'closing'
};

// PRIORITY CONFIRMATION VALUES
export const PRIORITY_CONFIRMATION_VALUES = {
  CONFIRMED: 'confirmed',
  OVERRIDE: 'override'
};

// ENTRY TYPES
export const ENTRY_TYPES = {
  REFLECTION: 'reflection',
  VOICE_PREVIEW: 'voice_preview',
  INSIGHT: 'insight'
};

// UTILITY FUNCTIONS
export const getVoiceStyle = (voiceId) => {
  return VOICE_STYLES[voiceId] || VOICE_STYLES[VOICE_IDS.MIRROR];
};

export const getVoiceName = (voiceId) => {
  return VOICE_NAMES[voiceId] || VOICE_NAMES[VOICE_IDS.MIRROR];
};

export const getVoiceDescription = (voiceId) => {
  return VOICE_DESCRIPTIONS[voiceId] || VOICE_DESCRIPTIONS[VOICE_IDS.THERAPIST];
};

export const mapVoiceForApp = (onboardingVoice) => {
  return VOICE_MAPPING[onboardingVoice] || VOICE_IDS.THERAPIST;
};

// DOMAIN HELPERS
export const getDomainList = () => Object.values(TIER2_DOMAINS);

export const isDomainValid = (domain) => {
  return getDomainList().includes(domain);
};

// VOICE HELPERS
export const getVoiceList = () => [VOICE_IDS.TONY, VOICE_IDS.CLARA, VOICE_IDS.MARCUS];

export const isVoiceValid = (voiceId) => {
  return Object.values(VOICE_IDS).includes(voiceId);
};

// VALIDATION HELPERS
export const validateTier2Domain = (domain) => {
  if (!isDomainValid(domain)) {
    throw new Error(`Invalid domain: ${domain}. Must be one of: ${getDomainList().join(', ')}`);
  }
  return true;
};

export const validateVoiceId = (voiceId) => {
  if (!isVoiceValid(voiceId)) {
    throw new Error(`Invalid voice ID: ${voiceId}. Must be one of: ${Object.values(VOICE_IDS).join(', ')}`);
  }
  return true;
};