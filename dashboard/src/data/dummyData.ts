/**
 * PhishShield AI — Dummy Data
 * Comprehensive mock data for all dashboard features.
 * Replace with real API responses when backend is implemented.
 */

import type {
  ScanResult,
  WeeklyScanData,
  RiskDistributionData,
  ThreatTrendData,
  ActivityEntry,
  ThreatEntry,
  AttackType,
} from '../types';

export interface ThreatTrendDataWithVolume extends ThreatTrendData {
  volume: number;
}

// ============================================================
// Dashboard Stats
// ============================================================

export const dashboardStats = {
  totalScans: 12847,
  threatsBlocked: 342,
  safeWebsites: 11983,
  highRiskWebsites: 522,
};

// ============================================================
// Weekly Scan Data (Bar Chart)
// ============================================================

export const weeklyScanData: WeeklyScanData[] = [
  { day: 'Mon', scans: 142, threats: 8 },
  { day: 'Tue', scans: 189, threats: 12 },
  { day: 'Wed', scans: 167, threats: 5 },
  { day: 'Thu', scans: 210, threats: 15 },
  { day: 'Fri', scans: 195, threats: 9 },
  { day: 'Sat', scans: 88, threats: 3 },
  { day: 'Sun', scans: 76, threats: 2 },
];

// ============================================================
// Risk Distribution (Pie Chart)
// ============================================================

export const riskDistributionData: RiskDistributionData[] = [
  { name: 'Safe', value: 78, color: '#22c55e' },
  { name: 'Suspicious', value: 15, color: '#eab308' },
  { name: 'Dangerous', value: 7, color: '#ef4444' },
];

// ============================================================
// Threat Trend Data (Line Chart)
// ============================================================

export const threatTrendData: ThreatTrendDataWithVolume[] = [
  { month: '2021', phishing: 1213639, malware: 540000, scam: 250000, volume: 1540 },
  { month: '2022', phishing: 4744699, malware: 1800000, scam: 850000, volume: 1890 },
  { month: '2023', phishing: 3626014, malware: 2100000, scam: 1100000, volume: 1250 },
  { month: '2024', phishing: 3755379, malware: 2450000, scam: 1350000, volume: 2200 },
  { month: '2025', phishing: 4102844, malware: 2900000, scam: 1600000, volume: 1600 },
  { month: '2026', phishing: 2854332, malware: 1500000, scam: 900000, volume: 2650 }, // YTD
];

// ============================================================
// Recent Activity Data
// ============================================================

export const recentActivityData: ActivityEntry[] = [
  { id: '1', website: 'secure-paypa1.com/login', risk: 'dangerous', time: '2 min ago', status: 'blocked', score: 15 },
  { id: '2', website: 'github.com', risk: 'safe', time: '5 min ago', status: 'allowed', score: 95 },
  { id: '3', website: 'g00gle-verify.tk', risk: 'dangerous', time: '12 min ago', status: 'blocked', score: 8 },
  { id: '4', website: 'stackoverflow.com', risk: 'safe', time: '18 min ago', status: 'allowed', score: 92 },
  { id: '5', website: 'amaz0n-deals.xyz', risk: 'suspicious', time: '25 min ago', status: 'flagged', score: 35 },
  { id: '6', website: 'microsoft.com', risk: 'safe', time: '32 min ago', status: 'allowed', score: 98 },
  { id: '7', website: 'free-bitcoin-winner.click', risk: 'dangerous', time: '45 min ago', status: 'blocked', score: 5 },
  { id: '8', website: 'linkedin.com', risk: 'safe', time: '1 hr ago', status: 'allowed', score: 94 },
  { id: '9', website: 'verify-account-now.ml', risk: 'dangerous', time: '1.5 hr ago', status: 'blocked', score: 12 },
  { id: '10', website: 'reddit.com', risk: 'safe', time: '2 hr ago', status: 'allowed', score: 91 },
  { id: '11', website: 'netlfix-update.ga', risk: 'suspicious', time: '2.5 hr ago', status: 'flagged', score: 28 },
  { id: '12', website: 'cloudflare.com', risk: 'safe', time: '3 hr ago', status: 'allowed', score: 97 },
];

// ============================================================
// Scan History (Extended)
// ============================================================

