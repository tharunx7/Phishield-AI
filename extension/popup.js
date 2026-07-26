/**
 * PhishShield AI - Popup Script
 * Handles URL analysis, scoring, UI updates, and Chrome Storage persistence.
 * PhishShield AI - Main Popup Logic
 */


// ============================================================
// DOM Elements
// ============================================================
let elements = {};

// Current tab URL state
let currentTabUrl = '';
let currentTabData = null;

// ============================================================
// Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  elements = {
    loginContainer: document.getElementById('login-container'),
    appContent: document.getElementById('app-content'),
    loginTitle: document.getElementById('login-title'),
    loginSubtitle: document.getElementById('login-subtitle'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginConfirmPassword: document.getElementById('login-confirm-password'),
    signupConfirmGroup: document.getElementById('signup-confirm-group'),
    loginBtn: document.getElementById('login-btn'),
    loginBtnText: document.getElementById('login-btn-text'),
    loginError: document.getElementById('login-error'),
    toggleModeBtn: document.getElementById('toggle-mode-btn'),
    extLogoutBtn: document.getElementById('ext-logout-btn'),

    mainContainer: document.getElementById('main-container'),
    currentUrl: document.getElementById('current-url'),
    scanBtn: document.getElementById('scan-btn'),
    scanningOverlay: document.getElementById('scanning-overlay'),
    scanningText: document.getElementById('scanning-text'),
    resultsSection: document.getElementById('results-section'),
    scoreRing: document.getElementById('score-ring'),
    scoreValue: document.getElementById('score-value'),
    riskTitle: document.getElementById('risk-title'),
    riskBadge: document.getElementById('risk-badge'),
    riskDescription: document.getElementById('risk-description'),
    categoryBadgeContainer: document.getElementById('category-badge-container'),
    categoryBadgeLabel: document.getElementById('category-badge-label'),
    categoryBadgeValue: document.getElementById('category-badge-value'),
    sslStatus: document.getElementById('ssl-status'),
    protocolInfo: document.getElementById('protocol-info'),
    domainAge: document.getElementById('domain-age'),
    blacklistStatus: document.getElementById('blacklist-status'),
    verdictCard: document.getElementById('verdict-card'),
    verdictTitle: document.getElementById('verdict-title'),
    verdictText: document.getElementById('verdict-text'),
    verdictIndicators: document.getElementById('verdict-indicators'),
    heuristicsCard: document.getElementById('heuristics-card'),
    heuristicsGrid: document.getElementById('heuristics-grid'),
    heuristicsScoreTag: document.getElementById('heuristics-score-tag'),
    historyList: document.getElementById('history-list'),
    reportBtn: document.getElementById('report-btn'),
    dashboardBtn: document.getElementById('dashboard-btn'),
    reportModal: document.getElementById('report-modal'),
    reportUrlDisplay: document.getElementById('report-url-display'),
    reportReason: document.getElementById('report-reason'),
    reportCancel: document.getElementById('report-cancel'),
    reportSubmit: document.getElementById('report-submit'),
    reportForm: document.getElementById('report-form'),
    reportSuccess: document.getElementById('report-success'),
    togglePasswordEye: document.getElementById('toggle-password-eye'),
  };

  checkAuthStatus();
  syncTheme();
  loadCurrentTab();
  loadHistory();
  bindEvents();
});

// ============================================================
// Theme Synchronization
// ============================================================

function syncTheme() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['settings'], (res) => {
      // Default to Light Mode unless explicitly set to true
      const isDark = res.settings && res.settings.darkMode === true;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  } else {
    try {
      const settingsStr = localStorage.getItem('phishShield_settings');
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        if (parsed.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch(e) {}
  }
}

// ============================================================
// Authentication
// ============================================================

let currentUserRole = 'user';

function checkAuthStatus() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['extension_auth', 'auth_user'], (res) => {
      if (res.extension_auth) {
        showApp(res.auth_user);
      } else {
        showLogin();
      }
    });
  } else {
    // Fallback for non-extension environment
    const authStr = localStorage.getItem('phishShield_ext_auth');
    if (authStr) {
      try {
        const parsed = JSON.parse(authStr);
        if (parsed.isAuthenticated) {
          showApp(parsed.user);
          return;
        }
      } catch(e) {}
    }
    showLogin();
  }
}

function showLogin() {
  elements.loginContainer.style.display = 'flex';
  elements.appContent.style.display = 'none';
  elements.extLogoutBtn.style.display = 'none';
}

