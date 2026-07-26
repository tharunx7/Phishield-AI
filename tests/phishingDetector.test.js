/**
 * PhishShield AI — Phishing Detector Test Suite
 * Validates the lexical feature extraction and ensemble classification model.
 */

const FeatureExtractor = require('../extension/featureExtractor');
const PhishingModel = require('../extension/phishingModel');

describe('PhishShield AI Phishing Detector Unit Tests', () => {

  describe('Feature Extraction Verification', () => {
    test('Should extract features from standard safe URL', () => {
      const url = 'https://www.google.com/search?q=test';
      const features = FeatureExtractor.extractFeatures(url);

      expect(features.has_https).toBe(1);
      expect(features.url_length).toBe(url.length);
      expect(features.domain_length).toBe('www.google.com'.length);
      expect(features.subdomain_count).toBe(1); // 'www' is a subdomain relative to 'google.com'
      expect(features.has_ip_address).toBe(0);
      expect(features.is_known_safe).toBe(1);
    });

    test('Should flag missing HTTPS', () => {
      const url = 'http://example.com';
      const features = FeatureExtractor.extractFeatures(url);
      expect(features.has_https).toBe(0);
    });

    test('Should identify IP address as domain', () => {
      const url = 'http://192.168.1.1/login';
      const features = FeatureExtractor.extractFeatures(url);
      expect(features.has_ip_address).toBe(1);
    });

    test('Should count excessive subdomains', () => {
      const url = 'http://login.verify.update.secure.example.com';
      const features = FeatureExtractor.extractFeatures(url);
      expect(features.subdomain_count).toBe(4);
    });

    test('Should detect Punycode', () => {
      const url = 'https://xn--pple-45a.com';
      const features = FeatureExtractor.extractFeatures(url);
      expect(features.has_punycode).toBe(1);
    });
  });

  describe('Classifier Model Evaluation', () => {
    
    // Group 1: Known Safe Links (Expected: safe, high safety score)
    const safeUrls = [
      'https://www.google.com',
      'https://github.com/trending',
      'https://stackoverflow.com/questions',
      'https://www.amazon.com/gp/cart',
      'https://www.microsoft.com/en-us',
      'https://www.apple.com/macbook-pro',
      'https://www.wikipedia.org',
      'https://www.reddit.com/r/news',
      'https://www.netflix.com/browse',
      'https://www.cloudflare.com',
      'https://www.npmjs.com/package/jest',
      'https://vercel.com/dashboard',
      'https://mail.google.com/mail/u/0/',
      'https://outlook.live.com/mail/',
      'https://zoom.us/join',
      'https://slack.com',
      'https://discord.com/channels/@me',
      'https://spotify.com',
      'https://dropbox.com',
      'https://instagram.com'
    ];

    safeUrls.forEach(url => {
      test(`Safe URL: ${url}`, () => {
        const features = FeatureExtractor.extractFeatures(url);
        const result = PhishingModel.classifyUrl(features);
        
        expect(result.riskLevel).toBe('safe');
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.confidence).toBeGreaterThanOrEqual(0.60);
      });
    });

    // Group 2: Obvious Scams/Phishing Links (Expected: dangerous, safety score < 40)
    const obviousScams = [
      'http://paypa1-verify.tk/login',
      'http://secure-bank0famerica.xyz',
      'http://amaz0n-update.click/signin',
      'http://chase-security-alert.buzz/verify',
      'http://free-bitcoin-giveaway.monster',
      'http://steam-promo-codes.fit/login',
      'http://netflix-free-trial.ga',
      'http://coinbase-wallet-login.icu',
      'http://paypal-resolution-center.cf/secure',
      'http://wellsfargo-accounts-suspend.work',
      'http://192.168.10.12/paypal-verify',
      'http://verification-chase-update.rest',
      'http://win-free-iphone-now.cam',
      'http://unauthorized-login-alert.gq',
      'http://verify-account-reset.ml'
    ];

    obviousScams.forEach(url => {
      test(`Obvious Scam URL: ${url}`, () => {
        const features = FeatureExtractor.extractFeatures(url);
        const result = PhishingModel.classifyUrl(features);
        
        expect(result.riskLevel).toBe('dangerous');
        expect(result.score).toBeLessThan(40);
        expect(result.confidence).toBeGreaterThanOrEqual(0.70);
      });
    });

    // Group 3: Tricky/Subtle Scams (Expected: suspicious or dangerous, safety score < 70)
    const trickyScams = [
      'https://google.com-verify.net/account',
      'https://login.microsft.com.evil.com/auth',
      'https://paypal-update.secure-login-portal.link/webapps/mpp/home',
      'https://chase-bank-verify-identity.com',
      'https://secure.chase.com.banking-alert.xyz/verify',
      'https://appleid.apple.com.ssl-protection.info',
      'https://microsoft-login-online-update.com',
      'https://wellsfargo-support-customer-resolution.xyz',
      'https://coinbase-auth-verify.com',
      'https://binance-recovery-support-panel.click',
      'https://facebook-recover-account-security.net',
      'https://netflix-billing-update-center.icu',
      'https://dropbox-shared-file-download.xyz',
      'https://spotify-premium-free-voucher.buzz',
      'https://whatsapp-verification-codes.xyz'
    ];

    trickyScams.forEach(url => {
      test(`Tricky/Subtle Scam URL: ${url}`, () => {
        const features = FeatureExtractor.extractFeatures(url);
        const result = PhishingModel.classifyUrl(features);
        
        expect(result.riskLevel).not.toBe('safe');
        expect(result.score).toBeLessThan(70);
      });
    });

    // Group 4: Edge Cases (Punycode, shorteners, IP, etc.)
    const edgeCases = [
      { url: 'https://xn--pple-45a.com', expectedRisk: 'dangerous' }, // Apple Homograph
      { url: 'http://182.22.41.9/login.php', expectedRisk: 'dangerous' }, // IP Address
      { url: 'https://bit.ly/3xY8zK9', expectedRisk: 'suspicious' }, // Shortener link (inherently suspicious)
      { url: 'https://user@paypal-verify.com', expectedRisk: 'dangerous' }, // User@ tricks
      { url: 'http://my-novel-scam-site.tk/payment.exe', expectedRisk: 'dangerous' }, // Dangerous extension + TLD
      { url: 'https://legit-site.com:8443/login', expectedRisk: 'suspicious' }, // Non-standard port
      { url: 'http://normal-blog.xyz', expectedRisk: 'suspicious' } // Unknown site on generic TLD
    ];

    edgeCases.forEach(edge => {
      test(`Edge Case URL: ${edge.url}`, () => {
        const features = FeatureExtractor.extractFeatures(edge.url);
        const result = PhishingModel.classifyUrl(features);
        
        expect(result.riskLevel).toBe(edge.expectedRisk);
      });
    });
  });
});
