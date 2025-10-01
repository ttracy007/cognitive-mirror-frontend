/**
 * Voice Transcription Cleaner
 * Frontend-only utility for cleaning voice-to-text transcription
 * No external dependencies - pure JavaScript
 */

class VoiceTranscriptionCleaner {
  constructor(options = {}) {
    // Configuration options
    this.removeFillersEnabled = options.removeFillersEnabled !== false; // Default: true
    this.preserveFillers = options.preserveFillers || []; // Fillers to keep

    // Self-correction patterns
    this.selfCorrectionPatterns = [
      // "I always I often" → "I often" (keep second instance)
      {
        pattern: /\b(I|we|they|he|she|you)\s+(\w+)\s+\1\s+(\w+)/gi,
        replacement: '$1 $3'
      },
      // "I feel like I feel" → "I feel"
      {
        pattern: /\b(I|we|they|he|she|you)\s+(feel|think|know|believe)\s+(like|that)\s+\1\s+\2/gi,
        replacement: '$1 $2'
      }
    ];

    // Repeated word patterns
    this.repeatedWordPatterns = [
      // "the the" → "the"
      {
        pattern: /\b(\w+)\s+\1\b/gi,
        replacement: '$1'
      }
    ];

    // Filler words to remove (configurable)
    this.fillerWords = [
      'um', 'uh', 'er', 'ah', 'uhm', 'hmm'
    ];

    // Filler phrases to remove
    this.fillerPhrases = [
      'you know', 'i mean', 'like you know', 'you know like'
    ];

    // Question word patterns for automatic question mark detection
    this.questionWords = [
      'why', 'what', 'when', 'where', 'who', 'how',
      'is', 'are', 'can', 'could', 'would', 'should',
      'do', 'does', 'did', 'will', 'won\'t', 'can\'t'
    ];
  }

  /**
   * Main cleaning method
   * @param {string} text - Raw transcription text
   * @returns {string} - Cleaned text
   */
  cleanTranscription(text) {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text.trim();

    // Step 1: Apply self-correction patterns
    cleaned = this.applySelfCorrections(cleaned);

    // Step 2: Remove repeated words
    cleaned = this.removeRepeatedWords(cleaned);

    // Step 3: Remove filler words (if enabled)
    if (this.removeFillersEnabled) {
      cleaned = this.removeFillers(cleaned);
    }

    // Step 4: Clean punctuation
    cleaned = this.cleanPunctuation(cleaned);

    // Step 5: Fix capitalization
    cleaned = this.fixCapitalization(cleaned);

    // Step 6: Final cleanup
    cleaned = this.finalCleanup(cleaned);

    return cleaned;
  }

  /**
   * Apply self-correction patterns
   * Handles cases like "I always I often" → "I often"
   */
  applySelfCorrections(text) {
    let result = text;

    this.selfCorrectionPatterns.forEach(({ pattern, replacement }) => {
      result = result.replace(pattern, replacement);
    });

    return result;
  }

  /**
   * Remove repeated words
   * Handles cases like "the the" → "the"
   */
  removeRepeatedWords(text) {
    let result = text;

    this.repeatedWordPatterns.forEach(({ pattern, replacement }) => {
      result = result.replace(pattern, replacement);
    });

    return result;
  }

  /**
   * Remove filler words and phrases
   */
  removeFillers(text) {
    let result = text;

    // Remove filler phrases first (longer patterns)
    this.fillerPhrases.forEach(phrase => {
      if (!this.preserveFillers.includes(phrase)) {
        const regex = new RegExp(`\\b${phrase}\\b,?\\s*`, 'gi');
        result = result.replace(regex, '');
      }
    });

    // Remove individual filler words
    this.fillerWords.forEach(word => {
      if (!this.preserveFillers.includes(word)) {
        const regex = new RegExp(`\\b${word}\\b,?\\s*`, 'gi');
        result = result.replace(regex, '');
      }
    });

    return result;
  }