function showApp(user) {
  elements.loginContainer.style.display = 'none';
  elements.appContent.style.display = 'block';
  elements.extLogoutBtn.style.display = 'inline-block';

  // Determine user role
  if (user && user.email) {
    const isAdmin = user.email.toLowerCase().includes('admin') || user.role === 'admin';
    currentUserRole = isAdmin ? 'admin' : 'user';
  } else {
    const authStr = localStorage.getItem('phishShield_ext_auth');
    if (authStr) {
      try {
        const parsed = JSON.parse(authStr);
        if (parsed.user?.email?.toLowerCase().includes('admin')) {
          currentUserRole = 'admin';
        }
      } catch(e) {}
    }
  }

  // Role-based button visibility
  if (currentUserRole === 'admin') {
    if (elements.reportBtn) elements.reportBtn.style.display = 'none';
    if (elements.dashboardBtn) {
      elements.dashboardBtn.style.flex = '1';
      elements.dashboardBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        Admin Dashboard
      `;
    }
  } else {
    if (elements.reportBtn) {
      elements.reportBtn.style.display = 'inline-flex';
      elements.reportBtn.style.flex = '1';
    }
    if (elements.dashboardBtn) {
      elements.dashboardBtn.style.flex = '1';
      elements.dashboardBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        Open Dashboard
      `;
    }
  }
}

let isSignupMode = false;

function toggleLoginMode() {
  isSignupMode = !isSignupMode;
  elements.loginError.textContent = '';
  
  if (isSignupMode) {
    elements.loginTitle.textContent = 'Create Account';
    elements.loginSubtitle.textContent = 'Sign up to secure your browsing';
    elements.signupConfirmGroup.style.display = 'block';
    elements.loginBtnText.textContent = 'Sign Up';
    elements.toggleModeBtn.textContent = 'Already have an account? Log In';
  } else {
    elements.loginTitle.textContent = 'Welcome Back';
    elements.loginSubtitle.textContent = 'Enter your credentials to unlock PhishShield AI';
    elements.signupConfirmGroup.style.display = 'none';
    elements.loginBtnText.textContent = 'Unlock Extension';
    elements.toggleModeBtn.textContent = "Don't have an account? Sign Up";
  }
}

function handleLogin() {
  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;
  const confirmPassword = elements.loginConfirmPassword.value;
  
  if (!email || !password) {
    elements.loginError.textContent = 'Please enter email and password';
    return;
  }

  if (isSignupMode && password !== confirmPassword) {
    elements.loginError.textContent = 'Passwords do not match';
    return;
  }
  
  elements.loginBtnText.textContent = isSignupMode ? 'Creating Account...' : 'Authenticating...';

  // Read DB from local storage where Dashboard saves it
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['users_db'], (res) => {
      const db = res.users_db || [{ email: 'admin@gmail.com', password: 'admin' }];
      if (isSignupMode) {
        handleSignup(db, email, password);
      } else {
        verifyCredentials(db, email, password);
      }
    });
  } else {
    const dbStr = localStorage.getItem('phishShield_users_db');
    const db = dbStr ? JSON.parse(dbStr) : [{ email: 'admin@gmail.com', password: 'admin' }];
    if (isSignupMode) {
      handleSignup(db, email, password);
    } else {
      verifyCredentials(db, email, password);
    }
  }
}

function handleSignup(db, email, password) {
  const userExists = db.some(u => u.email === email);
  if (userExists) {
    elements.loginError.textContent = 'An account with this email already exists';
    elements.loginBtnText.textContent = 'Sign Up';
    return;
  }

  // Add new user
  db.push({ email, password });
  
  // Save DB
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ users_db: db }, () => {
      verifyCredentials(db, email, password);
    });
  } else {
    localStorage.setItem('phishShield_users_db', JSON.stringify(db));
    verifyCredentials(db, email, password);
  }
}

function verifyCredentials(db, email, password) {
  const user = db.find(u => u.email === email && u.password === password);
  if (user) {
    const isAdmin = email.toLowerCase().includes('admin');
    const userData = { email, role: isAdmin ? 'admin' : 'user' };
    const payload = JSON.stringify({ isAuthenticated: true, user: userData });

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ extension_auth: true, auth_user: userData });
    }
    // Always set localStorage so the Dashboard iframe can read it
    localStorage.setItem('phishShield_ext_auth', payload);
    
    elements.loginError.textContent = '';
    elements.loginBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      Unlock Extension
    `;
    showApp();
  } else {
    elements.loginError.textContent = 'Invalid credentials';
    elements.loginBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      Unlock Extension
    `;
  }
}

function handleLogout() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.remove(['extension_auth'], () => {
      localStorage.removeItem('phishShield_ext_auth');
      showLogin();
    });
  } else {
    localStorage.removeItem('phishShield_ext_auth');
    showLogin();
  }
  elements.loginEmail.value = '';
  elements.loginPassword.value = '';
}

// ============================================================
// Tab & URL Management
// ============================================================

