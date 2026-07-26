import { FeatureVector } from './featureExtractor';
import { RiskLevel } from '../types';

interface DecisionStump {
  feature: keyof FeatureVector;
  threshold: number;
  direction: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
  weight: number;
}

const DECISION_STUMPS: DecisionStump[] = [
  { feature: 'is_known_safe', threshold: 1, direction: 'eq', weight: -8.5 },
  { feature: 'brand_impersonation_score', threshold: 0.9, direction: 'gte', weight: 4.8 },
  { feature: 'brand_impersonation_score', threshold: 0.5, direction: 'gte', weight: 3.2 },
  { feature: 'path_brand_impersonation', threshold: 1, direction: 'eq', weight: 3.5 },
  { feature: 'has_https', threshold: 0, direction: 'eq', weight: 2.8 },
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
  { feature: 'at_symbol', threshold: 1, direction: 'eq', weight: 3.8 },
  { feature: 'double_slash_redirect', threshold: 1, direction: 'eq', weight: 3.2 },
  { feature: 'subdomain_count', threshold: 3, direction: 'gte', weight: 1.4 },
  { feature: 'subdomain_count', threshold: 5, direction: 'gte', weight: 2.6 },
  { feature: 'url_length', threshold: 120, direction: 'gt', weight: 1.2 },
  { feature: 'url_length', threshold: 75, direction: 'gt', weight: 0.6 },
  { feature: 'suspicious_keyword_count', threshold: 1, direction: 'gte', weight: 1.4 },
  { feature: 'suspicious_keyword_count', threshold: 2, direction: 'gte', weight: 2.8 },
  { feature: 'suspicious_keyword_count', threshold: 3, direction: 'gte', weight: 4.5 },
  { feature: 'has_suspicious_extension', threshold: 1, direction: 'eq', weight: 3.0 },
  { feature: 'has_non_standard_port', threshold: 1, direction: 'eq', weight: 1.5 },
  { feature: 'url_shortener_detected', threshold: 1, direction: 'eq', weight: 1.2 }
];

const BASE_BIAS = -2.2;

export interface ClassificationResult {
  score: number;
  phishingProbability: number;
  confidence: number;
  riskLevel: RiskLevel;
}

export const PhishingModel = {
  classifyUrl(features: FeatureVector): ClassificationResult {
    let logOdds = BASE_BIAS;

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

    const phishingProbability = 1 / (1 + Math.exp(-logOdds));
    const safetyScore = Math.max(0, Math.min(100, Math.round((1 - phishingProbability) * 100)));

    const margin = Math.abs(logOdds);
    const confidence = Math.max(0.60, Math.min(0.99, 0.60 + (margin / 10) * 0.39));

    let riskLevel: RiskLevel = 'safe';
    if (safetyScore < 40) {
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
