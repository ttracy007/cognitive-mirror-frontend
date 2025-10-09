# Cognitive Mirror - 3-Tier Onboarding Implementation Sequence

> **Master Implementation Guide**: Complete build plan for replacing legacy onboarding with framework-based system

## ⚠️ CRITICAL RULES

1. **NEVER skip a step** - Each step has dependencies
2. **STOP at SYNC POINTS** - Other team must confirm before proceeding
3. **UPDATE STATUS after each step** - Mark checkboxes in status files
4. **Reference framework doc** - `./Cognitive Mirror - Complete Onboarding Framework.md`
5. **Backup before replace** - All legacy code goes to `backup files/onboarding-backup/`

---

## 📚 Document Structure

This implementation has three coordinated documents:

- **IMPLEMENTATION-SEQUENCE.md** (this file) - Master plan
- **CLAUDE-CODE-PROMPTS-BACKEND.md** - Executable backend prompts
- **CLAUDE-CODE-PROMPTS-FRONTEND.md** - Executable frontend prompts
- **IMPLEMENTATION-STATUS-BACKEND.md** - Backend progress tracker
- **IMPLEMENTATION-STATUS-FRONTEND.md** - Frontend progress tracker

---

## Phase 1: Backup & Database Prep

### ✅ Step 1.1: Backup Legacy Onboarding Files [BACKEND]

**Owner:** Backend Team (Claude Code)  
**Location:** `cognitive-mirror-backend`

**Task:** Move existing onboarding files to backup folder

**Files to backup:**
```bash
# Create backup directory
mkdir -p "backup files/onboarding-backup"

# Move files
mv src/routes/onboarding-3tier-v1.js "backup files/onboarding-backup/onboarding-3tier-v1-BACKUP.js"
mv src/routes/voice-previews-v2.js "backup files/onboarding-backup/voice-previews-v2-BACKUP.js"
```

**Verification:**
- [ ] Files exist in `backup files/onboarding-backup/`
- [ ] Original files removed from `src/routes/`
- [ ] Git commit: "backup: archive legacy onboarding system"

**🚨 DO NOT PROCEED until backup confirmed**

---

### ✅ Step 1.2: Add Matrix Mapping Column [YOU - SUPABASE]

**Owner:** You (Manual Supabase Execution)  
**Location:** Supabase SQL Editor (Dev Database)

**Task:** Add `matrix_mapping` column to store matrix position data

**SQL to execute:**
```sql
-- Add matrix_mapping column to user_onboarding_profile
ALTER TABLE user_onboarding_profile 
ADD COLUMN IF NOT EXISTS matrix_mapping jsonb;

-- Add index for matrix queries
CREATE INDEX IF NOT EXISTS idx_matrix_mapping_gin 
ON user_onboarding_profile USING gin (matrix_mapping);

-- Verify column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_onboarding_profile' 
AND column_name = 'matrix_mapping';
```

**Verification:**
- [ ] SQL executed successfully
- [ ] Column `matrix_mapping jsonb` exists
- [ ] Index created successfully
- [ ] Screenshot of successful execution saved

**Expected result:**
```
column_name      | data_type
matrix_mapping   | jsonb
```

**🚨 CHECKPOINT:** Confirm column exists before Step 2.1

---

## Phase 2: Backend - Build Framework System

### ✅ Step 2.1: Build Tier 1 Framework System [BACKEND]

**Owner:** Backend Team (Claude Code)  
**Location:** `cognitive-mirror-backend/src/routes/`

**Task:** Create new `onboarding-3tier-framework.js` with framework-compliant Tier 1

**What to build:**

1. **Framework Tier 1 Questions (7 questions, not 21)**
   - Q1: Gender (with tone indicators)
   - Q2: Age (NUMBER INPUT + brackets)
   - Q3: AI Trust
   - Q4: Kitchen Sponge (NESTED with follow-ups)
   - Q5: Texting Back
   - Q6: Problem-Solving Spiral
   - Q7: Self-Check-In (MATRIX TRIGGER)

