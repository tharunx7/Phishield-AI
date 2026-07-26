import { fetchDomainAgeAndWhois, extractRootDomain } from '../services/whoisInspector';
import type { WhoisData } from '../types';

export interface EmailAnalysisResult {
  score: number;
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  findings: {
    type: 'URL' | 'HOMOGLYPH' | 'HEURISTIC' | 'MALWARE' | 'WHOIS';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    snippet?: string;
  }[];
  extractedUrls: string[];
  whoisDataList?: WhoisData[];
}

export function analyzeEmail(rawText: string): EmailAnalysisResult {
  const result: EmailAnalysisResult = {
    score: 0,
    riskLevel: 'SAFE',
    findings: [],
    extractedUrls: [],
  };

  if (!rawText || !rawText.trim()) return result;

  // Clean spacing noise in URLs (e.g. "http : // domain . com" -> "http://domain.com")
  const text = rawText
    .replace(/(https?)\s*:\s*\/\/\s*/gi, '$1://')
    .replace(/([\w-]+)\s*\.\s*(com|net|org|edu|gov|mil|in|uk|au|ca|de|fr|cn|jp|us|eu|xyz|tk|ml|cf|gq|ga|info|biz|cc|io|co|me|online|site|store|tech|website|work|app|dev|icu|top|buzz|monster|vip|club)\b/gi, '$1.$2');

  let riskScore = 0;

  // 1. Universal URL & Domain Extraction (Catches http, https, www, bare domains, HTML href, and Markdown patterns across all TLDs)
  const universalTldPattern = '(?:com|net|org|edu|gov|mil|in|uk|au|ca|de|fr|cn|jp|us|eu|xyz|tk|ml|cf|gq|ga|info|biz|cc|io|co|me|online|site|store|tech|website|work|app|dev|icu|top|buzz|monster|vip|club|ac\\.in|edu\\.in|gov\\.in|ac\\.uk)';
  const urlRegex = new RegExp(`(?:https?:\\/\\/|www\\.)[^\\s"'<>()]+|[\\w-]+\\.(?:[\\w-]+\\.)*${universalTldPattern}(?:\\/[^\\s"'<>()]*)?`, 'gi');
  const rawUrls = text.match(urlRegex) || [];
  
  // Clean trailing punctuation & noise (e.g. "http://domain.com." -> "http://domain.com")
  const cleanedRawUrls = rawUrls.map(u => u.trim().replace(/[.,;)"'>]+$/, ''));
  const urls = Array.from(new Set(cleanedRawUrls.filter(u => u.length > 3)));

  // 1A. HTML & Markdown Hyperlink Mismatch Detection (Catches hidden href traps)
  const htmlLinkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let htmlMatch;
  while ((htmlMatch = htmlLinkRegex.exec(rawText)) !== null) {
    const href = htmlMatch[1].trim().replace(/[.,;)"'>]+$/, '');
    const anchorText = htmlMatch[2].replace(/<[^>]+>/g, '').trim();

    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      if (!urls.includes(href)) urls.push(href);

      try {
        const hrefHost = new URL(href).hostname.toLowerCase();
        const textDomainMatch = anchorText.match(/(?:https?:\/\/|www\.)?([\w-]+\.(?:com|net|org|edu|gov|io|co|info|xyz))/i);
        if (textDomainMatch) {
          const displayedDomain = textDomainMatch[1].toLowerCase();
          if (!hrefHost.endsWith(displayedDomain) && !displayedDomain.endsWith(hrefHost)) {
            riskScore += 55;
            result.findings.push({
              type: 'URL',
              severity: 'CRITICAL',
              message: `🚨 Hyperlink Mismatch Attack Detected! Displayed link text shows "${displayedDomain}" but actual href redirects to "${hrefHost}".`,
              snippet: `<a href="${href}">${anchorText}</a>`,
            });
          }
        }
      } catch (e) {}
    }
  }

  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi;
  let mdMatch;
  while ((mdMatch = markdownLinkRegex.exec(rawText)) !== null) {
    const anchorText = mdMatch[1].trim();
    const href = mdMatch[2].trim().replace(/[.,;)"'>]+$/, '');
    if (!urls.includes(href)) urls.push(href);

    try {
      const hrefHost = new URL(href).hostname.toLowerCase();
      const textDomainMatch = anchorText.match(/(?:https?:\/\/|www\.)?([\w-]+\.(?:com|net|org|edu|gov|io|co|info|xyz))/i);
      if (textDomainMatch) {
        const displayedDomain = textDomainMatch[1].toLowerCase();
        if (!hrefHost.endsWith(displayedDomain) && !displayedDomain.endsWith(hrefHost)) {
          riskScore += 55;
          result.findings.push({
            type: 'URL',
            severity: 'CRITICAL',
            message: `🚨 Hyperlink Mismatch Attack Detected! Displayed text shows "${displayedDomain}" but destination link redirects to "${hrefHost}".`,
            snippet: `[${anchorText}](${href})`,
          });
        }
      }
    } catch (e) {}
  }

  result.extractedUrls = urls;

  const trustedDomains = ['dhl.com', 'dhl.express', 'fedex.com', 'ups.com', 'usps.com', 'google.com', 'microsoft.com', 'aws.amazon.com', 'github.com', 'zoom.us', 'salesforce.com', 'w3.org', 'yahoo.com', 'sendgrid.net', 'mailchimp.com', 'hubspot.com', 'docusign.com', 'paypal.com'];
  const suspiciousKeywords = ['verify', 'update', 'login', 'secure', 'support', 'service', 'alerts', 'account', 'billing', 'confirm', 'resolution', 'customs', 'payment', 'delivery', 'status'];

  urls.forEach(url => {
    try {
      const formattedUrl = url.startsWith('http') ? url : `http://${url}`;
      const parsedUrl = new URL(formattedUrl);
      const hostname = parsedUrl.hostname.toLowerCase();

      // Check if trusted exact domain
      const isTrusted = trustedDomains.some(trusted => hostname === trusted || hostname.endsWith(`.${trusted}`));

      // 1B. Open Redirect Attack Parser (e.g. httpbin.org/redirect-to?url=http://dhl-customs-payment.xyz/pay)
      const isRedirectVector = /\b(redirect|redirect-to|out\?url=|goto=|target=|url=http)\b/i.test(url);
      if (isRedirectVector) {
        riskScore += 45;
        result.findings.push({
          type: 'URL',
          severity: 'CRITICAL',
          message: `🚨 Open Redirect Attack Vector Detected! Link uses open redirect wrapper (${hostname}) to mask actual phishing destination.`,
          snippet: url,
        });

        // Extract nested target URL inside redirect parameter
        const nestedUrlMatch = url.match(/url=(https?:\/\/[^\s&]+)/i);
        if (nestedUrlMatch) {
          const nestedUrl = nestedUrlMatch[1];
          try {
            const nestedHost = new URL(nestedUrl).hostname.toLowerCase();
            if (/\.(xyz|tk|ml|cf|gq|ga|top|work|bid|monster|vip|cc|info|icu|buzz|site|online)$/i.test(nestedHost)) {
              riskScore += 35;
              result.findings.push({
                type: 'URL',
                severity: 'CRITICAL',
                message: `Nested Open Redirect Target uses Suspicious Phishing TLD: ${nestedHost}`,
                snippet: nestedUrl,
              });
            }
          } catch (e) {}
        }
      }

      if (!isTrusted) {
        // Flag suspicious TLDs (including .xyz, .info, .tk, .site, .icu, etc.)
        if (/\.(xyz|tk|ml|cf|gq|ga|top|work|bid|monster|vip|cc|info|icu|buzz|site|online)$/i.test(hostname)) {
          riskScore += 35;
          result.findings.push({
            type: 'URL',
            severity: 'CRITICAL',
            message: `Suspicious Phishing TLD detected on domain: ${hostname}`,
            snippet: url,
          });
        }

        // Flag Brand Impersonation / Deceptive Domain Keywords (e.g. dhl-delivery-status.info, docusign-alerts-example.net)
        const hasSuspiciousKeyword = suspiciousKeywords.some(kw => hostname.includes(kw));
        const isBrandImpersonation = /\b(dhl|fedex|ups|usps|docusign|paypal|microsoft|google|apple|amazon|netflix|chase|wellsfargo|bank)\b/i.test(hostname) && !isTrusted;

        if (isBrandImpersonation) {
          riskScore += 50;
          result.findings.push({
            type: 'URL',
            severity: 'CRITICAL',
            message: `🚨 Brand Impersonation Domain Detected! Deceptive domain spoofing legitimate brand: ${hostname}`,
            snippet: url,
          });
        } else if (hasSuspiciousKeyword) {
          riskScore += 30;
          result.findings.push({
            type: 'URL',
            severity: 'HIGH',
            message: `Phishing Keyword Lure in domain name: ${hostname}`,
            snippet: url,
          });
        }

        // Excessive subdomains check
        if (hostname.split('.').length > 3) {
          riskScore += 20;
          result.findings.push({
            type: 'URL',
            severity: 'HIGH',
            message: 'Excessive subdomains detected (Typosquatting/Phishing structure).',
            snippet: url,
          });
        }
      }
    } catch (e) {
      if (/\b(verify|update|login|secure|support|service|alerts|account|customs|payment)\b/i.test(url)) {
        riskScore += 25;
        result.findings.push({
          type: 'URL',
          severity: 'HIGH',
          message: `Suspicious link pattern detected: ${url}`,
          snippet: url,
        });
      }
    }
  });

  // 2. Homoglyph Attack Detection (Cyrillic character mixing)
  const homoglyphRegex = /[асеорху]/g; 
  const words = text.split(/\s+/);
  
  words.forEach(word => {
    if (homoglyphRegex.test(word) && /[a-zA-Z]/.test(word)) {
      riskScore += 40;
      result.findings.push({
        type: 'HOMOGLYPH',
        severity: 'CRITICAL',
        message: 'Homoglyph attack detected (Cyrillic character substitution to trick domain inspection).',
        snippet: word,
      });
    }
  });

  // 3. Social Engineering & Delivery Scam Heuristics
  const heuristicTriggers = [
    { regex: /From:.*?(Billing|Support|Geek Squad|Norton|McAfee|Paypal|Amazon|Best Buy).*?<(.*?(?:gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com).*?)>/i, msg: '🚨 Free Email Impersonation Trap! Official corporations NEVER use Gmail/Yahoo for billing.', score: 65 },
    { regex: /\b(auto-renewal|auto-debit|geek squad|total tech support|fraud resolution center|cancel and claim a refund|amount charged|call us immediately|call our fraud|toll-free)\b/i, msg: '🚨 Tech Support / Refund Scam Pattern (Vishing). Scammers want you to call the number to gain remote access to your bank.', score: 85 },
    { regex: /\b(delivery exception|shipment failed|package could not be delivered|failed delivery|unpaid customs fee|customs fee|customs payment|returned to sender|delivery address)\b/i, msg: '🚨 Logistics & Delivery Fee Scam Pattern (Fake DHL/FedEx Customs Fee Lure).', score: 35 },
    { regex: /\b(urgent|immediate action|act now|account suspended|account locked|unauthorized access|temporarily disabled|unauthorized login|within 48 hours|within 24 hours)\b/i, msg: 'Creates intense false sense of urgency.', score: 25 },
    { regex: /\b(verify your account|confirm your identity|update billing|login to your account|enable content|enable macros|update address)\b/i, msg: 'Deceptive instruction (Requests credential entry, address update, or macro execution).', score: 30 },
    { regex: /\b(gift card|wire transfer|bitcoin|crypto|invoice attached|azure information protection)\b/i, msg: 'High-risk lure keywords detected (Financial/Protected document trick).', score: 25 },
    { regex: /\b(dear customer|dear user|dear member|dear employee)\b/i, msg: 'Generic non-personalized greeting common in mass phishing emails.', score: 10 }
  ];

  heuristicTriggers.forEach(trigger => {
    const match = text.match(trigger.regex);
    if (match) {
      riskScore += trigger.score;
      result.findings.push({
        type: 'HEURISTIC',
        severity: trigger.score >= 25 ? 'HIGH' : 'MEDIUM',
        message: trigger.msg,
        snippet: match[0],
      });
    }
  });

  // 4. Malware Payloads & Macro-Enabled Document Detection (.docm, .xlsm, .exe, .vbs)
  const malwareTriggers = [
    { regex: /[\w-]+\.(docm|xlsm)\b/i, msg: 'CRITICAL: Macro-Enabled Document Lure (.docm / .xlsm)! Known vector for banking trojans & ransomware.' },
    { regex: /[\w-]+\.(exe|scr|vbs|bat|cmd|ps1|iso|img)\b/i, msg: 'CRITICAL: Executable or script attachment lure detected.' },
    { regex: /\b(attached invoice|invoice\.pdf|payment receipt|nda_agreement)\b/i, msg: 'Common malware payload attachment lure.' }
  ];

  malwareTriggers.forEach(trigger => {
    const match = text.match(trigger.regex);
    if (match) {
      riskScore += 45;
      result.findings.push({
        type: 'MALWARE',
        severity: 'CRITICAL',
        message: trigger.msg,
        snippet: match[0],
      });
    }
  });

  // Final Risk Level Categorization
  result.score = Math.min(riskScore, 100);

  if (result.score >= 70) result.riskLevel = 'CRITICAL';
  else if (result.score >= 50) result.riskLevel = 'HIGH';
  else if (result.score >= 25) result.riskLevel = 'MEDIUM';
  else if (result.score > 0) result.riskLevel = 'LOW';
  else result.riskLevel = 'SAFE';

  return result;
}

/**
 * Asynchronous Email Threat Analyzer with WHOIS & Domain Creation Age Intelligence
 */
export async function analyzeEmailAsync(rawText: string): Promise<EmailAnalysisResult> {
  const result = analyzeEmail(rawText);
  if (!result.extractedUrls || result.extractedUrls.length === 0) return result;

  const whoisList: WhoisData[] = [];
  const processedDomains = new Set<string>();

  for (const url of result.extractedUrls) {
    const rootDomain = extractRootDomain(url);
    if (!processedDomains.has(rootDomain)) {
      processedDomains.add(rootDomain);
      const whoisData = await fetchDomainAgeAndWhois(url);
      whoisList.push(whoisData);

      if (whoisData.riskCategory === 'CRITICAL_NEW') {
        result.score = Math.min(100, result.score + 35);
        result.findings.push({
          type: 'WHOIS',
          severity: 'CRITICAL',
          message: `WHOIS Alert: ${rootDomain} was registered ${whoisData.ageFormatted} ago (${whoisData.createdDate}). Fresh domain registration is a primary zero-day phishing indicator.`,
          snippet: rootDomain,
        });
      } else if (whoisData.riskCategory === 'RECENT') {
        result.score = Math.min(100, result.score + 20);
        result.findings.push({
          type: 'WHOIS',
          severity: 'HIGH',
          message: `WHOIS Notice: ${rootDomain} is a recent domain created ${whoisData.ageFormatted} ago (${whoisData.createdDate}).`,
          snippet: rootDomain,
        });
      }
    }
  }

  result.whoisDataList = whoisList;

  // Re-eval risk level
  if (result.score >= 70) result.riskLevel = 'CRITICAL';
  else if (result.score >= 50) result.riskLevel = 'HIGH';
  else if (result.score >= 25) result.riskLevel = 'MEDIUM';
  else if (result.score > 0) result.riskLevel = 'LOW';
  else result.riskLevel = 'SAFE';

  return result;
}
