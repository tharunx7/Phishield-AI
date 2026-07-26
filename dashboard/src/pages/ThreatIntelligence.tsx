import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, TrendingUp, Crosshair, Activity, DollarSign, Mail, BarChart3 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { topPhishingDomains, attackTypes, recentThreats } from '../data/dummyData';
import { getFromStorage } from '../services/storageAdapter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Fallback 5-year annual data if no live data available
const historicalDataSets: Record<string, Array<{ year: string; attacks: number; financial: number }>> = {
  '2021-2026': [
    { year: '2021', attacks: 1213639, financial: 23.9 },
    { year: '2022', attacks: 4744699, financial: 23.8 },
    { year: '2023', attacks: 3626014, financial: 25.9 },
    { year: '2024', attacks: 3755379, financial: 27.2 },
    { year: '2025', attacks: 3842275, financial: 27.7 },
    { year: '2026*', attacks: 1956181, financial: 28.0 },
  ],
  '2016-2020': [
    { year: '2016', attacks: 1220523, financial: 19.5 },
    { year: '2017', attacks: 1122041, financial: 20.1 },
    { year: '2018', attacks: 1045231, financial: 21.3 },
    { year: '2019', attacks: 1121345, financial: 22.0 },
    { year: '2020', attacks: 1056431, financial: 22.5 },
  ],
  '2011-2015': [
    { year: '2011', attacks: 254123, financial: 15.2 },
    { year: '2012', attacks: 312345, financial: 16.8 },
    { year: '2013', attacks: 452132, financial: 17.5 },
    { year: '2014', attacks: 512341, financial: 18.0 },
    { year: '2015', attacks: 721345, financial: 18.9 },
  ],
  '2006-2010': [
    { year: '2006', attacks: 45210, financial: 8.5 },
    { year: '2007', attacks: 68340, financial: 9.8 },
    { year: '2008', attacks: 95400, financial: 11.2 },
    { year: '2009', attacks: 145000, financial: 12.5 },
    { year: '2010', attacks: 198000, financial: 14.0 },
  ],
  '2001-2005': [
    { year: '2001', attacks: 2100, financial: 2.1 },
    { year: '2002', attacks: 4500, financial: 3.5 },
    { year: '2003', attacks: 8900, financial: 4.8 },
    { year: '2004', attacks: 15400, financial: 5.6 },
    { year: '2005', attacks: 28000, financial: 7.2 },
  ],
};

interface Live30Day {
  totalThreatsDetected: number;
  bankingScams: number;
  financialSectorPercent: number;
  dailyPhishingEmails: number;
  bankingScamGrowthYoY: number;
  malwareURLs: number;
  credentialTheft: number;
  isLiveData: boolean;
}

interface ThreatIntelPayload {
  live30Day: Live30Day;
  historical5Year: {
    annualSummary: Array<{
      year: number;
      totalAttacks: number;
      topTargetShare: number;
    }>;
  };
  financialIndex: {
    riskLevel: string;
  };
  lastUpdated: string;
}

