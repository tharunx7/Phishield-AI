/**
 * PhishShield AI - Background Service Worker
 * Handles background tasks, message passing, data persistence,
 * and real-time threat intelligence fetching.
 */

// ============================================================
// Configuration & ML Engine
// ============================================================
const THREAT_SERVER_URL = 'http://localhost:3001';
const THREAT_INTEL_ALARM = 'refreshThreatIntel';
const THREAT_INTEL_CACHE_KEY = 'threatIntelData';
const THREAT_INTEL_REFRESH_HOURS = 6;

// Import the ML engine for real-time background scanning
try {
  importScripts('featureExtractor.js', 'phishingModel.js');
} catch (e) {
  console.error('[PhishShield AI] Failed to load ML modules in background:', e);
}

// ============================================================
// Installation & Update Handlers
// ============================================================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Extension installed successfully.

    // Initialize default settings
    chrome.storage.local.set({
      settings: {
        darkMode: false,
        notifications: true,
        autoScan: false,
        realTimeProtection: true,
        language: 'en',
      },
      scanHistory: [],
      reports: [],
      totalScans: 0,
      threatsBlocked: 0,
    });
  }

  if (details.reason === 'update') {
    // Extension updated to new version.
  }
});

// Reset settings to ensure Light Mode default
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['settings'], (res) => {
    const settings = res.settings || {};
    settings.darkMode = false;
    chrome.storage.local.set({ settings });
  });
}

// ============================================================
// Deep Trace Redirect Unroller
// ============================================================
async function handleUnrollUrl(url) {
  try {
    // Fetch the URL with redirect follow to get the final destination
    // The background script bypasses standard CORS
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (response && response.url && response.url !== url) {
      return { finalUrl: response.url };
    }
    
    // Fallback if HEAD doesn't return a different URL (some shorteners only respond to GET)
    const getResponse = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (getResponse && getResponse.url) {
      return { finalUrl: getResponse.url };
    }
    
    return { finalUrl: url };
  } catch (e) {
    console.warn('[PhishShield AI] Failed to unroll URL:', e);
    return { finalUrl: url };
  }
}

// ============================================================
// Alarm Listener — Auto-refresh threat intelligence
// ============================================================

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === THREAT_INTEL_ALARM) {
    // Alarm fired: refreshing threat intelligence...
    await handleFetchThreatIntel();
  }
});

// ============================================================
// Message Listener (Popup <-> Background Communication)
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Received message
  switch (message.type) {
    case 'SAVE_SCAN':
      handleSaveScan(message.data).then(sendResponse);
      return true; // Keep channel open for async response

    case 'GET_HISTORY':
      handleGetHistory().then(sendResponse);
      return true;

    case 'CLEAR_HISTORY':
      handleClearHistory().then(sendResponse);
      return true;

    case 'REPORT_WEBSITE':
      handleReportWebsite(message.data).then(sendResponse);
      return true;

    case 'GET_STATS':
      handleGetStats().then(sendResponse);
      return true;

    case 'CHECK_SAFE_BROWSING':
      handleCheckSafeBrowsing(message.url).then(sendResponse);
      return true;

    case 'FETCH_THREAT_INTEL':
      handleFetchThreatIntel(message.forceRefresh).then(sendResponse);
      return true;

    case 'GET_THREAT_INTEL':
      handleGetCachedThreatIntel().then(sendResponse);
      return true;

    case 'UNROLL_URL':
      handleUnrollUrl(message.url).then(sendResponse);
      return true;

    default:
      console.warn('[PhishShield AI] Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

async function handleCheckSafeBrowsing(url) {
  try {
    const settingsResult = await chrome.storage.local.get('settings');
    const apiKey = settingsResult?.settings?.safeBrowsingApiKey || '';
    
    if (!apiKey) {
      // Local threat intelligence list fallback
      const hostname = new URL(url).hostname.toLowerCase();
      const isBlacklisted = [
        'paypa1-verify.tk', 'secure-bank0famerica.xyz', 'amaz0n-update.click',
        'google.com-verify.net', 'login.microsft.com.evil.com', 'scam-bank.com',
        'verify-chase.com', 'free-bitcoin.xyz', 'giveaway-airdrop.tk', 'steam-promo.click'
      ].some(domain => hostname === domain || hostname.endsWith('.' + domain));
      
      return { success: true, isMalicious: isBlacklisted, threatType: isBlacklisted ? 'SOCIAL_ENGINEERING' : null };
    }
    
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client: {
          clientId: "phishshield-ai",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: url }]
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const isMalicious = data.matches && data.matches.length > 0;
    return {
      success: true,
      isMalicious: !!isMalicious,
      threatType: isMalicious ? data.matches[0].threatType : null
    };
  } catch (error) {
    console.error('[PhishShield AI] Error querying Safe Browsing:', error);
    // Graceful fallback
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      const isBlacklisted = [
        'paypa1-verify.tk', 'secure-bank0famerica.xyz', 'amaz0n-update.click',
        'google.com-verify.net', 'login.microsft.com.evil.com', 'scam-bank.com',
        'verify-chase.com', 'free-bitcoin.xyz', 'giveaway-airdrop.tk', 'steam-promo.click'
      ].some(domain => hostname === domain || hostname.endsWith('.' + domain));
      return { success: true, isMalicious: isBlacklisted, threatType: isBlacklisted ? 'SOCIAL_ENGINEERING' : null };
    } catch {
      return { success: true, isMalicious: false, threatType: null };
    }
  }
}

