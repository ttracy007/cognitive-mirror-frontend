# Claude Code Prompts - Frontend

> **Executable Prompts**: Copy these directly into Claude Code for each implementation step

**Project:** Cognitive Mirror Frontend  
**Location:** `cognitive-mirror-frontend`  
**Implementation Sequence:** `./IMPLEMENTATION-SEQUENCE.md`

---

## 🚨 BEFORE YOU START

1. **Wait for Backend Sync Point 2.4** - Backend must notify you they're ready
2. **Check Status File** - Update `IMPLEMENTATION-STATUS-FRONTEND.md` after each step
3. **Test After Each Step** - Don't proceed until current step works
4. **Commit After Each Step** - Use commit messages from sequence doc

---

## PROMPT 3.1: Update OnboardingContainer to Fetch from Backend

```
I need you to update the OnboardingContainer component to fetch questions from the backend API instead of using static questions.

CONTEXT:
The backend team has implemented framework-based Tier 1 questions (7 questions instead of 21) and we need to fetch these dynamically.

TASK:
Update file: `src/components/Onboarding/OnboardingContainer.jsx`

CHANGES NEEDED:

1. ADD NEW FUNCTION - fetchTier1Questions:

```javascript
const fetchTier1Questions = async () => {
  try {
    setIsLoading(true);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
    const response = await fetch(`${backendUrl}/api/onboarding/v1/tier1/questions/${userId}`);
    const data = await response.json();
    
    if (data.success) {
      setCurrentTierQuestions(data.questions);
    } else {
      console.error('Failed to fetch Tier 1 questions:', data.error);
      // Handle error - show error message to user
    }
  } catch (error) {
    console.error('Error fetching Tier 1 questions:', error);
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

2. ADD useEffect TO TRIGGER FETCH:

```javascript
useEffect(() => {
  if (currentTier === 1 && userId) {
    fetchTier1Questions();
  }
}, [currentTier, userId]);
```

3. KEEP EXISTING FUNCTIONS (DO NOT MODIFY):
- `submitTier1()` - Already works correctly
- `submitTier2()` - Already works correctly
- `submitTier3()` - Already works correctly

These submission handlers already work and should not be changed.

TESTING REQUIREMENTS:

After implementing, test these scenarios:

Test 1: Questions Load
1. Start onboarding
2. Click "Let's Go"
3. Verify Tier 1 loads
4. Count questions - should be 7 (not 21)
5. Check console for any errors

Test 2: Q2 Age Input
1. Navigate to Q2
2. Verify NUMBER INPUT field appears (not dropdown)
3. Type age: 28
4. Verify bracket auto-selects: "26-35 (supposed to have it together by now)"
5. Verify value is captured

Test 3: Q4 Nested Follow-ups
1. Navigate to Q4: Kitchen sponge question
2. Select "A tortured political prisoner"
3. Verify follow-up question appears
4. Select Option 2: "Ugh, I'm disgusting/I'm a mess"
5. Verify both answers are captured

Test 4: Q7 Self-Report
1. Navigate to Q7
2. Verify all 4 options visible:
   - Tip top - couldn't be better
   - Doing fine - the usual ups and downs
   - Hanging on by a thread
   - Stop asking me how I'm doing - I hate that question
3. Select "Tip top"
4. Verify selection captured
5. Submit Tier 1
6. Verify transition to Tier 2

VERIFICATION CHECKLIST:
- [ ] Questions fetch from backend on Tier 1
- [ ] Exactly 7 questions appear (not 21)
- [ ] Q2 shows number input
- [ ] Q4 shows nested follow-ups
- [ ] Q7 captures self-report
- [ ] Tier 1 submission still works
- [ ] No console errors

ERROR HANDLING:
If backend is not available, show user-friendly message:
"Unable to load questions. Please check your connection and try again."

COMMIT MESSAGE: "feat: fetch onboarding questions from backend API"

After completing, update IMPLEMENTATION-STATUS-FRONTEND.md Step 3.1 as complete.
```

---

## PROMPT 3.2: Remove Midpoint Check Logic

```
I need you to remove the legacy midpoint check system that interrupts the onboarding flow.

CONTEXT:
The midpoint check was part of the old system. The new framework goes directly from Tier 1 → Tier 2 → Tier 3 → Voice Selection without interruption.

TASK:
Remove midpoint check logic from onboarding components.

FILES TO UPDATE:

1. FILE: `src/components/Onboarding/QuestionData.js`

REMOVE this entire object:
```javascript
export const MID_POINT_CHECK = {
  message: "Hey, quick check—how's this feeling...",
  continueButton: "Let's keep going",
  skipButton: "I'm ready to dive in"
};
```

2. FILE: `src/components/Onboarding/OnboardingContainer.jsx`

FIND AND REMOVE:

a) State declaration:
```javascript
const [currentStep, setCurrentStep] = useState('opening');
```

b) Midpoint render block (find and delete entire block):
```javascript
if (currentStep === 'midpoint') {
  return (
    <div className="onboarding-frame midpoint">
      <h2>{MID_POINT_CHECK.message}</h2>
      <button onClick={() => handleMidPointChoice('continue')}>
        {MID_POINT_CHECK.continueButton}
      </button>
      <button onClick={() => handleMidPointChoice('skip')}>
        {MID_POINT_CHECK.skipButton}
      </button>
    </div>
  );
}
```

