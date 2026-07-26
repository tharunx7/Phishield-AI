import { useState } from 'react';
import { Search, Filter, Download, Trash2, ExternalLink } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { useScanData } from '../hooks/useScanData';
import type { RiskLevel } from '../types';

export function ScanHistory() {
  const { history, deleteScan, clearHistory } = useScanData();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  const filteredHistory = history.filter(scan => {
    const matchesSearch = scan.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scan.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || scan.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleExport = () => {
    // Basic CSV export
    const headers = ['URL', 'Domain', 'Score', 'Risk Level', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(s => 
        `"${s.url}","${s.domain}",${s.score},${s.riskLevel},"${s.timestamp}",${s.status}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `phishshield_scans_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Scan History</h2>
          <p className="text-slate-400 text-sm">Review past website analyses and threat detections.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={clearHistory}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20 flex items-center gap-2"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by URL or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-500" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 appearance-none min-w-[150px]"
            >
              <option value="all">All Risk Levels</option>
              <option value="safe">Safe</option>
              <option value="suspicious">Suspicious</option>
              <option value="dangerous">Dangerous</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-lg border border-slate-800/60">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Target URL</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-slate-300 max-w-[300px] truncate" title={scan.url}>
                        {scan.url}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge level={scan.riskLevel} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-bold ${
                        scan.score >= 70 ? 'text-green-400' : 
                        scan.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {scan.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800" title="View details">
                          <ExternalLink size={16} />
                        </button>
                        <button 
                          onClick={() => deleteScan(scan.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800" title="Delete record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No scan history found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