// ============================================================
// Data Handlers
// ============================================================

/**
 * Save a scan result to storage and update stats
 */
async function handleSaveScan(scanData) {
  try {
    const result = await chrome.storage.local.get(['scanHistory', 'totalScans', 'threatsBlocked']);
    const history = result.scanHistory || [];
    let totalScans = result.totalScans || 0;
    let threatsBlocked = result.threatsBlocked || 0;

    // Add scan to history (most recent first)
    history.unshift({
      ...scanData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });

    // Keep only the last 500 scans
    if (history.length > 500) {
      history.splice(500);
    }

    totalScans++;
    if (scanData.riskLevel === 'dangerous') {
      threatsBlocked++;
    }

    await chrome.storage.local.set({
      scanHistory: history,
      totalScans,
      threatsBlocked,
    });

    return { success: true };
  } catch (error) {
    console.error('[PhishShield AI] Error saving scan:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieve scan history from storage
 */
async function handleGetHistory() {
  try {
    const result = await chrome.storage.local.get('scanHistory');
    return { success: true, data: result.scanHistory || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Clear all scan history
 */
async function handleClearHistory() {
  try {
    await chrome.storage.local.set({ scanHistory: [] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Handle website report submission
 */
async function handleReportWebsite(reportData) {
  try {
    const result = await chrome.storage.local.get('reports');
    const reports = result.reports || [];

    reports.unshift({
      ...reportData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    });

    await chrome.storage.local.set({ reports });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get aggregated stats for the dashboard
 */
async function handleGetStats() {
  try {
    const result = await chrome.storage.local.get([
      'scanHistory',
      'totalScans',
      'threatsBlocked',
    ]);

    const history = result.scanHistory || [];
    const safeCount = history.filter((s) => s.riskLevel === 'safe').length;
    const suspiciousCount = history.filter((s) => s.riskLevel === 'suspicious').length;
    const dangerousCount = history.filter((s) => s.riskLevel === 'dangerous').length;

    return {
      success: true,
      data: {
        totalScans: result.totalScans || 0,
        threatsBlocked: result.threatsBlocked || 0,
        safeWebsites: safeCount,
        suspiciousWebsites: suspiciousCount,
        dangerousWebsites: dangerousCount,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// Threat Intelligence Handlers
// ============================================================

/**
 * Fetch threat intel from the backend server and cache in storage
 */
async function handleFetchThreatIntel(forceRefresh = false) {
  try {
    // Check cache staleness
    if (!forceRefresh) {
      const cached = await chrome.storage.local.get([THREAT_INTEL_CACHE_KEY, 'threatIntelTimestamp']);
      if (cached[THREAT_INTEL_CACHE_KEY] && cached.threatIntelTimestamp) {
        const age = Date.now() - cached.threatIntelTimestamp;
        const maxAge = THREAT_INTEL_REFRESH_HOURS * 60 * 60 * 1000;
        if (age < maxAge) {
          // Threat intel cache is fresh, skipping fetch.
          return { success: true, data: cached[THREAT_INTEL_CACHE_KEY], fromCache: true };
        }
      }
    }

    // Fetching threat intel from server...
    const response = await fetch(`${THREAT_SERVER_URL}/api/threat-trends?refresh=${forceRefresh}`);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      // Cache the data
      await chrome.storage.local.set({
        [THREAT_INTEL_CACHE_KEY]: json.data,
        threatIntelTimestamp: Date.now(),
      });
      // Threat intel data cached successfully.
      return { success: true, data: json.data, fromCache: false };
    }

    throw new Error(json.error || 'Invalid server response');
  } catch (error) {
    console.warn('[PhishShield AI] Threat intel fetch failed:', error.message);

    // Try to return cached data as fallback
    try {
      const cached = await chrome.storage.local.get(THREAT_INTEL_CACHE_KEY);
      if (cached[THREAT_INTEL_CACHE_KEY]) {
        // Returning stale cached threat intel as fallback.
        return { success: true, data: cached[THREAT_INTEL_CACHE_KEY], fromCache: true, stale: true };
      }
    } catch {}

    return { success: false, error: error.message };
  }
}

/**
 * Get cached threat intel without triggering a network fetch
 */
async function handleGetCachedThreatIntel() {
  try {
    const cached = await chrome.storage.local.get([THREAT_INTEL_CACHE_KEY, 'threatIntelTimestamp']);
    if (cached[THREAT_INTEL_CACHE_KEY]) {
      return { success: true, data: cached[THREAT_INTEL_CACHE_KEY], timestamp: cached.threatIntelTimestamp };
    }
    return { success: false, error: 'No cached data available' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// Real-Time Active Protection Interceptor
// ============================================================

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab.url;
  if (!url) return;
  
  // Ignore internal pages and local development
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.includes('localhost')) {
    return;
  }

  try {
    // 1. Check if Real-Time Protection is enabled
    const result = await chrome.storage.local.get(['settings', 'whitelist']);
    const isEnabled = result.settings?.realTimeProtection ?? true;
    
    if (!isEnabled) return;

    // 2. Check Whitelist
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const whitelist = result.whitelist || [];
    if (whitelist.includes(domain)) {
      return; // User bypassed the warning for this domain
    }

    // 3. Extract Features and Analyze
    if (typeof globalThis.FeatureExtractor !== 'undefined' && typeof globalThis.PhishingModel !== 'undefined') {
      const extraction = globalThis.FeatureExtractor.extractFeatures(url);
      const analysis = globalThis.PhishingModel.classifyUrl(extraction.features);

      // Update Extension Icon Badge dynamically
      if (chrome.action) {
        const scoreStr = Math.round(analysis.score || 0).toString();
        let badgeColor = '#10b981'; // Safe green
        if (analysis.riskLevel === 'dangerous') badgeColor = '#ef4444'; // Danger red
        else if (analysis.riskLevel === 'suspicious') badgeColor = '#f59e0b'; // Suspicious amber

        chrome.action.setBadgeText({ tabId, text: scoreStr });
        chrome.action.setBadgeBackgroundColor({ tabId, color: badgeColor });
      }

      // 4. Block if dangerous
      if (analysis.riskLevel === 'dangerous') {
        // Collect threat indicators for the warning page
        let threatIndicators = [];
        const f = extraction.features;
        if (f.has_punycode || f.domain_entropy > 4) threatIndicators.push("Detected deceptive characters (Homoglyphs) or random domain generation used to impersonate trusted brands.");
        if (f.has_suspicious_tld) threatIndicators.push("Uses a highly suspicious top-level domain commonly used by scammers.");
        if (f.brand_impersonation_score > 0 || f.path_brand_impersonation > 0) threatIndicators.push("Appears to be impersonating a well-known brand.");
        if (f.suspicious_keyword_count > 0) threatIndicators.push("Uses manipulative keywords designed to create urgency or steal credentials.");
        
        const warningUrl = chrome.runtime.getURL(`warning.html?url=${encodeURIComponent(url)}&threats=${encodeURIComponent(JSON.stringify(threatIndicators))}`);
        
        // Instantly redirect tab to Red Warning Screen Blocker
        chrome.tabs.update(tabId, { url: warningUrl });
        
        // Log the blocked threat
        handleSaveScan({
          url: url,
          timestamp: new Date().toISOString(),
          riskLevel: 'dangerous',
          score: analysis.score,
          features: f,
          analysis: analysis
        });
      }
    } else {
      console.warn('[PhishShield AI] ML modules not loaded, cannot perform real-time scan');
    }

  } catch (error) {
    console.error('[PhishShield AI] Interceptor Error:', error);
  }
});

// Listen for tab switching to immediately refresh badge score
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://') && !tab.url.includes('localhost')) {
      if (typeof globalThis.FeatureExtractor !== 'undefined' && typeof globalThis.PhishingModel !== 'undefined') {
        const extraction = globalThis.FeatureExtractor.extractFeatures(tab.url);
        const analysis = globalThis.PhishingModel.classifyUrl(extraction.features);
        if (chrome.action) {
          const scoreStr = Math.round(analysis.score || 0).toString();
          let badgeColor = '#10b981';
          if (analysis.riskLevel === 'dangerous') badgeColor = '#ef4444';
          else if (analysis.riskLevel === 'suspicious') badgeColor = '#f59e0b';
          chrome.action.setBadgeText({ tabId: activeInfo.tabId, text: scoreStr });
          chrome.action.setBadgeBackgroundColor({ tabId: activeInfo.tabId, color: badgeColor });
        }
      }
    }
  } catch {}
});
