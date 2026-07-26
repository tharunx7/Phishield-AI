import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, Clock, Zap, Check, X, AlertTriangle, Lock } from 'lucide-react';

/**
 * Calculate password entropy in bits.
 * Entropy = length × log₂(charset_size)
 */
function calcEntropy(password: string): number {
  if (!password) return 0;
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  if (charsetSize === 0) return 0;
  return password.length * Math.log2(charsetSize);
}

/**
 * Estimate time to crack using brute force at 10 billion guesses/second.
 * Returns a human-readable string.
 */
function estimateCrackTime(password: string): { text: string; color: string; seconds: number } {
  if (!password) return { text: '--', color: '#64748b', seconds: 0 };

  const entropy = calcEntropy(password);
  // Assume 10 billion guesses/second (modern GPU cluster)
  const guessesPerSecond = 10_000_000_000;
  const combinations = Math.pow(2, entropy);
  const seconds = combinations / guessesPerSecond / 2; // Average = half the space

  if (seconds < 0.001) return { text: 'Instantly', color: '#ef4444', seconds };
  if (seconds < 1) return { text: 'Less than a second', color: '#ef4444', seconds };
  if (seconds < 60) return { text: `${Math.round(seconds)} second${Math.round(seconds) !== 1 ? 's' : ''}`, color: '#ef4444', seconds };
  if (seconds < 3600) return { text: `${Math.round(seconds / 60)} minute${Math.round(seconds / 60) !== 1 ? 's' : ''}`, color: '#f97316', seconds };
  if (seconds < 86400) return { text: `${Math.round(seconds / 3600)} hour${Math.round(seconds / 3600) !== 1 ? 's' : ''}`, color: '#f97316', seconds };
  if (seconds < 86400 * 30) return { text: `${Math.round(seconds / 86400)} day${Math.round(seconds / 86400) !== 1 ? 's' : ''}`, color: '#eab308', seconds };
  if (seconds < 86400 * 365) return { text: `${Math.round(seconds / (86400 * 30))} month${Math.round(seconds / (86400 * 30)) !== 1 ? 's' : ''}`, color: '#eab308', seconds };
  if (seconds < 86400 * 365 * 100) return { text: `${Math.round(seconds / (86400 * 365))} year${Math.round(seconds / (86400 * 365)) !== 1 ? 's' : ''}`, color: '#22c55e', seconds };
  if (seconds < 86400 * 365 * 1_000_000) return { text: `${Math.round(seconds / (86400 * 365 * 100)).toLocaleString()} centuries`, color: '#22c55e', seconds };
  if (seconds < 86400 * 365 * 1_000_000_000) return { text: `${Math.round(seconds / (86400 * 365 * 1_000_000)).toLocaleString()} million years`, color: '#06b6d4', seconds };
  return { text: `${(seconds / (86400 * 365 * 1_000_000_000)).toExponential(1)} billion years`, color: '#a855f7', seconds };
}

interface StrengthLevel {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  percent: number;
}

function getStrengthLevel(entropy: number): StrengthLevel {
  if (entropy === 0)
    return { label: 'Empty', color: '#64748b', bgColor: 'rgba(100,116,139,0.05)', borderColor: 'rgba(100,116,139,0.15)', percent: 0 };
  if (entropy < 28)
    return { label: 'Very Weak', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', percent: 15 };
  if (entropy < 36)
    return { label: 'Weak', color: '#f97316', bgColor: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.2)', percent: 30 };
  if (entropy < 50)
    return { label: 'Fair', color: '#eab308', bgColor: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.2)', percent: 50 };
  if (entropy < 70)
    return { label: 'Strong', color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', percent: 75 };
  return { label: 'Very Strong', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.2)', percent: 100 };
}

export function PasswordAnalyzer() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const analysis = useMemo(() => {
    const entropy = calcEntropy(password);
    const strength = getStrengthLevel(entropy);
    const crackTime = estimateCrackTime(password);

    const criteria = [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letters', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letters', met: /[a-z]/.test(password) },
      { label: 'Contains numbers', met: /[0-9]/.test(password) },
      { label: 'Contains special characters', met: /[^a-zA-Z0-9]/.test(password) },
      { label: 'At least 12 characters', met: password.length >= 12 },
    ];

    return { entropy, strength, crackTime, criteria };
  }, [password]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl relative overflow-hidden group h-full"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Subtle hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-cyan-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 p-6 flex flex-col h-full justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1" style={{ color: 'var(--text-heading)' }}>
            <Lock size={20} className="text-purple-400" />
            Password Analyzer
          </h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Validate password strength and see how long it takes a hacker to crack it.</p>

          {/* Password Input */}
          <div className="relative mb-5">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to analyze..."
              className="w-full rounded-xl py-3.5 pl-12 pr-12 text-sm font-mono focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-color-subtle)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color-subtle)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-purple-400 transition-colors p-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Strength</span>
              <motion.span
                key={analysis.strength.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: analysis.strength.color }}
              >
                {analysis.strength.label}
              </motion.span>
            </div>
            <div className="h-2 rounded-full overflow-hidden relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.strength.percent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full relative"
                style={{
                  background: `linear-gradient(90deg, ${analysis.strength.color}, ${analysis.strength.color}aa)`,
                  boxShadow: `0 0 12px ${analysis.strength.color}40`,
                }}
              >
                {password && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                )}
              </motion.div>
            </div>
          </div>

          {/* Crack Time Block */}
          <motion.div
            className="rounded-xl p-5 relative overflow-hidden mb-5 border transition-all duration-300"
            style={{
              background: analysis.strength.bgColor,
              borderColor: analysis.strength.borderColor,
            }}
          >
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.03]">
              <AlertTriangle size={68} style={{ color: analysis.crackTime.color }} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} style={{ color: analysis.crackTime.color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: analysis.crackTime.color }}>
                  Time to Crack by Hacker
                </span>
              </div>
              <motion.div
                key={analysis.crackTime.text}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black font-mono tracking-tight"
                style={{ color: analysis.crackTime.color }}
              >
                {analysis.crackTime.text}
              </motion.div>
              <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Time estimated at 10 billion brute-force attempts per second.
                Entropy: <span className="font-mono text-slate-400">{analysis.entropy.toFixed(1)} bits</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Criteria Checklist */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Password Requirements</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.criteria.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium transition-all duration-300 border ${
                  item.met
                    ? 'bg-green-500/5 border-green-500/15 text-green-400'
                    : 'bg-slate-800/10 border-transparent text-slate-500'
                }`}
                style={{
                  borderColor: item.met ? undefined : 'var(--border-color-subtle)',
                }}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    item.met
                      ? 'bg-green-500/20 shadow-[0_0_6px_rgba(34,197,94,0.3)]'
                      : 'bg-slate-800'
                  }`}
                >
                  {item.met ? (
                    <Check size={10} className="text-green-400" />
                  ) : (
                    <X size={10} className="text-slate-600" />
                  )}
                </div>
                {item.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
