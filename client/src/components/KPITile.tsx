import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface KPITileProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
  trend?: string;
  trendColor?: string;
  progress?: number;
  progressGradient?: string;
  delay?: number;
  onClick?: () => void;
  className?: string;
}

export default function KPITile({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  trend,
  trendColor = '#7a7a94',
  progress,
  progressGradient = 'linear-gradient(90deg, #7dff9e, #ffb347)',
  delay = 0,
  onClick,
  className,
}: KPITileProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    const numericMatch = value.match(/[\d]+/g);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    const target = parseInt(numericMatch[0], 10);
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime - delay;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setDisplayValue(value.replace(/[\d]+/, String(current)));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        hasAnimated.current = true;
      }
    };

    requestAnimationFrame(animate);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className={cn(
        'relative rounded-xl backdrop-blur-xl bg-glass border border-glass-border',
        'p-5 cursor-pointer select-none',
        'active:scale-[0.95] transition-transform',
        className,
      )}
      style={{ background: 'rgba(18,18,26,0.72)' }}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>

      {/* Value */}
      <div className="font-display text-h2 text-text-primary leading-tight mb-1">
        {displayValue}
      </div>

      {/* Label */}
      <div
        className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-secondary mb-2"
      >
        {label}
      </div>

      {/* Trend */}
      {trend && (
        <div className="text-xs" style={{ color: trendColor }}>
          {trend}
        </div>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-3 w-full h-1 bg-bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: progressGradient }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, delay: delay / 1000 + 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          />
        </div>
      )}
    </motion.div>
  );
}
