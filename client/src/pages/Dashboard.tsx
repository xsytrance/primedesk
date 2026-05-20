import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ticket, Inbox, Activity, BarChart3, PlusCircle, Laptop, FileText, MessageSquare,
  Shield, MapPin, TrendingUp, TrendingDown, ChevronRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import KPITile from '@/components/KPITile';
import OfficeBadge from '@/components/OfficeBadge';
import Avatar from '@/components/Avatar';
import MusicPlayer from '@/components/MusicPlayer';
import {
  dashboardKPIs, officeStatuses, ticketTrend, mockActivityFeed, mspData,
  operator1, operator2, getActivityIcon, timeAgo,
  type ActivityItem,
} from '@/data/mock';

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Status dot ─── */
const StatusDot = memo(function StatusDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
});

/* ─── Activity item ─── */
function ActivityRow({ item, index }: { item: ActivityItem; index: number }) {
  const navigate = useNavigate();
  const iconInfo = getActivityIcon(item.type);
  const iconMap: Record<string, typeof Ticket> = {
    plus: PlusCircle,
    'check-circle': TrendingDown,
    'file-text': FileText,
    'message-circle': MessageSquare,
    truck: TrendingUp,
    'user-check': Shield,
    activity: Activity,
  };
  const IconComp = iconMap[iconInfo.icon] || Activity;

  return (
    <motion.button
      variants={fadeUp}
      custom={index}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left',
        'hover:bg-bg-surface/50 transition-colors active:scale-[0.98]',
        'border-b border-[rgba(255,255,255,0.04)] last:border-b-0',
      )}
      onClick={() => {
        if (item.targetId?.startsWith('t')) navigate('/tickets');
        else if (item.targetId?.startsWith('l')) navigate('/laptops');
        else if (item.targetId?.startsWith('kb')) navigate('/kb');
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${iconInfo.color}18` }}
      >
        <IconComp size={15} style={{ color: iconInfo.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">{item.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-secondary">{timeAgo(item.timestamp)}</span>
          <OfficeBadge office={item.office} showLabel={false} />
        </div>
      </div>
      <ChevronRight size={14} className="text-text-muted mt-1 flex-shrink-0" />
    </motion.button>
  );
}

/* ─── Dashboard Page ─── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  /* ── KPIs ── */
  const kpiData = [
    {
      icon: Ticket, iconColor: '#00d9ff', iconBg: 'rgba(0,217,255,0.15)',
      value: String(dashboardKPIs.myOpenTickets), label: 'MY OPEN',
      trend: dashboardKPIs.myOpenTrend, trendColor: '#ffb347',
      delay: 0,
      onClick: () => navigate('/tickets'),
    },
    {
      icon: Inbox, iconColor: '#ff4fd8', iconBg: 'rgba(255,79,216,0.15)',
      value: String(dashboardKPIs.allOpenTickets), label: 'ALL OPEN',
      trend: dashboardKPIs.allOpenTrend, trendColor: '#7dff9e',
      delay: 80,
      onClick: () => navigate('/tickets'),
    },
    {
      icon: Activity, iconColor: '#ffb347', iconBg: 'rgba(255,179,71,0.15)',
      value: `${dashboardKPIs.activeLoad}%`, label: 'ACTIVE LOAD',
      progress: dashboardKPIs.activeLoad,
      progressGradient: 'linear-gradient(90deg, #7dff9e, #ffb347, #ff4d6a)',
      delay: 160,
      onClick: () => {},
    },
    {
      icon: BarChart3, iconColor: '#7dff9e', iconBg: 'rgba(125,255,158,0.15)',
      value: `${dashboardKPIs.openedToday} / ${dashboardKPIs.closedToday}`, label: 'OPENED / CLOSED',
      delay: 240,
      onClick: () => navigate('/tickets'),
    },
  ];

  /* ── Quick Actions ── */
  const quickActions = [
    { icon: PlusCircle, label: 'New Ticket', color: '#00d9ff', route: '/tickets', bg: 'rgba(0,217,255,0.15)' },
    { icon: Laptop, label: 'Add Laptop', color: '#ff4fd8', route: '/laptops', bg: 'rgba(255,79,216,0.15)' },
    { icon: FileText, label: 'New Article', color: '#7dff9e', route: '/kb', bg: 'rgba(125,255,158,0.15)' },
    { icon: MessageSquare, label: 'War Room', color: '#ffb347', route: '/warroom', bg: 'rgba(255,179,71,0.15)' },
  ];

  /* ── Chart tooltip ── */
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-bg-elevated border border-glass-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-text-muted mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="text-xs" style={{ color: p.dataKey === 'opened' ? '#00d9ff' : '#7dff9e' }}>
            {p.dataKey === 'opened' ? 'Opened' : 'Closed'}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div ref={scrollRef} className="pb-4">
      {/* ── KPI Tiles ── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4"
        variants={staggerContainer}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {kpiData.map((kpi, i) => (
          <motion.div key={kpi.label} variants={fadeUp} custom={i}>
            <KPITile {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── XP Leaderboard ── */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 16 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <button
          className="w-full rounded-xl backdrop-blur-xl border border-glass-border p-4 text-left hover:bg-bg-surface/30 transition-colors active:scale-[0.99]"
          style={{ background: 'rgba(18,18,26,0.72)' }}
          onClick={() => navigate('/profile')}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Operator 1 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Avatar src={operator1.avatar} fallback={operator1.initials} size={32} borderColor={operator1.color} />
                <span className="text-sm text-text-primary font-medium">{operator1.displayName}</span>
                <span className="text-[10px] font-display px-1.5 py-0.5 rounded bg-cyan/20 text-cyan">L{operator1.level}</span>
              </div>
              <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #00d9ff, #ff4fd8)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(operator1.xp / operator1.nextLevelXp) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                />
              </div>
              <div className="text-[10px] text-text-secondary mt-1 font-mono">{operator1.xp} / {operator1.nextLevelXp} XP</div>
            </div>

            {/* VS */}
            <div className="text-[10px] font-mono text-text-muted px-2">VS</div>

            {/* Operator 2 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 justify-end">
                <span className="text-[10px] font-display px-1.5 py-0.5 rounded bg-magenta/20 text-magenta">L{operator2.level}</span>
                <span className="text-sm text-text-primary font-medium">{operator2.displayName}</span>
                <Avatar src={operator2.avatar} fallback={operator2.initials} size={32} borderColor={operator2.color} />
              </div>
              <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #ff4fd8, #7dff9e)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(operator2.xp / operator2.nextLevelXp) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                />
              </div>
              <div className="text-[10px] text-text-secondary mt-1 font-mono text-right">{operator2.xp} / {operator2.nextLevelXp} XP</div>
            </div>
          </div>
        </button>
      </motion.div>

      {/* ── Office Status Cards ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"
        variants={staggerContainer}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {officeStatuses.map((office, i) => (
          <motion.div
            key={office.code}
            variants={fadeUp}
            custom={i}
          >
            <button
              className={cn(
                'w-full rounded-xl backdrop-blur-xl border border-glass-border overflow-hidden text-left',
                'hover:bg-bg-surface/30 transition-all active:scale-[0.99]',
              )}
              style={{ background: 'rgba(18,18,26,0.72)' }}
              onClick={() => navigate('/tickets')}
            >
              {/* Top glow line */}
              <div
                className="h-[1px]"
                style={{ background: `linear-gradient(to right, transparent, ${office.color}, transparent)` }}
              />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} style={{ color: office.color }} />
                  <span className="font-display text-[11px] tracking-wider uppercase" style={{ color: office.color }}>
                    {office.label}
                  </span>
                  <StatusDot color={office.status === 'Online' ? '#7dff9e' : '#ff4d6a'} />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-3">
                  <div>
                    <div className="font-display text-h2 text-text-primary">{office.activeTickets}</div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">ACTIVE</div>
                  </div>
                  <div>
                    <div className="font-display text-h2 text-text-primary">{office.laptopTasks}</div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">LAPTOPS</div>
                  </div>
                  <div className="ml-auto">
                    <div className="text-sm" style={{ color: office.status === 'Online' ? '#7dff9e' : '#ffb347' }}>
                      {office.status}
                    </div>
                  </div>
                </div>

                {/* Mini bar */}
                <div className="flex gap-1 items-end h-4">
                  {[40, 65, 85, 55, 70, 90, 45].map((h, j) => (
                    <motion.div
                      key={j}
                      className="flex-1 rounded-full"
                      style={{ backgroundColor: office.color, opacity: 0.3 + (j / 10) }}
                      initial={{ height: 0 }}
                      animate={{ height: `${h * 0.16}px` }}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 + j * 0.03 }}
                    />
                  ))}
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4"
        variants={staggerContainer}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            variants={fadeUp}
            custom={i}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl backdrop-blur-xl border border-glass-border',
              'hover:bg-bg-surface/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all active:scale-95',
            )}
            style={{ background: 'rgba(18,18,26,0.72)' }}
            onClick={() => navigate(action.route)}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ backgroundColor: action.bg }}
            >
              <action.icon size={22} style={{ color: action.color }} />
            </div>
            <span className="text-sm text-text-primary">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ── Ticket Trend Mini-Chart ── */}
      <motion.div
        className="mt-4 rounded-xl backdrop-blur-xl border border-glass-border p-5"
        style={{ background: 'rgba(18,18,26,0.72)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-secondary mb-4">
          TICKET TREND &mdash; LAST 7 DAYS
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ticketTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d9ff" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#00d9ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dff9e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#7dff9e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#4a4a60', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="opened"
                stroke="#00d9ff"
                strokeWidth={2}
                fill="url(#cyanArea)"
                animationDuration={600}
                animationBegin={600}
              />
              <Area
                type="monotone"
                dataKey="closed"
                stroke="#7dff9e"
                strokeWidth={2}
                fill="url(#greenArea)"
                animationDuration={600}
                animationBegin={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── MSP On-Duty ── */}
      <motion.div
        className="mt-4 rounded-xl backdrop-blur-xl border border-glass-border p-4 flex items-center gap-3"
        style={{ background: 'rgba(18,18,26,0.72)' }}
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.2, delay: 0.6 }}
      >
        <div className="w-10 h-10 rounded-full bg-green/15 flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-green" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-primary">Current MSP: {mspData.name}</div>
          <div className="text-xs text-text-secondary">{mspData.email}</div>
        </div>
        <span className="text-xs text-cyan cursor-pointer hover:underline">View</span>
      </motion.div>

      {/* ── Recent Activity Feed ── */}
      <motion.div
        className="mt-4"
        variants={staggerContainer}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-secondary mb-3">
          RECENT ACTIVITY
        </div>
        <div className="rounded-xl backdrop-blur-xl border border-glass-border overflow-hidden" style={{ background: 'rgba(18,18,26,0.72)' }}>
          <div className="max-h-[300px] overflow-y-auto">
            {mockActivityFeed.map((item, i) => (
              <ActivityRow key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Music Player (Desktop only inline) ── */}
      <div className="hidden md:block">
        <MusicPlayer />
      </div>

      {/* Mobile music player shows inline above nav */}
      <div className="md:hidden mt-4">
        <MusicPlayer />
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
