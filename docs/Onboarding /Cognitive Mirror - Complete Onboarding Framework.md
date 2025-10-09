
Cognitive Mirror - Complete Onboarding Framework
Master Implementation Guide : This document contains the complete framework for implementing the 3-
tier onboarding system, including pattern detection, causal chain logic, matrix mapping, voice preview
generation, and evidence validation.
Table of Contents
Part I: Causal Chain Framework & Algorithm Logic
1. Executive Summary
2. Pattern Type Taxonomy
3. Bayesian Validation Framework
4. Causal Chain Construction
5. Matrix Mapping Framework
6. Complete Algorithm Flow
7. Data Storage Schema
8. Pattern Validation Rules
9. Q2 Age Revision
10. Tier 3 Priority Detection & Selection
Part II: Voice Preview Framework
11. Voice Preview Architecture
12. Matrix-Driven Strategy Selection
13. Voice Preview Templates by Strategy
14. Voice-Specific Adaptation Guidelines
15. Quality Control & Edge Cases
Part III: 3-Tier Question Architecture
16. Tier 1: Pattern Detection Questions
17. Tier 2: Golden Key Excavation
18. Tier 3: Priority Identification
Part IV: Evidence Detection Library
19. Age-Based Demographic Tendencies
20. Gender-Based Demographic Tendencies
21. Cross-Pattern Evidence
22. Evidence Strength Scoring
PART I: CAUSAL CHAIN FRAMEWORK & ALGORITHM
LOGIC
I. Executive Summary
This document defines the complete algorithmic framework for how Tier 1, Tier 2, and Tier 3 data flow into
causal probability calculations that generate intelligent voice previews.
Core Principle: Not all Tier 1 responses are equal. Some are behavioral patterns (high confidence, answer-
derived), others are demographic tendencies (low confidence until validated by Tier 2 evidence).
II. Pattern Type Taxonomy
Type A: Behavioral Pattern Indicators (High Confidence)
Definition: Patterns derived directly from user's answer choice that reveal specific behaviors or thought
patterns.
Characteristics:

    ✅ Answer-derived (user explicitly chose this option)
    ✅ High initial confidence (70-90%)
    ✅ Can be used immediately in causal chains
    ✅ Require only Tier 2 golden key alignment (not validation)

Examples:

    Q4: User picks "I'm disgusting/I'm a mess" → self_criticism (90% confidence)
    Q5: User picks "Hold down to read without showing read, stress until respond" → social_obligation_anxiety

(85% confidence)

    Q6: User picks "Fail repeatedly, think worthless, then brilliant" → emotional_dysregulation,