2. **Type A/B/C Pattern Detection**
   - Type A: Behavioral (answer-derived, 70-90% confidence)
   - Type B: Demographic tendencies (50-70% base rate, requires validation)
   - Type C: Tone preferences (left/right leaning)

3. **Pattern Object Structure**
```javascript
{
  pattern: "self_criticism",
  pattern_type: "behavioral",
  initial_confidence: 0.90,
  evidence_required: "alignment",
  use_threshold: 0.75
}
```

**Reference:** Framework doc pages 38-42 (Tier 1 Questions), pages 2-4 (Pattern Type Taxonomy)

**Deliverable:** `src/routes/onboarding-3tier-framework.js` with:
- `TIER1_QUESTIONS_FRAMEWORK` array
- `detectTier1PatternsFramework()` function
- `getTier1QuestionsHandler()` route handler
- `submitTier1Handler()` route handler

**🔄 SYNC POINT 2.1:** 
- Update `IMPLEMENTATION-STATUS-BACKEND.md` 
- Commit: "feat: implement framework Tier 1 system"

---

### ✅ Step 2.2: Build Matrix Mapping System [BACKEND]

**Owner:** Backend Team (Claude Code)  
**Location:** `cognitive-mirror-backend/src/routes/onboarding-3tier-framework.js`

**Task:** Implement complete matrix mapping logic

**What to build:**

1. **Q7 Self-Report Capture**
   - Store in `tier1_responses.q7_self_report`
   - Values: "tip_top" | "doing_fine" | "hanging_thread" | "stop_asking"

2. **Pattern Score Calculator**
```javascript
function calculatePatternScore(tier1Patterns, tier2Validation, tier2GoldenKeys) {
  let score = 0;
  
  // Count behavioral patterns (Type A)
  const behavioral = tier1Patterns.filter(p => 
    p.pattern_type === "behavioral" && 
    p.initial_confidence >= 0.75
  );
  score += behavioral.length;
  
  // Count validated tendencies (Type B)
  const validated = tier2Validation.filter(t => 
    t.validated === true && 
    t.posterior_confidence >= 0.75
  );
  score += validated.length;
  
  // Count high-severity golden keys
  const highSeverity = tier2GoldenKeys.filter(gk => 
    gk.emotional_intensity === "high"
  );
  score += highSeverity.length * 0.5;
  
  return score;
}
```

3. **Pattern Level Classification**
   - LOW: 0-2 (minimal distress)
   - MEDIUM: 3-4 (moderate distress)
   - HIGH: 5+ (significant distress)

4. **Matrix Position Calculator**
```javascript
function calculateMatrixPosition(q7SelfReport, patternLevel) {
  const selfReportValues = {
    "tip_top": 1,
    "doing_fine": 2,
    "hanging_thread": 3,
    "stop_asking": 2.5
  };
  
  const patternLevelValues = {
    "LOW": 1,
    "MEDIUM": 2,
    "HIGH": 3
  };
  
  const discrepancy = selfReportValues[q7SelfReport] - patternLevelValues[patternLevel];
  
  let interpretation;
  if (discrepancy >= 1.5) interpretation = "minimizing";
  else if (discrepancy <= -1.5) interpretation = "catastrophizing";
  else if (Math.abs(discrepancy) <= 0.5) interpretation = "aligned";
  else interpretation = "slight_gap";
  
  return {
    self_report: q7SelfReport,
    pattern_level: patternLevel,
    interpretation: interpretation
  };
}
```

