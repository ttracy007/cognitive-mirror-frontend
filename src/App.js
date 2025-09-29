// 🔼 Imports and Setup      
import React, { useEffect, useState } from 'react'; 
import SummaryViewer from './SummaryViewer'; 
import PatternInsightViewer from './PatternInsightViewer';
import { supabase, UsernameStore, getBootSession, subscribeAuth } from './supabaseClient';
import './App.css';
// import DemoSofia from './pages/DemoSofia';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import JournalTimeline from './components/JournalTimeline';
import MoodModal from './components/MoodModal';
import LatestResponse from './components/LatestResponse'; 

const App = () => {

  // --- Tone descriptions map ---
  const toneDescriptions = {
    therapist: "🩺 Clara – A warm, grounded therapist who sees the pattern beneath the panic.",
    marcus: "🧘 Marcus – Speaks like the Stoic philosopher himself. Will quote Meditations.",
    frank: "💪🍷 Tony – A frank, no-bullshit friend who tells you what you need to hear.",
    movies: "🎬 Movies – A movie buff who only speaks through movie metaphors.",
    verena: "🌸 Verena – A clarity-driven life coach unphased by self-pity."
  };

  // Default to Clara
  const [forcedTone, setForcedTone] = useState("therapist");
  // Keep a visible description bound to the current selection
  const [toneDescription, setToneDescription] = useState(toneDescriptions["therapist"]);

  const handleToneChange = (e) => {
    const val = e.target.value;
    setForcedTone(val);
    setToneDescription(toneDescriptions[val] || "");
  };

  const toneName = (t) =>
  ({ therapist: 'Clara', marcus: 'Marcus', frank: 'Tony', movies: 'Movies', verena: 'Verena' }[t] || 'Mirror');

  // 🔽 Existing states (no change to their order beyond moving forcedTone here)
  const [showLogin, setShowLogin] = useState(false);
  const [session, setSession] = useState(null);
  const [entry, setEntry] = useState('');
  const [history, setHistory] = useState([]);
  const [tooltip, setTooltip] = useState("🩺 Clara – A warm, grounded therapist who sees the pattern beneath the panic.");
  const [latestEntryId, setLatestEntryId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showPatternInsight, setShowPatternInsight] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [parsedTags, setParsedTags] = useState([]);
  const [severityLevel, setSeverityLevel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [inputExpanded, setInputExpanded] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [isListening, setIsListening] = useState(false);
  const prompts = ["What’s shaking sugar?"];
  const [showGroupedView, setShowGroupedView] = useState(false);
  const [placeholderPrompt, setPlaceholderPrompt] = useState(() =>
    prompts[Math.floor(Math.random() * prompts.length)] 
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  let transcriptBuffer = '';
  const [tooltipVisible, setTooltipVisible] = useState(null); // 'pattern' | 'therapist' | 'mood' | null
  const [styleVariant, setStyleVariant] = useState("D")
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] =useState(1);
  const [username, setUsername] = useState('');
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const handleCloseMoodTracker = () => setShowMoodTracker(false);
  const handleOpenMoodTracker = () => setShowMoodTracker(true);

  // 🔽 Voice Recording State Management
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceError, setVoiceError] = useState('');
  const [voiceDebugLogs, setVoiceDebugLogs] = useState([]);

  // 🔽 Browser Support Detection
  const [voiceSupported, setVoiceSupported] = useState(true);

  // 🔽 Voice Debug Helper Function
  const addVoiceDebugLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(message); // Also log to console
    setVoiceDebugLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]); // Keep last 10 logs
  };

  // 🔽 Transcription Quality Enhancement
  const enhanceTranscription = (text) => {
    if (!text || text.trim().length === 0) return text;

    let enhanced = text.trim();

    // Clean up extra spaces
    enhanced = enhanced.replace(/\s+/g, ' ');

    // Add periods at the end if missing
    if (!/[.!?]$/.test(enhanced)) {
      enhanced += '.';
    }

    // Capitalize first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

    // Add periods before new sentences that start with capital letters (but aren't already punctuated)
    enhanced = enhanced.replace(/([a-z])\s+([A-Z][a-z])/g, '$1. $2');

    // Fix common word capitalization (I, I'm, etc.)
    enhanced = enhanced.replace(/\bi\b/g, 'I');
    enhanced = enhanced.replace(/\bi'm\b/g, "I'm");
    enhanced = enhanced.replace(/\bi'll\b/g, "I'll");
    enhanced = enhanced.replace(/\bi've\b/g, "I've");
    enhanced = enhanced.replace(/\bi'd\b/g, "I'd");

    // Add question marks for obvious questions
    enhanced = enhanced.replace(/(\bwhat|\bhow|\bwhy|\bwhen|\bwhere|\bwho|\bis|\bdo|\bdoes|\bcan|\bcould|\bwould|\bshould)\b([^.!?]*?)(\.|$)/gi, (match, start, middle, end) => {
      if (middle.length > 0 && !middle.includes('.') && !middle.includes('!')) {
        return start + middle + '?';
      }
      return match;
    });

    return enhanced;
  };

  // 🔽 Responsive state for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 560);

  // 🔽 Browser Support Detection Effect
  React.useEffect(() => {
    const checkVoiceSupport = () => {
      const SpeechRecognition = window.SpeechRecognition ||
                               window.webkitSpeechRecognition ||
                               window.mozSpeechRecognition ||
                               window.msSpeechRecognition;

      const isFirefox = /Firefox/i.test(navigator.userAgent);

      if (!SpeechRecognition && !isFirefox) {
        setVoiceSupported(false);
        console.log('🔇 Voice input disabled: Browser not supported');
      } else if (isFirefox) {
        // Firefox: Show voice button but with helpful messaging
        setVoiceSupported(true);
        console.log('🔇 Firefox detected: Voice button available with helpful messaging');
      }
    };

    checkVoiceSupport();
  }, []);

  // 🔽 Latest Response State Management
  const [latestResponse, setLatestResponse] = useState(null);
  const [latestEntry, setLatestEntry] = useState(null);
  const [showLatestResponse, setShowLatestResponse] = useState(false);
  const latestResponseRef = React.useRef(null);

  // 🔽 Function 1: Load Saved Username (rehydrate)
  useEffect(() => {
    const saved = UsernameStore.get();
    if (saved) setUsername(saved);
  }, []);

  // 🔽 Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 560;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

    // Log environment on startup
  useEffect(() => {
  }, []);
  

   // 🔽 Function 3a: Build Current Commit Tag 
  useEffect(() => {
    fetch('/build-version.txt')
      .then(res => res.text())
      .then(text => {
      });
  }, []);

  // 🔽 Function 4: Auth Setup (boot + subscribe once)
    useEffect(() => {
      let stop = () => {};
      (async () => {
        setSession(await getBootSession());
        stop = subscribeAuth(setSession);
      })();
      return () => stop();
    }, []);

 // 🔽 Function 5: Submit New Journal Entry (username/session–safe)
  const handleSubmit = async () => {
    console.warn("🧪 handleSubmit called from device width:", window.innerWidth);

    // Always read a stable username
    const u = (username || UsernameStore.get() || '').trim();

    // Make sure we have a session
    let s = session;
    if (!s) {
      s = await getBootSession();
      if (s) setSession(s);
    }

    // Guard rails: must have session + entry + username
    const guardRails = { 
      hasSession: !!s?.user, 
      hasEntry: !!entry.trim(), 
      hasUsername: !!u,
      sessionUser: s?.user?.id,
      username: u,
      entry: entry.trim()
    };
    
    setDebugInfo(`🔍 Guard Rails: ${JSON.stringify(guardRails, null, 2)}`);
    
    if (!s?.user || !entry.trim() || !u) {
      setDebugInfo('❌ Guard rails failed - missing required data');
      return;
    }

    setDebugInfo('🚀 Starting submission...');
    setProcessingMessage(`⏳ ${toneName(forcedTone)} is thinking...`);
    setIsProcessing(true);
    
    // 🔽 Hide any previous latest response when starting new submission
    setShowLatestResponse(false);

    const userId = s.user.id;
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    
    const apiDetails = { 
      backendUrl, 
      userId, 
      entryLength: entry.length
    };
    
    setDebugInfo(`📡 API: ${JSON.stringify(apiDetails, null, 2)}`);

    try {
      // First, let's test if we can reach the backend URL at all
      if (!backendUrl) {
        setDebugInfo('❌ Backend URL is undefined!');
        return;
      }
      
      setDebugInfo(`📤 Testing connection to: ${backendUrl}\n🌐 User Agent: ${navigator.userAgent}\n📡 Network: ${navigator.connection?.effectiveType || 'unknown'}`);
      
      // Test basic connectivity first
      try {
        const testResponse = await fetch(`${backendUrl}/health`, { 
          method: 'GET'
        });
        setDebugInfo(`✅ Health check: ${testResponse.status}`);
      } catch (healthErr) {
        setDebugInfo(`❌ Health check failed: ${healthErr.message}\n🔄 Server might be sleeping - trying to wake it up...`);
        
        // Try to wake up the server by hitting the main endpoint
        try {
          await fetch(`${backendUrl}/`, { method: 'GET' });
          setDebugInfo(`🔄 Wake-up call sent. Waiting 5 seconds for server to start...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (wakeErr) {
          setDebugInfo(`❌ Cannot wake server: ${wakeErr.message}`);
        }
      }
      
      setDebugInfo('📤 Making journal-entry request...');
      
      const requestBody = {
        entry_text: entry,
        tone_mode: forcedTone,
        username: u,
        user_id: userId,
      };
      
      setDebugInfo(`📦 Request body: ${JSON.stringify(requestBody, null, 2)}`);
      
      const res = await fetch(`${backendUrl}/journal-entry`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      const responseInfo = { 
        status: res.status, 
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      };
      
      setDebugInfo(`📥 Response: ${JSON.stringify(responseInfo, null, 2)}`);

      if (!res.ok) {
        const errorText = await res.text();
        setDebugInfo(`❌ Error Response: ${res.status} ${res.statusText}\nBody: ${errorText}`);
        setShowLatestResponse(false); // Hide loading state on error
        return;
      }

      const data = await res.json();
      setDebugInfo(`✅ Success: ${JSON.stringify(data, null, 2)}`);
      
      
      // 🔽 FIX: Use the same field that ChatBubble successfully uses
      const responseText = data.response_text || data.response || 'No response received.';
      
      // 🔽 Store latest response for immediate display
      setLatestEntry(entry.trim());
      setLatestResponse({
        text: responseText,
        tone: forcedTone,
        toneName: toneName(forcedTone),
        timestamp: new Date().toISOString()
      });
      setShowLatestResponse(true);
      
      // 🔽 Auto-scroll to show the response
      setTimeout(() => {
        if (latestResponseRef.current) {
          latestResponseRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } catch (err) {
      const errorDetails = {
        message: err.message || 'Unknown error',
        name: err.name || 'Unknown',
        stack: err.stack || 'No stack trace',
        toString: err.toString(),
        constructor: err.constructor?.name || 'Unknown constructor'
      };
      
      setDebugInfo(`❌ Detailed Error: ${JSON.stringify(errorDetails, null, 2)}`);
      
      // Additional specific error checks
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setDebugInfo(`❌ Network Error: Cannot connect to ${backendUrl}\nThis might be a CORS or connectivity issue.`);
      }
    } finally {
      setEntry('');
      setParsedTags([]);
      setSeverityLevel('');
      setIsProcessing(false);
      // Add delay to ensure backend has written to database before refreshing timeline
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 1200); // Increased delay to account for backend database write time
      
      // Collapse input on mobile after successful submission
      if (window.innerWidth <= 768) {
        setInputExpanded(false);
      }
    }
  };

  // 🔽 Function 5b: Voice Recording Functions
  const startVoiceRecording = async () => {
    console.log("🔧 DEBUGGING: Voice recording started - new implementation active");
    addVoiceDebugLog("🎙️ Starting voice recording...");

    try {
      // Enhanced environment detection for HTTPS requirements
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const isProduction = location.hostname.includes('vercel.app') || location.hostname.includes('netlify.app');
      const isHTTPS = location.protocol === 'https:';

      // Log environment details for debugging
      addVoiceDebugLog(`🌐 Environment: ${isDevelopment ? 'development' : isProduction ? 'production' : 'unknown'}`);
      addVoiceDebugLog(`🔒 Protocol: ${location.protocol} | Mobile: ${isMobile}`);
      addVoiceDebugLog(`📍 Host: ${location.hostname}`);

      // Check HTTPS requirement for mobile browsers
      const requiresHTTPS = !isHTTPS && !isDevelopment && isMobile;

      if (requiresHTTPS) {
        addVoiceDebugLog("❌ HTTPS required for mobile microphone access in production");
        const message = isDevelopment
          ? 'Voice recording requires HTTPS on mobile devices. This works in production (Vercel uses HTTPS automatically).'
          : 'Voice recording requires a secure HTTPS connection on mobile devices. Production deployments use HTTPS automatically.';
        setVoiceError(message);
        return;
      }

      addVoiceDebugLog(`✅ HTTPS check passed - ${isHTTPS ? 'HTTPS' : 'localhost development'} environment`);

      // Special handling for Firefox - show helpful message instead of attempting voice recognition
      const isFirefoxBrowser = /Firefox/i.test(navigator.userAgent);
      if (isFirefoxBrowser) {
        addVoiceDebugLog("🦊 Firefox browser detected - showing helpful message");
        setVoiceError('Voice transcription is not supported in Firefox. For voice input, please use Chrome, Safari, or Edge browser. You can still type your journal entries normally.');
        return;
      }

      // Check for Web Speech API support with all vendor prefixes
      addVoiceDebugLog("🔍 Checking Speech Recognition API...");
      const SpeechRecognition = window.SpeechRecognition ||
                               window.webkitSpeechRecognition ||
                               window.mozSpeechRecognition ||
                               window.msSpeechRecognition;

      const apiStatus = {
        standard: !!window.SpeechRecognition,
        webkit: !!window.webkitSpeechRecognition,
        mozilla: !!window.mozSpeechRecognition,
        microsoft: !!window.msSpeechRecognition
      };
      addVoiceDebugLog(`🔧 APIs: std:${apiStatus.standard} webkit:${apiStatus.webkit} moz:${apiStatus.mozilla} ms:${apiStatus.microsoft}`);

      if (!SpeechRecognition) {
        addVoiceDebugLog("❌ Speech Recognition not supported");

        // Detect browser for specific error messages
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = navigator.userAgent.toLowerCase().includes('android');

        let errorMessage = 'Voice transcription is not supported in this browser.';

        if (isFirefox) {
          errorMessage = 'Voice transcription is not supported in Firefox. Please use Chrome, Safari, or Edge.';
        } else if (isIOS) {
          errorMessage = 'Voice transcription requires iOS 14.5+ with Safari. Please update or try Chrome.';
        } else if (isAndroid) {
          errorMessage = 'Voice transcription requires Chrome on Android. Please try Chrome browser.';
        } else {
          errorMessage = 'Voice transcription requires Chrome, Safari, or Edge browser.';
        }

        setVoiceError(errorMessage);
        return;
      }
      addVoiceDebugLog("✅ Speech Recognition supported");

      // Request microphone permission with enhanced mobile compatibility
      addVoiceDebugLog("🎤 Requesting microphone permission...");
      try {
        let stream;

        // Modern browsers with MediaDevices API
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          addVoiceDebugLog("🔧 Using modern MediaDevices API");
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
        }
        // Legacy getUserMedia with proper binding
        else if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) {
          const getUserMedia = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;

          addVoiceDebugLog("🔧 Using legacy getUserMedia with proper binding");
          stream = await new Promise((resolve, reject) => {
            getUserMedia.call(navigator, { audio: true }, resolve, reject);
          });
        }
        else {
          throw new Error('getUserMedia not supported in this browser');
        }

        addVoiceDebugLog("✅ Microphone permission granted");
        // Clean up the stream immediately
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (permissionError) {
        addVoiceDebugLog(`❌ Microphone error: ${permissionError.message || permissionError.name || 'Permission denied'}`);
        setVoiceError('Microphone access is required for voice journaling. Please enable microphone permissions in your browser settings and try again.');
        return;
      }

      // Initialize speech recognition
      addVoiceDebugLog("🚀 Creating Speech Recognition instance...");
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;

      // Mobile-specific optimizations for better speech continuation
      if (isMobile) {
        addVoiceDebugLog("📱 Applying mobile speech optimizations");
        // Some mobile browsers benefit from these settings
        try {
          recognitionInstance.grammars = new webkitSpeechGrammarList();
        } catch (e) {
          // Graceful fallback if grammars not supported
        }
      }

      // Set up event handlers
      recognitionInstance.onstart = () => {
        addVoiceDebugLog("🎤 Recognition started! Opening modal...");
        setIsRecording(true);
        setShowVoiceModal(true);
        setVoiceError('');
        setRecordingTime(0);
      };

      recognitionInstance.onresult = (event) => {
        // Check if recording is still active - prevent processing if stopped
        if (!isRecording) {
          console.log("🔧 DEBUGGING: Ignoring result - recording stopped");
          return;
        }

        // Build complete transcript from all final results
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }

        if (finalTranscript.trim()) {
          addVoiceDebugLog(`📝 Final transcription: "${finalTranscript.slice(-50)}..."`);

          // Apply transcription enhancement to final results
          const enhancedTranscript = enhanceTranscription(finalTranscript);

          // For multiple recording sessions: append to existing text instead of replacing
          setEntry(prevEntry => {
            const existingText = prevEntry.trim();
            const newText = enhancedTranscript.trim();

            if (existingText) {
              // Add space between existing and new text
              const combinedText = existingText + ' ' + newText;
              console.log("🔧 DEBUGGING: Appending text - existing:", existingText, "new:", newText, "combined:", combinedText);
              return combinedText;
            } else {
              console.log("🔧 DEBUGGING: Setting initial text:", newText);
              return newText;
            }
          });
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Voice recognition error. Please try again.';

        if (event.error === 'network') {
          errorMessage = 'Voice transcription requires an internet connection.';
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please try again.';
        }

        setVoiceError(errorMessage);
        stopVoiceRecording();
      };

      recognitionInstance.onend = () => {
        // Mobile speech recognition often ends automatically after silence
        // For mobile: restart recognition to maintain continuous capture
        if (isMobile && isRecording && !voiceError) {
          addVoiceDebugLog("📱 Mobile auto-restart: Recognition ended, restarting for continuous capture");
          try {
            // Small delay to prevent rapid restart issues
            setTimeout(() => {
              if (isRecording && !voiceError) {
                recognitionInstance.start();
              }
            }, 100);
          } catch (error) {
            addVoiceDebugLog(`❌ Auto-restart failed: ${error.message}`);
            setIsRecording(false);
            setShowVoiceModal(false);
            setRecordingTime(0);
          }
        } else {
          // Desktop or intentional stop
          setIsRecording(false);
          setShowVoiceModal(false);
          setRecordingTime(0);
        }
      };

      // Start recording
      addVoiceDebugLog("📢 About to start recognition...");
      recognitionInstance.start();
      addVoiceDebugLog("✅ Recognition.start() called successfully");
      setRecognition(recognitionInstance);

    } catch (error) {
      console.error('Error starting voice recording:', error);
      setVoiceError('Failed to start voice recording. Please try again.');
    }
  };

  const stopVoiceRecording = () => {
    console.log("🔧 DEBUGGING: Stopping voice recording");
    if (recognition) {
      recognition.stop();
      recognition.onresult = null; // Prevent further result processing
      recognition.onend = null; // Prevent onend from interfering
    }
    setIsRecording(false);
    setShowVoiceModal(false);
    setRecordingTime(0);
    setRecognition(null); // Clear recognition instance
  };

  const cancelVoiceRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
    setShowVoiceModal(false);
    setRecordingTime(0);
    // Don't keep the transcribed text on cancel
    setEntry('');
  };

  // Timer for recording duration
  React.useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
    } else if (!isRecording && recordingTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  // Format recording time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🔽 Function 5c: Generate Pattern Insight
  const [processingMessage, setProcessingMessage] = useState("");
  
  const handlePatternInsight = async () => {
    setShowPatternInsight(true);
  };
  
   // 🔽 Function 6: Fetch Past Journals
  const fetchHistory = async () => {
    const user = session?.user;
    if (!user) return;
    const { data, error } = await supabase
      .from('journals')
      .select('id, entry_text, response_text, primary_theme, secondary_theme, tone_mode, timestamp')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });
      
    if (error) {
    console.error("❌ Error fetching history:", error.message);
    return;
  }

  // 🔽 Function 6a: Filter Out No Response 

  const showAll = true; // <== True all entries, False filtered 
  const filtered = showAll
    ? (data || [])
    : (data || []).filter(entry =>
    entry.response_text?.trim().toLowerCase() !== 'no response received.'
  );
  // console.log("📜 Filtered journal history:", filtered);  // <== Enable if False 
  setHistory(filtered);
};

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  // 🔽 UI State Routing
  if (!session && !showLogin) {
    return <LandingPage onStart={() => setShowLogin(true)} />;
  }

  if (!session) {
    return (
      <LoginPage
        onAuthSuccess={(session, username) => {
          setSession(session);
          setUsername(username);
          UsernameStore.set(username); // <--persist
        }}
      />
    );
  }

// 🔽 Function 7: Generate Handoff Summaries  

  // 🔽 Tone Display Utility
  const displayTone = (mode) => {
    const t = mode?.trim().toLowerCase();
    return t === 'frank' ? '🔴 Frank Friend' : '🟢 Marcus Aurelius';
  };

  const getToneStyle = (mode) => {
    const tone = mode?.trim().toLowerCase();
    switch (tone) {
      case 'frank':
      case 'frank friend':
        return {
          backgroundColor: '#fff1f1',
          borderColor: '#cc0000',
          label: '🔴 Tony',
        };
      case 'marcus':
      case 'marcus aurelius':
        return {
          backgroundColor: '#f0fdf4',
          borderColor: '#2e7d32',
          label: '🟢 Marcus Aurelius',
        };
      case 'therapist':
        return {
          backgroundColor: '#fef6ff',
          borderColor: '#b755e5',
          label: '🟣 Clara',
        };
      case 'movies':
        return {
          backgroundColor: '#fdfaf6',
          borderColor: '#ff8c00',
          label: '🎬 Movie Metaphors Man',
        };
      case 'verena':
          return {
            backgroundColor: '#ffeaf0',
            borderColor: '#ec407a',
            label: '🌸 Verena',
        };  
      default:
        return {
          backgroundColor: '#eeeeee',
          borderColor: '#999999',
          label: '❓ Unknown',
        };
    }
  };

    // Centralize tooltip copy in one place
    const TOOLTIP_TEXT = {
      pattern: "Generates a unified insight based on your recent themes, topics, and emotional loops.",
      therapist: "A handoff-style recap of emotional themes, loops, and potential focus areas for therapy.",
      mood: "Visualizes your emotional trends over time. Coming soon."
    };

// 🔽 UI Rendering
return (
  <>
    {/* Step 1: Voice Introduction + Begin */}
    {showWelcome && welcomeStep === 1 && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.96)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          overflowY: 'auto'
        }}
      >
        <div style={{ maxWidth: '700px', width: '90%' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.6rem' }}>✨ Choose Your Companion</h2>
          <ul style={{ textAlign: 'left', fontSize: '1rem', marginBottom: '2rem' }}>
            <li style={{ marginBottom: '1rem' }}>
              <b>💪🍷 Tony</b> – A frank, no-bullshit friend who’s always honest and supportive, helping you cut through the crap and break free from the loops that keep you stuck.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <b>🧘 Marcus Aurelius</b> – Speaks like the Stoic philosopher himself—calm, sparse, and deeply rooted in principle. If inspired he may quote from his own journal, <i>Meditations</i>.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <b>🩺 Clara</b> – A warm, grounded therapist who sees the pattern beneath the panic.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <b>🎬 Movie Metaphor Man</b> – Only thinks in movie metaphors—no matter what you say. Your problems are part of the hero's journey.
            </li>
            <li style={{ marginBottom: '1.5rem' }}>
              <b>🌸 Verena</b> – Verena is a clarity-driven career coach who helps you stop spinning your wheels and start building something real.
            </li>
          </ul>

          <button
            onClick={() => setShowWelcome(false)}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              borderRadius: '6px',
              backgroundColor: '#374151',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Let’s begin →
          </button>
        </div>
      </div>
    )}

    {/* MAIN APP INTERFACE — Only render when welcome is dismissed */}
    {!showWelcome && (
      <div className="chat-container background-option-1">
        {/* Header with Logout */}
        <div className="app-header">
          <div className="header-brand">
            <h1 className="mirror-title">
              <span className="mirror-emoji" role="img" aria-label="Cognitive Mirror"></span>
              Cognitive Mirror
            </h1>

            <div className="beta-notice">
               🚧 Rough Beta: Responses can take up to a minute. Thanks for your patience.
            </div>
          </div>
  
        {/* Username and Logout Button Placement Top Right */}
        <div className="header-user">
          <div className="user-info" title={session?.user?.id || ''}>
            Signed in as <strong>{username || '—'}</strong>
            {session?.user?.id ? (
              <span style={{ color: 'var(--color-text-light)', marginLeft: 6 }}>
                ({(session.user.id).slice(0, 8)})
              </span>
            ) : null}
          </div>

          <button
            className="logout-btn"
            onClick={async () => {
              await supabase.auth.signOut();
              setSession(null);
            }}
          >
            Log Out
          </button>
        </div>
        </div>

        {/* Debug Panel for Mobile (only show in development environment) */}
        {process.env.NODE_ENV === 'development' && window.innerWidth <= 768 && (debugInfo || voiceDebugLogs.length > 0) && (
          <div style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            right: '10px',
            background: '#000',
            color: '#0f0',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '10px',
            zIndex: 9999,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>🐛 Debug Info:</strong>
              <button
                onClick={() => {
                  setDebugInfo('');
                  setVoiceDebugLogs([]);
                }}
                style={{ background: '#333', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '3px' }}
              >
                ✕
              </button>
            </div>
            {debugInfo && <div style={{ marginTop: '5px' }}>{debugInfo}</div>}
            {voiceDebugLogs.length > 0 && (
              <div style={{ marginTop: '5px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                <strong>🎙️ Voice Debug:</strong>
                <div>{voiceDebugLogs.join('\n')}</div>
              </div>
            )}
          </div>
        )}

        {/* Sticky Input Bar (fixed) */}
        <div
          className={`reflection-input-container ${isMobile && !inputExpanded ? 'collapsed' : (isMobile ? 'expanded' : '')}`}
          onClick={() => {
            if (!inputExpanded && isMobile) {
              console.log('✅ Expanding input on mobile');
              setInputExpanded(true);
            }
          }}
          onTouchStart={(e) => {
            if (!inputExpanded && isMobile) {
              console.log('✅ Expanding input on mobile touch');
              e.preventDefault();
              setInputExpanded(true);
            }
          }}
          style={{ touchAction: 'manipulation' }}
        >
          <textarea
          className="reflection-textarea"
          rows="3"
          value={entry}
          onChange={(e) => {
            setEntry(e.target.value);
            
            // 🔽 Auto-dismiss latest response when user starts typing new entry
            if (showLatestResponse && e.target.value.length > 0) {
              setShowLatestResponse(false);
              // Trigger timeline refresh when Latest Response dismisses
              setRefreshTrigger(prev => prev + 1);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (entry.trim() && !isProcessing) {
                handleSubmit();
              }
            }
            if (e.key === 'Escape' && isMobile) {
              setInputExpanded(false);
            }
          }}
          placeholder={placeholderPrompt}
        />
          {/* Toolbar row: all action buttons organized */}
          <div className="cm-toolbar">
            {/* Action buttons section */}
            <div className="toolbar-section cm-actions">
              {/* <button className="cm-btn" onClick={startListening} disabled={isListening}>
                🎙️ Start
              </button>
              <button className="cm-btn" onClick={stopListening} disabled={!isListening}>
                🛑 Stop
              </button> */}
          
              {/* Button layout: Split if voice supported, single if not */}
              {voiceSupported ? (
                <>
                  <div className="cm-button-row">
                    <button
                        className="cm-btn cm-btn--primary cm-btn--split"
                        onClick={handleSubmit}
                        id="reflect-btn"
                        aria-label="Reflect"
                        type="button"
                        disabled={isProcessing || !entry.trim()}>
                      🧠 Reflect
                    </button>

                    <button
                        className="cm-btn cm-btn--voice cm-btn--split"
                        onClick={startVoiceRecording}
                        aria-label="Voice transcription"
                        type="button"
                        disabled={isProcessing || isRecording}>
                      🎙️ Voice
                    </button>
                  </div>

                  {/* Voice Recording Modal - positioned within input container */}
                  {showVoiceModal && (
                    <div className="voice-modal-inline">
                      <div className="voice-modal">
                        <div className="voice-modal-header">
                          <button
                            className="voice-modal-cancel"
                            onClick={cancelVoiceRecording}
                            aria-label="Cancel recording"
                            type="button">
                            ✕
                          </button>
                          <button
                            className="voice-modal-send"
                            onClick={stopVoiceRecording}
                            aria-label="Finish recording"
                            type="button">
                            ↑
                          </button>
                        </div>

                        <div className="voice-visualizer">
                          <div className="voice-line" style={{ '--delay': 0 }}></div>
                          <div className="voice-line" style={{ '--delay': 1 }}></div>
                          <div className="voice-line" style={{ '--delay': 2 }}></div>
                          <div className="voice-line" style={{ '--delay': 3 }}></div>
                          <div className="voice-line" style={{ '--delay': 4 }}></div>
                          <div className="voice-line" style={{ '--delay': 5 }}></div>
                          <div className="voice-line" style={{ '--delay': 6 }}></div>
                          <div className="voice-line" style={{ '--delay': 7 }}></div>
                          <div className="voice-line" style={{ '--delay': 8 }}></div>
                          <div className="voice-line" style={{ '--delay': 9 }}></div>
                          <div className="voice-line" style={{ '--delay': 10 }}></div>
                          <div className="voice-line" style={{ '--delay': 11 }}></div>
                          <div className="voice-line" style={{ '--delay': 12 }}></div>
                          <div className="voice-line" style={{ '--delay': 13 }}></div>
                          <div className="voice-line" style={{ '--delay': 14 }}></div>
                        </div>

                        <div className="voice-timer">
                          {formatTime(recordingTime)}
                        </div>

                        {voiceError && (
                          <div className="voice-error">
                            {voiceError}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                    className="cm-btn cm-btn--primary"
                    onClick={handleSubmit}
                    id="reflect-btn"
                    aria-label="Reflect"
                    type="button"
                    disabled={isProcessing || !entry.trim()}>
                  🧠 Reflect
                </button>
              )}

              {/* Mobile close button when expanded */}
              {isMobile && inputExpanded && (
                <button 
                  className="cm-btn" 
                  onClick={() => setInputExpanded(false)}
                  aria-label="Close"
                  type="button">
                  ✕ Close
                </button>
              )}

              <button
                className="cm-btn"
                onClick={handlePatternInsight}
                onMouseEnter={() => setTooltipVisible('pattern')}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                🧭 See Pattern Insight
              </button>

              <button
                className="cm-btn"
                onClick={() => setShowSummary(true)}
                onMouseEnter={() => setTooltipVisible('therapist')}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                🩺 Therapist Summary
              </button>

              <button
                className="cm-btn"
                onClick={handleOpenMoodTracker /* your existing handler */}
                onMouseEnter={() => setTooltipVisible('mood')}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                📊 Mood Tracker
              </button>

              {/* Shared tooltip renderer for the three buttons */}
              {tooltipVisible && (
                <div className="tooltip">
                  {tooltipVisible === 'pattern' &&
                    'Generates a unified insight based on your recent themes, topics, and emotional loops.'}
                  {tooltipVisible === 'therapist' &&
                    'A handoff-style recap of emotional themes, loops, and potential focus areas for therapy.'}
                  {tooltipVisible === 'mood' && 'Visualizes your emotional trends over time.'}
                </div>
              )}

              {isListening && <span>🎧 Listening…</span>}
              {isProcessing && (
                <div className="processing-message">
                  ⏳ {toneName(forcedTone)} is thinking<span className="dots"></span>
                </div>
              )}
            </div>

            {/* Voice selection section */}
            <div className="toolbar-section voice-section">
              <label className="voice-label">🗣️ Voice:</label>
              <select
                className="voice-select"
                value={forcedTone}
                onChange={handleToneChange}
                aria-label="Select voice"
              >
                <option value="therapist">Clara</option>
                <option value="marcus">Marcus</option>
                <option value="frank">Tony</option>
                <option value="movies">Movies</option>
                <option value="verena">Verena</option>
              </select>
              <div className="voice-description" aria-live="polite">
                {toneDescription}
              </div>
            </div>
          </div>
          {/* END toolbar */}
        </div>
        {/* END fixed input container */}

        {/* Latest Response Section - appears immediately after input */}
        {isProcessing && (
          <div className="latest-response-loading">
            <div className="latest-response-loading-content">
              <div className="latest-response-loading-spinner">🤔</div>
              <div className="latest-response-loading-text">
                {processingMessage || `${toneName(forcedTone)} is thinking...`}
              </div>
            </div>
          </div>
        )}

        {showLatestResponse && latestResponse && latestEntry && (
          <div ref={latestResponseRef}>
            <LatestResponse
              entry={latestEntry}
              response={latestResponse}
              onDismiss={() => {
                setShowLatestResponse(false);
                // Trigger timeline refresh to navigate to journal timeline (consistent with auto-close behavior)
                setRefreshTrigger(prev => prev + 1);

                // Mobile-specific: Immediately open "Tap to Reflect" input for seamless journaling flow
                if (isMobile) {
                  setInputExpanded(true);
                }
              }}
            />
          </div>
        )}


        {/* Timeline (outside the fixed container) */}
        <div className="chat-thread">
          <JournalTimeline 
            userId={session?.user?.id} 
            refreshTrigger={refreshTrigger} 
            styleVariant={styleVariant}
            excludeLatestResponse={showLatestResponse && latestResponse ? latestEntry : null}
          />
        </div>

        {/* Summary Viewer */}
        {showSummary && (
          <div style={{ marginTop: '1rem' }}>
            <SummaryViewer history={history} onClose={() => setShowSummary(false)} />
          </div>
        )}

        {/* Pattern Insight Viewer */}
        {showPatternInsight && (
          <PatternInsightViewer 
            onClose={() => setShowPatternInsight(false)}
            userId={session?.user?.id}
            toneMode={forcedTone}
          />
        )}

        {/* Mood Tracker Model */}
        {showMoodTracker && (
          <MoodModal
            userId={session?.user?.id}
            onClose={handleCloseMoodTracker}
          />
        )}
      </div>
    )}
  </>
);
}
export default App;
