// src/components/Onboarding/QuestionData.js

export const OPENING_FRAME = {
  title: "Let's Get to Know You",
  message: "Hey there. Before we dive in, I'd love to get to know you a bit. Think of this as a conversation with a friend who's genuinely curious about how you're doing. No judgment, no pressure—just honest reflection. Sound good?"
};

export const CLOSING_FRAME = {
  title: "You're All Set",
  message: "Thanks for sharing all that. I'll remember what matters most to you, and we can keep coming back to it as things shift. You're not locked into anything—this is just a starting point. Ready to dive in?"
};

export const MID_POINT_CHECK = {
  message: "Hey, quick check—how's this feeling so far? I've got a few more questions that could help us get a fuller picture, but if something's already pressing on your mind and you'd rather just dive into it, we can do that too. What sounds better—keep going with me, or jump straight into what matters most?",
  continueButton: "Let's keep going",
  skipButton: "I'm ready to dive in"
};

export const ONBOARDING_QUESTIONS = [
  {
    id: 'q1_sleep',
    number: 1,
    question: "Let's start simple: How's your sleep lately? Do you wake up feeling rested, or is it more of a struggle?",
    type: 'scale_with_notes',
    scale: {
      min: 1,
      max: 10,
      labels: {
        1: 'Terrible',
        5: 'Okay',
        10: 'Great'
      }
    },
    placeholder: "Any specific issues? (e.g., 'Wake up at 3am', 'Can't fall asleep')"
  },

  {
    id: 'q2_stress',
    number: 2,
    question: "What about stress—are you feeling it right now, or are things relatively calm?",
    type: 'select_with_notes',
    options: [
      { value: 'stress_free', label: 'Pretty stress-free' },
      { value: 'low', label: 'A little stressed' },
      { value: 'moderate', label: 'Moderate stress' },
      { value: 'high', label: 'High stress' },
      { value: 'overwhelming', label: 'Completely overwhelmed' }
    ],
    followUpTriggers: ['moderate', 'high', 'overwhelming'],
    followUpQuestion: "What's the main thing weighing on you?",
    placeholder: "What's causing the stress?"
  },

  {
    id: 'q3_focus',
    number: 3,
    question: "When you're trying to get something done, does your mind cooperate, or does it feel like you're wrestling with it?",
    type: 'boolean_with_notes',
    options: [
      { value: true, label: "It's a struggle / Mind wanders" },
      { value: false, label: 'I can usually focus pretty well' }
    ],
    placeholder: "What happens when you try to focus?"
  },

  {
    id: 'q4_unspoken',
    number: 4,
    question: "Is there something on your mind that you don't talk about much? Something that kind of sits there in the background?",
    type: 'boolean_with_notes',
    options: [
      { value: true, label: 'Yes, there is' },
      { value: false, label: 'Not really' }
    ],
    placeholder: "You don't have to share details if you don't want to, but what is it about?"
  },

  {
    id: 'q5_relationships',
    number: 5,
    question: "Are there people in your life—past or present—who still take up space in your thoughts? Not necessarily in a bad way, just... they're there.",
    type: 'tags_with_notes',
    placeholder: "Who? (e.g., 'ex-partner', 'father', 'old friend')",
    notesPlaceholder: "What's the nature of those thoughts?"
  },

  // MID-POINT CHECK HAPPENS AFTER Q5

  {
    id: 'q6_purpose',
    number: 6,
    question: "Is there something in your life right now that genuinely excites you or gives you a sense of meaning? Could be big or small.",
    type: 'boolean_with_notes',
    options: [
      { value: true, label: 'Yes, definitely' },
      { value: false, label: 'Not really / Not sure' }
    ],
    placeholder: "What is it?"
  },

  {
    id: 'q7_self_talk',
    number: 7,
    question: "When things don't go the way you want, what's the voice in your head like? Is it more 'Hey, it's okay, try again' or more 'Ugh, you always mess this up'?",
    type: 'select_with_notes',
    options: [
      { value: 'compassionate', label: "Pretty kind / 'It's okay'" },
      { value: 'neutral', label: 'Somewhere in between' },
      { value: 'critical', label: "Hard on myself / 'I always mess up'" }
    ],
    placeholder: "Anything specific that voice says?"
  },

  {
    id: 'q8_energy',
    number: 8,
    question: "On a typical day, do you wake up with a sense of 'Let's do this,' or is it more like 'Here we go again...'?",
    type: 'select_with_notes',
    options: [
      { value: 'excited', label: "Let's do this!" },
      { value: 'neutral', label: "It's fine, just another day" },
      { value: 'low', label: "Here we go again..." },
      { value: 'dread', label: 'Genuine dread' }
    ],
    placeholder: "What affects your energy most?"
  },

  {
    id: 'q9_support',
    number: 9,
    question: "Do you have people you can talk to about what's going on, or does it feel like you're mostly handling things solo?",
    type: 'select_with_notes',
    options: [
      { value: 'strong', label: 'I have good support' },
      { value: 'some', label: 'Some people, but limited' },
      { value: 'minimal', label: 'Mostly handle it alone' }
    ],
    placeholder: "Who do you talk to, if anyone?"
  },

  {
    id: 'q10_priority',
    number: 10,
    question: "Of everything we just touched on—sleep, stress, relationships, focus, whatever—what feels like the thing you'd most want to work through right now?",
    type: 'text_area',
    placeholder: "No wrong answer. What matters most to you right now?",
    required: true
  }
];