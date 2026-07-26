import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showIcon?: boolean;
}

export function RiskBadge({ level, className = '', showIcon = false }: RiskBadgeProps) {
  const config = {
    safe: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.1)]',
      label: 'Safe',
      icon: '✓'
    },
    suspicious: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
      shadow: 'shadow-[0_0_10px_rgba(234,179,8,0.1)]',
      label: 'Suspicious',
      icon: '⚠'
    },
    dangerous: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
      shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.1)]',
      label: 'Dangerous',
      icon: '✕'
    }
  };

  const style = config[level] || config.suspicious;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} ${style.shadow} ${className}`}
    >
      {showIcon && <span>{style.icon}</span>}
      {style.label}
    </span>
  );
}
