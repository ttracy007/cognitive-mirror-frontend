// TIER 1 QUESTION BUCKET
// Multiple choice fun questions that reveal demographics, personality, worldview
// System randomly selects 8-10 from this pool for each onboarding

const tier1Questions = [
  {
    id: 'q1_gender',
    category: 'demographic',
    required: true, // Always ask
    question: "Are you:",
    options: [
      { value: 'male', text: 'Male' },
      { value: 'female', text: 'Female' },
      { value: 'non_binary', text: 'Non-binary' },
      { value: 'hate_term', text: 'I hate whoever invented the term non-binary' }
    ]
  },

  {
    id: 'q2_age',
    category: 'demographic',
    required: true, // Always ask
    question: "How old are you?",
    options: [
      { value: 'under_18', text: 'Under 18 (should you even be here?)' },
      { value: '18_25', text: '18-25 (figuring it out)' },
      { value: '26_35', text: '26-35 (supposed to have it together by now)' },
      { value: '36_50', text: '36-50 (definitely don\'t have it together)' },
      { value: '50_plus', text: '50+ (gave up pretending to have it together)' }
    ]
  },

  {
    id: 'q3_cultural_stance',
    category: 'demographic',
    required: true, // Always ask - meta callback to Q1
    question: 'If somebody were to put the term "non-binary" on a questionnaire I would:',
    options: [
      { value: 'love', text: 'Love that person' },
      { value: 'hate', text: 'Hate that person' },
      { value: 'not_care', text: 'Not really care' },
      { value: 'depends', text: 'Depends entirely on the questionnaire' }
    ]
  },

  {
    id: 'q4_ai_trust',
    category: 'personality',
    question: "Are you generally trusting of chat robots or nah?",
    options: [
      { value: 'trust', text: "Totally trust them - they're smarter than most people" },
      { value: 'cautious', text: 'Cautiously optimistic' },
      { value: 'skeptical', text: 'Deeply skeptical' },
      { value: 'find_out', text: "Currently talking to one so I guess we'll find out" }
    ],
    reveals: ['ai_receptiveness', 'general_trust_level']
  },

  {
    id: 'q5_kitchen_sponge',
    category: 'personality',
    question: "In your kitchen sink, the sponge is:",
    options: [
      { value: 'prisoner', text: 'A tortured political prisoner' },
      { value: 'regular', text: 'Swapped with punctual regularity' },
      { value: 'what_sponge', text: "I'm not sure what a kitchen sponge is" },
      { value: 'no_sink', text: 'There is no kitchen sink' }
    ],
    reveals: ['perfectionism', 'guilt_patterns', 'executive_function']
  },

  {
    id: 'q6_running_late_rain',
    category: 'personality',
    question: "You're running late for something important and it starts pouring rain. You:",
    options: [
      { value: 'get_umbrella', text: 'Go back for the umbrella (better late than soaked)' },
      { value: 'run_through', text: 'Say fuck it and run through the rain' },
      { value: 'cancel', text: 'Cancel the thing entirely - universe is telling me something' },
      { value: 'paralyzed', text: "Stand paralyzed in doorway weighing options until it's too late" }
    ],
    reveals: ['decision_making', 'anxiety', 'risk_tolerance']
  },

  {
    id: 'q7_apology_style',
    category: 'personality',
    question: "When you've clearly messed something up, you:",
    options: [
      { value: 'immediate', text: 'Apologize immediately and profusely' },
      { value: 'once_mean_it', text: 'Apologize once, mean it, move on' },
      { value: 'explain', text: 'Explain why it happened (not apologizing exactly...)' },
      { value: 'wait', text: 'Wait to see if they noticed' },
      { value: 'double_down', text: 'Double down - was it really even a mistake?' }
    ],
    reveals: ['conflict_style', 'accountability', 'defensiveness']
  },

  {
    id: 'q8_social_battery',
    category: 'personality',
    question: "After spending time with people, you:",
    options: [
      { value: 'energized', text: 'Feel energized and want more' },
      { value: 'recharge', text: 'Feel fine but need some alone time to recharge' },
      { value: 'drained', text: 'Feel completely drained and need to lie down' },
      { value: 'replay', text: 'Spend three days replaying every conversation wondering if you said something stupid' }
    ],
    reveals: ['social_anxiety', 'introversion', 'rumination']
  },

  {
    id: 'q9_advice_reception',
    category: 'personality',
    question: "When someone gives you unsolicited advice, you:",
    options: [
      { value: 'appreciate', text: 'Actually appreciate it - different perspectives help' },
      { value: 'smile_ignore', text: 'Smile, nod, ignore completely' },
      { value: 'annoyed', text: "Get annoyed - they don't know my situation" },
      { value: 'spite', text: 'Immediately do the opposite out of spite' }
    ],
    reveals: ['receptiveness', 'defensiveness', 'control_issues']
  },

  {
    id: 'q10_phone_calls',
    category: 'personality',
    question: "When your phone rings with an unknown number, you:",
    options: [
      { value: 'answer', text: 'Answer it like a normal person' },
      { value: 'google', text: 'Let it go to voicemail, google the number' },
      { value: 'horror', text: 'Stare at it in horror until it stops' },
      { value: 'died', text: 'Assume someone died' },
      { value: 'what_call', text: "What's a phone call?" }
    ],
    reveals: ['anxiety', 'avoidance', 'catastrophizing']
  },

  {
    id: 'q11_morning_person',
    category: 'personality',
    question: "In the morning, you:",
    options: [
      { value: 'natural', text: 'Wake up naturally, ready to seize the day' },
      { value: 'coffee', text: 'Need coffee to become human' },
      { value: 'snooze', text: 'Hit snooze 6 times and hate yourself for it' },
      { value: 'what_morning', text: 'What morning? I went to bed at 5am' }
    ],
    reveals: ['sleep_patterns', 'self_criticism', 'routine']
  },

  {
    id: 'q12_grocery_shopping',
    category: 'personality',
    question: "At the grocery store, you:",
    options: [
      { value: 'list_stick', text: 'Have a list, stick to it, in and out' },
      { value: 'list_ignore', text: "Have a list, buy everything except what's on the list" },
      { value: 'wing_it', text: 'Wing it completely, forget half of what you needed' },
      { value: 'online', text: 'Order online because grocery stores are hell' },
      { value: 'delivery', text: 'Survive on delivery apps and denial' }
    ],
    reveals: ['executive_function', 'planning', 'avoidance']
  },

  {
    id: 'q13_texting_back',
    category: 'personality',
    question: "When someone texts you, you:",
    options: [
      { value: 'immediate', text: 'Respond immediately' },
      { value: 'forget', text: 'Read it, mean to respond, forget for 3 days' },
      { value: 'anxious', text: 'Read it, get anxious, overthink response, never send anything' },
      { value: 'unread', text: 'Leave it unread until you have emotional capacity' },
      { value: 'phantom', text: "What are you talking about? I responded (you didn't)" }
    ],
    reveals: ['social_anxiety', 'avoidance', 'executive_function']
  },

  {
    id: 'q14_weekend_plans',
    category: 'personality',
    question: "Friday night, someone asks about your weekend plans. You:",
    options: [
      { value: 'scheduled', text: 'Already have every hour scheduled' },
      { value: 'flexible', text: 'Have one or two things, rest is flexible' },
      { value: 'nothing', text: "Literally nothing, and that's the plan" },
      { value: 'panic', text: "Panic because you're supposed to have plans" },
      { value: 'lie', text: "Lie and say you're busy (you're not)" }
    ],
    reveals: ['social_pressure', 'control', 'isolation']
  },

  {
    id: 'q15_email_inbox',
    category: 'personality',
    question: "Your email inbox is:",
    options: [
      { value: 'zero', text: 'Inbox zero, always' },
      { value: 'under_50', text: 'Under 50 unread (mostly under control)' },
      { value: '500_1000', text: '500-1000 unread (gave up months ago)' },
      { value: '5000_plus', text: '5,000+ unread (decorative at this point)' },
      { value: 'seventeen', text: 'I have 17 different email addresses and avoid all of them' }
    ],
    reveals: ['executive_function', 'overwhelm', 'avoidance']
  },

  {
    id: 'q16_decision_making',
    category: 'personality',
    question: "Choosing where to eat dinner:",
    options: [
      { value: 'immediate', text: 'I pick immediately, no problem' },
      { value: 'options', text: 'I need 2-3 options, then I can decide' },
      { value: 'veto', text: "You pick, I'll veto what I don't want" },
      { value: 'dont_care', text: '45-minute conversation ending with "I don\'t care"' },
      { value: 'cereal', text: 'Analysis paralysis until we just eat cereal at home' }
    ],
    reveals: ['decision_making', 'anxiety', 'control']
  },

  {
    id: 'q17_being_wrong',
    category: 'personality',
    question: "When you realize you're wrong about something, you:",
    options: [
      { value: 'admit_easy', text: 'Admit it immediately, no big deal' },
      { value: 'admit_explain', text: 'Admit it but explain how I got there' },
      { value: 'deflect', text: 'Admit it but make a joke to deflect' },
      { value: 'quiet_change', text: 'Quietly change position without acknowledging' },
      { value: 'die_hill', text: 'Die on that hill - was I really wrong though?' }
    ],
    reveals: ['defensiveness', 'ego', 'flexibility']
  },

  {
    id: 'q18_social_media',
    category: 'personality',
    question: "Your social media presence is:",
    options: [
      { value: 'active', text: 'Active poster, love sharing my life' },
      { value: 'occasional', text: 'Occasional poster, mostly lurk' },
      { value: 'lurk_judge', text: 'Never post, just scroll and judge' },
      { value: 'haunted', text: 'Posted once in 2019, still haunted by it' },
      { value: 'deleted', text: 'Deleted everything, living in analog peace' }
    ],
    reveals: ['social_anxiety', 'self_consciousness', 'validation_seeking']
  },

  {
    id: 'q19_running_late',
    category: 'personality',
    question: "When you're running late, you:",
    options: [
      { value: 'text_eta', text: 'Text immediately with updated ETA' },
      { value: 'text_almost', text: "Text when I'm almost there" },
      { value: 'apologize', text: 'Show up late and apologize profusely' },
      { value: 'act_normal', text: 'Show up late and act like nothing happened' },
      { value: 'no_show', text: "Just don't show up, send apology text later" }
    ],
    reveals: ['accountability', 'anxiety', 'conflict_avoidance']
  },

  {
    id: 'q20_compliments',
    category: 'personality',
    question: "When someone compliments you, you:",
    options: [
      { value: 'accept', text: 'Say thank you, accept it gracefully' },
      { value: 'reciprocate', text: 'Say thank you, immediately compliment them back' },
      { value: 'deflect', text: 'Deflect or make self-deprecating joke' },
      { value: 'suspicious', text: 'Assume they want something' },
      { value: 'uncomfortable', text: 'Feel deeply uncomfortable and suspicious' }
    ],
    reveals: ['self_worth', 'trust', 'social_anxiety']
  },

  {
    id: 'q21_problem_solving_spiral',
    category: 'personality',
    question: "When you can't figure something out, you:",
    options: [
      { value: 'keep_trying_calmly', text: 'Keep trying calmly until I get it' },
      { value: 'fail_worthless_brilliant', text: 'Fail repeatedly, think I\'m worthless, then solve it and feel brilliant' },
      { value: 'figure_everything_out', text: 'I figure everything out' },
      { value: 'skip_trigger', text: 'Enough with these questions. Let\'s move on.' }
    ],
    reveals: ['emotional_dysregulation', 'all_or_nothing_thinking', 'self_worth_volatility', 'perfectionism']
  }
];