  /**
   * Clean punctuation issues
   * Handles cases like ".?" → "?" and multiple punctuation
   */
  cleanPunctuation(text) {
    let result = text;

    // Fix mixed ending punctuation - prioritize question marks and exclamations
    result = result.replace(/\.+\?+$/g, '?');
    result = result.replace(/\?+\.+$/g, '?');
    result = result.replace(/\.+!+$/g, '!');
    result = result.replace(/!+\.+$/g, '!');

    // Fix multiple punctuation marks
    result = result.replace(/\.{2,}$/g, '.');
    result = result.replace(/\?{2,}$/g, '?');
    result = result.replace(/!{2,}$/g, '!');

    // Remove spaces before punctuation
    result = result.replace(/\s+([.!?,:;])/g, '$1');

    // Clean up multiple spaces
    result = result.replace(/\s{2,}/g, ' ');

    return result;
  }

  /**
   * Fix capitalization
   */
  fixCapitalization(text) {
    let result = text.trim();

    if (result.length === 0) return result;

    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);

    // Always capitalize "I" (standalone)
    result = result.replace(/\bi\b/g, 'I');

    // Capitalize after sentence endings
    result = result.replace(/([.!?])\s+([a-z])/g, (match, punct, letter) => {
      return punct + ' ' + letter.toUpperCase();
    });

    return result;
  }

  /**
   * Final cleanup and add ending punctuation
   */
  finalCleanup(text) {
    let result = text.trim();

    if (result.length === 0) return result;

    // Remove any remaining multiple spaces
    result = result.replace(/\s{2,}/g, ' ');

    // Add ending punctuation if missing
    if (!/[.!?]$/.test(result)) {
      // Check if it's a question
      const isQuestion = this.isQuestion(result);
      result += isQuestion ? '?' : '.';
    }

    return result;
  }

  /**
   * Detect if text is a question
   */
  isQuestion(text) {
    const lowercased = text.toLowerCase().trim();

    // Check if starts with question words
    const startsWithQuestionWord = this.questionWords.some(word =>
      lowercased.startsWith(word + ' ')
    );

    // Check for question patterns
    const hasQuestionPattern = /\b(how|what|when|where|who|why)\b.*\b(do|does|did|is|are|was|were|can|could|would|should|will)\b/i.test(text);

    return startsWithQuestionWord || hasQuestionPattern;
  }

  /**
   * Configure filler removal
   */
  setFillerRemoval(enabled) {
    this.removeFillersEnabled = enabled;
  }

  /**
   * Add words to preserve (don't remove as fillers)
   */
  preserveFiller(word) {
    if (!this.preserveFillers.includes(word)) {
      this.preserveFillers.push(word);
    }
  }

  /**
   * Test the cleaner with provided examples
   */
  static runTests() {
    const cleaner = new VoiceTranscriptionCleaner();

    const testCases = [
      {
        input: "I always I often overreact",
        expected: "I often overreact."
      },
      {
        input: "Why do I do this.?",
        expected: "Why do I do this?"
      },
      {
        input: "I feel like I feel overwhelmed",
        expected: "I feel overwhelmed."
      },
      {
        input: "Um, you know, I just feel anxious",
        expected: "I just feel anxious."
      },
      {
        input: "the the cat is on the mat",
        expected: "The cat is on the mat."
      },
      {
        input: "i don't know i just think",
        expected: "I don't know I just think."
      }
    ];

    console.log('🧪 Voice Transcription Cleaner Tests:');
    console.log('=' .repeat(50));

    testCases.forEach((test, index) => {
      const result = cleaner.cleanTranscription(test.input);
      const passed = result === test.expected;

      console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Input:    "${test.input}"`);
      console.log(`Expected: "${test.expected}"`);
      console.log(`Result:   "${result}"`);

      if (!passed) {
        console.log(`❌ Mismatch detected`);
      }

      console.log('-'.repeat(50));
    });
  }
}

export default VoiceTranscriptionCleaner;