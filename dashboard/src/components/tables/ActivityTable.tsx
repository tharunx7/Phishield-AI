import { useState } from 'react';
import { ArrowUpDown, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { RiskBadge } from '../ui/RiskBadge';
import { recentActivityData } from '../../data/dummyData';
import type { ActivityEntry } from '../../types';

export function ActivityTable() {
  const [data, setData] = useState<ActivityEntry[]>(recentActivityData);
  const [sortField, setSortField] = useState<keyof ActivityEntry>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof ActivityEntry) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);

    const sorted = [...data].sort((a, b) => {
      // Simple sorting logic for demo
      if (a[field] < b[field]) return isAsc ? -1 : 1;
      if (a[field] > b[field]) return isAsc ? 1 : -1;
      return 0;
    });
    setData(sorted);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-900/20 backdrop-blur-sm">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('website')}>
              <div className="flex items-center gap-2">Website <ArrowUpDown size={14} /></div>
            </th>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('risk')}>
              <div className="flex items-center gap-2">Risk <ArrowUpDown size={14} /></div>
            </th>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('time')}>
              <div className="flex items-center gap-2">Time <ArrowUpDown size={14} /></div>
            </th>
            <th className="px-6 py-4 font-medium cursor-pointer hover:text-slate-200 transition-colors" onClick={() => handleSort('status')}>
              <div className="flex items-center gap-2">Status <ArrowUpDown size={14} /></div>
            </th>
            <th className="px-6 py-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {row.risk === 'safe' ? (
                    <ShieldCheck size={16} className="text-green-400" />
                  ) : (
                    <ShieldAlert size={16} className={row.risk === 'dangerous' ? 'text-red-400' : 'text-yellow-400'} />
                  )}
                  <span className="font-mono text-slate-300">{row.website}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <RiskBadge level={row.risk} />
              </td>
              <td className="px-6 py-4 text-slate-400">{row.time}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 ${
                  row.status === 'blocked' ? 'text-red-400' : 
                  row.status === 'allowed' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    row.status === 'blocked' ? 'bg-red-400' : 
                    row.status === 'allowed' ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800">
                  <ExternalLink size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
