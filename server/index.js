/**
 * PhishShield AI — Threat Intelligence Server
 *
 * Express backend that:
 *   1. Fetches live threat data from URLhaus + OpenPhish every 12 hours (node-cron)
 *   2. Serves the blended live-30-day + 5-year-historical data via REST API
 *   3. Provides a health-check endpoint
 *
 * Endpoints:
 *   GET /api/threat-trends   → Full threat intelligence payload
 *   GET /api/health          → Server health check
 *
 * Default port: 3001 (configurable via PORT env var)
 */

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { getThreatData, aggregateLive30DayStats } = require('./services/threatFetcher.js');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: [
    /^chrome-extension:\/\//,     // Chrome extension popup
    /^http:\/\/localhost/,         // Vite dev server
    /^http:\/\/127\.0\.0\.1/,
  ],
  methods: ['GET'],
  credentials: false,
}));

app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────

/**
 * GET /api/threat-trends
 * Returns the full threat intelligence payload:
 *   { live30Day, historical5Year, financialIndex, lastUpdated }
 */
app.get('/api/threat-trends', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const data = await getThreatData(forceRefresh);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Server] /api/threat-trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch threat intelligence data',
      message: error.message,
    });
  }
});

/**
 * GET /api/unshorten
 * Quishing Protection Engine — Traces redirected & shortened QR URLs
 * Tracks bit.ly, tinyurl.com, t.co to expose the ultimate malicious destination.
 */
app.get('/api/unshorten', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ success: false, error: 'URL parameter is required' });
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const shortenerMap = {
      'bit.ly/3xy9zq': 'https://paypal-verify-account.tk/login',
      'tinyurl.com/chase-verify-login': 'https://www.avedeoiro.com/site/plugins/chase/',
      't.co/scamtest': 'https://free-giftcard-winner.cf/claim',
    };

    let finalUrl = targetUrl;
    let isShortened = false;

    // Check pre-computed Quishing simulation map
    const lowerUrl = targetUrl.toLowerCase();
    for (const [shortKey, destination] of Object.entries(shortenerMap)) {
      if (lowerUrl.includes(shortKey)) {
        finalUrl = destination;
        isShortened = true;
        break;
      }
    }

    // Perform live HTTP HEAD / GET fetch if not in simulation map
    if (!isShortened) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const fetchRes = await fetch(targetUrl, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (fetchRes.url && fetchRes.url !== targetUrl) {
          finalUrl = fetchRes.url;
          isShortened = true;
        }
      } catch (e) {
        clearTimeout(timeoutId);
      }
    }

    const origHost = new URL(targetUrl).hostname;
    const finalHost = new URL(finalUrl).hostname;
    const qrCodePath = isShortened ? `${origHost} ➔ ${finalHost}` : origHost;

    return res.json({
      success: true,
      originalUrl: targetUrl,
      finalUrl,
      isShortened,
      redirectPath: [targetUrl, finalUrl],
      qrCodePath,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to unshorten URL',
      message: error.message,
    });
  }
});

/**
 * GET /api/health
 * Simple health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PhishShield Threat Intelligence Server',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Cron Job: Refresh threat data every 12 hours ───────────────
cron.schedule('0 */12 * * *', async () => {
  console.log('[Cron] Scheduled 12-hour threat data refresh started...');
  try {
    await aggregateLive30DayStats();
    console.log('[Cron] Threat data refresh completed successfully.');
  } catch (error) {
    console.error('[Cron] Threat data refresh failed:', error.message);
  }
});

// ── Server Start ───────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   PhishShield AI — Threat Intelligence Server           ║');
  console.log(`║   Running on http://localhost:${PORT}                      ║`);
  console.log('║   Endpoints:                                            ║');
  console.log('║     GET /api/threat-trends                              ║');
  console.log('║     GET /api/health                                     ║');
  console.log('║   Cron: Every 12 hours (URLhaus + OpenPhish refresh)    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // Initial data fetch on startup
  console.log('[Server] Performing initial threat data fetch...');
  try {
    await aggregateLive30DayStats();
    console.log('[Server] Initial data fetch complete. Server ready.');
  } catch (error) {
    console.error('[Server] Initial fetch failed (will retry via cron):', error.message);
  }
});

module.exports = app;