export const scanHistoryData: ScanResult[] = [
  {
    id: '1', url: 'https://secure-paypa1.com/login', domain: 'secure-paypa1.com',
    score: 15, riskLevel: 'dangerous', riskLabel: 'Dangerous',
    indicators: ['Suspicious keywords: login', 'Typosquatting detected', 'Suspicious TLD'],
    details: { domain: 'secure-paypa1.com', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '< 1 month', blacklistStatus: '⚠ Flagged', ip: '192.168.1.100' },
    timestamp: '2026-07-19T09:30:00Z', status: 'completed',
  },
  {
    id: '2', url: 'https://github.com', domain: 'github.com',
    score: 95, riskLevel: 'safe', riskLabel: 'Safe',
    indicators: ['Known trusted domain', 'Valid SSL', 'Established domain'],
    details: { domain: 'github.com', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '15+ years', blacklistStatus: '✓ Clean', ip: '140.82.121.4' },
    timestamp: '2026-07-19T09:25:00Z', status: 'completed',
  },
  {
    id: '3', url: 'http://g00gle-verify.tk', domain: 'g00gle-verify.tk',
    score: 8, riskLevel: 'dangerous', riskLabel: 'Dangerous',
    indicators: ['No HTTPS', 'Suspicious keywords: verify', 'Suspicious TLD: .tk', 'Typosquatting detected'],
    details: { domain: 'g00gle-verify.tk', protocol: 'HTTP', ssl: 'Not Secure', sslClass: 'ssl-invalid', domainAge: '2 weeks', blacklistStatus: '⚠ Flagged', ip: '45.33.32.156' },
    timestamp: '2026-07-19T09:18:00Z', status: 'completed',
  },
  {
    id: '4', url: 'https://stackoverflow.com', domain: 'stackoverflow.com',
    score: 92, riskLevel: 'safe', riskLabel: 'Safe',
    indicators: ['Known trusted domain', 'Valid SSL'],
    details: { domain: 'stackoverflow.com', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '16+ years', blacklistStatus: '✓ Clean', ip: '151.101.1.69' },
    timestamp: '2026-07-19T09:12:00Z', status: 'completed',
  },
  {
    id: '5', url: 'https://amaz0n-deals.xyz/free-gift', domain: 'amaz0n-deals.xyz',
    score: 35, riskLevel: 'suspicious', riskLabel: 'Suspicious',
    indicators: ['Suspicious keywords: free, gift', 'Suspicious TLD: .xyz', 'Typosquatting possible'],
    details: { domain: 'amaz0n-deals.xyz', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '3 months', blacklistStatus: '✓ Clean', ip: '104.21.45.12' },
    timestamp: '2026-07-19T09:05:00Z', status: 'completed',
  },
  {
    id: '6', url: 'https://microsoft.com', domain: 'microsoft.com',
    score: 98, riskLevel: 'safe', riskLabel: 'Safe',
    indicators: ['Known trusted domain', 'Valid SSL', 'Established domain'],
    details: { domain: 'microsoft.com', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '30+ years', blacklistStatus: '✓ Clean', ip: '20.70.246.20' },
    timestamp: '2026-07-19T08:55:00Z', status: 'completed',
  },
  {
    id: '7', url: 'http://free-bitcoin-winner.click', domain: 'free-bitcoin-winner.click',
    score: 5, riskLevel: 'dangerous', riskLabel: 'Dangerous',
    indicators: ['No HTTPS', 'Suspicious keywords: free, winner, bitcoin', 'Suspicious TLD: .click', 'Scam pattern detected'],
    details: { domain: 'free-bitcoin-winner.click', protocol: 'HTTP', ssl: 'Not Secure', sslClass: 'ssl-invalid', domainAge: '1 week', blacklistStatus: '⚠ Flagged', ip: '185.220.101.1' },
    timestamp: '2026-07-19T08:45:00Z', status: 'completed',
  },
  {
    id: '8', url: 'https://linkedin.com', domain: 'linkedin.com',
    score: 94, riskLevel: 'safe', riskLabel: 'Safe',
    indicators: ['Known trusted domain', 'Valid SSL'],
    details: { domain: 'linkedin.com', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '22+ years', blacklistStatus: '✓ Clean', ip: '13.107.42.14' },
    timestamp: '2026-07-19T08:30:00Z', status: 'completed',
  },
  {
    id: '9', url: 'http://verify-account-now.ml/secure', domain: 'verify-account-now.ml',
    score: 12, riskLevel: 'dangerous', riskLabel: 'Dangerous',
    indicators: ['No HTTPS', 'Suspicious keywords: verify, account, secure', 'Suspicious TLD: .ml', 'Urgency pattern'],
    details: { domain: 'verify-account-now.ml', protocol: 'HTTP', ssl: 'Not Secure', sslClass: 'ssl-invalid', domainAge: '3 days', blacklistStatus: '⚠ Flagged', ip: '172.67.182.12' },
    timestamp: '2026-07-19T08:15:00Z', status: 'completed',
  },
  {
    id: '10', url: 'https://reddit.com', domain: 'reddit.com',
    score: 91, riskLevel: 'safe', riskLabel: 'Safe',
    indicators: ['Known trusted domain', 'Valid SSL'],
    details: { domain: 'reddit.com', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '19+ years', blacklistStatus: '✓ Clean', ip: '151.101.1.140' },
    timestamp: '2026-07-19T08:00:00Z', status: 'completed',
  },
  {
    id: '11', url: 'https://netlfix-update.ga/confirm', domain: 'netlfix-update.ga',
    score: 28, riskLevel: 'suspicious', riskLabel: 'Suspicious',
    indicators: ['Suspicious keywords: update, confirm', 'Suspicious TLD: .ga', 'Typosquatting detected'],
    details: { domain: 'netlfix-update.ga', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '2 months', blacklistStatus: '✓ Clean', ip: '104.21.67.89' },
    timestamp: '2026-07-19T07:45:00Z', status: 'completed',
  },
  {
    id: '12', url: 'https://cloudflare.com', domain: 'cloudflare.com',
    score: 97, riskLevel: 'safe', riskLabel: 'Safe',
    indicators: ['Known trusted domain', 'Valid SSL', 'Established domain'],
    details: { domain: 'cloudflare.com', protocol: 'HTTPS', ssl: 'Valid', sslClass: 'ssl-valid', domainAge: '15+ years', blacklistStatus: '✓ Clean', ip: '104.16.132.229' },
    timestamp: '2026-07-19T07:30:00Z', status: 'completed',
  },
];

