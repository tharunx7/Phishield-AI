/**
 * PhishShield AI — Feature Extraction Pipeline
 * Extracts lexical, structural, and typosquatting features from URLs.
 */

const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top',
  '.buzz', '.click', '.link', '.work', '.surf',
  '.rest', '.fit', '.cam', '.icu', '.monster'
];

const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'sign-in', 'verify', 'account', 'secure', 'update',
  'confirm', 'banking', 'password', 'credential', 'suspend',
  'urgent', 'alert', 'paypal', 'wallet', 'crypto', 'prize',
  'winner', 'free', 'gift', 'reward', 'claim', 'limited',
  'expire', 'locked', 'unauthorized', 'validate', 'invoice',
  'reset-password', 'confirm-identity', 'verify-account',
  'free-gift', 'giftcard', 'free-bitcoin', 'cashapp-reward', 'win-iphone',
  'steam-promo', 'netflix-free', 'verification-chase', 'giveaway', 'airdrop',
  'scam', 'promo', 'reward'
];

const KNOWN_BRANDS = [
  { name: 'PayPal', domains: ['paypal.com'] },
  { name: 'Google', domains: ['google.com', 'gmail.com', 'youtube.com'] },
  { name: 'Apple', domains: ['apple.com', 'icloud.com'] },
  { name: 'Microsoft', domains: ['microsoft.com', 'outlook.com', 'live.com'] },
  { name: 'Amazon', domains: ['amazon.com', 'aws.amazon.com'] },
  { name: 'Facebook', domains: ['facebook.com', 'fb.com'] },
  { name: 'Netflix', domains: ['netflix.com'] },
  { name: 'Instagram', domains: ['instagram.com'] },
  { name: 'Twitter/X', domains: ['twitter.com', 'x.com'] },
  { name: 'LinkedIn', domains: ['linkedin.com'] },
  { name: 'Chase', domains: ['chase.com'] },
  { name: 'Bank of America', domains: ['bankofamerica.com'] },
  { name: 'Wells Fargo', domains: ['wellsfargo.com'] },
  { name: 'Dropbox', domains: ['dropbox.com'] },
  { name: 'Spotify', domains: ['spotify.com'] },
  { name: 'WhatsApp', domains: ['whatsapp.com'] },
  { name: 'Coinbase', domains: ['coinbase.com'] },
  { name: 'Binance', domains: ['binance.com'] }
];