export function ThreatIntelligence() {
  const [liveData, setLiveData] = useState<Live30Day | null>(null);
  const [liveChartData, setLiveChartData] = useState(historicalDataSets['2021-2026']);
  const [selectedRange, setSelectedRange] = useState('2021-2026');
  const [riskLevel, setRiskLevel] = useState('HIGH');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const loadThreatData = async () => {
      try {
        let data = await getFromStorage<ThreatIntelPayload>('threatIntelData');
        
        // Fallback for local development (when not inside the Chrome Extension environment)
        if (!data || !data.live30Day) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 500);
            const resp = await fetch('http://localhost:3001/api/threat-trends', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (resp.ok) {
              const json = await resp.json();
              if (json.success && json.data) {
                data = json.data;
              }
            }
          } catch (e) {
            // Silently fallback without logging raw Error objects to Chrome Extension error panel
          }
        }

        if (data && data.live30Day) {
          setLiveData(data.live30Day);
          setLastUpdated(data.lastUpdated || '');
          if (data.financialIndex) {
            setRiskLevel(data.financialIndex.riskLevel || 'HIGH');
          }
          if (data.historical5Year?.annualSummary) {
            setLiveChartData(data.historical5Year.annualSummary.map((y) => ({
              year: y.year.toString() + (y.year === 2026 ? '*' : ''),
              attacks: y.totalAttacks,
              financial: y.topTargetShare,
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load threat intel data:', err);
      }
    };
    loadThreatData();
  }, []);

  const live = liveData || {
    totalThreatsDetected: 345800,
    bankingScams: 96900,
    financialSectorPercent: 27.9,
    dailyPhishingEmails: 3400000000,
    bankingScamGrowthYoY: 65,
    malwareURLs: 51800,
    credentialTheft: 262800,
    isLiveData: false,
  };

  const riskColorMap: Record<string, string> = {
    CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
    HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    ELEVATED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Threat Intelligence</h2>
          <p className="text-slate-400 text-sm">Global threat data and emerging phishing trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 border rounded-lg text-xs font-bold uppercase tracking-wider ${riskColorMap[riskLevel] || riskColorMap.HIGH}`}>
            {riskLevel} RISK
          </span>
          {live.isLiveData && (
            <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-semibold animate-pulse">LIVE</span>
          )}
        </div>
      </div>

      {/* Live 30-Day Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10"><ShieldAlert className="text-red-400" size={18} /></div>
            <span className="text-xs text-slate-400 uppercase font-semibold">30-Day Threats</span>
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">{live.totalThreatsDetected.toLocaleString()}</div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><DollarSign className="text-amber-400" size={18} /></div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Banking Scams</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{live.bankingScams.toLocaleString()}</div>
          <div className="text-[10px] text-red-400 mt-1 font-semibold">▲ {live.bankingScamGrowthYoY}% YoY</div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><BarChart3 className="text-purple-400" size={18} /></div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Financial Sector</span>
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">{live.financialSectorPercent}%</div>
          <div className="text-[10px] text-slate-500 mt-1">#1 targeted sector</div>
        </GlassCard>

        <GlassCard delay={0.4}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/10"><Mail className="text-cyan-400" size={18} /></div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Daily Phishing</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{(live.dailyPhishingEmails / 1e9).toFixed(1)}B</div>
          <div className="text-[10px] text-slate-500 mt-1">emails per day</div>
        </GlassCard>
      </div>

      {/* 5-Year Trend Chart */}
      <GlassCard delay={0.5}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="text-cyan-400" size={20} />
              <h3 className="text-lg font-semibold text-white">Annual Phishing Attacks</h3>
            </div>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-slate-800/80 border border-slate-700 text-slate-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="2021-2026">2021–2026</option>
              <option value="2016-2020">2016–2020</option>
              <option value="2011-2015">2011–2015</option>
              <option value="2006-2010">2006–2010</option>
              <option value="2001-2005">2001–2005</option>
            </select>
          </div>
          {lastUpdated && selectedRange === '2021-2026' && (
            <span className="text-[10px] text-slate-500 font-mono">
              Updated: {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={(selectedRange === '2021-2026' ? liveChartData : historicalDataSets[selectedRange]).map(d => ({
            ...d,
            phishing: Math.round(d.attacks * 0.6),
            malware: Math.round(d.attacks * 0.25),
            scam: Math.round(d.attacks * 0.15)
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`} 
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              labelStyle={{ color: 'var(--text-secondary)' }}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} iconType="circle" />
            <Line type="monotone" dataKey="phishing" name="Phishing Attacks" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#ef4444', stroke: '#0f172a' }} />
            <Line type="monotone" dataKey="malware" name="Malware" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#a855f7', stroke: '#0f172a' }} />
            <Line type="monotone" dataKey="scam" name="Scam/Fraud" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#eab308', stroke: '#0f172a' }} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Phishing Domains */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <GlobeIcon className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Top Active Phishing Domains</h3>
          </div>
          
          <div className="space-y-4">
            {topPhishingDomains.map((threat) => (
              <div key={threat.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div>
                  <div className="font-mono text-slate-200 mb-1">{threat.domain}</div>
                  <div className="text-xs text-slate-500">{threat.type} &bull; {threat.occurrences.toLocaleString()} hits</div>
                </div>
                <RiskBadge level={threat.severity} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Attack Types Distribution */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Crosshair className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Prevalent Attack Vectors</h3>
          </div>

          <div className="space-y-5">
            {attackTypes.map((attack) => (
              <div key={attack.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">{attack.name}</span>
                  <span className="text-slate-400">{attack.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${attack.percentage}%`,
                      backgroundColor: attack.color,
                      boxShadow: `0 0 10px ${attack.color}80`
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Emerging Threats */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-red-400" />
              <h3 className="text-lg font-semibold text-white">Emerging Threats (Last 24h)</h3>
            </div>
            <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-semibold animate-pulse">LIVE</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 text-xs uppercase">
                <tr>
                  <th className="pb-3 font-medium">Indicator of Compromise (IoC)</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">First Seen</th>
                  <th className="pb-3 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentThreats.map((threat) => (
                  <tr key={threat.id}>
                    <td className="py-3 font-mono text-cyan-400">{threat.domain}</td>
                    <td className="py-3 text-slate-300">{threat.type}</td>
                    <td className="py-3 text-slate-500">{threat.firstSeen}</td>
                    <td className="py-3"><RiskBadge level={threat.severity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>
  );
}