// ============================================================
// Threat Intelligence Data
// ============================================================

export const topPhishingDomains: ThreatEntry[] = [
  { id: '1', domain: 'secure-paypa1.com', type: 'Credential Harvesting', severity: 'dangerous', firstSeen: '2026-07-10', lastSeen: '2026-07-19', occurrences: 847 },
  { id: '2', domain: 'g00gle-verify.tk', type: 'Account Phishing', severity: 'dangerous', firstSeen: '2026-07-05', lastSeen: '2026-07-19', occurrences: 623 },
  { id: '3', domain: 'amaz0n-security.xyz', type: 'Payment Fraud', severity: 'dangerous', firstSeen: '2026-07-12', lastSeen: '2026-07-18', occurrences: 412 },
  { id: '4', domain: 'microsoft-alert.ml', type: 'Tech Support Scam', severity: 'dangerous', firstSeen: '2026-07-01', lastSeen: '2026-07-19', occurrences: 389 },
  { id: '5', domain: 'netlfix-billing.ga', type: 'Subscription Scam', severity: 'suspicious', firstSeen: '2026-07-08', lastSeen: '2026-07-17', occurrences: 256 },
  { id: '6', domain: 'apple-id-verify.cf', type: 'Identity Theft', severity: 'dangerous', firstSeen: '2026-07-14', lastSeen: '2026-07-19', occurrences: 198 },
];

export const attackTypes: AttackType[] = [
  { name: 'Credential Harvesting', count: 4521, percentage: 38, color: '#ef4444' },
  { name: 'Fake Login Pages', count: 2847, percentage: 24, color: '#f97316' },
  { name: 'Payment Fraud', count: 1923, percentage: 16, color: '#eab308' },
  { name: 'Tech Support Scam', count: 1245, percentage: 10, color: '#a855f7' },
  { name: 'Malware Distribution', count: 892, percentage: 7, color: '#ec4899' },
  { name: 'Other', count: 589, percentage: 5, color: '#64748b' },
];

export const recentThreats: ThreatEntry[] = [
  { id: '1', domain: 'bank-secure-login.click', type: 'Credential Harvesting', severity: 'dangerous', firstSeen: '2026-07-19', lastSeen: '2026-07-19', occurrences: 12 },
  { id: '2', domain: 'crypto-wallet-verify.top', type: 'Wallet Drainer', severity: 'dangerous', firstSeen: '2026-07-19', lastSeen: '2026-07-19', occurrences: 8 },
  { id: '3', domain: 'urgent-account-update.ml', type: 'Account Phishing', severity: 'suspicious', firstSeen: '2026-07-18', lastSeen: '2026-07-19', occurrences: 34 },
  { id: '4', domain: 'prize-winner-claim.buzz', type: 'Prize Scam', severity: 'dangerous', firstSeen: '2026-07-18', lastSeen: '2026-07-19', occurrences: 56 },
  { id: '5', domain: 'dropbox-share-file.ga', type: 'Malware Distribution', severity: 'suspicious', firstSeen: '2026-07-17', lastSeen: '2026-07-18', occurrences: 23 },
];

// ============================================================
// Detection Accuracy Data
// ============================================================

export const detectionAccuracy = {
  overall: 97.3,
  phishing: 98.1,
  malware: 95.8,
  scam: 96.5,
  falsePositives: 1.2,
};