// USAGE LOGIC FOR ONBOARDING
function selectTier1Questions() {
  const required = tier1Questions.filter(q => q.required);
  const optional = tier1Questions.filter(q => !q.required);

  // Always include 3 required (gender, age, cultural stance)
  // Randomly select 1 from optional pool for total of 4 questions
  const selectedOptional = shuffleArray(optional).slice(0, 1);

  return [...required, ...selectedOptional];
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// PATTERN DETECTION (for adaptive Tier 2-3)
function detectPatterns(tier1Responses) {
  const patterns = {
    social_anxiety: 0,
    executive_function: 0,
    defensiveness: 0,
    perfectionism: 0,
    avoidance: 0,
    rumination: 0
  };

  // Social anxiety cluster
  if (tier1Responses.q8_social_battery === 'replay') patterns.social_anxiety += 2;
  if (tier1Responses.q13_texting_back === 'anxious') patterns.social_anxiety += 2;
  if (tier1Responses.q20_compliments === 'uncomfortable') patterns.social_anxiety += 1;
  if (tier1Responses.q10_phone_calls === 'horror') patterns.social_anxiety += 1;

  // Executive function cluster
  if (tier1Responses.q15_email_inbox === '5000_plus') patterns.executive_function += 2;
  if (tier1Responses.q12_grocery_shopping === 'wing_it') patterns.executive_function += 1;
  if (tier1Responses.q13_texting_back === 'forget') patterns.executive_function += 1;

  // Defensiveness cluster
  if (tier1Responses.q17_being_wrong === 'die_hill') patterns.defensiveness += 2;
  if (tier1Responses.q7_apology_style === 'double_down') patterns.defensiveness += 2;
  if (tier1Responses.q9_advice_reception === 'spite') patterns.defensiveness += 1;

  // Perfectionism cluster
  if (tier1Responses.q5_kitchen_sponge === 'prisoner') patterns.perfectionism += 2;
  if (tier1Responses.q11_morning_person === 'snooze') patterns.perfectionism += 1;

  // Avoidance cluster
  if (tier1Responses.q19_running_late === 'no_show') patterns.avoidance += 2;
  if (tier1Responses.q13_texting_back === 'unread') patterns.avoidance += 1;
  if (tier1Responses.q12_grocery_shopping === 'delivery') patterns.avoidance += 1;

  // Rumination cluster
  if (tier1Responses.q8_social_battery === 'replay') patterns.rumination += 2;

  // Emotional dysregulation / all-or-nothing cluster
  if (tier1Responses.q21_problem_solving_spiral === 'fail_worthless_brilliant') patterns.emotional_dysregulation += 3;
  if (tier1Responses.q21_problem_solving_spiral === 'fail_worthless_brilliant') patterns.all_or_nothing_thinking += 2;
  if (tier1Responses.q21_problem_solving_spiral === 'fail_worthless_brilliant') patterns.perfectionism += 1;

  return patterns;
}

export { tier1Questions, selectTier1Questions, detectPatterns };