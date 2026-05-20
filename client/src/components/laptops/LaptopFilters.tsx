import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type StatusFilter = 'All' | 'Open' | 'Completed';
export type OfficeFilter = 'All' | 'NYC' | 'SF' | 'DC';

interface LaptopFiltersProps {
  month: string;
  onMonthChange: (month: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  officeFilter: OfficeFilter;
  onOfficeChange: (office: OfficeFilter) => void;
}

const statusOptions: StatusFilter[] = ['All', 'Open', 'Completed'];
const officeOptions: { value: OfficeFilter; label: string; color: string }[] = [
  { value: 'NYC', label: 'NYC', color: '#00d9ff' },
  { value: 'SF', label: 'SF', color: '#ff4fd8' },
  { value: 'DC', label: 'DC', color: '#7dff9e' },
];

export default function LaptopFilters({
  month,
  onMonthChange,
  statusFilter,
  onStatusChange,
  officeFilter,
  onOfficeChange,
}: LaptopFiltersProps) {
  const currentMonth = format(new Date(), 'yyyy-MM');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="flex flex-col gap-3 p-3 md:p-4 rounded-xl bg-glass backdrop-blur-xl border border-glass-border"
    >
      {/* Top row: month + status */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Month selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const d = new Date(month + '-01');
              d.setMonth(d.getMonth() - 1);
              onMonthChange(format(d, 'yyyy-MM'));
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:text-cyan hover:bg-cyan-dim transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="relative">
            <input
              type="month"
              value={month || currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="appearance-none bg-input border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-text-primary font-mono cursor-pointer focus:outline-none focus:border-cyan focus:shadow-[0_0_0_3px_rgba(0,217,255,0.15)]"
            />
          </div>
          <button
            onClick={() => {
              const d = new Date(month + '-01');
              d.setMonth(d.getMonth() + 1);
              onMonthChange(format(d, 'yyyy-MM'));
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:text-cyan hover:bg-cyan-dim transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-all duration-150 active:scale-95',
                statusFilter === s
                  ? 'bg-cyan-dim text-cyan border border-cyan/30'
                  : 'bg-surface text-text-secondary border border-transparent hover:text-text-primary',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: office toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOfficeChange('All')}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium transition-all duration-150 active:scale-95',
            officeFilter === 'All'
              ? 'bg-cyan-dim text-cyan border border-cyan/30'
              : 'bg-surface text-text-secondary border border-transparent hover:text-text-primary',
          )}
        >
          All Offices
        </button>
        {officeOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => onOfficeChange(o.value)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 inline-flex items-center gap-1.5 border',
              officeFilter === o.value
                ? 'border-opacity-40'
                : 'border-transparent bg-surface text-text-secondary hover:text-text-primary',
            )}
            style={
              officeFilter === o.value
                ? {
                    color: o.color,
                    backgroundColor: o.color + '18',
                    borderColor: o.color + '60',
                  }
                : undefined
            }
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: o.color }} />
            {o.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
