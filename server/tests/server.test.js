/**
 * PhishShield AI — Server Tests
 * Uses Node.js built-in test runner (node --test)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const historicalBaseline = require('../data/historicalBaseline.js');
const { isFinancialTarget } = require('../services/threatFetcher.js');

describe('Historical Baseline Data', () => {
  it('should have daily phishing email count of 3.4 billion', () => {
    assert.strictEqual(historicalBaseline.dailyPhishingEmails, 3_400_000_000);
  });

  it('should have financial sector share of 27.9%', () => {
    assert.strictEqual(historicalBaseline.financialSectorSharePercent, 27.9);
  });

  it('should have banking scam YoY growth of 65%', () => {
    assert.strictEqual(historicalBaseline.bankingScamYoYGrowthPercent, 65);
  });

  it('should have quarterly attacks for all years 2021-2026', () => {
    const years = [...new Set(historicalBaseline.quarterlyAttacks.map((q) => q.year))];
    assert.ok(years.includes(2021), 'Missing 2021');
    assert.ok(years.includes(2022), 'Missing 2022');
    assert.ok(years.includes(2023), 'Missing 2023');
    assert.ok(years.includes(2024), 'Missing 2024');
    assert.ok(years.includes(2025), 'Missing 2025');
    assert.ok(years.includes(2026), 'Missing 2026');
  });

  it('should have Q1 2026 attacks at 971,181', () => {
    const q1_2026 = historicalBaseline.quarterlyAttacks.find(
      (q) => q.year === 2026 && q.quarter === 'Q1'
    );
    assert.ok(q1_2026, 'Q1 2026 entry not found');
    assert.strictEqual(q1_2026.attacks, 971_181);
  });

  it('should have 12 monthly trend entries', () => {
    assert.strictEqual(historicalBaseline.monthlyTrend.length, 12);
  });

  it('should have all monthly entries with positive values', () => {
    historicalBaseline.monthlyTrend.forEach((m) => {
      assert.ok(m.totalAttacks > 0, `${m.month} totalAttacks should be > 0`);
      assert.ok(m.bankingScams > 0, `${m.month} bankingScams should be > 0`);
      assert.ok(m.malware > 0, `${m.month} malware should be > 0`);
      assert.ok(m.credential > 0, `${m.month} credential should be > 0`);
    });
  });

  it('should have annual summaries for 2021-2026', () => {
    assert.strictEqual(historicalBaseline.annualSummary.length, 6);
    historicalBaseline.annualSummary.forEach((y) => {
      assert.ok(y.totalAttacks > 0);
      assert.ok(y.avgQuarterly > 0);
      assert.strictEqual(y.topTarget, 'Financial Services');
    });
  });

  it('should have attack type breakdown summing to ~100%', () => {
    const breakdown = historicalBaseline.attackTypeBreakdown;
    const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
    assert.ok(total >= 99.5 && total <= 100.5, `Breakdown sums to ${total}, expected ~100`);
  });
});

describe('Financial Target Parser', () => {
  it('should detect PayPal phishing URLs', () => {
    assert.ok(isFinancialTarget('https://paypal-secure-login.xyz/verify'));
  });

  it('should detect Chase bank URLs', () => {
    assert.ok(isFinancialTarget('https://chase-account-verify.com/login'));
  });

  it('should detect generic banking keywords', () => {
    assert.ok(isFinancialTarget('https://my-banking-portal.tk/'));
  });

  it('should detect crypto-related URLs', () => {
    assert.ok(isFinancialTarget('https://coinbase-verify.click/'));
    assert.ok(isFinancialTarget('https://bitcoin-wallet-secure.xyz/'));
  });

  it('should NOT flag non-financial URLs', () => {
    assert.ok(!isFinancialTarget('https://google.com/'));
    assert.ok(!isFinancialTarget('https://github.com/'));
    assert.ok(!isFinancialTarget('https://facebook-login.phish.tk/'));
  });
});
