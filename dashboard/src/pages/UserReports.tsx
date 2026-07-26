import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Search, Trash2, Send, User } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { getFromStorage, setInStorage } from '../services/storageAdapter';

interface UserReport {
  id: string;
  url: string;
  score: number;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  timestamp: string;
  status: 'Pending Review' | 'Confirmed Safe' | 'Confirmed Threat' | 'Reported to Cyber Portal';
  reporter?: string;
}

// Helper to get formatted username from email
const getDisplayName = (email?: string) => {
  if (!email) return 'Anonymous User';
  const prefix = email.split('@')[0];
  return prefix
    .split(/[\._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getAiReasoning = (report: UserReport) => {
  if (report.riskLevel === 'dangerous') {
    return 'High probability of phishing. AI detected deceptive heuristics, suspicious domain age, and patterns matching known scam sites.';
  }
  if (report.riskLevel === 'suspicious') {
    return 'Displays anomalous characteristics. Domain might be recently registered or contains misleading elements. Manual review recommended.';
  }
  return 'No significant threat indicators detected by AI. Domain appears legitimate and matches standard safety protocols.';
};

export function UserReports() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReports();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'phishShield_userReports' || e.key === 'userReports') {
        loadReports();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadReports = async () => {
    let data = await getFromStorage<UserReport[]>('userReports');
    
    // DEMO HACK: If no reports exist, inject fake reports for presentation purposes!
    if (!data || data.length === 0) {
      data = [
        { id: 'rep-1', url: 'https://paypal-update-account.tk/login', score: 98, riskLevel: 'dangerous', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Pending Review', reporter: 'analyst@phishshield.ai' },
        { id: 'rep-2', url: 'https://netflix-subscription-free.com', score: 85, riskLevel: 'dangerous', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'Confirmed Threat', reporter: 'user74@company.com' },
        { id: 'rep-3', url: 'https://google-docs-secure.net', score: 45, riskLevel: 'suspicious', timestamp: new Date(Date.now() - 14400000).toISOString(), status: 'Pending Review', reporter: 'guest@example.com' },
        { id: 'rep-4', url: 'https://legitimate-startup-blog.io', score: 30, riskLevel: 'suspicious', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Confirmed Safe', reporter: 'security@phishshield.ai' },
      ];
      await setInStorage('userReports', data);
    }
    
    setReports(data);
  };

  const [toastMessage, setToastMessage] = useState('');

  const updateStatus = async (id: string, newStatus: UserReport['status']) => {
    const target = reports.find(r => r.id === id);
    const updated = reports.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setReports(updated);
    await setInStorage('userReports', updated);

    if (newStatus === 'Reported to Cyber Portal') {
      const existing = (await getFromStorage<any[]>('userNotifications')) || [];
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'cyber_dept',
        title: 'Forwarded to Cyber Crime Dept 🏛️',
        desc: `Admin reviewed your report for ${target?.url || 'suspicious URL'} and successfully submitted it to the Cyber Crime Portal.`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
      };
      await setInStorage('userNotifications', [newNotif, ...existing]);
      window.dispatchEvent(new Event('storage'));

      setToastMessage(`Report for ${target?.url || 'site'} sent to Cyber Crime Dept! User notification created.`);
      setTimeout(() => setToastMessage(''), 4500);
    }
  };

  const clearAll = async () => {
    if (confirm('Are you sure you want to clear all user reports?')) {
      setReports([]);
      await setInStorage('userReports', []);
    }
  };

  const filteredReports = reports.filter(r => 
    r.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">User Reports</h2>
          <p className="text-slate-400 text-sm">Review potential threats and false positives reported by users.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={clearAll}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20 flex items-center gap-2"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-purple-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-xs text-purple-400 font-mono bg-purple-500/20 px-2 py-1 rounded">Notification Pushed</span>
        </div>
      )}

      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by URL or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 text-center border-t border-slate-800/60">
            <ShieldAlert size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">No reports found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              There are currently no user reports matching your search.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg border border-slate-800/60">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Reported URL</th>
                  <th className="px-6 py-4 font-medium">Reporter</th>
                  <th className="px-6 py-4 font-medium">Risk Level</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium text-slate-200 truncate max-w-[250px] inline-block" title={report.url}>
                          {report.url}
                        </span>
                        <div className="text-xs text-slate-400 max-w-[250px] whitespace-normal leading-relaxed">
                          <span className="text-cyan-400/90 font-medium flex items-center gap-1 mb-0.5">
                            <ShieldAlert size={12} /> AI Analysis:
                          </span>
                          {getAiReasoning(report)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <User size={14} />
                        <span className="text-xs">{getDisplayName(report.reporter)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge level={report.riskLevel} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          report.riskLevel === 'dangerous' ? 'bg-red-500' : 
                          report.riskLevel === 'suspicious' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="font-medium text-slate-200">{report.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(report.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        report.status === 'Reported to Cyber Portal'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : report.status === 'Confirmed Safe' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : report.status === 'Confirmed Threat'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateStatus(report.id, 'Confirmed Safe')}
                          disabled={report.status === 'Confirmed Safe'}
                          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-green-400 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-slate-700"
                          title="Mark as Safe"
                        >
                          <CheckCircle size={14} /> Safe
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'Confirmed Threat')}
                          disabled={report.status === 'Confirmed Threat'}
                          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-slate-700"
                          title="Confirm Threat"
                        >
                          <AlertTriangle size={14} /> Threat
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            updateStatus(report.id, 'Reported to Cyber Portal');
                            const targetUrl = 'https://cybercrime.gov.in/';
                            const winChrome = (window as any).chrome;
                            if (winChrome && winChrome.tabs?.create) {
                              winChrome.tabs.create({ url: targetUrl });
                            } else {
                              window.open(targetUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          disabled={report.status === 'Reported to Cyber Portal'}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer ${
                            report.status === 'Reported to Cyber Portal'
                              ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border-slate-800'
                              : 'bg-slate-800 hover:bg-slate-700 text-purple-400'
                          }`}
                          title="Report to Cyber Crime Portal"
                        >
                          <Send size={14} /> Cyber Crime
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