5. **Voice Strategy Selector**
```javascript
function selectVoiceStrategy(matrixPosition, goldenKeys, priority) {
  const { interpretation, pattern_level } = matrixPosition;
  
  if (interpretation === "minimizing" && pattern_level === "HIGH") {
    return {
      strategy: "gentle_reality_check",
      surface_gap: true,
      approach: "insight_not_accusation"
    };
  }
  
  if (interpretation === "catastrophizing" && pattern_level === "LOW") {
    return {
      strategy: "strength_based_reframe",
      surface_gap: true,
      approach: "validate_then_redirect"
    };
  }
  
  if (interpretation === "aligned") {
    return {
      strategy: "validate_and_deepen",
      surface_gap: false,
      approach: "connect_dots_they_havent_connected"
    };
  }
  
  if (matrixPosition.self_report === "stop_asking") {
    return {
      strategy: "respect_then_engage",
      surface_gap: false,
      approach: "patterns_without_judgment"
    };
  }
  
  return {
    strategy: "causal_chain_insight",
    surface_gap: false,
    approach: "connect_priority_to_patterns"
  };
}
```

**Reference:** Framework doc pages 12-20 (Matrix Mapping Framework)

**Deliverable:** Functions in `onboarding-3tier-framework.js`:
- `calculatePatternScore()`
- `categorizePatternScore()`
- `calculateMatrixPosition()`
- `selectVoiceStrategy()`

**Database Update:** After Tier 3 submission, store:
```javascript
await supabase
  .from('user_onboarding_profile')
  .update({
    matrix_mapping: {
      q7_self_report: "tip_top",
      pattern_score: 6.5,
      pattern_level: "HIGH",
      discrepancy: "minimizing",
      matrix_position: { 
        self_report: "tip_top", 
        pattern_level: "HIGH", 
        interpretation: "minimizing" 
      },
      voice_strategy: { 
        strategy: "gentle_reality_check", 
        surface_gap: true 
      }
    }
  })
  .eq('user_id', user_id);
```

**🔄 SYNC POINT 2.2:**
- Update `IMPLEMENTATION-STATUS-BACKEND.md`
- Commit: "feat: implement matrix mapping system"

---

### ✅ Step 2.3: Integrate Matrix with Voice Previews [BACKEND]

**Owner:** Backend Team (Claude Code)  
**Location:** `cognitive-mirror-backend/src/routes/voice-previews-framework.js`

**Task:** Create new voice preview system with matrix-driven strategy

**What to build:**

1. **Fetch Matrix Data**
```javascript
async function generateVoicePreviewsHandler(req, res) {
  const { user_id } = req.body;
  
  // Fetch complete profile including matrix_mapping
  const { data: profile } = await supabase
    .from('user_onboarding_profile')
    .select('user_stated_priority, tier1_patterns, tier2_golden_keys, matrix_mapping')
    .eq('user_id', user_id)
    .single();
    
  const matrixData = profile.matrix_mapping;
  const strategy = matrixData.voice_strategy;
  
  // Generate previews using strategy
  const previews = await generateThreeVoicePreviewsWithStrategy(
    profile,
    strategy
  );
}
```

2. **Strategy-Driven Voice Generation**

**Strategy 1: Gentle Reality Check Template**
```javascript
if (strategy.strategy === "gentle_reality_check") {
  basePrompt = `
You want to ${priority}, but here's what I'm seeing: ${goldenKeySpecifics}. 
That's not a ${surfaceProblem}—that's a ${rootCause}. 
${patternInsight}. 
What if fixing ${priority} actually means addressing ${rootCause} first?
  `;
}
```

**Strategy 2: Strength-Based Reframe Template**
```javascript
if (strategy.strategy === "strength_based_reframe") {
  basePrompt = `
You say you're ${catastrophicSelfReport}, and I hear that it feels ${validate}. 
But here's what I'm also seeing: ${evidenceOfCapability}. 
What if ${realStruggle} isn't about ${perceivedProblem}—
it's about ${gapBetweenCapabilityAndSelfPerception}? 
What would shift if you trusted yourself more?
  `;
}
```

**Strategy 3: Validate and Deepen Template**
```javascript
if (strategy.strategy === "validate_and_deepen") {
  basePrompt = `
