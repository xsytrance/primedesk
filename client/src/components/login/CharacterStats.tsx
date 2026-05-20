import { motion } from 'framer-motion';

interface Stat {
  label: string;
  value: string;
}

interface Props {
  stats: Stat[];
  primaryColor: string;
  accentText: string;
  isHovered: boolean;
}

export default function CharacterStats({ stats, primaryColor, accentText, isHovered }: Props) {
  return (
    <div className="space-y-1.5 mb-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: isHovered ? i * 0.05 : 0, duration: 0.2 }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted w-20 shrink-0">
            {stat.label}
          </span>
          <div className="flex-1 h-px" style={{ background: `${primaryColor}20` }} />
          <motion.span
            className="text-sm font-display font-bold tabular-nums"
            style={{ color: accentText }}
            animate={{ scale: isHovered ? [1, 1.1, 1] : 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            {stat.value}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}
