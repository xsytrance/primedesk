import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { LEVELS, getLevelInfo } from './ProfileHeader';

interface XPProgressProps {
  currentXp: number;
}

export default function XPProgress({ currentXp }: XPProgressProps) {
  const levelInfo = getLevelInfo(currentXp);

  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-[0.28em] text-text-secondary mb-4">Level Progression</h3>
      <div className="rounded-2xl p-5" style={{ background: 'rgba(18,18,26,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Level path */}
        <div className="flex items-center justify-between relative mb-6 overflow-x-auto pb-2">
          {/* Connecting line */}
          <div className="absolute top-[14px] left-4 right-4 h-[2px] bg-bg-surface rounded-full -z-0" />
          <div
            className="absolute top-[14px] left-4 h-[2px] rounded-full -z-0 transition-all duration-800"
            style={{
              width: `${(levelInfo.current.level - 1) / (LEVELS.length - 1) * 100}%`,
              background: 'linear-gradient(90deg, #7dff9e, #00d9ff)',
            }}
          />

          {LEVELS.map((lvl, i) => {
            const isCompleted = currentXp >= lvl.xp;
            const isCurrent = levelInfo.current.level === lvl.level;

            return (
              <motion.div
                key={lvl.level}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.4 + i * 0.06,
                  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                }}
                className="relative flex flex-col items-center z-10 flex-shrink-0 mx-0.5"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isCompleted ? '#7dff9e' : isCurrent ? 'var(--cyan)' : 'transparent',
                    border: isCompleted ? '2px solid #7dff9e' : isCurrent ? '2px solid var(--cyan)' : '2px solid var(--text-muted)',
                    boxShadow: isCurrent ? '0 0 12px rgba(0,217,255,0.4)' : 'none',
                  }}
                >
                  {isCompleted && !isCurrent && <Check size={14} className="text-bg-base" />}
                  {isCurrent && <Star size={14} className="text-bg-base" />}
                  {!isCompleted && !isCurrent && (
                    <span className="text-[10px] font-mono text-text-muted">{lvl.level}</span>
                  )}
                </div>
                <span className={`text-[9px] font-mono mt-1.5 whitespace-nowrap ${isCurrent ? 'text-cyan font-semibold' : isCompleted ? 'text-green' : 'text-text-muted'}`}>
                  L{lvl.level}
                </span>
                {isCurrent && (
                  <motion.div
                    className="absolute -bottom-5 whitespace-nowrap text-[10px] font-mono text-text-secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {lvl.title}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-mono text-text-secondary">
              {levelInfo.next ? `${currentXp} / ${levelInfo.next.xp} XP` : 'MAX LEVEL'}
            </span>
            <span className="text-xs font-mono text-cyan">
              {levelInfo.next ? `${Math.round(levelInfo.progress * 100)}%` : 'COMPLETE'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-bg-surface overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #7dff9e, #00d9ff)' }}
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress * 100}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