You want ${priority}, and you mentioned ${goldenKey}. 
Here's the pattern: ${mechanism}. 
What if ${realIssue} isn't about ${surface}—it's about ${underlyingPattern}? 
${questionAboutBreakingPattern}
  `;
}
```

**Strategy 4: Respect Then Engage Template**
```javascript
if (strategy.strategy === "respect_then_engage") {
  basePrompt = `
${respectDeflection}. 
Here's what I'm noticing about ${priority}: ${patternObservation}. 
${patternInsight}. 
${briefQuestion}
  `;
}
```

3. **Voice-Specific Adaptations**

**Tony D:** Direct, confrontational
```javascript
const tonyDPrompt = applyTonyDStyle(basePrompt, strategy);
// - Blunt declarative statements
// - User's words woven naturally (NO quotation marks)
// - "Here's what's actually happening..."
```

**Clara:** Warm, exploratory
```javascript
const claraPrompt = applyClaraStyle(basePrompt, strategy);
// - "I wonder if..." / "I'm curious about..."
// - Validating language
// - Gentle questions
```

**Marcus:** Stoic, philosophical
```javascript
const marcusPrompt = applyMarcusStyle(basePrompt, strategy);
// - "Consider..." / "Perhaps..."
// - Philosophical observations
// - Ends with wisdom
```

**Reference:** Framework doc pages 30-35 (Voice Preview Templates by Strategy)

**Deliverable:** `src/routes/voice-previews-framework.js` with:
- `generateVoicePreviewsHandler()` with matrix integration
- `generateThreeVoicePreviewsWithStrategy()` function
- Strategy template system
- Voice-specific style adapters

**🔄 SYNC POINT 2.3:**
- Update `IMPLEMENTATION-STATUS-BACKEND.md`
- Commit: "feat: integrate matrix with voice preview generation"

---

### ✅ Step 2.4: Update Route Index [BACKEND]

**Owner:** Backend Team (Claude Code)  
**Location:** `cognitive-mirror-backend/src/routes/index.js`

**Task:** Switch from legacy to framework routes

**Changes:**
```javascript
// BEFORE:
const { setupOnboarding3TierRoutes } = require('./onboarding-3tier-v1');
const { setupVoicePreviewV2Routes } = require('./voice-previews-v2');

// AFTER:
const { setupOnboarding3TierRoutes } = require('./onboarding-3tier-framework');
const { setupVoicePreviewRoutes } = require('./voice-previews-framework');
```

**Verification:**
- [ ] Server starts without errors
- [ ] Routes respond: `GET /api/onboarding/v1/tier1/questions/:user_id`
- [ ] Routes respond: `POST /api/onboarding/v1/voice-previews/generate`

**🔄 SYNC POINT 2.4:**
- Update `IMPLEMENTATION-STATUS-BACKEND.md`
- Commit: "chore: switch to framework-based onboarding routes"
- **NOTIFY FRONTEND TEAM: Backend ready for integration testing**

**🚨 CHECKPOINT:** Backend Phase 2 complete. Frontend can begin Phase 3.

---

## Phase 3: Frontend - Integration Updates

### ✅ Step 3.1: Update OnboardingContainer to Fetch from Backend [FRONTEND]

**Owner:** Frontend Team (Claude Code)  
**Location:** `cognitive-mirror-frontend/src/components/Onboarding/`

**Task:** Replace static questions with backend API calls

**Changes to `OnboardingContainer.jsx`:**

1. **Fetch Tier 1 Questions from Backend**
```javascript
useEffect(() => {
  if (currentTier === 1 && userId) {
    fetchTier1Questions();
  }
}, [currentTier, userId]);

const fetchTier1Questions = async () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
  const response = await fetch(`${backendUrl}/api/onboarding/v1/tier1/questions/${userId}`);
  const data = await response.json();
  
  if (data.success) {
    setCurrentTierQuestions(data.questions);
  }
};
```