all_or_nothing_thinking (88% confidence)
Storage:
Type B: Demographic Tendencies (Low Confidence Until Validated)
Definition: Statistical likelihoods based on demographic context (age, gender) that require Tier 2 evidence to
confirm.
Characteristics:

    ⚠ Context-derived (based on user's demographic group)
    ⚠ Low initial confidence (50-70% base rate)
    ⚠ Cannot be used until validated by Tier 2 evidence
    ⚠ Require explicit validation from golden keys

Examples:

    Q2: User is 26-35 → comparison_driven (65% base rate, requires validation)
    Q2: User is 36-50 → existential_questioning (60% base rate, requires validation)

Storage:

javascript

{
{

"pattern_type"

"pattern_type"
:

:

"behavioral"

"behavioral"
,

,

"pattern"

"pattern"
:

:

"self_criticism"

"self_criticism"
,

,

"source"

"source"
:

:

"tier1_q4_option2"

"tier1_q4_option2"
,

,

"initial_confidence"

"initial_confidence"
:

:
0.
0.
,
,

"evidence_required"

"evidence_required"
:

:

"alignment"

"alignment"
,

,

"use_threshold"

"use_threshold"
:

:
0.
0.
}}

javascript

{
{

"pattern_type"

"pattern_type"
:

:

"demographic_tendency"

"demographic_tendency"
,

,

"pattern"

"pattern"
:

:

"comparison_driven"

"comparison_driven"
,

,

"source"

"source"
:

:

"tier1_q2_age_26_35"

"tier1_q2_age_26_35"
,

,

"base_rate"

"base_rate"
:

:
0.
0.
,
,

"initial_confidence"

"initial_confidence"
:

:
0.
0.
,
,

"evidence_required"

"evidence_required"
:

:

"validation"

"validation"
,

,

"validated"

"validated"
:

:

false

false
,

,

"posterior_confidence""posterior_confidence"::nullnull,,

"use_threshold""use_threshold"::0.750.

}}
Type C: Tone Preference Indicators (No Causal Use)
Definition: Indicators that inform voice selection but don't predict behavioral patterns or golden keys.
Characteristics:

    🎭 Used for voice/tone matching only
    🎭 No causal probability calculations
    🎭 Stored separately from behavioral patterns

Examples:

    Q1: Option 3 "Non-binary" → left_leaning (tone preference)
    Q1: Option 4 "Hate the term non-binary" → right_leaning (tone preference)

III. Bayesian Validation Framework
How Demographic Tendencies Get Validated
Step 1: Demographic Context Establishes Prior Probability
User answers Q2: Age 28 (bracket 26-35)
Step 2: Tier 2 Golden Keys Provide Evidence
User writes in golden key:

javascript

{
{

"demographic_context"

"demographic_context"
:

:
{
{

"age_exact"

"age_exact"
:

:
28
28
,
,

"age_bracket""age_bracket"::"26-35""26-35",,

"statistical_tendencies""statistical_tendencies"::[[

{{

"pattern""pattern"::"comparison_driven""comparison_driven",,

"base_rate"

"base_rate"
:

:
0.
0.
,
,

"prior_probability"

"prior_probability"
:

:
0.
0.
,
,

"validated"

"validated"
:

:

false

false

}
}
]
]
}
}
}
}
"Everyone around me is getting promoted and buying houses and I'm still renting and in the same job for 3
years. I feel like I'm failing at life compared to where I should be."
Evidence Extraction:
Step 3: Bayesian Update Calculates Posterior Probability
Result:

javascript

{{

"golden_key_indicators""golden_key_indicators"::{{

"comparison_language""comparison_language"::[["everyone around me""everyone around me",,"compared to where I should be""compared to where I should be"]],,

"relative_achievement_framing""relative_achievement_framing"::truetrue,,

"social_comparison_markers"

"social_comparison_markers"
:

:
[
[

"promoted"

"promoted"
,

,

"buying houses"

"buying houses"
,

,

"still renting"

"still renting"
]

]
,
,

"evidence_strength"

"evidence_strength"
:

:

"strong"

"strong"

}
}
}
}

javascript

function

function
validateDemographicTendency

validateDemographicTendency
(

(

prior

prior
,

,

evidence

evidence
)

)
{
{

const

const
baseRate

baseRate
=

=

prior

prior
.

.

base_rate

base_rate
;

;

const

const
evidenceStrength

evidenceStrength
=

=

evidence

evidence
.

.

strength

strength
;

;

let

let
likelihoodRatio

likelihoodRatio
;

;

if

if
(

(

evidenceStrength

evidenceStrength
===

===

"strong"

"strong"
)

)
{
{

likelihoodRatio

likelihoodRatio
=

=
5.
5.
;
;
}
}

else

else
if

if
(

(

evidenceStrength

evidenceStrength
===

===

"moderate"

"moderate"
)

)
{
{

likelihoodRatio

likelihoodRatio
=

=
2.
2.
;
;

}}elseelseifif((evidenceStrength evidenceStrength ======"weak""weak")){{

likelihoodRatio likelihoodRatio ==0.80.8;;

}}elseelseifif((evidenceStrength evidenceStrength ======"contradictory""contradictory")){{

likelihoodRatio likelihoodRatio ==0.20.2;;

}
}

const

const
posterior

posterior
=

=
(
(

baseRate

baseRate
*

*

likelihoodRatio

likelihoodRatio
)

)
/
/
(
(
(
(

baseRate

baseRate
*

*

likelihoodRatio

likelihoodRatio
)

)
+
+
(
(
(
(
1
1
-
-

baseRate

baseRate
)

)
*
*
1
1
)
)
)
)
;
;

return

return
Math

Math
.

.

min

min
(

(

posterior

posterior
,

,
0.
0.
)
)
;
;
}
}
IV. Causal Chain Construction
How Patterns Link to Golden Keys to Priorities
Causal Chain Template:
Example 1: Comparison-Driven Productivity Problem
Tier 1 Patterns (Validated):

    comparison_driven (92% confidence, validated by golden key)
    self_criticism (90% confidence, behavioral)

Mechanism:

    Compares self to others → Feels inadequate → Self-critical thoughts reinforce inadequacy

Tier 2 Golden Key:

    "Everyone around me is getting promoted and buying houses and I'm still renting and in the same job. I feel

like I'm failing at life."
Impact:

    Mental energy consumed by comparison → Rumination about being "behind" → Cognitive drain →

Reduced focus
Tier 3 Priority:

    "I want to be more productive"

javascript

{
{

"pattern"

"pattern"
:

:

"comparison_driven"

"comparison_driven"
,

,

"prior_probability"

"prior_probability"
:

:
0.
0.
,
,

"evidence_strength"

"evidence_strength"
:

:

"strong"

"strong"
,

,

"posterior_probability"

"posterior_probability"
:

:
0.
0.
,
,

"validated"

"validated"
:

:

true

true
,

,

"use_in_voice_preview"

"use_in_voice_preview"
:

:

true

true

}}

Tier 1 Pattern(s) → Mechanism → Tier 2 Golden Key → Impact → Tier 3 Priority

Tier 1 Pattern(s) → Mechanism → Tier 2 Golden Key → Impact → Tier 3 Priority

Causal Probability Calculation:
Voice Preview Output:
"You say you want to be more productive, but here's what I'm seeing: You're comparing yourself to everyone
around you—their promotions, their houses—and you're convinced you're falling behind. That comparison
loop is eating up the mental energy you need to actually focus. You're not failing at productivity—you're
exhausting yourself measuring your worth against everyone else's timeline."
Example 2: Demographic Tendency NOT Validated
Tier 1 Patterns:

    comparison_driven (65% prior, NOT validated - no evidence in golden keys)
    social_obligation_anxiety (85% confidence, behavioral)

Tier 2 Golden Key:

    "My boss micromanages every decision I make. I feel like I can't breathe and I'm constantly second-

guessing myself waiting for him to criticize me."
Evidence Check:

javascript

{
{

"causal_chain"

"causal_chain"
:

:

"comparison_driven + self_criticism → rumination → cognitive_drain → productivity_loss"

"comparison_driven + self_criticism → rumination → cognitive_drain → productivity_loss"
,

,

"probability_calculation""probability_calculation"::{{

"pattern_confidence""pattern_confidence"::0.920.92,,

"golden_key_alignment""golden_key_alignment"::0.950.95,,

"priority_relevance"

"priority_relevance"
:

:
0.
0.
,
,

"overall_probability"

"overall_probability"
:

:
0.
0.
,
,

"confidence_level"

"confidence_level"
:

:

"high"

"high"
,

,

"use_in_voice_preview"

"use_in_voice_preview"
:

:

true

true

}
}
}
}
Voice Preview Output (Does NOT mention comparison):
"You say you want to be more productive, but here's what's happening: Your boss is in your head. Every
decision you make, you're second-guessing because you're waiting for him to criticize it. You've internalized
his micromanaging and now you're doing it to yourself."
Causal Chain Templates Library
Purpose: This library provides research-backed templates that connect Tier 1 patterns → mechanisms → Tier 2
golden keys → impacts → Tier 3 priorities.
Implementation Note: These templates are reference patterns, not rigid scripts. Use them to identify
mechanism types and construct natural language connections.
Template 1: Rumination-Sleep-Productivity Chain
Tier 1 Patterns: rumination + social_obligation_anxiety
Mechanism: Perseverative cognition prevents sleep initiation/maintenance
Golden Key Evidence: References to replaying conversations, nighttime worry, 3am wake-ups
Impact: Cognitive depletion → reduced executive function → productivity loss
Priority Connection: "I want to be more productive"
Research Foundation:
Nolen-Hoeksema et al. (2008) - Rumination maintains negative mood and impairs problem-solving by
occupying working memory resources needed for goal-directed behavior.
Confidence Triggers:

javascript

{
{

"demographic_tendency"

"demographic_tendency"
:

:

"comparison_driven"

"comparison_driven"
,

,

"evidence_found"

"evidence_found"
:

:

false

false
,

,

"posterior_probability"

"posterior_probability"
:

:
0.
0.
,
,

"validated"

"validated"
:

:

false

false
,

,

"use_in_voice_preview"

"use_in_voice_preview"
:

:

false

false

}
}

    Golden key mentions specific time ("3am," "middle of the night")
    Describes repetitive thinking ("replay," "over and over")
    Links worry to specific event/person
    HIGH confidence if all three present

Voice Preview Insight Pattern: "The productivity struggle isn't about time management—it's about energy
depletion. When rumination steals sleep, the next day starts already exhausted."
Template 2: Social Anxiety-Rumination-Avoidance Loop
Tier 1 Patterns: social_obligation_anxiety + rumination + avoidance_coping
Mechanism: Fear of negative evaluation → rumination → behavioral avoidance → reinforced anxiety
Golden Key Evidence: Replaying social interactions, analyzing what was said, delaying responses
Impact: Social withdrawal → relationship deterioration → isolation
Priority Connection: "I want better relationships"
Research Foundation:
Clark & Wells (1995) - Social anxiety is maintained by post-event processing which prevents corrective
learning.
Voice Preview Insight Pattern: "The relationship struggle isn't about the interactions themselves—it's about
the mental replay that keeps you stuck in yesterday's conversations."
Template 3: Self-Criticism-Performance-Anxiety Spiral
Tier 1 Patterns: self_criticism + perfectionism + social_obligation_anxiety
Mechanism: Harsh self-judgment activates threat response → impaired performance → confirms negative
beliefs
Golden Key Evidence: Self-directed harsh language, fear of judgment, performance anxiety
Impact: Shame-based learning impairment → repeated mistakes
Priority Connection: "I want to be better at my job" / "I want to be more confident"
Research Foundation:
Neff & Germer (2017) - Self-criticism activates the threat defense system, impairing executive function.
Voice Preview Insight Pattern: "The performance anxiety isn't about lacking ability—it's about the inner critic
drowning out your competence."
Template 4: Perfectionism-Procrastination Paradox
Tier 1 Patterns: perfectionism + avoidance_coping + executive_function_deficit
Mechanism: Fear of imperfect performance → task avoidance → last-minute crisis → belief that only pressure
produces results
Golden Key Evidence: Putting things off, last-minute rushing, all-or-nothing thinking
Impact: Chronic stress → burnout → reduced quality
Priority Connection: "I want to stop procrastinating"
Research Foundation:
Sirois & Pychyl (2013) - Procrastination serves as emotion regulation for performance anxiety.
Voice Preview Insight Pattern: "Procrastination isn't laziness—it's perfectionism in disguise. You delay
because 'not done yet' feels safer than 'done but imperfect.'"
Template 5: Comparison-Inadequacy-Rumination Chain
Tier 1 Patterns: comparison_driven (validated) + self_criticism + rumination
Mechanism: Social comparison → perceived inadequacy → rumination → mood deterioration
Golden Key Evidence: References to others' achievements, feeling "behind"
Impact: Mental energy consumed by comparison → reduced focus on own goals
Priority Connection: "I want to be more productive"
Research Foundation:
Vogel et al. (2014) - Upward social comparison decreases self-esteem and increases negative affect.
Voice Preview Insight Pattern: "The productivity problem isn't about working harder—it's about mental
energy consumed by measuring yourself against everyone else's timeline."
Template 6: Achievement Pressure-Meaning Crisis
Tier 1 Patterns: achievement_pressure + existential_questioning + regret_processing
Mechanism: External achievement doesn't satisfy internal needs → questioning life choices
Golden Key Evidence: Questions about meaning, wasted time, career dissatisfaction despite success
Impact: Motivational deficit → reduced engagement
Priority Connection: "I want to find purpose"
Research Foundation:
Crocker & Park (2004) - When self-worth is contingent on external achievement, success fails to provide lasting
self-esteem.
Voice Preview Insight Pattern: "The fulfillment you're seeking isn't about achieving more—it's about the gap
between what you thought success would feel like and what it actually feels like."
Template 7: Avoidance-Anxiety Amplification Loop
Tier 1 Patterns: avoidance_coping + social_obligation_anxiety + executive_function_deficit
Mechanism: Anxiety triggers avoidance → temporary relief → task accumulation → greater anxiety
Golden Key Evidence: Putting things off, feeling overwhelmed, avoiding difficult situations
Impact: Negative reinforcement strengthens avoidance → life narrowing
Priority Connection: "I want to stop avoiding things"
Research Foundation:
Barlow et al. (2014) - Avoidance behaviors prevent corrective learning needed for anxiety to habituate.
Voice Preview Insight Pattern: "Avoidance feels like protection but functions like quicksand—each step away
makes the next step harder."
Template 8: Control-Insecurity Paradox
Tier 1 Patterns: social_obligation_anxiety + relationship distress from golden keys
Mechanism: Attachment insecurity → control attempts → partner reactance → relationship conflict
Golden Key Evidence: Monitoring partner, jealousy, checking behaviors
Impact: Control creates the disconnection it aims to prevent
Priority Connection: "I want better relationships"
Research Foundation:
Brehm & Brehm (1981) - Control attempts trigger psychological reactance in others.
Voice Preview Insight Pattern: "The relationship anxiety isn't about your partner—it's about trying to control
connection to feel secure. Control kills intimacy."
Template 9: People-Pleasing-Resentment Cycle
Tier 1 Patterns: social_obligation_anxiety + self_criticism + boundary deficit
Mechanism: Need for approval → excessive accommodation → resentment buildup
Golden Key Evidence: Difficulty saying no, overcommitment, feeling drained
Impact: Identity confusion → relationship inauthenticity
Priority Connection: "I want better boundaries"
Research Foundation:
Impett et al. (2010) - Sacrificing personal needs decreases relationship quality through inauthenticity.
Voice Preview Insight Pattern: "The relationship exhaustion isn't about the people—it's about losing yourself
trying to be what everyone needs."
Template 10: Self-Worth Volatility Pattern
Tier 1 Patterns: emotional_dysregulation + all_or_nothing_thinking + self_criticism
Mechanism: Self-worth tied to performance → failure triggers shame → success triggers temporary relief
Golden Key Evidence: Emotional swings tied to performance, brilliant then worthless
Impact: Unstable self-concept → relationship instability
Priority Connection: "I want to feel more stable"
Research Foundation:
Crocker & Park (2004) - Contingent self-worth creates emotional volatility.
Voice Preview Insight Pattern: "The emotional volatility isn't about sensitivity—it's about having your worth
on a scoreboard that changes with every outcome."
Implementation Guidelines for Claude Code
When constructing causal chains:
1. Match patterns to templates - Identify which template(s) fit the user's patterns + golden keys
2. Verify confidence triggers - Only use if golden key evidence meets criteria
3. Calculate probability score:
4. Select appropriate insight pattern - Use as foundation for connecting dots
5. Adapt to tone - Modify language to match voice (Tony D / Clara / Marcus)
6. Prioritize parsimony - Use fewest templates that explain the most data
V. Matrix Mapping Framework
Overview
The Matrix Mapping Framework compares what users SAY about themselves (Q7 self-report) with what their
BEHAVIOR reveals (pattern score from Tier 1 + Tier 2).
Critical Philosophy: The matrix is not about "catching" users. It's about meeting them where they are and
gently surfacing blind spots through insight, not observation.

javascript

probability

probability
=

=
(
(

pattern_confidence

pattern_confidence
+

+

golden_key_alignment

golden_key_alignment
+

+

priority_relevance

priority_relevance
)

)
/
/
3
3

// Only use if probability >= 0.

// Only use if probability >= 0.

Step 1: Capture Self-Report Baseline (Q7 - Tier 1)
Q7: "How would you describe where you're at right now?"
Options:
1. Tip top - couldn't be better
2. Doing fine - the usual ups and downs
3. Hanging by a thread
4. Stop asking me - I hate that question
Data Storage:
Purpose: This baseline is captured BEFORE Tier 2. It represents conscious self-assessment without pattern
awareness.
Step 2: Calculate Pattern Score (After Tier 2 Completion)
Pattern Score aggregates all distress indicators:
What Counts as a Pattern?
Type A: Behavioral Patterns (Tier 1)

    Each high-confidence behavioral pattern = 1 point
    Examples: self_criticism, rumination, avoidance_coping
    Threshold: Pattern confidence >= 0.

Type B: Validated Demographic Tendencies (Tier 2)

    Each validated tendency = 1 point
    Examples: comparison_driven, achievement_pressure
    Threshold: Posterior probability >= 0.

javascript

{
{

"q7_self_report"

"q7_self_report"
:

:
{
{

"option"

"option"
:

:
1
1
,
,

"label"

"label"
:

:

"tip_top"

"tip_top"
,

,

"numerical_value"

"numerical_value"
:

:
1
1
}}
}}
Type C: High-Severity Golden Keys

    Each high-severity golden key = 0.5 points
    Indicators: Extreme emotional language, crisis markers, duration markers
    Threshold: Emotional intensity = "high"

Calculation Algorithm
Pattern Level Definitions:

javascript

function

function
calculatePatternScore

calculatePatternScore
(

(

tier1Patterns

tier1Patterns
,

,

tier2Validation

tier2Validation
,

,

tier2GoldenKeys

tier2GoldenKeys
)

)
{
{

let

let
score

score
=

=
0
0
;
;

// Count behavioral patterns

// Count behavioral patterns

const

const
behavioral

behavioral
=

=

tier1Patterns

tier1Patterns
.

.

filter

filter
(

(

p

p
=>

=>

p

p
.

.

pattern_type

pattern_type
===

===

"behavioral"

"behavioral"
&&

&&

p

p
.

.

initial_confidence

initial_confidence
>=

>=
0.
0.
)
)
;
;

score score +=+= behavioral behavioral..lengthlength;;

// Count validated tendencies// Count validated tendencies

constconst validated validated == tier2Validation tier2Validation..filterfilter((tt=>=>

t

t
.

.

validated

validated
===

===

true

true
&&

&&

t

t
.

.

posterior_confidence

posterior_confidence
>=

>=
0.
0.
)
)
;
;

score

score
+=

+=

validated

validated
.

.

length

length
;

;

// Count high-severity keys

// Count high-severity keys

const

const
highSeverity

highSeverity
=

=

tier2GoldenKeys

tier2GoldenKeys
.

.

filter

filter
(

(

gk

gk
=>

=>

gk

gk
.

.

emotional_intensity

emotional_intensity
===

===

"high"

"high"

)
)
;
;

score

score
+=

+=

highSeverity

highSeverity
.

.

length

length
*

*
0.
0.
;
;

return

return
score

score
;

;
}
}

functionfunctioncategorizePatternScorecategorizePatternScore((scorescore)){{

ifif((score score <=<= 22 ))returnreturn"LOW""LOW";;

ifif((score score <=<= 44 ))returnreturn"MEDIUM""MEDIUM";;

return

return
"HIGH"

"HIGH"
;
;
}
}

    LOW (0-2): Minimal distress, generally functional
    MEDIUM (3-4): Moderate distress, some challenges
    HIGH (5+): Significant distress, multiple challenges

Step 3: Calculate Matrix Position
Discrepancy Score Calculation
The Matrix (4x3 Grid)

javascript

const

const
selfReportValues

selfReportValues
=

=
{
{

"tip_top"

"tip_top"
:

:
1
1
,
,

"doing_fine"

"doing_fine"
:

:
2
2
,
,

"hanging_thread"

"hanging_thread"
:

:
3
3
,
,

"stop_asking"

"stop_asking"
:

:
2.
2.
}
}
;
;

const

const
patternScoreValues

patternScoreValues
=

=
{
{
"LOW"
"LOW"
:
:
1
1
,
,
"MEDIUM"
"MEDIUM"
:
:
2
2
,
,
"HIGH"
"HIGH"
:
:
3
3
}
}
;
;

functionfunctioncalculateDiscrepancycalculateDiscrepancy((selfReportselfReport,, patternLevel patternLevel)){{

constconst selfValue selfValue == selfReportValues selfReportValues[[selfReportselfReport]];;

constconst patternValue patternValue == patternScoreValues patternScoreValues[[patternLevelpatternLevel]];;

const

const
discrepancy

discrepancy
=

=

selfValue

selfValue

-

patternValue

patternValue
;

;

if

if
(

(

discrepancy

discrepancy
>=

>=
1.
1.
)
)

return

return
"minimizing"

"minimizing"
;

;

if

if
(

(

discrepancy

discrepancy
<=

<=
-
-
1.
1.
)
)

return

return
"catastrophizing"

"catastrophizing"
;

;

if

if
(

(

Math

Math
.

.

abs

abs
(

(

discrepancy

discrepancy
)

)
<=
<=
0.
0.
)
)

return

return
"aligned"

"aligned"
;

;

return

return
"slight_gap"

"slight_gap"
;

;
}
}
LOW MEDIUM HIGH
LOW MEDIUM HIGH
─────────────────────────────────────────────
─────────────────────────────────────────────

Tip top │ ALIGNED MINIMIZING DENIAL

Tip top │ ALIGNED MINIMIZING DENIAL

Doing fine │ POSITIVE ALIGNED MINIMIZING

Doing fine │ POSITIVE ALIGNED MINIMIZING

Hanging on │ CATASTROPH. ALIGNED ACCURATE

Hanging on │ CATASTROPH. ALIGNED ACCURATE

Stop asking Stop asking ││ AVOIDANT DEFENSIVE OVERWHELMED AVOIDANT DEFENSIVE OVERWHELMED

Step 4: Voice Preview Decision Tree

javascript

function

function
determineVoicePreviewStrategy

determineVoicePreviewStrategy
(

(

matrixPosition

matrixPosition
,

,

goldenKeys

goldenKeys
,

,

priority

priority
)

)
{
{

const

const
{

{

interpretation

interpretation
,

,

patternLevel

patternLevel
}

}
=
=

matrixPosition

matrixPosition
;

;

// MAJOR DISCREPANCY - Must address

// MAJOR DISCREPANCY - Must address

if

if
(

(

interpretation

interpretation
===

===

"minimizing"

"minimizing"
&&

&&

patternLevel

patternLevel
===

===
"HIGH"
"HIGH"
)
)
{
{

return

return
{

{

strategy

strategy
:

:

"gentle_reality_check"

"gentle_reality_check"
,

,

surfaceGapsurfaceGap::truetrue,,

approachapproach::"insight_not_accusation""insight_not_accusation"

}};;
}}

// CATASTROPHIZING - Reframe with strengths

// CATASTROPHIZING - Reframe with strengths

if

if
(

(

interpretation

interpretation
===

===

"catastrophizing"

"catastrophizing"
&&

&&

patternLevel

patternLevel
===

===
"LOW"
"LOW"
)
)
{
{

return

return
{

{

strategy

strategy
:

:

"strength_based_reframe"

"strength_based_reframe"
,

,

surfaceGap

surfaceGap
:

:

true

true
,

,

approach

approach
:

:

"validate_then_redirect"

"validate_then_redirect"

}
}
;
;
}
}

// ALIGNED - Skip gap, focus on insight

// ALIGNED - Skip gap, focus on insight

if

if
(

(

interpretation

interpretation
===

===

"aligned"

"aligned"
)

)
{
{

returnreturn{{

strategystrategy::"validate_and_deepen""validate_and_deepen",,

surfaceGapsurfaceGap::falsefalse,,

approachapproach::"connect_dots_they_havent_connected""connect_dots_they_havent_connected"

}
}
;
;
}
}

// DEFENSIVE - Respect boundary

// DEFENSIVE - Respect boundary

if

if
(

(

selfReport

selfReport
===

===

"stop_asking"

"stop_asking"
)

)
{
{

return

return
{

{

strategy

strategy
:

:

"respect_then_engage"

"respect_then_engage"
,

,

surfaceGap

surfaceGap
:

:

false

false
,

,

approach

approach
:

:

"patterns_without_judgment"

"patterns_without_judgment"

}
}
;
;
}
}
}
}
Step 5: Voice Preview Construction Strategies
Strategy 1: Gentle Reality Check (Minimizing + HIGH patterns)
Structure:
1. Start with stated priority
2. Name what's actually happening (from golden keys)
3. Reveal the hidden pattern/cost
4. Reframe the priority through the pattern
Example:
Note: The gap is IMPLICIT. No need to say "you say tip top but..."
Strategy 2: Strength-Based Reframe (Catastrophizing + LOW)
Structure:
1. Validate the feeling
2. Point to evidence of capability
3. Name the real struggle (gap between capability and self-perception)
4. Offer new frame
Example:

Self-Report: "Tip top"

Self-Report: "Tip top"

Patterns: HIGH (6+ patterns)

Patterns: HIGH (6+ patterns)

Priority: "I want to be more productive"

Priority: "I want to be more productive"

Golden Key: "I wake up at 3am worried I said something stupid at work"Golden Key: "I wake up at 3am worried I said something stupid at work"

Voice Preview:Voice Preview:

"You want to be more productive, but here's what I'm seeing: You're waking up at 3am replaying work conversations, "You want to be more productive, but here's what I'm seeing: You're waking up at 3am replaying work conversations,

beating yourself up over small things, and comparing yourself to everyone around you. That's not a productivity problem

beating yourself up over small things, and comparing yourself to everyone around you. That's not a productivity problem

—that's an exhaustion problem. The mental noise is stealing your energy before the day even starts. What if fixing

—that's an exhaustion problem. The mental noise is stealing your energy before the day even starts. What if fixing

'productivity' actually means fixing the 3am worry spiral first?"

'productivity' actually means fixing the 3am worry spiral first?"

Strategy 3: Validate and Deepen (Aligned)
Structure:
1. Skip the gap entirely (or validate briefly)
2. Connect priority + golden keys
3. Reveal the pattern insight
4. Offer the reframe
Example:
Strategy 4: Respect Then Engage (Defensive)
Structure:

Self-Report: "Hanging by a thread"

Self-Report: "Hanging by a thread"

Patterns: LOW

Patterns: LOW

Priority: "I want to feel less anxious"

Priority: "I want to feel less anxious"

Golden Key: "I feel overwhelmed but I still get everything done"

Golden Key: "I feel overwhelmed but I still get everything done"

Voice Preview:

Voice Preview:

"You say you're barely hanging on, and I hear that it feels overwhelming. But here's what I'm also seeing: You're proactive,

"You say you're barely hanging on, and I hear that it feels overwhelming. But here's what I'm also seeing: You're proactive,

you think things through, you actually get things done even when it's hard. What if the anxiety isn't about falling apart—

you think things through, you actually get things done even when it's hard. What if the anxiety isn't about falling apart—

it's about the gap between how capable you are and how incapable you feel? That disconnect is exhausting. What would it's about the gap between how capable you are and how incapable you feel? That disconnect is exhausting. What would

shift if you trusted yourself more?"shift if you trusted yourself more?"

Self-Report: "Doing fine"

Self-Report: "Doing fine"

Patterns: MEDIUMPatterns: MEDIUM

Priority: "I want better relationships"Priority: "I want better relationships"

Golden Key: "My partner and I fight about the same things over and over"Golden Key: "My partner and I fight about the same things over and over"

Voice Preview:

Voice Preview:

"You want better relationships, and you mentioned you and your partner fight about the same things repeatedly. Here's the

"You want better relationships, and you mentioned you and your partner fight about the same things repeatedly. Here's the

pattern I'm seeing: You replay arguments for days, stress about texts, second-guess what you said. What if the relationship

pattern I'm seeing: You replay arguments for days, stress about texts, second-guess what you said. What if the relationship

struggle isn't about the topics you fight about—it's about the rumination that keeps you stuck in fights long after they're

struggle isn't about the topics you fight about—it's about the rumination that keeps you stuck in fights long after they're

over? Breaking that loop might change everything."

over? Breaking that loop might change everything."

1. Acknowledge the deflection without judgment
2. Gently name what you're observing
3. Focus on patterns, not feelings
4. Keep it brief
Example:
Implementation Guidelines for Claude Code
Matrix Calculation Sequence

Self-Report: "Stop asking me how I'm doing"Self-Report: "Stop asking me how I'm doing"

Patterns: MEDIUM-HIGHPatterns: MEDIUM-HIGH

Priority: "I want to stop procrastinating"Priority: "I want to stop procrastinating"

Golden Key: "I put things off until I'm panicking, then somehow get them done"Golden Key: "I put things off until I'm panicking, then somehow get them done"

Voice Preview:

Voice Preview:

"Fair enough—let's skip the feelings check. Here's what I'm noticing about the procrastination: You wait until crisis hits,

"Fair enough—let's skip the feelings check. Here's what I'm noticing about the procrastination: You wait until crisis hits,

then adrenaline kicks in and you power through. That pattern works... until it doesn't. The emergency becomes the only

then adrenaline kicks in and you power through. That pattern works... until it doesn't. The emergency becomes the only

time you feel capable. What if you could access that capability without needing panic as the fuel?"

time you feel capable. What if you could access that capability without needing panic as the fuel?"

VI. Complete Algorithm Flow
Stage 1: Tier 1 Response Processing

javascript

async

async
function

function
performMatrixMapping

performMatrixMapping
(

(

userId

userId
)

)
{
{

// 1. Retrieve Q7 self-report

// 1. Retrieve Q7 self-report

const

const
selfReport

selfReport
=

=

await

await
getQ7Response

getQ7Response
(

(

userId

userId
)

)
;
;

// 2. Calculate pattern score

// 2. Calculate pattern score

const

const
tier1Patterns

tier1Patterns
=

=

await

await
getTier1Patterns

getTier1Patterns
(

(

userId

userId
)

)
;
;

const

const
tier2Validation

tier2Validation
=

=

await

await
getTier2Validation

getTier2Validation
(

(

userId

userId
)

)
;
;

constconst tier2GoldenKeys tier2GoldenKeys ==awaitawaitgetTier2GoldenKeysgetTier2GoldenKeys((userIduserId));;

constconst patternScore patternScore ==calculatePatternScorecalculatePatternScore((

tier1Patterns tier1Patterns,, tier2Validation tier2Validation,, tier2GoldenKeys tier2GoldenKeys

)
)
;
;

// 3. Determine pattern level

// 3. Determine pattern level

const

const
patternLevel

patternLevel
=

=

categorizePatternScore

categorizePatternScore
(

(

patternScore

patternScore
)

)
;
;

// 4. Calculate discrepancy

// 4. Calculate discrepancy

const

const
discrepancy

discrepancy
=

=

calculateDiscrepancy

calculateDiscrepancy
(

(

selfReport

selfReport
.

.

label

label
,

,

patternLevel

patternLevel
)

)
;
;

// 5. Get matrix position

// 5. Get matrix position

const

const
matrixPosition

matrixPosition
=

=
{
{

selfReport

selfReport
:

:

selfReport

selfReport
.

.

label

label
,

,

patternLevel

patternLevel
:

:

patternLevel

patternLevel
,

,

interpretationinterpretation:: discrepancy discrepancy

}};;

// 6. Determine strategy// 6. Determine strategy

const

const
tier3Priority

tier3Priority
=

=

await

await
getTier3Priority

getTier3Priority
(

(

userId

userId
)

)
;
;

const

const
strategy

strategy
=

=

determineVoicePreviewStrategy

determineVoicePreviewStrategy
(

(

matrixPosition

matrixPosition
,

,

tier2GoldenKeys

tier2GoldenKeys
,

,

tier3Priority

tier3Priority

)
)
;
;

return

return
{

{

matrixPosition

matrixPosition
,

,

strategy

strategy
,

,

patternScore

patternScore
}

}
;
;
}
}
Stage 2: Tier 2 Golden Key Analysis

javascript

function

function
processTier1Response

processTier1Response
(

(

questionId

questionId
,

,

optionSelected

optionSelected
,

,

userContext

userContext
)

)
{
{

const

const
response

response
=

=
{
{

question

question
:

:

questionId

questionId
,

,

option

option
:

:

optionSelected

optionSelected
,

,

patterns

patterns
:

:
[
[
]
]
}
}
;
;

ifif((questionId questionId ======"q1_gender""q1_gender"|||| questionId questionId ======"q2_age""q2_age")){{

response response..patternspatterns==extractDemographicTendenciesextractDemographicTendencies((questionIdquestionId,, optionSelected optionSelected));;

response response..patternspatterns..pushpush((......extractTonePreferencesextractTonePreferences((questionIdquestionId,, optionSelected optionSelected))));;

}}elseelse{{

response

response
.

.

patterns

patterns
=

=

extractBehavioralPatterns

extractBehavioralPatterns
(

(

questionId

questionId
,

,

optionSelected

optionSelected
)

)
;
;
}
}

return

return
response

response
;

;
}
}

javascript

functionfunctionanalyzeGoldenKeyanalyzeGoldenKey((goldenKeyTextgoldenKeyText,, tier1Patterns tier1Patterns)){{

const

const
indicators

indicators
=

=

extractIndicators

extractIndicators
(

(

goldenKeyText

goldenKeyText
)

)
;
;

const

const
validationResults

validationResults
=

=

tier1Patterns

tier1Patterns

.
.

filter

filter
(

(

p

p
=>

=>

p

p
.

.

pattern_type

pattern_type
===

===

"demographic_tendency"

"demographic_tendency"
)

)
.
.

map

map
(

(

tendency

tendency
=>

=>
{
{

const

const
evidence

evidence
=

=

findEvidence

findEvidence
(

(

indicators

indicators
,

,

tendency

tendency
.

.

pattern

pattern
)

)
;
;

const

const
posterior

posterior
=

=

validateDemographicTendency

validateDemographicTendency
(

(

tendency

tendency
,

,

evidence

evidence
)

)
;
;

return

return
{

{

pattern

pattern
:

:

tendency

tendency
.

.

pattern

pattern
,

,

prior

prior
:

:

tendency

tendency
.

.

base_rate

base_rate
,

,

evidence

evidence
:

:

evidence

evidence
.

.

strength

strength
,

,

posteriorposterior:: posterior posterior,,

validatedvalidated:: posterior posterior >=>=0.750.75

}};;
}}));;

return

return
{

{

indicators

indicators
,

,

validationResults

validationResults
}

}
;
;
}
}
Stage 3: Tier 3 Priority Matching
Stage 4a: Matrix Mapping (NEW - Insert Before Voice Generation)

javascript

function

function
buildCausalChains

buildCausalChains
(

(

tier1Patterns

tier1Patterns
,

,

tier2GoldenKeys

tier2GoldenKeys
,

,

tier3Priority

tier3Priority
)

)
{
{

const

const
validatedPatterns

validatedPatterns
=

=

tier1Patterns

tier1Patterns
.

.

filter

filter
(

(

p

p
=>

=>
(
(

p

p
.

.

pattern_type

pattern_type
===

===

"behavioral"

"behavioral"
&&

&&

p

p
.

.

initial_confidence

initial_confidence
>=

>=
0.75
0.75
)
)
||
||
(
(

p

p
.

.

pattern_type

pattern_type
===

===

"demographic_tendency"

"demographic_tendency"
&&

&&

p

p
.

.

validated

validated
===

===

true

true
)

)
)
)
;
;

const

const
causalChains

causalChains
=

=
[
[
]
]
;
;

forfor((constconst pattern pattern ofof validatedPatterns validatedPatterns)){{

forfor((constconst goldenKey goldenKey ofof tier2GoldenKeys tier2GoldenKeys)){{

constconst chain chain ==constructCausalChainconstructCausalChain((patternpattern,, goldenKey goldenKey,, tier3Priority tier3Priority));;

if

if
(

(

chain

chain
.

.

probability

probability
>=

>=
0.75
0.75
)
)
{
{

causalChains

causalChains
.

.

push

push
(

(

chain

chain
)

)
;
;
}
}
}
}
}
}

return

return
causalChains

causalChains
.

.

sort

sort
(

(
(
(

a

a
,

,

b

b
)

)
=>
=>

b

b
.

.

probability

probability

-

a

a
.

.

probability

probability
)

)
;
;
}
}
Stage 4b: Voice Preview Generation

javascript

async

async
function

function
performMatrixMapping

performMatrixMapping
(

(

userId

userId
)

)
{
{

const

const
selfReport

selfReport
=

=

await

await
getQ7Response

getQ7Response
(

(

userId

userId
)

)
;
;

const

const
tier1Patterns

tier1Patterns
=

=

await

await
getTier1Patterns

getTier1Patterns
(

(

userId

userId
)

)
;
;

const

const
tier2Validation

tier2Validation
=

=

await

await
getTier2Validation

getTier2Validation
(

(

userId

userId
)

)
;
;

const

const
tier2GoldenKeys

tier2GoldenKeys
=

=

await

await
getTier2GoldenKeys

getTier2GoldenKeys
(

(

userId

userId
)

)
;
;

const

const
tier3Priority

tier3Priority
=

=

await

await
getTier3Priority

getTier3Priority
(

(

userId

userId
)

)
;
;

constconst patternScore patternScore ==calculatePatternScorecalculatePatternScore((

tier1Patterns tier1Patterns,, tier2Validation tier2Validation,, tier2GoldenKeys tier2GoldenKeys

));;

const

const
patternLevel

patternLevel
=

=

categorizePatternScore

categorizePatternScore
(

(

patternScore

patternScore
)

)
;
;

const

const
discrepancy

discrepancy
=

=

calculateDiscrepancy

calculateDiscrepancy
(

(

selfReport

selfReport
.

.

label

label
,

,

patternLevel

patternLevel
)

)
;
;

const

const
matrixPosition

matrixPosition
=

=
{
{

selfReport

selfReport
:

:

selfReport

selfReport
.

.

label

label
,

,

patternLevel

patternLevel
:

:

patternLevel

patternLevel
,

,

interpretation

interpretation
:

:

discrepancy

discrepancy

}
}
;
;

const

const
strategy

strategy
=

=

determineVoicePreviewStrategy

determineVoicePreviewStrategy
(

(

matrixPosition

matrixPosition
,

,

tier2GoldenKeys

tier2GoldenKeys
,

,

tier3Priority

tier3Priority

)
)
;
;

awaitawaitstoreMatrixMappingstoreMatrixMapping((userIduserId,,{{

matrix_positionmatrix_position:: matrixPosition matrixPosition,,

pattern_scorepattern_score:: patternScore patternScore,,

voice_strategy

voice_strategy
:

:

strategy

strategy

}
}
)
)
;
;

return

return
{

{

matrixPosition

matrixPosition
,

,

strategy

strategy
,

,

patternScore

patternScore
}

}
;
;
}
}
VII. Data Storage Schema
Complete User Profile Structure

javascript

function

function
generateVoicePreview

generateVoicePreview
(

(

causalChains

causalChains
,

,

matrixData

matrixData
,

,

tone

tone
,

,

priority

priority
,

,

goldenKeys

goldenKeys
)

)
{
{

const

const
{

{

matrixPosition

matrixPosition
,

,

strategy

strategy
}

}
=
=

matrixData

matrixData
;

;

const

const
topChains

topChains
=

=

causalChains

causalChains
.

.

slice

slice
(

(
0
0
,
,
2
2
)
)
;
;

let

let
voicePreview

voicePreview
;

;

if

if
(

(

strategy

strategy
.

.

strategy

strategy
===

===

"gentle_reality_check"

"gentle_reality_check"
)

)
{
{

voicePreview voicePreview ==buildGentleRealityCheckbuildGentleRealityCheck((prioritypriority,, goldenKeys goldenKeys,, topChains topChains,, tone tone));;

}}elseelseifif((strategystrategy..strategystrategy======"strength_based_reframe""strength_based_reframe")){{

voicePreview voicePreview ==buildStrengthBasedReframebuildStrengthBasedReframe((prioritypriority,, goldenKeys goldenKeys,, topChains topChains,, tone tone));;

}}elseelseifif((strategystrategy..strategystrategy======"validate_and_deepen""validate_and_deepen")){{

voicePreview

voicePreview
=

=

buildValidateAndDeepen

buildValidateAndDeepen
(

(

priority

priority
,

,

goldenKeys

goldenKeys
,

,

topChains

topChains
,

,

tone

tone
)

)
;
;
}
}

else

else
if

if
(

(

strategy

strategy
.

.

strategy

strategy
===

===

"respect_then_engage"

"respect_then_engage"
)

)
{
{

voicePreview

voicePreview
=

=

buildRespectThenEngage

buildRespectThenEngage
(

(

priority

priority
,

,

goldenKeys

goldenKeys
,

,

topChains

topChains
,

,

tone

tone
)

)
;
;
}
}

return

return
{

{

text

text
:

:

voicePreview

voicePreview
,

,

word_count

word_count
:

:

voicePreview

voicePreview
.

.

split

split
(

(
' '
' '
)
)
.
.

length

length
,

,

strategy_used

strategy_used
:

:

strategy

strategy
.

.

strategy

strategy
,

,

matrix_position

matrix_position
:

:

matrixPosition

matrixPosition

}
}
;
;
}
}

javascript
{
{

"user_id"

"user_id"
:

:

"uuid"

"uuid"
,

,

"created_at"

"created_at"
:

:

"timestamp"

"timestamp"
,

,

// TIER 1: Pattern Detection

// TIER 1: Pattern Detection

"tier1_responses"

"tier1_responses"
:

:
{
{

"q1_gender"

"q1_gender"
:

:
{
{

"option""option":: 33 ,,

"tone_preferences""tone_preferences"::[["left_leaning""left_leaning"]],,

"behavioral_patterns""behavioral_patterns"::[[]],,

"demographic_tendencies""demographic_tendencies"::[[]]

}
}
,
,

"q2_age"

"q2_age"
:

:
{
{

"exact_age"

"exact_age"
:

:
28
28
,
,

"bracket"

"bracket"
:

:
"26-35"
"26-35"
,
,

"demographic_tendencies"

"demographic_tendencies"
:

:
[
[
{
{

"pattern"

"pattern"
:

:

"comparison_driven"

"comparison_driven"
,

,

"base_rate"

"base_rate"
:

:
0.65
0.65
,
,

"validated"

"validated"
:

:

true

true
,

,

"posterior_confidence"

"posterior_confidence"
:

:
0.92
0.92
}
}
]
]
}},,

"q7_self_report""q7_self_report"::{{

"option""option"::"tip_top""tip_top",,

"numerical_value""numerical_value":: 11

}
}
}
}
,
,

// TIER 2: Golden Keys

// TIER 2: Golden Keys

"tier2_golden_keys"

"tier2_golden_keys"
:

:
[
[
{
{

"domain"

"domain"
:

:

"work"

"work"
,

,

"text"

"text"
:

:

"Everyone around me is getting promoted..."

"Everyone around me is getting promoted..."
,

,

"word_count"

"word_count"
:

:
67
67
,
,

"indicators_detected"

"indicators_detected"
:

:
{
{

"comparison_language"

"comparison_language"
:

:

true

true
,

,

"emotional_intensity"

"emotional_intensity"
:

:

"high"

"high"

}},,

"validation_results""validation_results"::[[

{{

"pattern""pattern"::"comparison_driven""comparison_driven",,

"evidence_strength"

"evidence_strength"
:

:

"strong"

"strong"
,

,

"validated"

"validated"
:

:

true

true

"validated"

"validated"
:

:

true

true

}
}
]
]
}
}
]
]
,
,

// TIER 3: Stated Priority

// TIER 3: Stated Priority

"tier3_priority"

"tier3_priority"
:
:
{
{

"stated"

"stated"
:

:

"I want to be more productive"

"I want to be more productive"
,

,

"keywords"

"keywords"
:

:
[
[

"productive"

"productive"
,

,

"productivity"

"productivity"
]

]
}
}
,
,
// MATRIX MAPPING// MATRIX MAPPING

"matrix_mapping""matrix_mapping"::{{

"q7_self_report""q7_self_report"::"tip_top""tip_top",,

"pattern_score"

"pattern_score"
:

:
{
{

"total"

"total"
:

:
6.5
6.5
,
,

"level"

"level"
:

:
"HIGH"
"HIGH"
}
}
,
,

"discrepancy"

"discrepancy"
:

:

"minimizing"

"minimizing"
,

,

"matrix_position"

"matrix_position"
:

:
{
{

"self_report"

"self_report"
:

:

"tip_top"

"tip_top"
,

,

"pattern_level"

"pattern_level"
:

:
"HIGH"
"HIGH"
,
,

"cell"

"cell"
:

:

"denial"

"denial"

}
}
,
,

"voice_strategy"

"voice_strategy"
:

:
{
{

"strategy"

"strategy"
:

:

"gentle_reality_check"

"gentle_reality_check"
,

,

"surface_gap""surface_gap"::truetrue

}}
}},,
// CAUSAL CHAINS
// CAUSAL CHAINS

"causal_chains"

"causal_chains"
:
:
[
[
{
{

"patterns"

"patterns"
:

:
[
[

"comparison_driven"

"comparison_driven"
,

,

"self_criticism"

"self_criticism"
]

]
,
,

"golden_key"

"golden_key"
:

:

"work_golden_key_1"

"work_golden_key_1"
,

,

"priority"

"priority"
:

:

"productivity"

"productivity"
,

,

"mechanism"

"mechanism"
:

:

"comparison → rumination → cognitive_drain"

"comparison → rumination → cognitive_drain"
,

,

"probability"

"probability"
:

:
0.92
0.92
,
,

"used_in_voice_preview"

"used_in_voice_preview"
:

:

true

true

}
}
]
]
,
,
// VOICE PREVIEW// VOICE PREVIEW

"voice_preview""voice_preview"::{{

"tone""tone"::"tony_d""tony_d",,

"text""text"::"You say you want to be more productive...""You say you want to be more productive...",,

VIII. Pattern Validation Rules
Behavioral Patterns (Type A)
Rule: Use immediately if confidence ≥ 75% AND aligns with golden key content
Demographic Tendencies (Type B)
Rule: Require explicit validation from golden keys, posterior ≥ 75%
IX. Q2 Age Revision
Updated Question Structure
Q2: "What's your age?"
[NUMBER INPUT BOX - Validation: 13-99]

"chains_used"

"chains_used"
:

:
[
[

"chain_uuid_1"

"chain_uuid_1"
]

]
,
,

"strategy_used"

"strategy_used"
:

:

"gentle_reality_check"

"gentle_reality_check"

}
}
}
}

javascript

function

function
shouldUseBehavioralPattern

shouldUseBehavioralPattern
(

(

pattern

pattern
,

,

goldenKeys

goldenKeys
)

)
{
{

ifif((patternpattern..initial_confidenceinitial_confidence<<0.750.75))returnreturnfalsefalse;;

constconst alignment alignment == goldenKeys goldenKeys..somesome((gkgk=>=>

gk gk..indicators_detectedindicators_detected[[patternpattern..patternpattern]]======truetrue

)
)
;
;

return

return
alignment

alignment
;

;
}
}

javascript

function

function
shouldUseDemographicTendency

shouldUseDemographicTendency
(

(

tendency

tendency
,

,

validationResult

validationResult
)

)
{
{

return

return
(

(

validationResult

validationResult
.

.

validated

validated
===

===

true

true
&&

&&

validationResult

validationResult
.

.

posterior

posterior
>=

>=
0.75
0.75
)
)
;
;
}
}
UX Behavior:

    All age bracket options displayed initially (grayed out)
    User types exact age into input box
    System auto-selects corresponding bracket
    Non-matching brackets fade out
    Matching bracket becomes emphasized

Age Bracket Options (Visual Reference):
1. Under 18 (should you even be here?)
2. 18-25 (figuring it out)
3. 26-35 (supposed to have it together by now)
4. 36-50 (definitely don't have it together)
5. 50+ (gave up pretending to have it together)
Data Stored:
Purpose:

    Exact age enables precise demographic tendency calculations
    Bracket provides life stage context for therapeutic framing

X. Tier 3 Priority Detection & Selection
Person Overlap Detection
Purpose: When the same person appears across multiple golden keys, they are likely THE priority.
Approach: Ask for clarification when overlap is detected (simple vs. complex entity recognition).
Trigger Logic

javascript

{
{

"q2_age"

"q2_age"
:

:
{
{

"exact_age"

"exact_age"
:

:
28
28
,
,

"bracket"

"bracket"
:

:
"26-35"
"26-35"
}
}
}
}
Priority Boosting Logic
If User Confirms Same Person:

javascript

function

function
detectPotentialPersonOverlap

detectPotentialPersonOverlap
(

(

goldenKeys

goldenKeys
)

)
{
{

const

const
relationshipKeywords

relationshipKeywords
=

=
[
[

'partner'

'partner'
,

,

'girlfriend'

'girlfriend'
,

,

'boyfriend'

'boyfriend'
,

,

'wife'

'wife'
,

,

'husband'

'husband'
,

,

'mom'

'mom'
,

,

'dad'

'dad'
,

,

'boss'

'boss'
,

,

'friend'

'friend'
,

,

'ex'

'ex'

]
]
;
;

const

const
domainsWithRelationship

domainsWithRelationship
=

=
[
[
]
]
;
;

goldenKeys goldenKeys..forEachforEach((keykey=>=>{{

constconst hasRelationshipLanguage hasRelationshipLanguage == relationshipKeywords relationshipKeywords..somesome((keywordkeyword=>=>

key key..texttext..toLowerCasetoLowerCase(())..includesincludes((keywordkeyword))

)
)
;
;

if

if
(

(

hasRelationshipLanguage

hasRelationshipLanguage
)

)
{
{

domainsWithRelationship

domainsWithRelationship
.

.

push

push
(

(

key

key
.

.

domain

domain
)

)
;
;
}
}
}
}
)
)
;
;

return

return
domainsWithRelationship

domainsWithRelationship
.

.

length

length
>=

>=
2
2
;
;
}
}
PART II: VOICE PREVIEW FRAMEWORK
XI. Voice Preview Architecture
The Formula
Components:
1. Matrix Strategy - Determines opening stance
2. Stated Priority - What user explicitly wants
3. Golden Key Evidence - High-confidence vulnerable shares
4. Pattern Insight - Hidden mechanism connecting priority to golden keys
What Voice Previews Should Do

javascript

function

function
applyPersonOverlapBoost

applyPersonOverlapBoost
(

(

themes

themes
,

,

confirmedPerson

confirmedPerson
)

)
{
{

const

const
personToTheme

personToTheme
=

=
{
{

'romantic_partner'

'romantic_partner'
:

:

'relationships'

'relationships'
,

,

'boss'

'boss'
:

:

'work'

'work'
,

,

'family'

'family'
:

:

'relationships'

'relationships'

}
}
;
;

constconst relevantTheme relevantTheme == personToTheme personToTheme[[confirmedPersonconfirmedPerson]];;

ifif((themesthemes[[relevantThemerelevantTheme]])){{

themes themes[[relevantThemerelevantTheme]]== 100100 ;; // Boost to top priority// Boost to top priority

}
}

return

return
{

{

boosted_theme

boosted_theme
:

:

relevantTheme

relevantTheme
,

,

contextual_label

contextual_label
:

:

generateContextualLabel

generateContextualLabel
(

(

confirmedPerson

confirmedPerson
)

)
}
}
;
;
}
}

Voice Preview = Matrix Strategy + Stated Priority + Golden Key Evidence + Pattern Insight

Voice Preview = Matrix Strategy + Stated Priority + Golden Key Evidence + Pattern Insight

✅ Connect dots the user hasn't connected
✅ Use the user's actual words
✅ Reveal hidden patterns/mechanisms
✅ Reframe the priority through the pattern
✅ Ask provocative questions
✅ Demonstrate attentiveness naturally
❌ List observed patterns
❌ Score points ("You say A but actually B")
❌ Reference backend metrics
❌ Overwhelm with data
❌ Be performatively clever
Voice Preview Template Structure
Length Target: 100-150 words
Basic Structure:
XII. Matrix-Driven Strategy Selection
Decision Tree

[MATRIX OPENING - if needed]

[MATRIX OPENING - if needed]

[STATED PRIORITY]
[STATED PRIORITY]
[GOLDEN KEY REFERENCE][GOLDEN KEY REFERENCE]
[PATTERN INSIGHT / MECHANISM][PATTERN INSIGHT / MECHANISM]
[REFRAME / PROVOCATIVE QUESTION][REFRAME / PROVOCATIVE QUESTION]
XIII. Voice Preview Templates by Strategy
Strategy 1: Gentle Reality Check
When: Self-report minimizes + HIGH patterns + Clear golden keys
Template:
Tony D Example:
"You want to be more productive, but you're up at 3am replaying work conversations and beating yourself up
over small things. That's not a productivity problem—that's an exhaustion problem. The mental noise is
stealing your energy before the day even starts. What if fixing productivity actually means fixing the 3am
worry spiral first?"
Clara Example:

javascript

function

function
selectVoiceStrategy

selectVoiceStrategy
(

(

matrixPosition

matrixPosition
,

,

goldenKeyConfidence

goldenKeyConfidence
)

)
{
{

const

const
{

{

interpretation

interpretation
,

,

patternLevel

patternLevel
}

}
=
=

matrixPosition

matrixPosition
;

;

if

if
(

(

interpretation

interpretation
===

===

"minimizing"

"minimizing"
&&

&&

patternLevel

patternLevel
===

===
"HIGH"
"HIGH"
)
)
{
{

return

return
"GENTLE_REALITY_CHECK"

"GENTLE_REALITY_CHECK"
;
;
}
}

ifif((interpretation interpretation ======"catastrophizing""catastrophizing"&&&& patternLevel patternLevel ======"LOW""LOW")){{

returnreturn"STRENGTH_BASED_REFRAME""STRENGTH_BASED_REFRAME";;

}}

if

if
(

(

interpretation

interpretation
===

===

"aligned"

"aligned"
)

)
{
{

return

return
"VALIDATE_AND_DEEPEN"

"VALIDATE_AND_DEEPEN"
;
;
}
}

if

if
(

(

selfReport

selfReport
===

===

"stop_asking"

"stop_asking"
)

)
{
{

return

return
"RESPECT_THEN_ENGAGE"

"RESPECT_THEN_ENGAGE"
;
;
}
}

return

return
"CAUSAL_CHAIN_INSIGHT"

"CAUSAL_CHAIN_INSIGHT"
;
;
}
}

You want to [priority], but here's what I'm seeing: [golden key specifics]. That's not a [surface problem]—that's a [root You want to [priority], but here's what I'm seeing: [golden key specifics]. That's not a [surface problem]—that's a [root

cause]. [Pattern insight]. What if fixing [priority] actually means addressing [root cause] first?cause]. [Pattern insight]. What if fixing [priority] actually means addressing [root cause] first?

"You'd like to be more productive, and I hear that's important to you. You also mentioned waking up at 3am
worried about things you said at work. I'm wondering if these might be connected—when we're exhausted
from nighttime worry, productivity naturally suffers. What do you think might shift if we addressed the
worry first?"
Marcus Example:
"You seek greater productivity. Yet you wake at 3am replaying conversations, judging yourself harshly for
small failings. Consider: the productivity you desire may be impossible while the mind is occupied with
yesterday's words. What if the path to effectiveness begins not with doing more, but with quieting the
rumination that prevents rest?"
Strategy 2: Strength-Based Reframe
When: Self-report catastrophizes + LOW patterns + Evidence of coping
Template:
Tony D Example:
"You say you're barely hanging on, but look at what you're actually doing: You're proactive, you think things
through, you get shit done even when it's hard. What if the anxiety isn't about falling apart—it's about the
gap between how capable you are and how incapable you feel? You're not breaking—you're exhausted from
not trusting yourself."
Clara Example:
"You mentioned feeling like you're barely hanging on, and I honor that this feels overwhelming for you. I
also notice that you're still showing up—you're proactive, thoughtful, and getting things done despite how
hard it feels. I'm wondering if the real struggle might be the disconnect between your actual capability and
how you feel about yourself. What might it be like to trust yourself a bit more?"
Marcus Example:
"You perceive yourself as barely enduring. Yet observe your actions: You anticipate challenges, you persist
despite difficulty, you fulfill obligations. Perhaps the burden is not inadequacy but the weight of judging
yourself inadequate while simultaneously proving otherwise. The anxiety serves neither your peace nor your
performance. What if you were already enough?"

You say you're [catastrophic self-report], and I hear that it feels [validate]. But here's what I'm also seeing: [evidence of

You say you're [catastrophic self-report], and I hear that it feels [validate]. But here's what I'm also seeing: [evidence of

capability]. What if [real struggle] isn't about [perceived problem]—it's about [gap between capability and self-

capability]. What if [real struggle] isn't about [perceived problem]—it's about [gap between capability and self-

perception]? What would shift if you trusted yourself more?

perception]? What would shift if you trusted yourself more?

