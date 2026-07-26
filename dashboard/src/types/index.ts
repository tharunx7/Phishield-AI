/**
 * PhishShield AI — TypeScript Type Definitions
 * Central type definitions for the entire dashboard application.
 */

// ============================================================
// Scan & Analysis Types
// ============================================================

export type RiskLevel = 'safe' | 'suspicious' | 'dangerous';

export interface ScanResult {
  id: string;
  url: string;
  domain: string;
  score: number;
  riskLevel: RiskLevel;
  riskLabel: string;
  indicators: string[];
  details: ScanDetails;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface ScanDetails {
  domain: string;
  protocol: string;
  ssl: string;
  sslClass: string;
  domainAge: string;
  blacklistStatus: string;
  ip?: string;
}

// ============================================================
// Analysis Types
export interface XaiSegment {
  text: string;
  type: 'protocol' | 'subdomain' | 'domain' | 'tld' | 'port' | 'path' | 'query' | 'raw';
  risk: 'safe' | 'warning' | 'critical';
  message?: string;
}

export interface WhoisData {
  domain: string;
  createdDate: string;
  ageInDays: number;
  ageFormatted: string;
  registrar: string;
  country: string;
  isPrivacyProtected: boolean;
  whoisTrustScore: number;
  riskCategory: 'CRITICAL_NEW' | 'RECENT' | 'MODERATE' | 'ESTABLISHED' | 'HIGH_TRUST';
  riskFactors: string[];
  rawRdapSource?: string;
}

export interface AnalysisResult {
  url: string;
  domain: string;
  protocol: string;
  ssl: string;
  ip: string;
  score: number;
  riskLevel: RiskLevel;
  aiExplanation: string;
  indicators: string[];
  recommendation: string;
  timestamp: string;
  xaiSegments?: XaiSegment[];
  redirectPath?: string;
  scamCategory?: string;
  whoisData?: WhoisData;
}

// ============================================================
// Threat Intelligence Types
// ============================================================

export interface ThreatEntry {
  id: string;
  domain: string;
  type: string;
  severity: RiskLevel;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
}

export interface AttackType {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

// ============================================================
// Report Types
// ============================================================

export interface Report {
  id: string;
  url: string;
  reason: string;
  score?: number;
  riskLevel?: RiskLevel;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

// ============================================================
// Settings Types
// ============================================================

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  autoScan: boolean;
  realTimeProtection: boolean;
  language: string;
}

// ============================================================
// Dashboard Stats Types
// ============================================================

export interface DashboardStats {
  totalScans: number;
  threatsBlocked: number;
  safeWebsites: number;
  highRiskWebsites: number;
}

// ============================================================
// Chart Data Types
// ============================================================

export interface WeeklyScanData {
  day: string;
  scans: number;
  threats: number;
}

export interface RiskDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface ThreatTrendData {
  month: string;
  phishing: number;
  malware: number;
  scam: number;
}

// ============================================================
// Activity Table Types
// ============================================================

export interface ActivityEntry {
  id: string;
  website: string;
  risk: RiskLevel;
  time: string;
  status: 'blocked' | 'allowed' | 'flagged';
  score: number;
}

// ============================================================
// AI Service Types (Future-ready)
// ============================================================

export interface AIProvider {
  name: string;
  type: 'gemini' | 'openai' | 'custom_ml';
  apiKey?: string;
  endpoint?: string;
  enabled: boolean;
}

export interface AIAnalysisRequest {
  url: string;
  html?: string;
  screenshot?: string;
}

export interface AIAnalysisResponse {
  score: number;
  riskLevel: RiskLevel;
  explanation: string;
  indicators: string[];
  confidence: number;
}