2. **Keep Existing Submission Handlers**
   - `submitTier1()` - Already implemented ✅
   - `submitTier2()` - Already implemented ✅
   - `submitTier3()` - Already implemented ✅

**Verification:**
- [ ] Questions load from backend
- [ ] Tier 1 shows 7 questions (not 21)
- [ ] Q2 shows number input
- [ ] Q4 shows nested follow-ups
- [ ] Q7 captures self-report

**🔄 SYNC POINT 3.1:**
- Update `IMPLEMENTATION-STATUS-FRONTEND.md`
- Commit: "feat: fetch onboarding questions from backend API"

---

### ✅ Step 3.2: Remove Midpoint Check Logic [FRONTEND]

**Owner:** Frontend Team (Claude Code)  
**Location:** `cognitive-mirror-frontend/src/components/Onboarding/`

**Task:** Remove legacy midpoint check system

**Files to Update:**

1. **QuestionData.js**
```javascript
// REMOVE:
export const MID_POINT_CHECK = {
  message: "Hey, quick check—how's this feeling...",
  continueButton: "Let's keep going",
  skipButton: "I'm ready to dive in"
};
```

2. **OnboardingContainer.jsx**
```javascript
// REMOVE:
const [currentStep, setCurrentStep] = useState('opening');
// Remove 'midpoint' from step options

// REMOVE midpoint render block
```

**Verification:**
- [ ] No midpoint check appears
- [ ] Questions flow: Tier 1 → Tier 2 → Tier 3 → Voice Selection
- [ ] No errors in console

**🔄 SYNC POINT 3.2:**
- Update `IMPLEMENTATION-STATUS-FRONTEND.md`
- Commit: "refactor: remove legacy midpoint check system"

---

### ✅ Step 3.3: Fix VoiceSelection Endpoint + Add Inline Response [FRONTEND]

**Owner:** Frontend Team (Claude Code)  
**Location:** `cognitive-mirror-frontend/src/components/Onboarding/VoiceSelection.jsx`

**Task:** Update endpoint URL and add inline response textarea

**Changes:**

1. **Fix Endpoint URL**
```javascript
// BEFORE:
const endpoint = '/api/voice-previews/generate';

// AFTER:
const endpoint = '/api/onboarding/v1/voice-previews/generate';
```

2. **Add Inline Response State**
```javascript
const [inlineResponse, setInlineResponse] = useState('');
```

3. **Add Inline Response Textarea**
```javascript
{selectedVoice && (
  <div className="inline-response-section">
    <p className="inline-prompt">
      Want to respond to {getVoiceName(selectedVoice)}? 
      (Optional - you can skip and start fresh)
    </p>
    <textarea
      className="inline-response-input"
      placeholder="Respond to the insight, or click 'Start Journaling' to begin fresh..."
      value={inlineResponse}
      onChange={(e) => setInlineResponse(e.target.value)}
      rows={4}
    />
  </div>
)}
```

4. **Pass Inline Response to Parent**
```javascript
const handleJournalNow = () => {
  if (selectedVoice) {
    const selectedPreview = voiceResponses?.[selectedVoice];
    onVoiceSelected(selectedVoice, 'journal-now', selectedPreview, inlineResponse);
  }
};
```

**Verification:**
- [ ] Voice previews load from correct endpoint
- [ ] Inline textarea appears when voice selected
- [ ] Inline response is optional
- [ ] Response passes to journal component

**🔄 SYNC POINT 3.3:**
- Update `IMPLEMENTATION-STATUS-FRONTEND.md`
- Commit: "feat: add inline response to voice selection"

---

### ✅ Step 3.4: Update QuestionData.js to Proxy Backend [FRONTEND]

**Owner:** Frontend Team (Claude Code)  
**Location:** `cognitive-mirror-frontend/src/components/Onboarding/QuestionData.js`