Strategy 3: Validate and Deepen
When: Self-report aligns with pattern score
Template:
Tony D Example:
"You want better relationships, and you mentioned you and your partner fight about the same shit repeatedly.
Here's what I'm seeing: You replay arguments for days, stress about texts, second-guess what you said. The
relationship struggle isn't about what you fight about—it's about the rumination that keeps you stuck in fights
long after they're over. What if breaking that loop changes everything?"
Clara Example:
"You're hoping for better relationships, and you shared that you and your partner find yourselves in the same
conflicts repeatedly. I'm noticing a pattern: replaying arguments, worrying about communication,
questioning yourself. I wonder if the challenge isn't the topics themselves, but how the mental replay keeps
the conflict alive long after the moment has passed. What might be possible if you could let go a bit sooner?"
Marcus Example:
"You seek harmony in relationships, yet find yourself revisiting the same conflicts. You replay exchanges,
scrutinize words, question interpretations. The discord perpetuates not in the original disagreement, but in
your continued habitation of it. One cannot resolve yesterday's argument while mentally dwelling in it today.
What if presence, not analysis, is the path forward?"
Strategy 4: Respect Then Engage
When: Self-report = "Stop asking me"
Template:
Tony D Example:
"Fair enough—let's skip the feelings check. Here's what I'm noticing about the procrastination: You wait
until crisis hits, then adrenaline kicks in and you power through. That pattern works... until it doesn't. The
emergency becomes your permission to be human and turn in imperfect work. What if you could access that
capability without needing panic as the fuel?"