c) Handler function:
```javascript
const handleMidPointChoice = (choice) => {
  // Delete entire function
};
```

d) Any references to 'midpoint' step in conditional logic

EXPECTED BEHAVIOR AFTER REMOVAL:

Flow should be:
1. Opening Frame
2. Tier 1 Questions (7 questions)
3. Tier 2 Questions (Clinical questions)
4. Tier 3 Questions (Priority)
5. Voice Selection

No interruptions, no midpoint check.

TESTING REQUIREMENTS:

Test 1: Flow Progression
1. Start onboarding
2. Complete Tier 1 (7 questions)
3. Verify goes directly to Tier 2 (no midpoint screen)
4. Complete Tier 2
5. Verify goes directly to Tier 3
6. Complete Tier 3
7. Verify goes directly to Voice Selection

Test 2: UI Verification
1. Run through entire flow
2. Confirm no midpoint UI appears anywhere
3. Check console for no warnings about missing MID_POINT_CHECK
4. Check console for no broken references

VERIFICATION CHECKLIST:
- [ ] MID_POINT_CHECK removed from QuestionData.js
- [ ] currentStep state removed
- [ ] Midpoint render block removed
- [ ] handleMidPointChoice function removed
- [ ] No midpoint screen appears during flow
- [ ] Flow goes: Tier 1 → Tier 2 → Tier 3 → Voice Selection
- [ ] No console errors
- [ ] No console warnings

COMMIT MESSAGE: "refactor: remove legacy midpoint check system"

After completing, update IMPLEMENTATION-STATUS-FRONTEND.md Step 3.2 as complete.
```

---

## PROMPT 3.3: Fix VoiceSelection Endpoint + Add Inline Response

```
I need you to fix the VoiceSelection component to use the correct endpoint and add an inline response feature.

CONTEXT:
The voice preview endpoint has changed, and we want to allow users to respond to the voice preview before starting their first journal entry.

TASK:
Update file: `src/components/Onboarding/VoiceSelection.jsx`

CHANGES NEEDED:

1. FIX ENDPOINT URL:

FIND this line:
```javascript
const endpoint = '/api/voice-previews/generate';
```

CHANGE to:
```javascript
const endpoint = '/api/onboarding/v1/voice-previews/generate';
```

2. ADD NEW STATE:

