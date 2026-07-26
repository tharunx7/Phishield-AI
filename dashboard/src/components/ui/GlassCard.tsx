import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className = '', delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`backdrop-blur-md rounded-2xl relative overflow-hidden group transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Subtle hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-purple-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
      
      {/* Card Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