You want to [priority], and you mentioned [golden key]. Here's the pattern: [mechanism]. What if [real issue] isn't about You want to [priority], and you mentioned [golden key]. Here's the pattern: [mechanism]. What if [real issue] isn't about

[surface]—it's about [underlying pattern]? [Question about breaking pattern][surface]—it's about [underlying pattern]? [Question about breaking pattern]

[Respect deflection]. Here's what I'm noticing about [priority]: [pattern observation]. [Pattern insight]. [Brief question]

[Respect deflection]. Here's what I'm noticing about [priority]: [pattern observation]. [Pattern insight]. [Brief question]

Clara Example:
"I hear you—we don't need to do the 'how are you' thing. What I'm curious about is the procrastination
pattern you mentioned. It seems like pressure becomes the catalyst for action, almost like you need the crisis
to give yourself permission to just do it imperfectly. I wonder what might open up if you could give yourself
that permission earlier?"
Marcus Example:
"Noted—we need not examine your state. Yet consider your relationship with action: You delay until
necessity compels, then execute under duress. The procrastination is not laziness but a demand for perfect
readiness—which never arrives. The deadline grants permission for imperfection. Could you grant yourself
that permission without requiring crisis first?"
XIV. Voice-Specific Adaptation Guidelines
Tony D: Direct & Confrontational
Characteristics:

    Cuts through bullshit immediately
    Strong language ("shit," "screwed up")
    Challenges directly without softening
    Provocative questions
    Short, punchy sentences
    No hedging