Add these state variables at the top of the component:
```javascript
const [inlineResponse, setInlineResponse] = useState('');
const [showInlineInput, setShowInlineInput] = useState(false);
```

3. ADD INLINE RESPONSE TEXTAREA:

Add this component AFTER the voice preview cards, but BEFORE the action buttons:

```javascript
{selectedVoice && (
  <div className="inline-response-section">
    <p className="inline-prompt">
      Want to respond to {selectedVoice === 'tony_d' ? 'Tony D' : selectedVoice === 'clara' ? 'Clara' : 'Marcus'}? 
      <span className="inline-optional">(Optional - you can skip and start fresh)</span>
    </p>
    <textarea
      className="inline-response-input"
      placeholder={`Respond to ${selectedVoice === 'tony_d' ? 'Tony D' : selectedVoice === 'clara' ? 'Clara' : 'Marcus'}'s insight, or click "Start Journaling" to begin fresh...`}
      value={inlineResponse}
      onChange={(e) => setInlineResponse(e.target.value)}
      rows={4}
    />
  </div>
)}
```

4. UPDATE handleJournalNow FUNCTION:

FIND the existing function and UPDATE to:
```javascript
const handleJournalNow = () => {
  if (selectedVoice) {
    const selectedPreview = voiceResponses?.[selectedVoice];
    onVoiceSelected(selectedVoice, 'journal-now', selectedPreview, inlineResponse);
  }
};
```

5. ADD STYLING (optional - add to CSS file):

```css
.inline-response-section {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.inline-prompt {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.inline-optional {
  font-size: 14px;
  color: #666;
  font-style: italic;
  margin-left: 8px;
}

.inline-response-input {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.inline-response-input:focus {
  outline: none;
  border-color: #4A90E2;
}
```

6. UPDATE PARENT COMPONENT (OnboardingContainer.jsx):

FIND handleVoiceSelected and UPDATE to accept 4 parameters:
```javascript
const handleVoiceSelected = (voice, flowChoice, voicePreview = null, inlineResponse = null) => {
  setSelectedVoice(voice);

  if (flowChoice === 'journal-now') {
    handleSubmitAndStartJournal(voice, voicePreview, inlineResponse);
  } else if (flowChoice === 'explore-further') {
    handleExploreVoiceFurther(voice);
  }
};
```

UPDATE handleSubmitAndStartJournal to pass inlineResponse:
```javascript
const handleSubmitAndStartJournal = async (voice, voicePreview, inlineResponse) => {
  try {
    setIsSubmitting(true);
    await handleSubmit();
    
    onComplete({
      selectedVoice: voice,
      voicePreview: voicePreview,
      inlineResponse: inlineResponse,  // NEW: Pass inline response
      startJournalImmediately: true
    });
  } catch (error) {
    console.error('Error submitting onboarding:', error);
    // Handle error
  } finally {
    setIsSubmitting(false);
  }
};
```

TESTING REQUIREMENTS:

Test 1: Endpoint Fix
1. Complete Tier 1, 2, 3
2. Reach Voice Selection screen
3. Verify voice previews load (check Network tab for correct endpoint)
4. Verify 3 previews appear
5. Verify no 404 errors

Test 2: Inline Response UI
1. Don't select a voice yet
2. Verify inline textarea does NOT appear
3. Select Tony D
4. Verify inline textarea appears
5. Verify prompt says "Want to respond to Tony D?"
6. Verify placeholder text appropriate

Test 3: Inline Response Functionality
1. Select a voice
2. Type response in textarea: "This really resonates with me"
3. Click "Start Journaling"
4. Verify redirect happens
5. Verify inline response is passed to journal (check in parent onComplete)

Test 4: Optional Inline Response
1. Select a voice
2. Leave textarea empty
3. Click "Start Journaling"
4. Verify it works (inline response is empty string, not null)
5. Verify redirect happens

VERIFICATION CHECKLIST:
- [ ] Endpoint URL updated
- [ ] Voice previews load from correct endpoint
- [ ] Inline response state added
- [ ] Inline textarea component added
- [ ] Textarea appears only when voice selected
- [ ] Can type in textarea
- [ ] Can leave textarea empty
- [ ] inlineResponse passed to parent
- [ ] Parent receives inlineResponse correctly
- [ ] No console errors

COMMIT MESSAGE: "feat: add inline response to voice selection"

After completing, update IMPLEMENTATION-STATUS-FRONTEND.md Step 3.3 as complete.
```

---

## PROMPT 3.4: Update QuestionData.js to Proxy Backend

```
I need you to refactor QuestionData.js to remove all static question definitions and proxy to the backend API.

CONTEXT:
All questions now come from the backend. QuestionData.js should only contain the opening/closing frames and a proxy function.

TASK:
Refactor file: `src/components/Onboarding/QuestionData.js`

COMPLETE NEW FILE STRUCTURE:

```javascript
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
```

WHAT TO REMOVE:

Remove these entirely (all static question arrays):
- `TIER_1_QUESTIONS` array
- `TIER_2_QUESTIONS` array
- `TIER_3_QUESTIONS` array
- Any other question arrays or objects

WHAT TO KEEP:

Keep only:
- `OPENING_FRAME` object
- `CLOSING_FRAME` object
- New `getQuestionsForTier()` function (add this)

UPDATE OnboardingContainer.jsx IF NEEDED:

If OnboardingContainer currently imports static questions, update to use the proxy function:

```javascript
// BEFORE:
import { TIER_1_QUESTIONS, TIER_2_QUESTIONS, TIER_3_QUESTIONS } from './QuestionData';

// AFTER:
import { OPENING_FRAME, CLOSING_FRAME, getQuestionsForTier } from './QuestionData';
```

And use the proxy function in useEffect or wherever questions are loaded:

```javascript
useEffect(() => {
  if (currentTier && userId) {
    fetchQuestionsForCurrentTier();
  }
}, [currentTier, userId]);

const fetchQuestionsForCurrentTier = async () => {
  try {
    setIsLoading(true);
    const questions = await getQuestionsForTier(currentTier, userId);
    setCurrentTierQuestions(questions);
  } catch (error) {
    console.error('Error loading questions:', error);
    // Show error to user
  } finally {
    setIsLoading(false);
  }
};
```

TESTING REQUIREMENTS:

Test 1: Proxy Function Works
1. Start onboarding
2. Verify Tier 1 questions load
3. Complete Tier 1
4. Verify Tier 2 questions load
5. Complete Tier 2
6. Verify Tier 3 questions load
7. Check Network tab - verify correct endpoints called

Test 2: Error Handling
1. Stop backend server (to simulate network failure)
2. Start onboarding
3. Verify error is caught
4. Verify user-friendly error message appears
5. Verify console shows error details
6. Restart backend
7. Verify questions load correctly

Test 3: Code Cleanup
1. Search entire file for any remaining static question arrays
2. Verify only OPENING_FRAME, CLOSING_FRAME, and getQuestionsForTier remain
3. Count lines removed (should be significant reduction)

VERIFICATION CHECKLIST:
- [ ] All static question arrays removed
- [ ] OPENING_FRAME kept
- [ ] CLOSING_FRAME kept
- [ ] getQuestionsForTier() function added
- [ ] Function calls correct backend endpoints
- [ ] Function handles errors gracefully
- [ ] Tier 1 questions load
- [ ] Tier 2 questions load
- [ ] Tier 3 questions load
- [ ] No console errors
- [ ] File size significantly reduced

LINES OF CODE IMPACT:
Estimated lines removed: ~500+ lines (all static question definitions)
Estimated lines added: ~30 lines (proxy function)
Net reduction: ~470+ lines

COMMIT MESSAGE: "refactor: proxy questions to backend API"

After completing, update IMPLEMENTATION-STATUS-FRONTEND.md Step 3.4 as complete.
```

---

## TESTING PROMPT: End-to-End Frontend Flow

```
I need you to help me run a complete end-to-end test of the frontend onboarding flow.

CONTEXT:
Backend is ready. All frontend changes are complete. Now we need to verify the entire flow works correctly.

TEST SCENARIO:
Complete user journey from start to journal redirect.

STEP-BY-STEP TEST:

**STEP 1: Opening Frame**
1. Navigate to onboarding start page
2. Verify opening frame displays:
   - Title: "Three Questions, Three Layers"
   - Message about going deep in stages
   - "Let's Go" button visible
3. Click "Let's Go"
4. Verify transition to Tier 1

**STEP 2: Tier 1 (7 Questions)**
1. Count questions - should be exactly 7
2. Q1: Gender
   - Verify 4 options visible
   - Select "Female"
   - Verify selection captured
3. Q2: Age
   - Verify NUMBER INPUT (not dropdown)
   - Type: 28
   - Verify bracket auto-selects: "26-35 (supposed to have it together by now)"
4. Q3: AI Trust
   - Select: "Curious experimenter"
5. Q4: Kitchen Sponge
   - Select: "A tortured political prisoner"
   - Verify follow-up appears
   - Select: "Ugh, I'm disgusting/I'm a mess"
6. Q5: Texting Back
   - Select: "Hold down to read without showing it read, stress until I respond"
7. Q6: Problem-Solving Spiral
   - Select: "Fail repeatedly, think I'm worthless, then solve it and feel brilliant"
8. Q7: Self-Check-In
   - Verify 4 options visible
   - Select: "Tip top - couldn't be better"
9. Click Submit
10. Verify transition to Tier 2 (no midpoint check!)

**STEP 3: Tier 2 (Clinical Questions)**
1. Verify questions render
2. Find a question about sleep or worry
3. Type response (50+ words): 
   "I wake up at 3am worried I said something stupid at work and can't get back to sleep. I replay the conversation over and over. Everyone around me is getting promoted and I'm still in the same job."
4. Complete other Tier 2 questions (can be brief)
5. Click Submit
6. Verify transition to Tier 3

**STEP 4: Tier 3 (Priority)**
1. Verify priority question appears
2. Type: "I want to be more productive"
3. Complete any other Tier 3 questions
4. Click Submit
5. Verify transition to Voice Selection

**STEP 5: Voice Selection**
1. Verify 3 voice previews appear:
   - Tony D
   - Clara
   - Marcus Aurelius
2. Check preview quality:
   - Each preview 100-150 words? ✓
   - References "productive" or "productivity"? ✓
   - References user's words (3am, worried, replay)? ✓
   - NO quotation marks around user's words? ✓
3. Select Tony D
4. Verify inline response textarea appears
5. Verify prompt says "Want to respond to Tony D?"
6. Type in textarea: "This makes sense. I never connected the sleep thing to productivity."
7. Click "Start Journaling"
8. Verify redirect to journal

**STEP 6: Journal Integration**
1. Verify landed on journal/timeline page
2. If inline response provided: Verify it appears as first entry
3. Verify Tony D is the active voice
4. Check console - should be NO errors throughout entire flow

**NETWORK TAB VERIFICATION:**

Check browser Network tab for these requests:

1. GET `/api/onboarding/v1/tier1/questions/:userId`
   - Status: 200
   - Response: 7 questions

2. POST `/api/onboarding/v1/tier1/submit`
   - Status: 200
   - Payload includes all answers

3. POST `/api/onboarding/v1/tier2/submit`
   - Status: 200
   - Payload includes golden keys

4. POST `/api/onboarding/v1/tier3/submit`
   - Status: 200
   - Payload includes priority

5. POST `/api/onboarding/v1/voice-previews/generate`
   - Status: 200
   - Response: 3 voice previews

**CONSOLE ERROR CHECK:**

Open browser console and verify:
- [ ] No React errors
- [ ] No network errors
- [ ] No undefined variable errors
- [ ] No warning messages
- [ ] No 404 errors
- [ ] No CORS errors

**DOCUMENT RESULTS:**

Create checklist in IMPLEMENTATION-STATUS-FRONTEND.md Step 4.1:

```
✓ Opening frame displayed correctly
✓ Tier 1: 7 questions loaded
✓ Tier 1: Q2 number input works
✓ Tier 1: Q4 nested follow-ups work
✓ Tier 1: Q7 self-report captured
✓ Tier 1: Submission successful
✓ NO midpoint check appeared
✓ Tier 2: Questions loaded
✓ Tier 2: Golden key submitted
✓ Tier 2: Submission successful
✓ Tier 3: Questions loaded
✓ Tier 3: Priority submitted
✓ Tier 3: Submission successful
✓ Voice previews loaded
✓ All 3 previews render correctly
✓ Previews meet quality requirements
✓ Inline response textarea appears
✓ Inline response captured
✓ Redirect to journal successful
✓ No console errors throughout
```

If ANY step fails:
1. Document the failure
2. Take screenshot
3. Note error message
4. Identify which component/function is responsible
5. Update status file with issue
6. Fix issue
7. Re-run full test

After completing full successful test, update IMPLEMENTATION-STATUS-FRONTEND.md Step 4.1 as complete.
```

---

## 🚨 TROUBLESHOOTING PROMPTS

### If Questions Don't Load

```
Questions are not loading from the backend. Help me debug.

ISSUE: [Describe what's happening]

DEBUG STEPS:
1. Check browser console for errors
2. Check Network tab - is the request being made?
3. What's the request URL?
4. What's the response status code?
5. What's the response body?

Show me:
- The fetch call in OnboardingContainer
- The endpoint URL being used
- Any error messages
- Network tab screenshot if possible

Let's identify if this is a frontend issue (wrong endpoint, wrong method) or backend issue (endpoint not responding).
```

---

### If Inline Response Doesn't Appear

```
The inline response textarea is not appearing when I select a voice. Help me debug.

ISSUE: Selected a voice but textarea didn't appear

DEBUG STEPS:
1. Check if selectedVoice state is being set
2. Check the conditional rendering logic
3. Check if the component is re-rendering after selection
4. Check for any CSS that might be hiding it

Show me:
- The handleVoiceSelect function
- The conditional rendering block for inline response
- Console.log the selectedVoice state
- Any CSS that might affect visibility

Let's figure out why the textarea isn't showing.
```

---

### If Midpoint Check Still Appears

```
The midpoint check is still appearing even though I removed the code. Help me find where it's coming from.

ISSUE: Midpoint check still shows during flow

DEBUG STEPS:
1. Search entire project for "midpoint" or "MID_POINT"
2. Check if code was removed from correct file
3. Check if there are multiple copies of OnboardingContainer
4. Check if old code is cached

Search for:
- "midpoint"
- "MID_POINT_CHECK"
- "handleMidPointChoice"

Show me all files that contain these terms.
```

---

### If Voice Previews Return 404

```
Voice preview endpoint is returning 404. Help me fix the endpoint URL.

ISSUE: POST /api/voice-previews/generate returns 404

DEBUG STEPS:
1. Check VoiceSelection.jsx - what's the current endpoint URL?
2. Check if it matches backend route: `/api/onboarding/v1/voice-previews/generate`
3. Check if REACT_APP_BACKEND_URL is set correctly
4. Check Network tab for full URL being called

Show me:
- Current endpoint URL in VoiceSelection.jsx
- REACT_APP_BACKEND_URL value
- Full URL from Network tab

Let's correct the endpoint URL.
```

---

**End of Frontend Prompts**

*Use these prompts in sequence with Claude Code to implement the complete frontend integration.*