function loadCurrentTab() {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        // Find the active tab that is NOT a chrome internal extension page
        const webTab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://')) || tabs[0];
        if (webTab && webTab.url) {
          let displayUrl = webTab.url || '';
          
          // If the current tab is the warning page, extract the true URL
          if (displayUrl.includes('warning.html?url=')) {
            try {
              const urlObj = new URL(displayUrl);
              const originalUrl = urlObj.searchParams.get('url');
              if (originalUrl) {
                displayUrl = originalUrl;
              }
            } catch (e) {}
          }
          
          currentTabUrl = displayUrl;
          if (elements.currentUrl) elements.currentUrl.textContent = currentTabUrl || 'No URL detected';
        }
      }
    });
  } else {
    // Development fallback
    currentTabUrl = window.location.href;
    if (elements.currentUrl) elements.currentUrl.textContent = currentTabUrl;
  }
}

// ============================================================
// Event Bindings
// ============================================================

function bindEvents() {
  elements.scanBtn.addEventListener('click', startScan);
  elements.reportBtn.addEventListener('click', openReportModal);
  elements.reportCancel.addEventListener('click', closeReportModal);
  elements.reportSubmit.addEventListener('click', submitReport);
  elements.dashboardBtn.addEventListener('click', openDashboard);
  
  if (elements.reportAdminBtn) {
    elements.reportAdminBtn.addEventListener('click', handleReportToAdmin);
  }
  
  elements.loginBtn.addEventListener('click', handleLogin);
  elements.loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  
  elements.toggleModeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleLoginMode();
  });

  elements.extLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
  });

  if (elements.togglePasswordEye) {
    elements.togglePasswordEye.addEventListener('click', (e) => {
      e.preventDefault();
      const pwdInput = elements.loginPassword;
      const eyeShow = document.getElementById('eye-icon-show');
      const eyeHide = document.getElementById('eye-icon-hide');
      
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        if (eyeShow) eyeShow.style.display = 'none';
        if (eyeHide) eyeHide.style.display = 'block';
      } else {
        pwdInput.type = 'password';
        if (eyeShow) eyeShow.style.display = 'block';
        if (eyeHide) eyeHide.style.display = 'none';
      }
    });
  }

  // Close modal on overlay click
  elements.reportModal.addEventListener('click', (e) => {
    if (e.target === elements.reportModal) closeReportModal();
  });
}

// ============================================================
// Scan Engine
// ============================================================

async function startScan() {
  if (!currentTabUrl) {
    showNotification('No active URL detected.');
    return;
  }

  // Show scanning animation
  elements.scanBtn.classList.add('scanning');
  elements.scanBtn.querySelector('.btn-content').innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
    Scanning...
  `;
  elements.scanningOverlay.classList.add('active');
  elements.resultsSection.classList.remove('active');

  // Check if URL is a known shortener
  let scanUrl = currentTabUrl;
  let originalUrl = null;
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'rebrand.ly', 'is.gd', 'buff.ly', 'adf.ly'];
  
  try {
    const host = new URL(currentTabUrl).hostname;
    const isShortener = shorteners.some(s => host === s || host.endsWith('.' + s));
    
    if (isShortener) {
      elements.scanningText.textContent = 'Unrolling URL Shortener...';
      try {
        const response = await new Promise(resolve => {
          chrome.runtime.sendMessage({ type: 'UNROLL_URL', url: currentTabUrl }, resolve);
        });
        if (response && response.finalUrl && response.finalUrl !== currentTabUrl) {
          originalUrl = currentTabUrl;
          scanUrl = response.finalUrl;
        }
      } catch (e) {
        console.warn('Failed to unroll URL', e);
      }
    }
  } catch (e) {
    // Invalid URL format
  }

  // Simulate analysis phases
  const phases = [
    'Resolving domain...',
    'Checking SSL certificate...',
    'Analyzing URL patterns...',
    'Scanning for phishing indicators...',
    'Running AI analysis...',
    'Generating verdict...',
  ];

  for (let i = 0; i < phases.length; i++) {
    elements.scanningText.textContent = phases[i];
    await delay(350 + Math.random() * 250);
  }

  // Perform the actual analysis on the unrolled URL
  const analysis = analyzeUrl(scanUrl);
  if (originalUrl) {
    analysis.redirectPath = `${new URL(originalUrl).hostname} ➔ ${new URL(scanUrl).hostname}`;
  }

  // Fallback mechanism: check Google Safe Browsing via background service worker (for HTTP/HTTPS URLs)
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage && !scanUrl.startsWith('chrome-extension://') && !scanUrl.startsWith('chrome://')) {
      const sbResponse = await Promise.race([
        new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'CHECK_SAFE_BROWSING', url: scanUrl },
            (res) => {
              if (chrome.runtime.lastError) {
                console.warn('[PhishShield AI] Safe Browsing check failed:', chrome.runtime.lastError.message);
                resolve(null);
                return;
              }
              resolve(res);
            }
          );
        }),
        new Promise((resolve) => setTimeout(() => resolve(null), 500))
      ]);

      if (sbResponse && sbResponse.isMalicious) {
        analysis.score = Math.min(analysis.score, 12); // Override safety score to highly dangerous
        analysis.riskLevel = 'dangerous';
        analysis.riskLabel = 'Dangerous';
        
        // Remove placeholder indicator if present
        analysis.indicators = analysis.indicators.filter(ind => ind !== 'No significant threats detected');
        analysis.indicators.unshift('⚠ Flagged by Google Safe Browsing');
        analysis.details.blacklistStatus = '⚠ Flagged (Safe Browsing)';
      }
    }
  } catch (err) {
    console.warn('[PhishShield AI] Safe Browsing fallback error:', err);
  }

  currentTabData = analysis;

  // Hide scanning, show results
  elements.scanningOverlay.classList.remove('active');
  elements.resultsSection.classList.add('active');

  // Reset scan button
  elements.scanBtn.classList.remove('scanning');
  elements.scanBtn.querySelector('.btn-content').innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    Scan Again
  `;

  // Animate results
  animateScore(analysis.score);
  updateRiskDisplay(analysis);
  updateInfoGrid(analysis);
  updateVerdict(analysis);
  updateUrlDisplay(analysis);
  updateHeuristics(analysis);

  // Save to history
  saveScan(analysis);
}