Sentence Starters:

    "Here's what's actually happening..."
    "You're not [X]—you're [Y]..."
    "That's not a [X] problem—that's [Y]..."
    "Let's be real..."

Avoid:

    "I'm wondering if..."
    "Perhaps..."
    Diplomatic language

Clara: Gentle & Exploratory
Characteristics:

    Warm, validating tone
    Softening language ("I wonder," "I'm curious")
    Questions as invitations
    Acknowledges emotions explicitly
    Longer, flowing sentences
    Creates safety

Sentence Starters:

    "I'm wondering if..."
    "I'm noticing that..."
    "I'm curious about..."
    "What might it be like if..."
    "I hear that [validation]..."

Avoid:

    Harsh language
    Direct confrontation
    Aggressive questions

Marcus Aurelius: Philosophical & Reflective
Characteristics:

    Stoic, observational tone
    Formal, elevated language
    Philosophical observations
    Questions probe deeper meaning
    Emphasizes paradoxes
    Timeless wisdom tone

Sentence Starters:

    "Consider..."
    "Observe that..."
    "Perhaps [insight]..."
    "What if [philosophical question]..."
    "You seek [X], yet [paradox]..."

Avoid:

    Modern slang
    Emotional validation language
    Overly warm/soft tone

XV. Quality Control & Edge Cases
Quality Control Checklist
Data Quality Requirements:
At least ONE high-confidence golden key (≥ 0.75)
Stated priority is clear
Matrix position calculated
At least ONE causal chain (≥ 0.75 probability)
Content Requirements:
Uses user's actual words from golden keys
Connects priority to golden key evidence
Reveals pattern/mechanism
Ends with provocative question or reframe
Length: 100-150 words
Matches selected voice characteristics
Prohibited:
No backend metrics visible
No pattern labels visible to user
No list of observations
No jargon
Edge Case: Insufficient Data
If golden keys are weak:
Edge Case: Unclear Priority
If priority is vague:
Edge Case: No Patterns
If pattern score is LOW and golden keys are mundane:
Common Mistakes to Avoid
Mistake 1: The Observation Report
Mistake 2: The Score Card
Mistake 3: The Data Dump
PART III: 3-TIER QUESTION ARCHITECTURE
XVI. Tier 1: Pattern Detection Questions

