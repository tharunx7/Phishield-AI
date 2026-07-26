import { ShieldCheck, ShieldAlert, Globe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';
import { WeeklyScanChart } from '../components/charts/WeeklyScanChart';
import { RiskDistributionPie } from '../components/charts/RiskDistributionPie';
import { ThreatTrendLine } from '../components/charts/ThreatTrendLine';
import { DetectionAccuracy } from '../components/charts/DetectionAccuracy';
import { ActivityTable } from '../components/tables/ActivityTable';
import { useScanData } from '../hooks/useScanData';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function Dashboard() {
  const { stats } = useScanData();
  const navigate = useNavigate();
  const { t } = useAppContext();

  const statCards = [
    {
      title: 'Total Scanned',
      value: stats.totalScans,
      icon: Globe,
      color: 'cyan' as const,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: 'Threats Blocked',
      value: stats.threatsBlocked,
      icon: ShieldAlert,
      color: 'red' as const,
      trend: { value: 4.2, isPositive: false },
    },
    {
      title: 'Safe Websites',
      value: stats.safeWebsites,
      icon: ShieldCheck,
      color: 'green' as const,
      trend: { value: 15.3, isPositive: true },
    },
    {
      title: 'High Risk',
      value: stats.highRiskWebsites,
      icon: Activity,
      color: 'purple' as const,
      trend: { value: 2.1, isPositive: false },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{t('header.overview')}</h2>
          <p className="text-slate-400 text-sm">{t('header.overviewSub')}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-700">
            Last 7 Days
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] cursor-pointer"
          >
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={card.title} {...card} delay={index * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2" delay={0.4}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Scan Activity & Threats</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-cyan-400" /> Scans</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500" /> Threats</div>
            </div>
          </div>
          <WeeklyScanChart />
        </GlassCard>

        <GlassCard delay={0.5}>
          <h3 className="text-lg font-semibold text-white mb-6">Risk Distribution</h3>
          <RiskDistributionPie />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard delay={0.6}>
          <h3 className="text-lg font-semibold text-white mb-6">AI Detection Accuracy</h3>
          <DetectionAccuracy />
        </GlassCard>
        
        <GlassCard className="xl:col-span-2" delay={0.7}>
          <h3 className="text-lg font-semibold text-white mb-6">Threat Trends (30 Days)</h3>
          <ThreatTrendLine />
        </GlassCard>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
            View All History
          </button>
        </div>
        <ActivityTable />
      </motion.div>
    </div>
  );
}