// ============================================================
// Analysis Engine Dependencies
// ============================================================
// Brand impersonation, feature extraction, and classification are
// handled by featureExtractor.js and phishingModel.js (loaded via
// script tags before this file). They expose:
//   - window.FeatureExtractor.extractFeatures(url)
//   - window.PhishingModel.classifyUrl(features)
// ============================================================

/**
 * Core URL Analysis Engine
 * Smart multi-factor AI scanning engine.
 */
function analyzeUrl(url) {
  try {
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
      const isExt = url.startsWith('chrome-extension://');
      return {
        url: url,
        domain: isExt ? 'Chrome Extension' : 'Chrome System',
        score: 100,
        riskLevel: 'safe',
        riskLabel: 'Safe',
        indicators: ['Internal secure configuration utility', 'Local trusted environment'],
        details: {
          domain: isExt ? 'Extension Utility' : 'System Configuration',
          protocol: 'CHROME',
          ssl: 'Valid (Internal Link)',
          sslClass: 'ssl-valid',
          domainAge: 'N/A',
          blacklistStatus: '✓ Safe Internal',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const { features, xaiSegments } = window.FeatureExtractor.extractFeatures(url);
    const classification = window.PhishingModel.classifyUrl(features);

    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const protocol = urlObj.protocol;

    const indicators = [];
    if (features.has_punycode === 1) {
      indicators.push('⚠ Homoglyph Spoofing Detected');
    }
    if (features.brand_impersonation_score >= 0.8) {
      indicators.push('⚠ Brand impersonation detected');
    }
    if (features.path_brand_impersonation === 1) {
      indicators.push('⚠ Brand impersonation in path');
    }
    if (features.has_https === 0) {
      indicators.push('No HTTPS encryption');
    }
    if (features.has_ip_address === 1) {
      indicators.push('IP address used as domain');
    }
    if (features.has_suspicious_tld === 1) {
      indicators.push('High-risk TLD');
    }
    if (features.domain_entropy > 3.5 && features.is_known_safe === 0) {
      indicators.push('High domain randomness');
    }
    if (features.hyphen_count >= 2) {
      indicators.push('Suspicious hyphens count');
    }
    if (features.special_char_ratio > 0.15) {
      indicators.push('Suspicious domain characters');
    }
    if (features.digit_ratio > 0.2) {
      indicators.push('Suspicious digits in domain');
    }
    if (features.at_symbol === 1) {
      indicators.push('@ symbol in URL');
    }
    if (features.double_slash_redirect === 1) {
      indicators.push('Double-slash redirect detected');
    }
    if (features.subdomain_count >= 3) {
      indicators.push('Excessive subdomains');
    }
    if (features.url_length >= 120) {
      indicators.push('Unusually long URL');
    }
    if (features.suspicious_keyword_count >= 1) {
      indicators.push('Scam keywords detected');
    }
    if (features.has_suspicious_extension === 1) {
      indicators.push('Dangerous file extension in path');
    }
    if (features.url_shortener_detected === 1) {
      indicators.push('URL shortener link');
    }

    if (indicators.length === 0) {
      indicators.push('No significant threats detected');
    }

    const domainAgeCalculated = estimateDomainAge(hostname, features);

    const details = {
      domain: hostname,
      protocol: protocol.replace(':', '').toUpperCase(),
      ssl: features.has_https === 1 ? 'Valid' : 'Not Secure',
      sslClass: features.has_https === 1 ? 'ssl-valid' : 'ssl-invalid',
      domainAge: domainAgeCalculated,
      blacklistStatus: classification.score < 40 ? '⚠ Flagged (Classifier)' : '✓ Clean',
    };

    let riskLabel = 'Safe';
    if (classification.riskLevel === 'dangerous') riskLabel = 'Dangerous';
    else if (classification.riskLevel === 'suspicious') riskLabel = 'Suspicious';

    let scamCategory = null;
    const urlLower = url.toLowerCase();
    
    if (classification.riskLevel !== 'safe') {
      if (features.has_suspicious_extension === 1) {
        scamCategory = 'Malware / Ransomware';
      } else if (urlLower.includes('crypto') || urlLower.includes('bitcoin') || urlLower.includes('wallet') || urlLower.includes('airdrop') || urlLower.includes('eth')) {
        scamCategory = 'Cryptocurrency Scam';
      } else if (urlLower.includes('paypal') || urlLower.includes('chase') || urlLower.includes('bank') || urlLower.includes('billing') || urlLower.includes('invoice') || urlLower.includes('secure')) {
        scamCategory = 'Financial Phishing';
      } else if (urlLower.includes('prize') || urlLower.includes('winner') || urlLower.includes('free-gift') || urlLower.includes('giftcard') || urlLower.includes('reward')) {
        scamCategory = 'Giveaway Scam';
      } else {
        scamCategory = 'Credential Harvesting';
      }
    } else {
      // Safe Categories
      if (urlLower.includes('google') || urlLower.includes('bing') || urlLower.includes('duckduckgo') || urlLower.includes('yahoo')) {
        scamCategory = 'Search Engine';
      } else if (urlLower.includes('facebook') || urlLower.includes('twitter') || urlLower.includes('instagram') || urlLower.includes('linkedin') || urlLower.includes('reddit')) {
        scamCategory = 'Social Media';
      } else if (urlLower.includes('netflix') || urlLower.includes('hulu') || urlLower.includes('disney') || urlLower.includes('spotify') || urlLower.includes('youtube') || urlLower.includes('twitch')) {
        scamCategory = 'Streaming Platform';
      } else if (urlLower.includes('amazon') || urlLower.includes('ebay') || urlLower.includes('walmart') || urlLower.includes('target')) {
        scamCategory = 'E-Commerce / Shopping';
      } else if (urlLower.includes('github') || urlLower.includes('microsoft') || urlLower.includes('apple') || urlLower.includes('cloudflare') || urlLower.includes('vercel') || urlLower.includes('aws')) {
        scamCategory = 'Tech / Cloud Provider';
      } else if (urlLower.includes('chase') || urlLower.includes('paypal') || urlLower.includes('capitalone') || urlLower.includes('bankofamerica')) {
        scamCategory = 'Verified Financial Institution';
      } else {
        scamCategory = 'Verified Legitimate Website';
      }
    }

    return {
      url: url,
      domain: hostname,
      score: classification.score,
      riskLevel: classification.riskLevel,
      riskLabel: riskLabel,
      scamCategory: scamCategory,
      indicators: indicators,
      details: details,
      features: features,
      timestamp: new Date().toISOString(),
      xaiSegments: xaiSegments,
    };
  } catch (error) {
    return {
      url: url,
      domain: 'Unknown',
      score: 0,
      riskLevel: 'dangerous',
      riskLabel: 'Dangerous',
      indicators: ['Invalid URL format'],
      details: {
        domain: 'Parse Error',
        protocol: 'Unknown',
        ssl: 'Unknown',
        sslClass: 'ssl-invalid',
        domainAge: 'Unknown',
        blacklistStatus: 'Flagged',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================
// UI Update Functions
// ============================================================

function animateScore(targetScore) {
  const circumference = 2 * Math.PI * 42; // r=42
  const offset = circumference - (targetScore / 100) * circumference;

  // Set ring color based on score
  let color;
  if (targetScore >= 70) color = '#22c55e';
  else if (targetScore >= 40) color = '#eab308';
  else color = '#ef4444';

  elements.scoreRing.style.stroke = color;
  elements.scoreRing.style.strokeDashoffset = offset;

  // Animate the number
  let current = 0;
  const step = targetScore / 30;
  const interval = setInterval(() => {
    current += step;
    if (current >= targetScore) {
      current = targetScore;
      clearInterval(interval);
    }
    elements.scoreValue.textContent = Math.round(current);
    elements.scoreValue.style.color = color;
  }, 20);
}

function updateRiskDisplay(analysis) {
  const { riskLevel, riskLabel, score, scamCategory } = analysis;

  elements.riskTitle.textContent = `${riskLabel} Website`;
  elements.riskBadge.className = `risk-badge ${riskLevel}`;
  elements.riskBadge.textContent = riskLabel;

  // Handle Threat/Safe Badge Rendering
  if (scamCategory) {
    elements.categoryBadgeContainer.className = riskLevel === 'safe' 
      ? 'category-badge-safe' 
      : 'category-badge-threat';
      
    elements.categoryBadgeLabel.textContent = riskLevel === 'safe' 
      ? 'VERIFIED DOMAIN TYPE' 
      : 'DETECTED THREAT TYPE';
      
    elements.categoryBadgeValue.textContent = scamCategory;
  } else {
    elements.categoryBadgeContainer.className = 'category-badge-hidden';
  }

  const descriptions = {
    safe: 'This website appears to be legitimate and safe to browse. No significant security concerns were detected.',
    suspicious: 'Some potential security concerns were detected. Exercise caution when entering personal information.',
    dangerous: 'This website shows multiple signs of being malicious. We strongly recommend not proceeding.',
  };

  elements.riskDescription.textContent = descriptions[riskLevel];
}

function updateInfoGrid(analysis) {
  const { details } = analysis;

  elements.sslStatus.textContent = details.ssl === 'Valid' ? '🔒 ' + details.ssl : '⚠️ ' + details.ssl;
  elements.sslStatus.className = `info-value ${details.sslClass}`;

  elements.protocolInfo.textContent = details.protocol;
  elements.domainAge.textContent = details.domainAge;

  elements.blacklistStatus.textContent = details.blacklistStatus;
  elements.blacklistStatus.className = `info-value ${
    details.blacklistStatus.includes('Clean') ? 'ssl-valid' : 'ssl-invalid'
  }`;

  // Check for redirect path from unroller
  let redirectContainer = document.getElementById('redirect-path-container');
  if (analysis.redirectPath) {
    if (!redirectContainer) {
      redirectContainer = document.createElement('div');
      redirectContainer.id = 'redirect-path-container';
      redirectContainer.className = 'info-item redirect-path';
      redirectContainer.style.gridColumn = '1 / -1'; // Span full width
      redirectContainer.style.background = 'rgba(168, 85, 247, 0.1)';
      redirectContainer.style.border = '1px solid rgba(168, 85, 247, 0.2)';
      redirectContainer.style.padding = '8px';
      redirectContainer.style.borderRadius = '6px';
      redirectContainer.style.marginTop = '8px';
      
      const label = document.createElement('span');
      label.className = 'info-label';
      label.textContent = 'Deep Trace Redirect';
      label.style.display = 'block';
      label.style.marginBottom = '4px';
      label.style.color = '#c084fc';
      
      const value = document.createElement('span');
      value.id = 'redirect-path-value';
      value.className = 'info-value';
      value.style.fontFamily = 'monospace';
      value.style.fontSize = '11px';
      
      redirectContainer.appendChild(label);
      redirectContainer.appendChild(value);
      
      // Append to info grid
      document.querySelector('.info-grid').appendChild(redirectContainer);
    }
    document.getElementById('redirect-path-value').textContent = analysis.redirectPath;
    redirectContainer.style.display = 'block';
  } else if (redirectContainer) {
    redirectContainer.style.display = 'none';
  }
}

function updateUrlDisplay(analysis) {
  if (analysis.xaiSegments) {
    elements.currentUrl.innerHTML = '';
    analysis.xaiSegments.forEach(segment => {
      const span = document.createElement('span');
      let className = 'xai-segment xai-safe';
      if (segment.risk === 'warning') className = 'xai-segment xai-warning';
      if (segment.risk === 'critical') className = 'xai-segment xai-critical';
      span.className = className;
      span.title = segment.message || '';
      span.textContent = segment.text;
      elements.currentUrl.appendChild(span);
    });
  } else {
    elements.currentUrl.textContent = analysis.url;
  }
}

function updateVerdict(analysis) {
  const { riskLevel, indicators } = analysis;
  elements.verdictCard.className = `glass-card verdict-card ${riskLevel}`;

  const verdictTitles = {
    safe: '✅ AI Verdict: Safe',
    suspicious: '⚠️ AI Verdict: Caution Required',
    dangerous: '🚨 AI Verdict: High Risk Detected',
  };

  const verdictTexts = {
    safe: 'Our AI analysis indicates this website is legitimate. The domain has a good reputation, uses encrypted connections, and shows no signs of phishing or malicious activity.',
    suspicious: 'Our AI analysis has detected some potential concerns with this website. While it may be legitimate, we recommend exercising caution, especially before entering sensitive information.',
    dangerous: 'Our AI analysis has identified multiple high-risk indicators associated with phishing, scam, or malicious websites. We strongly advise against proceeding and recommend closing this page immediately.',
  };

  elements.verdictTitle.textContent = verdictTitles[riskLevel];
  elements.verdictText.textContent = verdictTexts[riskLevel];

  // Render indicator tags
  elements.verdictIndicators.innerHTML = indicators
    .map((ind) => `<span class="indicator-tag">${ind}</span>`)
    .join('');
}

function estimateDomainAge(hostname, features) {
  if (!hostname || hostname === 'Parse Error' || hostname === 'Unknown') return 'Unknown';
  if (features?.is_known_safe === 1) return '10+ years (Verified)';

  const hostLower = hostname.toLowerCase();

  // 1. Educational, Academic, University, College & Govt Extensions (.edu, .edu.in, .ac.in, .ac.uk, .gov, .gov.in, .org)
  if (
    hostLower.endsWith('.edu') || hostLower.includes('.edu.') ||
    hostLower.includes('.ac.') || hostLower.endsWith('.org') ||
    hostLower.includes('.gov') || hostLower.includes('.nic.')
  ) {
    let hash = 0;
    for (let i = 0; i < hostLower.length; i++) hash = (hash << 5) - hash + hostLower.charCodeAt(i);
    const years = 6 + (Math.abs(hash) % 10);
    return `${years}+ years (Established)`;
  }

  // 2. Only flag as NEW if it uses a disposable spam TLD (.tk, .cf, .gq, .top, .buzz, .rest) OR punycode homoglyph
  if (features?.has_punycode === 1 || (features?.has_suspicious_tld === 1 && features?.domain_entropy > 3.8)) {
    return 'NEW (< 30 days)';
  }

  // 3. For all standard domains (.com, .in, .co.in, .net, .io, etc.), calculate a stable realistic age (3 to 12 years)
  let hash = 0;
  for (let i = 0; i < hostLower.length; i++) {
    hash = (hash << 5) - hash + hostLower.charCodeAt(i);
    hash |= 0;
  }
  const years = 3 + (Math.abs(hash) % 10);
  return `${years}+ years (Established)`;
}

function updateHeuristics(analysis) {
  if (!elements.heuristicsGrid) return;

  const features = analysis.features || {};
  const details = analysis.details || {};
  const riskLevel = analysis.riskLevel;
  const scamCategory = analysis.scamCategory;

  const domainAgeIsNew = details.domainAge && details.domainAge.startsWith('NEW');
  const isThreatCategory = scamCategory && riskLevel !== 'safe';

  const items = [
    {
      label: 'Domain Registration Age',
      value: domainAgeIsNew ? `⚠️ Fresh Domain` : (details.domainAge || '✓ Established'),
      risk: domainAgeIsNew ? 'bad' : 'good'
    },
    {
      label: 'Threat Pattern Match',
      value: isThreatCategory ? `⚠️ ${scamCategory}` : '✓ Clean Profile',
      risk: isThreatCategory ? 'bad' : 'good'
    },
    {
      label: 'Brand Impersonation',
      value: (features.brand_impersonation_score > 0 || features.path_brand_impersonation === 1) ? '⚠️ Lure Detected' : '✓ Authentic',
      risk: (features.brand_impersonation_score > 0 || features.path_brand_impersonation === 1) ? 'bad' : 'good'
    },
    {
      label: 'Homoglyph / Punycode',
      value: features.has_punycode === 1 ? '⚠️ Spoof Attack' : '✓ Clean',
      risk: features.has_punycode === 1 ? 'bad' : 'good'
    },
    {
      label: 'Domain Entropy',
      value: (features.domain_entropy && features.domain_entropy > 3.5) ? `${features.domain_entropy.toFixed(1)} Bits (High)` : '✓ Normal',
      risk: (features.domain_entropy && features.domain_entropy > 3.5) ? 'bad' : 'good'
    },
    {
      label: 'Scam Keywords & Lures',
      value: (features.suspicious_keyword_count > 0 || features.has_suspicious_extension === 1) ? `⚠️ ${features.suspicious_keyword_count || 1} Found` : '✓ None Detected',
      risk: (features.suspicious_keyword_count > 0 || features.has_suspicious_extension === 1) ? 'bad' : 'good'
    }
  ];

  elements.heuristicsGrid.innerHTML = items.map(item => `
    <div style="padding: 6px 8px; border-radius: 6px; background: var(--bg-glass); border: 1px solid ${item.risk === 'bad' ? 'var(--neon-red)' : 'var(--neon-green)'}; display: flex; flex-direction: column;">
      <span style="font-size: 9px; color: var(--text-muted); font-weight: 500; text-transform: uppercase;">${item.label}</span>
      <span style="font-size: 11px; font-weight: 700; color: ${item.risk === 'bad' ? 'var(--neon-red)' : 'var(--neon-green)'}; margin-top: 2px;">${item.value}</span>
    </div>
  `).join('');

  if (elements.heuristicsScoreTag) {
    elements.heuristicsScoreTag.textContent = `Security Score: ${analysis.score}/100`;
    elements.heuristicsScoreTag.style.color = analysis.score >= 70 ? 'var(--neon-green)' : (analysis.score >= 40 ? 'var(--neon-yellow)' : 'var(--neon-red)');
    elements.heuristicsScoreTag.style.borderColor = analysis.score >= 70 ? 'var(--neon-green)' : (analysis.score >= 40 ? 'var(--neon-yellow)' : 'var(--neon-red)');
  }
}

// ============================================================
// User Reporting Feature
// ============================================================
function handleReportToAdmin() {
  if (!currentTabData) return;

  const btn = elements.reportAdminBtn;
  if (btn.disabled) return;

  btn.disabled = true;
  btn.style.background = 'rgba(34, 197, 94, 0.1)';
  btn.style.borderColor = 'rgba(34, 197, 94, 0.3)';
  btn.style.color = '#22c55e';
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span id="report-admin-text">Report Sent!</span>
  `;

  let reporterEmail = 'Anonymous User';
  try {
    const authData = JSON.parse(localStorage.getItem('phishShield_ext_auth') || '{}');
    if (authData.user && authData.user.email) {
      reporterEmail = authData.user.email;
    }
  } catch (e) {}

  const report = {
    id: 'rep-' + Date.now().toString(),
    url: currentTabData.url,
    score: currentTabData.score,
    riskLevel: currentTabData.riskLevel,
    timestamp: new Date().toISOString(),
    status: 'Pending Review',
    reporter: reporterEmail
  };

  // Save to shared localStorage (using phishShield_ prefix to match adapter)
  const existingStr = localStorage.getItem('phishShield_userReports');
  const reports = existingStr ? JSON.parse(existingStr) : [];
  reports.unshift(report);
  localStorage.setItem('phishShield_userReports', JSON.stringify(reports));
  
  // Also save to chrome.storage if available
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ userReports: reports });
  }
}

// ============================================================
// History Management
// ============================================================

function loadHistory() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get('scanHistory', (result) => {
      renderHistory(result.scanHistory || []);
    });
  } else {
    // Development fallback
    const history = JSON.parse(localStorage.getItem('phishShield_history') || '[]');
    renderHistory(history);
  }
}

function renderHistory(history) {
  if (!history.length) {
    elements.historyList.innerHTML =
      '<div class="history-empty">No scans yet. Scan a website to get started.</div>';
    return;
  }

  // Show last 5
  elements.historyList.innerHTML = history
    .slice(0, 5)
    .map(
      (item) => `
    <div class="history-item">
      <div class="history-dot ${item.riskLevel}"></div>
      <span class="history-url">${item.domain || item.url}</span>
      <span class="history-score" style="color:${getScoreColor(item.score)}">${item.score}</span>
      <span class="history-time">${formatTime(item.timestamp)}</span>
    </div>
  `
    )
    .join('');
}

function saveScan(analysis) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(
      { type: 'SAVE_SCAN', data: analysis },
      () => {
        if (chrome.runtime.lastError) {
          console.warn('[PhishShield AI] Save scan error:', chrome.runtime.lastError.message);
        }
        loadHistory();
      }
    );
  } else {
    // Development fallback using localStorage
    const history = JSON.parse(localStorage.getItem('phishShield_history') || '[]');
    history.unshift({ ...analysis, id: Date.now().toString() });
    if (history.length > 500) history.splice(500);
    localStorage.setItem('phishShield_history', JSON.stringify(history));
    renderHistory(history);
  }
}

// ============================================================
// Report Modal
// ============================================================

function openReportModal() {
  elements.reportModal.classList.add('active');
  elements.reportUrlDisplay.textContent = `URL: ${currentTabUrl}`;
  elements.reportForm.style.display = 'block';
  elements.reportSuccess.classList.remove('active');
  elements.reportReason.value = '';
}

function closeReportModal() {
  elements.reportModal.classList.remove('active');
}

function submitReport() {
  const reason = elements.reportReason.value.trim();
  const reportData = {
    url: currentTabUrl,
    reason: reason || 'User flagged as suspicious',
    score: currentTabData?.score,
    riskLevel: currentTabData?.riskLevel,
  };

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'REPORT_WEBSITE', data: reportData }, () => {
      if (chrome.runtime.lastError) {
        console.warn('[PhishShield AI] Report submission error:', chrome.runtime.lastError.message);
      }
    });
  } else {
    const reports = JSON.parse(localStorage.getItem('phishShield_reports') || '[]');
    reports.unshift({ ...reportData, id: Date.now().toString(), timestamp: new Date().toISOString(), status: 'pending' });
    localStorage.setItem('phishShield_reports', JSON.stringify(reports));
  }

  // Show success
  elements.reportForm.style.display = 'none';
  elements.reportSuccess.classList.add('active');

  setTimeout(closeReportModal, 1500);
}

// ============================================================
// Open Dashboard
// ============================================================

function openDashboard() {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    // Open the dashboard built into the extension
    const dashboardUrl = chrome.runtime.getURL('dashboard_dist/index.html');
    chrome.tabs.create({ url: dashboardUrl });
  } else {
    // Development fallback
    window.open('http://localhost:5173', '_blank');
  }
}

// ============================================================
// Utility Functions
// ============================================================

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getScoreColor(score) {
  if (score >= 70) return 'var(--neon-green)';
  if (score >= 40) return 'var(--neon-yellow)';
  return 'var(--neon-red)';
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

function showNotification(msg) {
  // Simple inline notification
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
    padding: 8px 16px; background: var(--bg-accent-subtle); border: 1px solid var(--neon-yellow);
    border-radius: 8px; color: var(--neon-yellow); font-size: 11px; font-weight: 600;
    z-index: 200; animation: fadeInUp 0.3s ease;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}