"You want to be more productive. Based on what you've shared, it sounds like you've got a lot on your plate. Before we

"You want to be more productive. Based on what you've shared, it sounds like you've got a lot on your plate. Before we

dive in—what does 'productive' actually mean to you? What's getting in the way?"

dive in—what does 'productive' actually mean to you? What's getting in the way?"

"You mentioned waking up at 3am worried about work conversations and replaying what you said for days. That's

"You mentioned waking up at 3am worried about work conversations and replaying what you said for days. That's

exhausting. What's the thing you most want to change about this pattern?"

exhausting. What's the thing you most want to change about this pattern?"

"Sounds like you're doing pretty well overall. Nothing jumping out as a major concern. Is there something specific you'd

"Sounds like you're doing pretty well overall. Nothing jumping out as a major concern. Is there something specific you'd

like to work on, or are you just exploring what this tool can do?"

like to work on, or are you just exploring what this tool can do?"

BAD: "I noticed you have rumination, social anxiety, and self-criticism..."

BAD: "I noticed you have rumination, social anxiety, and self-criticism..."

GOOD: "You're up at 3am replaying conversations and beating yourself up..."

GOOD: "You're up at 3am replaying conversations and beating yourself up..."

BAD: "You say you're great, but your pattern score indicates..."

BAD: "You say you're great, but your pattern score indicates..."

