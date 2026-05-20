import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Settings, Truck } from 'lucide-react';
import type { Laptop } from '@/data/mock';

interface LaptopPipelineProps {
  laptops: Laptop[];
  onStageClick?: (stage: 'acquire' | 'configure' | 'ship' | null) => void;
  activeStage?: 'acquire' | 'configure' | 'ship' | null;
}

interface StageConfig {
  key: 'acquire' | 'configure' | 'ship';
  label: string;
  icon: React.ReactNode;
  color: string;
  colorVar: string;
}

const stages: StageConfig[] = [
  {
    key: 'acquire',
    label: 'ACQUIRE',
    icon: <Package size={22} />,
    color: '#00d9ff',
    colorVar: 'var(--cyan)',
  },
  {
    key: 'configure',
    label: 'CONFIGURE',
    icon: <Settings size={22} />,
    color: '#ff4fd8',
    colorVar: 'var(--magenta)',
  },
  {
    key: 'ship',
    label: 'SHIP',
    icon: <Truck size={22} />,
    color: '#7dff9e',
    colorVar: 'var(--green)',
  },
];

function countToStage(laptops: Laptop[], stageKey: 'acquire' | 'configure' | 'ship'): number {
  return laptops.filter((l) => {
    if (l.status === 'Completed') {
      // Completed items count toward their stored stage, or 'ship' if none
      const s = l.stage || 'ship';
      return s === stageKey;
    }
    return l.stage === stageKey;
  }).length;
}

export default function LaptopPipeline({ laptops, onStageClick, activeStage }: LaptopPipelineProps) {
  const [animatedCounts, setAnimatedCounts] = useState([0, 0, 0]);
  const total = laptops.length;

  const counts = stages.map((s) => countToStage(laptops, s.key));
  const percentages = total > 0 ? counts.map((c) => (c / total) * 100) : [0, 0, 0];

  // CountUp animation
  useEffect(() => {
    const duration = 600;
    const startTime = performance.now();
    const startValues = [...animatedCounts];
    const endValues = counts;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      const next = startValues.map((start, i) =>
        Math.round(start + (endValues[i] - start) * eased),
      );
      setAnimatedCounts(next);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts[0], counts[1], counts[2]]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-xl bg-glass backdrop-blur-xl border border-glass-border p-4 md:p-5 overflow-x-auto"
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-[280px]">
        {stages.map((stage, index) => {
          const isActive = activeStage === stage.key;
          return (
            <div key={stage.key} className="flex items-center gap-2 md:gap-3 flex-1">
              {/* Stage card */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                }}
                onClick={() => onStageClick?.(isActive ? null : stage.key)}
                className="flex-1 rounded-xl p-3 md:p-4 text-left transition-all duration-200 active:scale-[0.97] relative overflow-hidden"
                style={{
                  background: 'rgba(18,18,26,0.72)',
                  borderTop: `2px solid ${stage.color}`,
                  border: isActive ? `1px solid ${stage.color}60` : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isActive ? `0 0 20px ${stage.color}20` : undefined,
                }}
              >
                {/* Icon + Label */}
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: stage.color }}>{stage.icon}</span>
                  <span
                    className="font-display text-[10px] md:text-xs uppercase tracking-wider"
                    style={{ color: stage.color }}
                  >
                    {stage.label}
                  </span>
                </div>

                {/* Count */}
                <div
                  className="font-display text-2xl md:text-[28px] font-bold leading-tight"
                  style={{ color: stage.color }}
                >
                  {animatedCounts[index]}
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-surface overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: stage.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentages[index]}%` }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number], delay: index * 0.1 }}
                  />
                </div>
              </motion.button>

              {/* Arrow connector */}
              {index < stages.length - 1 && (
                <div className="flex-shrink-0 text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
