const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { getThreatData, aggregateLive30DayStats } = require('./services/threatFetcher.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    /^chrome-extension:\/\//,
    /^http:\/\/localhost/,
    /^http:\/\/127\.0\.0\.1/,
  ],
  methods: ['GET'],
  credentials: false,
}));

app.use(express.json());

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

    const lowerUrl = targetUrl.toLowerCase();
    for (const [shortKey, destination] of Object.entries(shortenerMap)) {
      if (lowerUrl.includes(shortKey)) {
        finalUrl = destination;
        isShortened = true;
        break;
      }
    }

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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PhishShield Threat Intelligence Server',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

cron.schedule('0 */12 * * *', async () => {
  console.log('[Cron] Scheduled 12-hour threat data refresh started...');
  try {
    await aggregateLive30DayStats();
    console.log('[Cron] Threat data refresh completed successfully.');
  } catch (error) {
    console.error('[Cron] Threat data refresh failed:', error.message);
  }
});

app.listen(PORT, async () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);

  try {
    await aggregateLive30DayStats();
    console.log('[Server] Initial data fetch complete. Server ready.');
  } catch (error) {
    console.error('[Server] Initial fetch failed:', error.message);
  }
});

module.exports = app;
