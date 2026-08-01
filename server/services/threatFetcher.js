const historicalBaseline = require('../data/historicalBaseline.js');

const FINANCIAL_KEYWORDS = [
  'paypal', 'chase', 'wellsfargo', 'wells-fargo', 'bankofamerica',
  'bank-of-america', 'citibank', 'citi', 'hsbc', 'barclays',
  'capitalone', 'capital-one', 'usbank', 'pnc', 'tdbank',
  'td-bank', 'schwab', 'fidelity', 'vanguard', 'robinhood',
  'coinbase', 'binance', 'stripe', 'square', 'venmo', 'zelle',
  'banking', 'bank', 'finance', 'credit', 'debit', 'mortgage',
  'loan', 'invest', 'trading', 'wallet', 'crypto', 'bitcoin',
  'ethereum', 'amex', 'americanexpress', 'mastercard', 'visa',
  'discover', 'unionpay', 'wise', 'revolut', 'n26', 'monzo',
  'chime', 'sofi', 'ally', 'ing', 'santander', 'bnp', 'sbi',
  'icici', 'hdfc', 'kotak', 'axis-bank', 'axisbank',
];

function isFinancialTarget(url) {
  const lower = url.toLowerCase();
  return FINANCIAL_KEYWORDS.some((kw) => lower.includes(kw));
}

let cachedLiveData = null;
let lastFetchTimestamp = null;

async function fetchURLhausData() {
  try {
    const response = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/1000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      throw new Error(`URLhaus HTTP ${response.status}`);
    }

    const data = await response.json();
    const urls = data.urls || [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentURLs = urls.filter((entry) => {
      const added = new Date(entry.dateadded);
      return added >= thirtyDaysAgo;
    });

    const maliciousUrlList = recentURLs.map(entry => entry.url || '').filter(Boolean);

    let malwareCount = 0;
    let phishingCount = 0;
    let financialCount = 0;
    const threatTypes = {};

    recentURLs.forEach((entry) => {
      const tag = (entry.threat || 'unknown').toLowerCase();
      threatTypes[tag] = (threatTypes[tag] || 0) + 1;

      if (tag.includes('malware')) malwareCount++;
      if (tag.includes('phishing') || tag.includes('phish')) phishingCount++;
      if (isFinancialTarget(entry.url || '')) financialCount++;
    });

    return {
      source: 'URLhaus',
      totalURLs: recentURLs.length,
      malwareCount,
      phishingCount,
      financialCount,
      threatTypes,
      rawCount: urls.length,
      fetchedAt: new Date().toISOString(),
      maliciousUrlList,
    };
  } catch (error) {
    console.error('[ThreatFetcher] URLhaus fetch failed:', error.message);
    return {
      source: 'URLhaus',
      totalURLs: 0,
      malwareCount: 0,
      phishingCount: 0,
      financialCount: 0,
      threatTypes: {},
      error: error.message,
      fetchedAt: new Date().toISOString(),
      maliciousUrlList: [],
    };
  }
}

async function fetchOpenPhishData() {
  try {
    const response = await fetch('https://openphish.com/feed.txt');

    if (!response.ok) {
      throw new Error(`OpenPhish HTTP ${response.status}`);
    }

    const text = await response.text();
    const urls = text
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    let financialCount = 0;
    const targetedBrands = {};

    urls.forEach((url) => {
      if (isFinancialTarget(url)) financialCount++;

      try {
        const hostname = new URL(url).hostname.toLowerCase();
        const parts = hostname.split('.');
        const brand = parts.length >= 2 ? parts[parts.length - 2] : hostname;
        targetedBrands[brand] = (targetedBrands[brand] || 0) + 1;
      } catch {
      }
    });

    const topBrands = Object.entries(targetedBrands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([brand, count]) => ({ brand, count }));

    return {
      source: 'OpenPhish',
      totalURLs: urls.length,
      financialCount,
      topBrands,
      fetchedAt: new Date().toISOString(),
      maliciousUrlList: urls,
    };
  } catch (error) {
    console.error('[ThreatFetcher] OpenPhish fetch failed:', error.message);
    return {
      source: 'OpenPhish',
      totalURLs: 0,
      financialCount: 0,
      topBrands: [],
      error: error.message,
      fetchedAt: new Date().toISOString(),
      maliciousUrlList: [],
    };
  }
}

