import { Activity } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { WeeklyScanChart } from '../components/charts/WeeklyScanChart';
import { RiskDistributionPie } from '../components/charts/RiskDistributionPie';
import { ThreatTrendLine } from '../components/charts/ThreatTrendLine';

export function Statistics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">In-Depth Statistics</h2>
        <p className="text-slate-400 text-sm">Detailed visual breakdown of system performance and threat data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-6">Scan Volume Over Time</h3>
          <WeeklyScanChart />
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-6">Threat Categories</h3>
          <RiskDistributionPie />
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-6">Long-term Threat Trends</h3>
          <ThreatTrendLine />
        </GlassCard>
      </div>
    </div>
  );
}