GOOD: "You want to be productive, but you're exhausted from worry spirals..."

GOOD: "You want to be productive, but you're exhausted from worry spirals..."

BAD: "Based on Q4, Q5, Q6, and your golden keys about work..."

BAD: "Based on Q4, Q5, Q6, and your golden keys about work..."

GOOD: "You mentioned replaying arguments for days..."

GOOD: "You mentioned replaying arguments for days..."

Q1: Gender
Question: "Gender:"
Options:
1. Male
2. Female
3. Non-binary
4. I hate whoever invented the term non-binary
Tone Preference Indicators:

    Option 3: left_leaning
    Option 4: right_leaning

Q2: Age
Question: "What's your age?"
[NUMBER INPUT BOX - Validation: 13-99]
Age Bracket Options (Visual Reference):
1. Under 18 (should you even be here?)
2. 18-25 (figuring it out)
3. 26-35 (supposed to have it together by now)
4. 36-50 (definitely don't have it together)
5. 50+ (gave up pretending to have it together)
Demographic Tendencies by Age:
26-35:

    comparison_driven (65% base rate)
    achievement_pressure (70%)
    life_milestone_anxiety (55%)

36-50:

    existential_questioning (60%)
    regret_processing (55%)
    meaning_crisis (50%)

50+:

    retrospective_processing (70%)
    mortality_awareness (65%)
    acceptance_vs_regret_tension (60%)

Q3: AI Trust
Question: "Your relationship with AI chatbots is:"
Options:
1. Obsessed - I talk to them more than actual humans
2. Curious experimenter - trying to figure out what they can do
3. I don't trust them - they know too much already
4. I'm sick of everyone talking about AI
Pattern Indicators:

    Options 1-2: easier_engagement
    Options 3-4: harder_engagement

Q4: Kitchen Sponge (NESTED)
Initial: "In your kitchen sink, the sponge is:"
Options:
1. Fresh as a daisy - replaced regularly
2. A tortured political prisoner
If "Fresh": "What drives you to keep it fresh?"
1. I like things tidy → conscientiousness
2. I feel gross if I don't → perfectionism, high_standards
3. It's what you're supposed to do → rule_following
4. I replace it before it gets bad → proactive
If "Tortured": "When you see that filthy thing, what goes through your head?"
1. Meh, not a priority → low_conscientiousness
2. Ugh, I'm disgusting/I'm a mess → perfectionism, self_criticism, harsh_self_judgment
3. Crap, forgot to get a new one → executive_function_deficit
4. I only replace when I absolutely have to → [SECOND FOLLOW-UP]
Q5: Texting Back
Question: "When someone texts you, you:"
Options:
1. Respond immediately → baseline_functional
2. Read it, mean to respond, forget for days → executive_function_deficit
3. Hold down to read without showing it read, stress until I respond → social_obligation_anxiety,
pressure_sensitivity, rumination
4. Don't stress - I've turned off read receipts → proactive_pressure_management, boundary_setting
Q6: Problem-Solving Spiral
Question: "When you can't figure something out, you:"
Options:
1. Keep trying calmly until I get it → healthy_baseline, emotional_regulation
2. Fail repeatedly, think I'm worthless, then solve it and feel brilliant → emotional_dysregulation,

all_or_nothing_thinking

3. Stop trying and hope it resolves itself → avoidance_coping, learned_helplessness
4. Give up and move on to something easier → avoidance_coping, low_frustration_tolerance
5. Decide it wasn't important anyway → avoidance_coping, ego_protection
6. Enough with these questions. Let's move on. → skip_trigger
Skip Logic: If option 6, force pick from 1-5 with message: "Fair enough. But real quick—if you HAD to pick
one, which sounds most like you?"
Q7: Self-Check-In (MATRIX TRIGGER)
Question: "How would you describe where you're at right now?"
Options:
1. Tip top - couldn't be better → self_presentation_optimistic
2. Doing fine - the usual ups and downs → self_presentation_balanced
3. Hanging on by a thread → self_presentation_struggling
4. Stop asking me how I'm doing - I hate that question → self_presentation_deflection
Purpose: Captures self-assessment BEFORE Tier 2 for matrix validation AFTER Tier 2
XVII. Tier 2: Golden Key Excavation
Purpose: Excavate vulnerable shares about what's actually weighing on the user.
Golden Key Quality Criteria:

    40+ words
    Emotional language
    Temporal markers
    Personal stakes/consequences
    Behavioral description

Domain 1: Sleep/Rest
Q1a: "On a scale of 1-10, how would you rate your sleep quality lately?"
Logic:

    If 8-10: Skip to Domain 2
    If 1-7: → Q1b

Q1b: "What's making it hard to sleep?"
1. Hard time falling asleep → Q1b-alt
2. Wake up in the middle of the night → Q1c
3. Both → Q1c
Q1b-alt: "When you're lying there trying to fall asleep, is your mind racing about something?"
1. Ye s → Q1d
2. No, mind is quiet → Skip to Domain 2
Q1c: "When you wake up, are you generally thinking about something specific?"
1. Yes, usually the same thing(s) → Q1d
2. Yes, but always different → Q1d
3. No, just can't sleep → Q1c-alt
Q1d: "What are the things you find yourself thinking about?"
1. Work/career
2. Romantic relationship
3. Family
4. Money/finances
5. Health
6. Something else → [TEXT]
Q1e: "In a nutshell, can you tell me what's going on with [topic]?"
[TEXT INPUT - Golden Key Excavation]
Domain 2: Rumination Patterns
Q2a: "Do things get stuck in your head, or are you pretty good at letting stuff go?"
Scale: 1 (let go easily) to 10 (stuck and can't shake)
Logic:

    If 1-5: Skip to Domain 3
    If 6-10: → Q2b

Q2b: "What kind of stuff tends to get stuck?"
1. Things I said or did
2. Things other people said or did
3. Things I'm worried might happen
4. Work stuff
5. All of the above
6. Something else → [TEXT]
Q2c: "Give me an example. What's something that's been stuck in your head recently?"
[TEXT INPUT - Golden Key Excavation]
Domain 3: Work/Performance
Q3a: "How's work feeling lately? Scale of 1-10."
Logic:

    If 7-10: → Q3a-alt (light touch)
    If 1-6: → Q3b (deep excavation)

Q3a-alt: "Anything at work on your mind?"
1. Yeah, actually → [TEXT]
2. Nope, things are good → Skip to Domain 4
Q3b: "What's the hardest part right now?"
1. Not getting enough done
2. Don't feel good enough/fear of failing
3. Difficult boss or coworkers
4. Feels meaningless or draining
5. Something else → [TEXT]
Q3c: "Can you tell me more about that? What's going on?"
[TEXT INPUT - Golden Key Excavation]
Domain 4: Relationships
Q4a: "How are your personal relationships?"
1. Good → Q4b-GOOD
2. Not so good → Q4c
Q4b-GOOD: "On a scale of 1-10, what do you mean by good?"
Scale:

    8-10: Fantastic—no problems
    5-7: Pretty good, but maybe some cracks
    1-4: Trying to make them good

Logic:

    If 8-10: → Q4c
    If 1-7: → Q4c

Q4c: "A lot of times we take up a lot of real estate in our mind thinking about—even obsessing over—a
situation with someone close to us. It could be something happening right now, something that happened in the
past, or something that might happen in the future. And all that energy is a drain on our time and resources.
Does that sound like something you ever do?"
Options:
1. Yeah, that's me → Q4d
2. Not really → Skip to Q5
Q4d: "Who or what situation takes up the most space in your head?"
1. Romantic partner/spouse
2. Ex-partner
3. Family
4. Friend(s)
5. Someone else → [TEXT]
Q4e: "Can you tell me more about that? What's going on?"
[TEXT INPUT - Golden Key Excavation]
Tier 3 Transition
Q5: "Is there anything else I haven't touched on that's really important to you—a priority you'd like to work on
—that I might be able to help you sort through and get better at?"
Options:
1. Yeah, there's something → [TEXT]
2. No, I think we covered it → TRIGGERS PERSON OVERLAP CHECK
Person Overlap Clarification (Conditional)
Trigger: If 2+ golden keys contain relationship language
Q5b: "Quick question before we move on..."
System generates contextual question:
Example:
"You mentioned issues with your girlfriend affecting your sleep, and you also talked about replaying
arguments. Are all of these about the same person? "
Options:
1. Ye s → Boost relevant priority
2. No, different people → No boost
XVIII. Tier 3: Priority Identification
Purpose: User explicitly states what they want to work on.
Structure TBD - Will be built based on:

    Open text input
    Pre-populated options from Tier 2
    Person overlap results

Examples:

    "I want to be more productive"
    "I want to stop procrastinating"
    "I want better relationships"
    "I want to sleep better"

PART IV: EVIDENCE DETECTION LIBRARY
XIX. Age-Based Demographic Tendencies
Comparison-Driven (Age 26-35, Base Rate: 65%)
Strong Evidence (2.0x likelihood):

    "everyone else," "everyone around me," "all my friends"
    "I'm behind," "falling behind," "should be further along"
    "they have X and I don't," "they're X and I'm not"
    "by now I should," "at my age I should"
    Specific comparisons: "they're getting promoted/married/buying houses and I'm..."

Moderate Evidence (1.5x likelihood):

    "comparing myself," "compare"
    "others," "people my age"
    "successful," "ahead"
    "not where I thought I'd be"

Example Golden Key:
"Everyone around me is getting promoted and buying houses and I'm still renting and in the same job. I feel
like I'm falling behind."
Evidence Detected: "everyone around me," "I'm...and I'm still," "falling behind"
Likelihood Ratio: 2.0
Posterior: 65% × 2.0 = 92% (validated)
Achievement Pressure (Age 26-35, Base Rate: 70%)
Strong Evidence:

    "supposed to," "should have," "need to"
    "pressure to," "expected to"
    "prove myself," "show that I can"
    "not good enough," "not measuring up"
    "success," "achieve," "accomplish" in stressful context

Moderate Evidence:

    "goals," "milestones"
    "career," "advancement"
    "expectations"

Life Milestone Anxiety (Age 26-35, Base Rate: 55%)
Strong Evidence:

    "marriage," "kids," "family" in anxious/pressured context
    "biological clock," "running out of time"
    "settle down," "be more stable"
    "my parents keep asking," "when are you going to"

Moderate Evidence:

    "relationship," "commitment"
    "future," "long-term"

Existential Questioning (Age 36-50, Base Rate: 60%)
Strong Evidence:

    "is this all there is?" "is this it?"
    "what's the point?" "what am I doing?"
    "wasted," "missed my chance"
    "too late," "if only I had"
    "meaning," "purpose" in questioning/doubting context

Moderate Evidence:

    "regret," "should have"
    "midlife"
    "stuck," "trapped"

Regret Processing (Age 36-50, Base Rate: 55%)
Strong Evidence:

    "if I had," "if only"
    "wish I'd," "should have"
    "too late now," "can't go back"
    "different path," "other choice"

Moderate Evidence:

    "regret"
    "mistake," "wrong decision"

Retrospective Processing (Age 50+, Base Rate: 70%)
Strong Evidence:

    "looking back," "in hindsight"
    "my life," "what I've done"
    "legacy," "what I'll leave behind"
    "time I have left"

Moderate Evidence:

    "memories"
    "past"
    "years gone by"

Mortality Awareness (Age 50+, Base Rate: 65%)
Strong Evidence:

    "time is running out," "not much time left"
    "health declining," "body breaking down"
    "die," "death," "end"
    "while I still can"

Moderate Evidence:

    "age," "getting old"
    "health issues"

XX. Gender-Based Demographic Tendencies
Emotional Suppression Tendency (Male, Base Rate: ~55%)
Strong Evidence:

    "man up," "be strong," "don't show weakness"
    "can't let them see," "have to stay tough"
    "showing emotions is," "crying is"
    "I'm not supposed to feel"

Moderate Evidence:

    "push through"
    "deal with it"
    "handle it myself"

Note: This is a TENTATIVE tendency that requires validation. Do not apply without strong evidence.
XXI. Cross-Pattern Evidence
Rumination (Can appear at any age)
Strong Evidence:

    "replaying," "replay"
    "over and over," "again and again"
    "can't stop thinking," "won't stop"
    "analyzing," "going through"
    "what did they think," "what if I'd said"

Moderate Evidence:

    "keep thinking"
    "stuck on"
    "obsessing"

Self-Criticism (Can appear at any age)
Strong Evidence:

    "I'm disgusting," "I'm a mess," "I'm worthless"
    "I'm such a," "I'm so stupid"
    "I can't do anything right"
    "failure," "incompetent" (self-directed)

Moderate Evidence:

    "I'm not good enough"
    "I should be better"

Avoidance (Can appear at any age)
Strong Evidence:

    "I avoid," "avoiding"
    "put off," "delay," "procrastinate"
    "don't want to deal with," "can't face"
    "hide," "ignore"

Moderate Evidence:

    "later"
    "not ready"

XXII. Evidence Strength Scoring
Likelihood Ratios
Strong Evidence: 2.0x (doubles likelihood)
Moderate Evidence: 1.5x (50% increase)
Weak Evidence: 1.2x (20% increase)
Contradictory Evidence: 0.5x (halves likelihood)
Multiple Evidence Accumulation
When multiple pieces of evidence appear in same golden key:
Detection Implementation

javascript

// Example: 2 strong + 1 moderate evidence

// Example: 2 strong + 1 moderate evidence

const

const
likelihoodRatio

likelihoodRatio
=

=
2.0
2.0
*
*
2.0
2.0
*
*
1.5
1.5
=
=
6.0
6.0

// But cap at 5.0 to avoid overconfidence

// But cap at 5.0 to avoid overconfidence

const

const
cappedRatio

cappedRatio
=

=

Math

Math
.

.

min

min
(

(

likelihoodRatio

likelihoodRatio
,

,
5.0
5.0
)
)
=
=
5.0
5.0

// Apply to base rate

// Apply to base rate

constconst posterior posterior == baseRate baseRate ** cappedRatio cappedRatio ==0.650.65**5.05.0==3.253.25

// Cap at 98% to avoid certainty// Cap at 98% to avoid certainty

constconst finalPosterior finalPosterior ==MathMath..minmin((posteriorposterior,,0.980.98))==0.980.98

Add New Evidence Patterns Here

javascript

function

function
detectEvidence

detectEvidence
(

(

goldenKeyText

goldenKeyText
,

,

demographicTendency

demographicTendency
)

)
{
{

const

const
text

text
=

=

goldenKeyText

goldenKeyText
.

.

toLowerCase

toLowerCase
(

(
)
)
;
;

const

const
evidence

evidence
=

=
{
{

strong

strong
:

:
[
[
]
]
,
,

moderate

moderate
:

:
[
[
]
]
,
,

weak

weak
:

:
[
[
]
]
}
}
;
;

constconst patterns patterns ==EVIDENCE_LIBRARYEVIDENCE_LIBRARY[[demographicTendencydemographicTendency]];;

// Check strong evidence// Check strong evidence

patterns

patterns
.

.

strong

strong
.

.

forEach

forEach
(

(

keyword

keyword
=>

=>
{
{

if

if
(

(

text

text
.

.

includes

includes
(

(

keyword

keyword
)

)
)
)
{
{

evidence

evidence
.

.

strong

strong
.

.

push

push
(

(

keyword

keyword
)

)
;
;
}
}
}
}
)
)
;
;

// Check moderate evidence

// Check moderate evidence

patterns

patterns
.

.

moderate

moderate
.

.

forEach

forEach
(

(

keyword

keyword
=>

=>
{
{

if

if
(

(

text

text
.

.

includes

includes
(

(

keyword

keyword
)

)
)
)
{
{

evidence

evidence
.

.

moderate

moderate
.

.

push

push
(

(

keyword

keyword
)

)
;
;
}
}
}
}
)
)
;
;

returnreturn{{

evidenceevidence:: evidence evidence,,

strengthstrength::calculateEvidenceStrengthcalculateEvidenceStrength((evidenceevidence)),,

likelihood_ratio

likelihood_ratio
:

:

calculateLikelihoodRatio

calculateLikelihoodRatio
(

(

evidence

evidence
)

)
}
}
;
;
}
}

function

function
calculateLikelihoodRatio

calculateLikelihoodRatio
(

(

evidence

evidence
)

)
{
{

let

let
ratio

ratio
=

=
1.0
1.0
;
;

evidence

evidence
.

.

strong

strong
.

.

forEach

forEach
(

(
(
(
)
)
=>
=>

ratio

ratio
*=

*=
2.0
2.0
)
)
;
;

evidence

evidence
.

.

moderate

moderate
.

.

forEach

forEach
(

(
(
(
)
)
=>
=>

ratio

ratio
*=

*=
1.5
1.5
)
)
;
;

// Cap to avoid overconfidence

// Cap to avoid overconfidence

return

return
Math

Math
.

.

min

min
(

(

ratio

ratio
,

,
5.0
5.0
)
)
;
;
}}
Template for Adding New Evidence:
APPENDIX: Implementation Summary
Complete Build Sequence
Phase 1: Backend Foundation
1. Database Schema - Create tables for tier1_responses, tier2_golden_keys, tier3_priority, matrix_mapping
2. Pattern Detection Logic - Implement Type A/B/C pattern classification
3. Bayesian Validation - Build evidence detection and posterior calculation
4. Causal Chain Construction - Implement template matching and probability scoring
Phase 2: Matrix Mapping
1. Pattern Score Calculator - Aggregate behavioral + validated + severity indicators
2. Discrepancy Detection - Compare Q7 self-report to pattern score
3. Strategy Selection - Determine voice preview approach based on matrix position
4. Matrix Data Storage - Store all matrix metadata for analysis
Phase 3: Voice Preview Generation

markdown

[Pattern Name] ([Age/Context], Base Rate: X%)

[Pattern Name] ([Age/Context], Base Rate: X%)

****Strong Evidence:Strong Evidence:****

        "exact phrase" "exact phrase"
        "another phrase" "another phrase"

**
**

Moderate Evidence:

Moderate Evidence:
**

**
-
-

"somewhat related phrase"

"somewhat related phrase"

**
**

Example Golden Key:

Example Golden Key:
**

**
>
>

"Sample text showing the pattern"

"Sample text showing the pattern"

**
**

Evidence Detected:

Evidence Detected:
**

**

List what was found

List what was found

**
**

Posterior:

Posterior:
**

**

Calculation showing validation

Calculation showing validation

1. Template System - Implement 5 strategy templates with voice adaptations
2. Golden Key Integration - Extract and reference user's actual words
3. Pattern Insight Weaving - Connect priority to golden keys through mechanisms
4. Quality Control - Validate length, tone, content requirements
Phase 4: Frontend Integration
1. Tier 1 Questions - Build UI for all 7 questions with nested logic
2. Tier 2 Questions - Build domain-by-domain excavation flow
3. Tier 3 Priority - Build priority selection with person overlap detection
4. Voice Preview Display - Show all 3 voices with selection mechanism
Phase 5: Testing & Validation
1. Unit Tests - Test each component independently
2. Integration Tests - Test full 3-tier flow
3. User Testing - Validate voice preview quality and selection rates
4. A/B Testing - Compare different approaches to optimization
Critical Success Factors
✅ Pattern confidence thresholds maintained (≥0.75 for all usage)
✅ Bayesian validation properly implemented (no demographic tendencies used without evidence)
✅ Matrix gap surfaced selectively (only when major discrepancy + clear strategy)
✅ Voice previews deliver insight (not observation reports)
✅ User's words always referenced (golden keys quoted or closely paraphrased)
✅ Length discipline maintained (100-150 words per voice)
✅ Tone differentiation clear (Tony ≠ Clara ≠ Marcus)
Future Enhancements
Post-Onboarding Memory System

    How journal entries reference onboarding patterns
    How golden keys inform therapeutic continuity
    How matrix position influences ongoing voice tone
    How stated priority guides long-term pattern insights

Advanced Pattern Detection

    Multi-golden-key pattern synthesis
    Temporal pattern tracking (how patterns change over time)
    Cross-domain pattern connections
    Pattern breakthrough detection

Voice Evolution

    Voice adaptation based on user feedback
    Tone calibration over time
    Pattern-specific voice customization
    Crisis mode voice shifting

Last Updated: January 2025
Status: Complete - Ready for Implementation
Next Steps: Create Claude Code implementation prompts

This is a offline tool, your data stays locally and is not send to any server!

Feedback & Bug Reports