async function aggregateLive30DayStats() {
  console.log('[ThreatFetcher] Starting 30-day aggregation...');

  const [urlhausData, openPhishData] = await Promise.all([
    fetchURLhausData(),
    fetchOpenPhishData(),
  ]);

  const feedTotal = urlhausData.totalURLs + openPhishData.totalURLs;
  const feedFinancial = urlhausData.financialCount + openPhishData.financialCount;
  const feedMalware = urlhausData.malwareCount;
  const feedPhishing = urlhausData.phishingCount + openPhishData.totalURLs;

  const latestMonthly = historicalBaseline.monthlyTrend[historicalBaseline.monthlyTrend.length - 1];
  const baselineTotal = latestMonthly.totalAttacks;
  const baselineBanking = latestMonthly.bankingScams;

  const hasLiveData = feedTotal > 0;
  const scaleFactor = hasLiveData ? Math.max(1, baselineTotal / Math.max(feedTotal, 1) * 0.001) : 1;

  const live30Day = {
    totalThreatsDetected: hasLiveData
      ? Math.round(baselineTotal + (feedTotal * scaleFactor * 0.05))
      : baselineTotal,
    bankingScams: hasLiveData
      ? Math.round(baselineBanking + (feedFinancial * scaleFactor * 0.03))
      : baselineBanking,
    malwareURLs: hasLiveData
      ? Math.round(latestMonthly.malware + (feedMalware * scaleFactor * 0.02))
      : latestMonthly.malware,
    credentialTheft: hasLiveData
      ? Math.round(latestMonthly.credential + (feedPhishing * scaleFactor * 0.04))
      : latestMonthly.credential,
    financialSectorPercent: hasLiveData
      ? parseFloat((((baselineBanking + feedFinancial * scaleFactor * 0.03) / (baselineTotal + feedTotal * scaleFactor * 0.05)) * 100).toFixed(1))
      : historicalBaseline.financialSectorSharePercent,
    bankingScamGrowthYoY: historicalBaseline.bankingScamYoYGrowthPercent,
    dailyPhishingEmails: historicalBaseline.dailyPhishingEmails,
    feedSources: {
      urlhaus: {
        status: urlhausData.error ? 'error' : 'ok',
        urlsProcessed: urlhausData.totalURLs,
        error: urlhausData.error || null,
      },
      openPhish: {
        status: openPhishData.error ? 'error' : 'ok',
        urlsProcessed: openPhishData.totalURLs,
        topBrands: openPhishData.topBrands?.slice(0, 10) || [],
        error: openPhishData.error || null,
      },
    },
    isLiveData: hasLiveData,
  };

  const financialIndex = {
    globalBankingScams30d: live30Day.bankingScams,
    financialSectorShare: live30Day.financialSectorPercent,
    yoyGrowth: historicalBaseline.bankingScamYoYGrowthPercent,
    topTargetedSector: 'Financial Services',
    attackTypeBreakdown: historicalBaseline.attackTypeBreakdown,
    riskLevel: live30Day.bankingScams > 95_000 ? 'CRITICAL' : live30Day.bankingScams > 90_000 ? 'HIGH' : 'ELEVATED',
  };

  const result = {
    live30Day,
    historical5Year: {
      quarterlyAttacks: historicalBaseline.quarterlyAttacks,
      annualSummary: historicalBaseline.annualSummary,
      monthlyTrend: historicalBaseline.monthlyTrend,
    },
    financialIndex,
    lastUpdated: new Date().toISOString(),
  };

  cachedLiveData = result;
  lastFetchTimestamp = Date.now();

  console.log(`[ThreatFetcher] Aggregation complete. Total threats: ${live30Day.totalThreatsDetected}`);
  return result;
}

async function getThreatData(forceRefresh = false) {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  if (!forceRefresh && cachedLiveData && lastFetchTimestamp && (Date.now() - lastFetchTimestamp < SIX_HOURS)) {
    return cachedLiveData;
  }
  return aggregateLive30DayStats();
}

module.exports = {
  fetchURLhausData,
  fetchOpenPhishData,
  aggregateLive30DayStats,
  getThreatData,
  isFinancialTarget,
};
