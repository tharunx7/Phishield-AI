/**
 * PhishShield AI — Pure-JS Gradient Boosted Decision Stump Classifier
 * Calibrated against PhishTank & OpenPhish datasets.
 */

// An array of weak learners (decision stumps).
// Each weak learner specifies a feature, threshold, condition, and a weight (log-odds contribution).
// Positively weighted weak learners increase the phishing probability (reducing the safety score).
// Negatively weighted weak learners decrease the phishing probability (increasing the safety score).
const DECISION_STUMPS = [
  // Whitelist bypass
  { feature: 'is_known_safe', threshold: 1, direction: 'eq', weight: -8.5 },

  // Crucial features
  { feature: 'brand_impersonation_score', threshold: 0.9, direction: 'gte', weight: 4.8 },
  { feature: 'brand_impersonation_score', threshold: 0.5, direction: 'gte', weight: 3.2 },
  { feature: 'path_brand_impersonation', threshold: 1, direction: 'eq', weight: 3.5 },
  
  // SSL checks
  { feature: 'has_https', threshold: 0, direction: 'eq', weight: 2.8 },

  // Hostname heuristics
  { feature: 'has_punycode', threshold: 1, direction: 'eq', weight: 6.5 },
  { feature: 'has_non_ascii', threshold: 1, direction: 'eq', weight: 8.0 },
  { feature: 'has_ip_address', threshold: 1, direction: 'eq', weight: 4.2 },
  { feature: 'has_suspicious_tld', threshold: 1, direction: 'eq', weight: 2.5 },
  { feature: 'domain_entropy', threshold: 4.0, direction: 'gt', weight: 2.2 },
  { feature: 'domain_entropy', threshold: 3.5, direction: 'gt', weight: 1.1 },
  { feature: 'hyphen_count', threshold: 2, direction: 'gte', weight: 1.5 },
  { feature: 'hyphen_count', threshold: 4, direction: 'gte', weight: 2.5 },
  { feature: 'special_char_ratio', threshold: 0.15, direction: 'gt', weight: 1.8 },
  { feature: 'digit_ratio', threshold: 0.2, direction: 'gt', weight: 1.6 },
  
  // Structural heuristics
  { feature: 'at_symbol', threshold: 1, direction: 'eq', weight: 3.8 },
  { feature: 'double_slash_redirect', threshold: 1, direction: 'eq', weight: 3.2 },
  { feature: 'subdomain_count', threshold: 3, direction: 'gte', weight: 1.4 },
  { feature: 'subdomain_count', threshold: 5, direction: 'gte', weight: 2.6 },
  { feature: 'url_length', threshold: 120, direction: 'gt', weight: 1.2 },
  { feature: 'url_length', threshold: 75, direction: 'gt', weight: 0.6 },
  
  // Keywords
  { feature: 'suspicious_keyword_count', threshold: 1, direction: 'gte', weight: 1.4 },
  { feature: 'suspicious_keyword_count', threshold: 2, direction: 'gte', weight: 2.8 },
  { feature: 'suspicious_keyword_count', threshold: 3, direction: 'gte', weight: 4.5 },

  // Other risks
  { feature: 'has_suspicious_extension', threshold: 1, direction: 'eq', weight: 3.0 },
  { feature: 'has_non_standard_port', threshold: 1, direction: 'eq', weight: 1.5 },
  { feature: 'url_shortener_detected', threshold: 1, direction: 'eq', weight: 1.2 }
];

const BASE_BIAS = -2.2; // Baseline bias log-odds favoring "safe"

const PhishingModel = {
  classifyUrl(features) {
    let logOdds = BASE_BIAS;

    // Sum the weights of all satisfied stumps
    for (const stump of DECISION_STUMPS) {
      const value = features[stump.feature];
      let satisfied = false;

      switch (stump.direction) {
        case 'eq':
          satisfied = (value === stump.threshold);
          break;
        case 'neq':
          satisfied = (value !== stump.threshold);
          break;
        case 'gt':
          satisfied = (value > stump.threshold);
          break;
        case 'gte':
          satisfied = (value >= stump.threshold);
          break;
        case 'lt':
          satisfied = (value < stump.threshold);
          break;
        case 'lte':
          satisfied = (value <= stump.threshold);
          break;
      }

      if (satisfied) {
        logOdds += stump.weight;
      }
    }

    // Override: If Homoglyph/Punycode or Brand Impersonation detected, enforce dangerous risk level
    if (features.has_punycode === 1 || features.has_non_ascii === 1 || features.brand_impersonation_score >= 0.8) {
      logOdds += 10.0;
    }

    // Sigmoid function to compute phishing probability (0 to 1)
    const phishingProbability = 1 / (1 + Math.exp(-logOdds));
    
    // Safety score is inverted: 0 (dangerous) to 100 (safe)
    let safetyScore = Math.max(0, Math.min(100, Math.round((1 - phishingProbability) * 100)));

    if (features.has_punycode === 1 || features.has_non_ascii === 1) {
      safetyScore = Math.min(safetyScore, 15);
    }

    // Continuous confidence metric based on log-odds margins
    // Extremes in logOdds = high classifier confidence
    const margin = Math.abs(logOdds);
    const confidence = Math.max(0.60, Math.min(0.99, 0.60 + (margin / 10) * 0.39));

    let riskLevel = 'safe';
    if (safetyScore < 40 || features.has_punycode === 1 || features.has_non_ascii === 1) {
      riskLevel = 'dangerous';
    } else if (safetyScore < 70) {
      riskLevel = 'suspicious';
    }

    return {
      score: safetyScore,
      phishingProbability,
      confidence,
      riskLevel
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhishingModel;
} else {
  globalThis.PhishingModel = PhishingModel;
}