**Task:** Remove static questions, proxy to backend

**Changes:**
```javascript
// REMOVE all static question arrays
// KEEP only:

export const OPENING_FRAME = {
  title: "Three Questions, Three Layers",
  message: "We're going to go deep together—but in stages..."
};

export const CLOSING_FRAME = {
  title: "Ready to Begin",
  message: "I've got a clear picture now..."
};

// NEW: Proxy functions
export async function getQuestionsForTier(tier, userId) {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
  const response = await fetch(`${backendUrl}/api/onboarding/v1/tier${tier}/questions/${userId}`);
  const data = await response.json();
  return data.questions;
}
```

**🔄 SYNC POINT 3.4:**
- Update `IMPLEMENTATION-STATUS-FRONTEND.md`
- Commit: "refactor: proxy questions to backend API"

**🚨 CHECKPOINT:** Frontend Phase 3 complete. Ready for testing.

---

## Phase 4: Testing & Validation

### ✅ Step 4.1: End-to-End Flow Test [BOTH TEAMS]

**Owner:** Both Teams + You  
**Location:** Dev environment

**Test Sequence:**

1. **Start Onboarding**
   - [ ] Opening frame appears
   - [ ] Click "Let's Go"

2. **Tier 1 (7 questions)**
   - [ ] Q1: Gender options
   - [ ] Q2: Age NUMBER INPUT auto-selects bracket
   - [ ] Q3: AI Trust
   - [ ] Q4: Kitchen sponge with nested follow-up
   - [ ] Q5: Texting back
   - [ ] Q6: Problem-solving spiral
   - [ ] Q7: Self-check-in
   - [ ] Submit → Check Supabase: `tier1_patterns` populated

3. **Tier 2 (Clinical questions)**
   - [ ] Adaptive questions appear
   - [ ] Write 50+ word response
   - [ ] Submit → Check Supabase: `tier2_golden_keys` populated

4. **Tier 3 (Priority)**
   - [ ] State priority
   - [ ] Submit → Check Supabase: `user_stated_priority` populated

5. **Matrix Mapping Verification**
   - [ ] Check Supabase: `matrix_mapping` column has data
   - [ ] Verify structure is correct

6. **Voice Preview Generation**
   - [ ] 3 voice previews appear
   - [ ] All reference stated priority
   - [ ] 100-150 words each
   - [ ] Use user's actual words (no quotes)

7. **Voice Selection**
   - [ ] Select voice
   - [ ] Inline textarea appears
   - [ ] Type response (or skip)
   - [ ] Click "Start Journaling"

8. **Journal Redirect**
   - [ ] Redirects correctly
   - [ ] Inline response appears if provided
   - [ ] Selected voice active
   - [ ] No console errors

**Success Criteria:**
- ✅ All 8 checkpoints pass
- ✅ No console errors
- ✅ All Supabase data correct
- ✅ Voice previews personalized
- ✅ Matrix mapping accurate

---

## 🎯 IMPLEMENTATION COMPLETE CHECKLIST

### Backend Checklist
- [ ] Step 1.1: Files backed up
- [ ] Step 1.2: Matrix column added
- [ ] Step 2.1: Tier 1 framework built
- [ ] Step 2.2: Matrix mapping built
- [ ] Step 2.3: Voice previews integrated
- [ ] Step 2.4: Routes updated

### Frontend Checklist
- [ ] Step 3.1: Questions fetch from backend
- [ ] Step 3.2: Midpoint check removed
- [ ] Step 3.3: Voice selection fixed + inline response
- [ ] Step 3.4: QuestionData proxies backend

### Integration Checklist
- [ ] Step 4.1: End-to-end test passes
- [ ] No console errors
- [ ] All Supabase data correct
- [ ] Voice previews personalized
- [ ] Matrix mapping accurate

---

**Last Updated:** [Timestamp when you start]  
**Framework Version:** v1.0  
**Status:** Ready to Begin