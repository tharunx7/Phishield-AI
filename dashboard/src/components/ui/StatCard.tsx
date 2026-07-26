import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './AnimatedCounter';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'cyan' | 'purple' | 'green' | 'red';
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
  const colorStyles = {
    cyan: 'from-cyan-400 to-cyan-600 text-cyan-400 bg-cyan-400/10 border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]',
    purple: 'from-purple-400 to-purple-600 text-purple-400 bg-purple-400/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    green: 'from-green-400 to-green-600 text-green-400 bg-green-400/10 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]',
    red: 'from-red-400 to-red-600 text-red-400 bg-red-400/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
  };

  const selectedColor = colorStyles[color];
  const gradientText = `bg-gradient-to-r ${selectedColor.split(' ').slice(0,2).join(' ')} bg-clip-text text-transparent`;

  return (
    <GlassCard delay={delay} className="group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className={`text-3xl font-bold font-mono ${gradientText}`}>
            <AnimatedCounter value={value} />
          </h3>
          
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}%</span>
              <span className="text-slate-500 ml-1">vs last week</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl border flex items-center justify-center transition-all duration-500 group-hover:scale-[1.15] group-hover:rotate-12 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] ${selectedColor.split(' ').slice(2).join(' ')}`}>
          <Icon size={24} className="transition-transform duration-500 group-hover:scale-110" />
        </div>
      </div>
    </GlassCard>
  );
}