const SAFE_DOMAINS = [
  'google.com', 'youtube.com', 'github.com', 'stackoverflow.com',
  'microsoft.com', 'apple.com', 'amazon.com', 'facebook.com',
  'twitter.com', 'x.com', 'linkedin.com', 'wikipedia.org',
  'reddit.com', 'netflix.com', 'mozilla.org', 'cloudflare.com',
  'npmjs.com', 'vercel.com', 'netlify.com', 'docs.google.com',
  'drive.google.com', 'mail.google.com', 'maps.google.com',
  'outlook.com', 'live.com', 'office.com', 'zoom.us',
  'slack.com', 'discord.com', 'twitch.tv', 'spotify.com',
  'dropbox.com', 'instagram.com', 'whatsapp.com', 'telegram.org', 'paypal.com'
];

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function calculateEntropy(str) {
  if (!str) return 0;
  const freq = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

const FeatureExtractor = {
  extractFeatures(url) {
    const features = {
      url_length: url.length,
      domain_length: 0,
      subdomain_count: 0,
      has_https: 0,
      has_ip_address: 0,
      hyphen_count: 0,
      at_symbol: 0,
      double_slash_redirect: 0,
      path_depth: 0,
      query_param_count: 0,
      has_suspicious_tld: 0,
      domain_entropy: 0,
      has_punycode: 0,
      suspicious_keyword_count: 0,
      brand_impersonation_score: 0,
      path_brand_impersonation: 0,
      has_suspicious_extension: 0,
      digit_ratio: 0,
      special_char_ratio: 0,
      has_non_standard_port: 0,
      url_shortener_detected: 0,
      is_known_safe: 0,
      has_non_ascii: 0
    };

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      const search = urlObj.search;
      const protocol = urlObj.protocol;

      features.domain_length = hostname.length;
      features.has_https = protocol === 'https:' ? 1 : 0;
      
      const dots = hostname.split('.');
      features.subdomain_count = Math.max(0, dots.length - 2);

      features.has_ip_address = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ? 1 : 0;
      
      const hyphenMatches = hostname.match(/-/g);
      features.hyphen_count = hyphenMatches ? hyphenMatches.length : 0;
      
      features.at_symbol = url.includes('@') ? 1 : 0;
      
      // double slash redirect
      features.double_slash_redirect = url.lastIndexOf('//') > 7 ? 1 : 0;

      features.path_depth = pathname.split('/').filter(Boolean).length;

      const params = search ? search.split('&').length : 0;
      features.query_param_count = params;

      const tld = '.' + dots[dots.length - 1];
      features.has_suspicious_tld = SUSPICIOUS_TLDS.includes(tld) ? 1 : 0;

      const domainWithoutTld = dots.slice(0, -1).join('.');
      features.domain_entropy = calculateEntropy(domainWithoutTld);

      features.has_punycode = hostname.includes('xn--') ? 1 : 0;
      features.has_non_ascii = /[^\x00-\x7F]/.test(hostname) ? 1 : 0;

      const fullUrlLower = url.toLowerCase();
      let kwCount = 0;
      SUSPICIOUS_KEYWORDS.forEach(kw => {
        if (fullUrlLower.includes(kw)) kwCount++;
      });
      const isAcademicOrGov = hostname.endsWith('.edu') || hostname.includes('.edu.') || hostname.includes('.ac.') || hostname.endsWith('.gov') || hostname.includes('.gov.') || hostname.includes('.nic.');
      const isKnownSafe = SAFE_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d)) || isAcademicOrGov;
      features.is_known_safe = isKnownSafe ? 1 : 0;

      features.suspicious_keyword_count = isKnownSafe ? 0 : kwCount;

      // Brand impersonation check
      let maxImpersonationScore = 0;
      if (!isKnownSafe) {
        const domainVariants = [
          hostname,
          dots.length >= 2 ? dots.slice(-2).join('.') : hostname,
          dots[0],
          dots.length >= 2 ? dots[dots.length - 2] : dots[0]
        ];

        for (const brand of KNOWN_BRANDS) {
          for (const officialDomain of brand.domains) {
            const officialName = officialDomain.split('.')[0];
            
            // Check if subdomain contains brand exactly
            if (dots.length > 2) {
              const subdomains = dots.slice(0, -2);
              for (const sub of subdomains) {
                if (sub.toLowerCase().includes(officialName)) {
                  maxImpersonationScore = Math.max(maxImpersonationScore, 1.0);
                }
              }
            }

            for (const variant of domainVariants) {
              const cleanVariant = variant.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (cleanVariant === officialName) {
                maxImpersonationScore = Math.max(maxImpersonationScore, 1.0);
              }
              const dist = levenshteinDistance(cleanVariant, officialName);
              if (dist > 0 && dist <= 2 && cleanVariant.length >= 4) {
                maxImpersonationScore = Math.max(maxImpersonationScore, 0.8);
              }
            }
          }
        }
      }
      features.brand_impersonation_score = maxImpersonationScore;

      // Path brand impersonation
      let pathBrandImp = 0;
      if (!isKnownSafe) {
        const pathnameLower = pathname.toLowerCase();
        for (const brand of KNOWN_BRANDS) {
          const brandNameLower = brand.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const regex = new RegExp(`(^|/|-|_|\\.)` + brandNameLower + `($|/|-|_|\\.)`);
          if (regex.test(pathnameLower)) {
            pathBrandImp = 1;
            break;
          }
        }
      }
      features.path_brand_impersonation = pathBrandImp;

      // Suspicious extension in path
      const suspiciousExts = ['.exe', '.scr', '.bat', '.cmd', '.msi', '.js', '.vbs', '.ps1', '.jar', '.apk', '.dmg', '.iso'];
      features.has_suspicious_extension = suspiciousExts.some(ext => pathname.toLowerCase().endsWith(ext)) ? 1 : 0;

      // Digit ratio in domain
      const digits = hostname.replace(/[^0-9]/g, '').length;
      features.digit_ratio = hostname.length > 0 ? digits / hostname.length : 0;

      // Special character ratio in domain
      const specials = hostname.replace(/[a-zA-Z0-9]/g, '').length;
      features.special_char_ratio = hostname.length > 0 ? specials / hostname.length : 0;

      // Non standard port
      features.has_non_standard_port = (urlObj.port && urlObj.port !== '443' && urlObj.port !== '80') ? 1 : 0;

      // URL shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'rebrand.ly', 'is.gd', 'buff.ly', 'adf.ly'];
      features.url_shortener_detected = shorteners.some(s => hostname === s || hostname.endsWith('.' + s)) ? 1 : 0;

    } catch (e) {
      // Return features filled with defaults
    }

    return {
      features,
      xaiSegments: FeatureExtractor.generateExplainableUrl(url, features)
    };
  },

  generateExplainableUrl(url, features) {
    try {
      const urlObj = new URL(url);
      const segments = [];
      
      // 1. Protocol
      segments.push({ 
        text: urlObj.protocol + '//', 
        type: 'protocol', 
        risk: features.has_https ? 'safe' : 'warning', 
        message: features.has_https ? 'Secure connection' : 'Unencrypted connection (HTTP is insecure)' 
      });
      
      // 2. Hostname parsing
      const host = urlObj.hostname;
      
      if (features.has_ip_address) {
        segments.push({ 
          text: host, 
          type: 'domain', 
          risk: 'critical', 
          message: 'IP address used instead of a domain name (Common in phishing)' 
        });
      } else {
        const parts = host.split('.');
        if (parts.length > 2) {
          const subdomains = parts.slice(0, -2).join('.');
          let subRisk = 'safe';
          let subMsg = 'Normal subdomains';
          if (features.brand_impersonation_score > 0) {
            subRisk = 'warning';
            subMsg = 'Subdomain is attempting to impersonate a known brand';
          }
          segments.push({ text: subdomains + '.', type: 'subdomain', risk: subRisk, message: subMsg });
        }
        
        const domain = parts.length > 1 ? parts[parts.length - 2] : parts[0];
        const tld = parts.length > 1 ? '.' + parts[parts.length - 1] : '';
        
        let domRisk = 'safe';
        let domMsg = 'Registered domain name';
        if (features.domain_entropy > 3.5 || features.has_punycode) {
          domRisk = 'warning';
          domMsg = 'Domain name looks randomly generated or uses punycode';
        }
        segments.push({ text: domain, type: 'domain', risk: domRisk, message: domMsg });
        
        let tldRisk = 'safe';
        let tldMsg = 'Top-Level Domain';
        if (features.has_suspicious_tld) {
          tldRisk = 'critical';
          tldMsg = 'Suspicious or frequently abused Top-Level Domain';
        }
        if (tld) segments.push({ text: tld, type: 'tld', risk: tldRisk, message: tldMsg });
      }

      // 3. Port
      if (urlObj.port) {
        let portRisk = features.has_non_standard_port ? 'warning' : 'safe';
        segments.push({ 
          text: ':' + urlObj.port, 
          type: 'port', 
          risk: portRisk, 
          message: features.has_non_standard_port ? 'Non-standard port used' : 'Standard port' 
        });
      }

      // 4. Path
      let pathRisk = 'safe';
      let pathMsg = 'URL Path';
      if (features.path_brand_impersonation) {
        pathRisk = 'warning';
        pathMsg = 'Brand name found hidden in the URL path';
      } else if (features.has_suspicious_extension) {
        pathRisk = 'critical';
        pathMsg = 'Path ends with a suspicious file extension (.exe, .scr, etc.)';
      }
      
      if (urlObj.pathname && urlObj.pathname !== '/') {
        segments.push({ text: urlObj.pathname, type: 'path', risk: pathRisk, message: pathMsg });
      } else if (urlObj.pathname === '/') {
         segments.push({ text: '/', type: 'path', risk: 'safe', message: pathMsg });
      }

      // 5. Query params
      if (urlObj.search) {
        segments.push({ text: urlObj.search, type: 'query', risk: 'safe', message: 'Query parameters' });
      }

      return segments;
    } catch(e) {
      return [{ text: url, type: 'raw', risk: 'safe', message: 'Unable to parse URL structure' }];
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeatureExtractor;
} else {
  globalThis.FeatureExtractor = FeatureExtractor;
}
