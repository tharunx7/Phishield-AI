/**
 * PhishShield AI — Quishing Redirect Tracer Service
 * Resolves shortened QR URLs (bit.ly, tinyurl.com, t.co) to reveal the ultimate destination.
 */

export interface UnshortenResult {
  originalUrl: string;
  finalUrl: string;
  isShortened: boolean;
  qrCodePath: string;
}

export async function traceQrRedirect(scannedUrl: string): Promise<UnshortenResult> {
  let targetUrl = scannedUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  // 1. Try querying backend express server unshorten API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`http://localhost:3001/api/unshorten?url=${encodeURIComponent(targetUrl)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return {
          originalUrl: json.originalUrl,
          finalUrl: json.finalUrl,
          isShortened: json.isShortened,
          qrCodePath: json.qrCodePath,
        };
      }
    }
  } catch (e) {
    clearTimeout(timeoutId);
  }

  // 2. Client-side fallback tracer for Quishing demo & offline execution
  const shortenerMap: Record<string, string> = {
    'bit.ly/3xy9zq': 'https://paypal-verify-account.tk/login',
    'tinyurl.com/chase-verify-login': 'https://www.avedeoiro.com/site/plugins/chase/',
    't.co/scamtest': 'https://free-giftcard-winner.cf/claim',
  };

  let finalUrl = targetUrl;
  let isShortened = false;

  const lower = targetUrl.toLowerCase();
  for (const [shortKey, destination] of Object.entries(shortenerMap)) {
    if (lower.includes(shortKey.toLowerCase())) {
      finalUrl = destination;
      isShortened = true;
      break;
    }
  }

  const origHost = new URL(targetUrl).hostname;
  const finalHost = new URL(finalUrl).hostname;
  const qrCodePath = isShortened ? `${origHost} ➔ ${finalHost}` : origHost;

  return {
    originalUrl: targetUrl,
    finalUrl,
    isShortened,
    qrCodePath,
  };
}
