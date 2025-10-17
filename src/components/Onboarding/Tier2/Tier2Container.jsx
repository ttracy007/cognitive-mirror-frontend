import React, { useState, useEffect } from 'react';
import DomainRenderer from './DomainRenderer';
import './Tier2.css';

const Tier2Container = ({ userId, onComplete, onBack }) => {
  const [domains, setDomains] = useState(null);
  const [currentDomain, setCurrentDomain] = useState(null);
  const [domainResponses, setDomainResponses] = useState({});
  const [goldenKeys, setGoldenKeys] = useState([]);
  const [completedDomains, setCompletedDomains] = useState(new Set()); // Track completed/skipped domains
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchTier2Domains();
    }
  }, [userId]);

  const fetchTier2Domains = async () => {
    try {
      setError(null);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(`${backendUrl}/api/onboarding/v1/tier2/questions/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch Tier 2 domains`);
      }

      const data = await response.json();

      if (data.success && data.domains) {
        setDomains(data.domains);
        setCurrentDomain('domain1_sleep');
        console.log('[Tier 2] Loaded domains from backend:', Object.keys(data.domains));
      } else {
        throw new Error(data.error || 'Failed to load Tier 2 domains');
      }
    } catch (error) {
      console.error('[Tier 2] Error fetching domains:', error);
      setError(`Failed to load Tier 2: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDomainComplete = (domainKey, responses, goldenKey) => {
    console.log(`[Tier 2] Domain ${domainKey} completed:`, { responses, goldenKey });

    // Store domain responses
    setDomainResponses(prev => ({
      ...prev,
      [domainKey]: responses
    }));

    // Mark domain as completed
    setCompletedDomains(prev => new Set([...prev, domainKey]));

    // Store golden key if provided and meets criteria
    if (goldenKey && goldenKey.text && goldenKey.word_count >= 40) {
      setGoldenKeys(prev => [...prev, goldenKey]);
      console.log(`[Tier 2] Golden key added for ${domainKey}:`, goldenKey.word_count, 'words');
    }

    // Move to next domain
    const domainOrder = ['domain1_sleep', 'domain2_rumination', 'domain3_work', 'domain4_relationships'];
    const currentIndex = domainOrder.indexOf(domainKey);

    if (currentIndex < domainOrder.length - 1) {
      const nextDomain = domainOrder[currentIndex + 1];
      console.log(`[Tier 2] Moving from ${domainKey} to ${nextDomain}`);
      setCurrentDomain(nextDomain);
    } else {
      // All domains complete - submit
      console.log('[Tier 2] All domains complete, submitting...');
      submitTier2();
    }
  };

  const handleSkipDomain = (fromDomain, skipTo) => {
    console.log(`[Tier 2] Skipping from ${fromDomain} to ${skipTo}`);

    // Mark the current domain as completed (via skip)
    setCompletedDomains(prev => new Set([...prev, fromDomain]));

    // Add skipped domain to domainResponses to satisfy backend validation
    setDomainResponses(prev => ({
      ...prev,
      [fromDomain]: {
        [`${fromDomain}_skipped`]: true,
        skip_reason: skipTo,
        completion_type: 'skipped'
      }
    }));

    console.log(`[Tier 2] Domain ${fromDomain} marked as completed (skipped)`);

    // Convert skip_to_domain2 format to actual domain key
    const domainMap = {
      'skip_to_domain2': 'domain2_rumination',
      'skip_to_domain3': 'domain3_work',
      'skip_to_domain4': 'domain4_relationships',
      'skip_to_q5': 'tier3_transition',
      'skip_to_tier3': 'tier3_transition'
    };

    const nextDomain = domainMap[skipTo] || skipTo;

    if (nextDomain === 'tier3_transition') {
      // Skip straight to Tier 3 - all domains complete
      console.log('[Tier 2] Skipping to Tier 3 - submitting Tier 2');
      submitTier2();
    } else {
      console.log(`[Tier 2] Skipping to domain: ${nextDomain}`);
      setCurrentDomain(nextDomain);
    }
  };

  const handleResetForTesting = () => {
    if (window.confirm('Reset Tier 2 progress? This will clear all domain answers and golden keys.')) {
      // Clear Tier 2 specific data
      setDomainResponses({});
      setGoldenKeys([]);
      setCompletedDomains(new Set());
      setCurrentDomain('domain1_sleep');
      console.log('[Tier 2] Reset completed - returning to first domain');
    }
  };

  const submitTier2 = async () => {
    try {
      // Debug validation
      console.log('[Tier 2] Validation check:');
      console.log('  userId:', userId, 'type:', typeof userId);
      console.log('  domainResponses:', domainResponses, 'keys:', Object.keys(domainResponses));
      console.log('  goldenKeys:', goldenKeys, 'length:', goldenKeys.length);

      if (!userId) {
        console.error('[Tier 2] ERROR: userId is missing');
        setError('User ID is missing - please refresh and try again');
        return;
      }

      if (!domainResponses || Object.keys(domainResponses).length === 0) {
        console.error('[Tier 2] ERROR: domainResponses is empty');
        setError('No domain responses found - please answer some questions first');
        return;
      }

      console.log('[Tier 2] Submitting with data:', {
        domainResponses,
        goldenKeys: goldenKeys.length,
        totalGoldenKeyWords: goldenKeys.reduce((sum, gk) => sum + gk.word_count, 0)
      });

      const payload = {
        userId,
        domainResponses,
        goldenKeys
      };

      console.log('[Tier 2] Full payload:', JSON.stringify(payload, null, 2));

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
      const response = await fetch(`${backendUrl}/api/onboarding/v1/tier2/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Tier 2] Submission successful:', data);
        // Pass the collected golden keys to parent
        onComplete(goldenKeys);
      } else {
        console.error('[Tier 2] Submission failed:', data);
        setError(`Tier 2 submission failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Tier 2] Network error during submission:', error);
      setError(`Network error: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="tier2-container">
        <div className="loading-state">
          <p>Loading Tier 2: Golden Key Excavation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tier2-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <div className="error-buttons">
            <button onClick={onBack} className="back-button">Back</button>
            <button onClick={fetchTier2Domains} className="try-again-button">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!domains || !currentDomain) {
    return (
      <div className="tier2-container">
        <div className="error-state">
          <p>No domains available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tier2-container">
      <div className="tier2-header">
        <h2>Layer 2: What's Really Going On</h2>
        <p>Let's dig deeper into what's weighing on you.</p>
      </div>

      <DomainRenderer
        domain={domains[currentDomain]}
        domainKey={currentDomain}
        userId={userId}
        onComplete={handleDomainComplete}
        onSkip={handleSkipDomain}
        onBack={() => {
          // Handle going back from current domain
          const domainOrder = ['domain1_sleep', 'domain2_rumination', 'domain3_work', 'domain4_relationships'];
          const currentIndex = domainOrder.indexOf(currentDomain);

          if (currentIndex > 0) {
            // Go back to previous domain
            const previousDomain = domainOrder[currentIndex - 1];
            console.log(`[Tier 2] Going back from ${currentDomain} to ${previousDomain}`);
            setCurrentDomain(previousDomain);
          } else {
            // At first domain - go back to Tier 1
            console.log('[Tier 2] At first domain - going back to Tier 1');
            onBack();
          }
        }}
        allResponses={domainResponses}
      />

      <div className="tier2-progress">
        <span>Domain: {domains[currentDomain]?.name || currentDomain}</span>
        <span>Domains Completed: {completedDomains.size}/4</span>
        <span>Golden Keys Found: {goldenKeys.length}</span>

        {/* Dev mode reset button for Tier 2 */}
        {process.env.NODE_ENV === 'development' && (
          <button
            className="tier2-reset-button"
            onClick={handleResetForTesting}
            title="Reset Tier 2 progress (dev only)"
            style={{
              marginLeft: '20px',
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Reset T2
          </button>
        )}
      </div>
    </div>
  );
};

export default Tier2Container;