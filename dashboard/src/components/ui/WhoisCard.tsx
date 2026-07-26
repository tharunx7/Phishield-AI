import React from 'react';
import { Calendar, ShieldAlert, ShieldCheck, Server, Lock, Globe, AlertTriangle, Activity } from 'lucide-react';
import { GlassCard } from './GlassCard';
import type { WhoisData } from '../../types';

interface WhoisCardProps {
  data: WhoisData;
  className?: string;
}

export const WhoisCard: React.FC<WhoisCardProps> = ({ data, className = '' }) => {
  const getBadgeStyle = (category: WhoisData['riskCategory']) => {
    switch (category) {
      case 'CRITICAL_NEW':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'RECENT':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MODERATE':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'ESTABLISHED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'HIGH_TRUST':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 50) return 'text-yellow-400 stroke-yellow-500';
    return 'text-red-400 stroke-red-500';
  };

  return (
    <GlassCard className={`p-5 space-y-4 border border-slate-800/80 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              Domain Age & WHOIS Intelligence
            </h3>
            <p className="text-xs text-slate-400">Real-time RDAP registration analysis & trust scoring</p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(data.riskCategory)}`}>
          {data.riskCategory === 'CRITICAL_NEW' && '⚠️ FRESH DOMAIN (<14d)'}
          {data.riskCategory === 'RECENT' && '⚡ RECENT DOMAIN (<90d)'}
          {data.riskCategory === 'MODERATE' && '🟡 MODERATE AGE'}
          {data.riskCategory === 'ESTABLISHED' && '🔵 ESTABLISHED'}
          {data.riskCategory === 'HIGH_TRUST' && '🛡️ HIGH TRUST (>5y)'}
        </span>
      </div>

      {/* Trust Gauge & Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
        {/* Domain Age Metric */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Domain Age
          </span>
          <span className="text-xl font-bold text-white font-mono">{data.ageFormatted}</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Registered: {data.createdDate}</span>
        </div>

        {/* Registrar Info */}
        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
          <span className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" /> Domain Registrar
          </span>
          <span className="text-sm font-semibold text-slate-200 truncate" title={data.registrar}>
            {data.registrar}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              {data.isPrivacyProtected ? 'Privacy Proxy Active' : 'Public WHOIS Record'}
            </span>
          </div>
        </div>

        {/* WHOIS Trust Score Bar */}
        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> WHOIS Trust Rating
            </span>
            <span className={`text-sm font-bold font-mono ${getScoreColor(data.whoisTrustScore)}`}>
              {data.whoisTrustScore}/100
            </span>
          </div>
          
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                data.whoisTrustScore >= 80 ? 'bg-emerald-500' : data.whoisTrustScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${data.whoisTrustScore}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Source: {data.rawRdapSource || 'IANA RDAP Registry'}</span>
        </div>
      </div>

      {/* Risk Factors Checklist */}
      {data.riskFactors && data.riskFactors.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Domain Risk Factors & Insights:</span>
          <div className="space-y-1.5">
            {data.riskFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-slate-300">
                {data.riskCategory === 'CRITICAL_NEW' || data.riskCategory === 'RECENT' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};
