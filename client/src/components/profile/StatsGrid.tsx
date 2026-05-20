import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Ticket, FileText, MessageCircle } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

interface StatsGridProps {
  ticketsCreated: number;
  ticketsResolved: number;
  kbArticles: number;
  messagesSent: number;
}

interface StatItem {
  label: string;
  value: number;
  icon: typeof Ticket;
  color: string;
}

export default function StatsGrid({ ticketsCreated, ticketsResolved, kbArticles, messagesSent }: StatsGridProps) {
  const stats: StatItem[] = [
    { label: 'Tickets Created', value: ticketsCreated, icon: Ticket, color: '#00d9ff' },
    { label: 'Tickets Resolved', value: ticketsResolved, icon: Ticket, color: '#7dff9e' },
    { label: 'KB Articles', value: kbArticles, icon: FileText, color: '#ff4fd8' },
    { label: 'Messages Sent', value: messagesSent, icon: MessageCircle, color: '#ffb347' },
  ];

  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-[0.28em] text-text-secondary mb-3">My Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <StatTile key={stat.label} stat={stat} index={i} />
        ))}
      </div>
    </div>
  );
}

function StatTile({ stat, index }: { stat: StatItem; index: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetRef = useRef(stat.value);
  targetRef.current = stat.value;

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayValue(Math.round(eased * targetRef.current));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [stat.value]);

  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 + index * 0.08, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      <GlassCard className="p-4 flex flex-col items-center text-center">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
          style={{ backgroundColor: `${stat.color}15` }}
        >
          <Icon size={18} style={{ color: stat.color }} />
        </div>
        <span className="text-h2 font-display text-text-primary">{displayValue}</span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary mt-1">
          {stat.label}
        </span>
      </GlassCard>
    </motion.div>
  );
}
