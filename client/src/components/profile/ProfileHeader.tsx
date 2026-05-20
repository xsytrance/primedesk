import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin } from 'lucide-react';
import type { User } from '@/data/mock';
import { getOfficeColor } from '@/data/mock';

interface ProfileHeaderProps {
  user: User;
}

const LEVELS = [
  { level: 1, xp: 0, title: 'Helpdesk Grunt' },
  { level: 2, xp: 100, title: 'Cable Monkey' },
  { level: 3, xp: 250, title: 'Ping Jockey' },
  { level: 4, xp: 500, title: 'Break-Fix Tech' },
  { level: 5, xp: 900, title: 'Access Guardian' },
  { level: 6, xp: 1400, title: 'Network Wrangler' },
  { level: 7, xp: 2000, title: 'Systems Operator' },
  { level: 8, xp: 3000, title: 'Infrastructure Pro' },
  { level: 9, xp: 4500, title: 'Senior Architect' },
  { level: 10, xp: 6500, title: 'Prime Admin' },
];

export function getLevelInfo(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      const next = LEVELS[i + 1];
      return {
        current: LEVELS[i],
        next: next || null,
        progress: next ? (xp - LEVELS[i].xp) / (next.xp - LEVELS[i].xp) : 1,
        xpInLevel: next ? xp - LEVELS[i].xp : 0,
        xpNeeded: next ? next.xp - LEVELS[i].xp : 0,
      };
    }
  }
  return { current: LEVELS[0], next: LEVELS[1], progress: 0, xpInLevel: 0, xpNeeded: 100 };
}

export { LEVELS };

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [avatarSeed, setAvatarSeed] = useState(0);
  const [animProgress, setAnimProgress] = useState(0);
  const progressRef = useRef(0);
  const levelInfo = getLevelInfo(user.xp);
  const officeColor = getOfficeColor(user.office);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      progressRef.current = t;
      setAnimProgress(t);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [user.xp]);

  const handleAvatarUpload = () => {
    setAvatarSeed((prev) => prev + 1);
  };

  const gradients = [
    'linear-gradient(135deg, #00d9ff, #ff4fd8)',
    'linear-gradient(135deg, #7dff9e, #00d9ff)',
    'linear-gradient(135deg, #ffb347, #ff4d6a)',
    'linear-gradient(135deg, #ff4fd8, #7dff9e)',
    'linear-gradient(135deg, #00d9ff, #ffb347)',
  ];
  const currentGradient = gradients[avatarSeed % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: 'rgba(18,18,26,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        {/* Animated gradient border */}
        <div
          className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(0,217,255,0.5), rgba(255,79,216,0.5), rgba(125,255,158,0.5))',
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'spin-slow 12s linear infinite',
          }}
        />

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          className="relative"
        >
          <button
            onClick={handleAvatarUpload}
            className="relative group cursor-pointer"
          >
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl font-display font-bold text-white overflow-hidden"
              style={{ background: currentGradient, boxShadow: `0 0 20px ${officeColor}30` }}
            >
              {user.initials}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: `3px solid ${officeColor}` }}
            />
          </button>
        </motion.div>

        {/* Name */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-h1 font-heading font-bold text-text-primary"
        >
          {user.displayName}
        </motion.h2>

        {/* Level badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-1"
        >
          <span className="text-sm font-display text-cyan tracking-wide">
            Level {levelInfo.current.level} &mdash; {levelInfo.current.title}
          </span>
        </motion.div>

        {/* XP Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-3 w-full max-w-[280px]"
        >
          <div className="w-full h-3 rounded-full bg-bg-surface overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #00d9ff, #ff4fd8)',
                width: `${animProgress * levelInfo.progress * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs font-mono text-text-secondary">
              {levelInfo.next ? `${Math.round(animProgress * levelInfo.xpInLevel)} / ${levelInfo.xpNeeded} XP` : 'MAX LEVEL'}
            </span>
            <span className="text-xs font-mono text-cyan">
              {levelInfo.next ? `${Math.round(levelInfo.progress * 100)}%` : '100%'}
            </span>
          </div>
        </motion.div>

        {/* Office */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center gap-1.5 text-sm"
          style={{ color: officeColor }}
        >
          <MapPin size={14} />
          <span className="font-mono uppercase text-xs tracking-wider">
            {user.office === 'NYC' ? 'NYC MAIN HQ' : user.office === 'SF' ? 'SF INNOVATION NODE' : 'DC POLICY NODE'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
