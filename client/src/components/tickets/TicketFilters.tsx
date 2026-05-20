import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type StatusFilter = 'All' | 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed' | 'My Tickets';
export type PriorityFilter = 'All' | 'Soon' | 'Later' | 'Whenever';

interface TicketFiltersProps {
  activeStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  activePriority: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  statusCounts: Record<string, number>;
}

const statusFilters: StatusFilter[] = ['All', 'Open', 'My Tickets', 'In Progress', 'Pending', 'Resolved', 'Closed'];

const priorityFilters: PriorityFilter[] = ['All', 'Soon', 'Later', 'Whenever'];

export default function TicketFilters({
  activeStatus,
  onStatusChange,
  activePriority,
  onPriorityChange,
  statusCounts,
}: TicketFiltersProps) {
  return (
    <div className="space-y-2">
      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {statusFilters.map((filter, i) => (
          <motion.button
            key={filter}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.25,
              delay: i * 0.04,
              ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatusChange(filter)}
            className={cn(
              'flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap',
              activeStatus === filter
                ? 'bg-cyan-dim text-cyan border border-cyan/30'
                : 'bg-bg-surface text-text-secondary border border-transparent hover:text-text-primary',
            )}
          >
            {filter}
            {filter !== 'All' && filter !== 'My Tickets' && statusCounts[filter] !== undefined && (
              <span className={cn(
                'ml-1.5 text-xs',
                activeStatus === filter ? 'text-cyan/70' : 'text-text-muted',
              )}>
                ({statusCounts[filter]})
              </span>
            )}
            {filter === 'All' && statusCounts['total'] !== undefined && (
              <span className={cn(
                'ml-1.5 text-xs',
                activeStatus === filter ? 'text-cyan/70' : 'text-text-muted',
              )}>
                ({statusCounts['total']})
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Priority filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {priorityFilters.map((filter, i) => (
          <motion.button
            key={filter}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.25,
              delay: i * 0.04 + 0.2,
              ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPriorityChange(filter)}
            className={cn(
              'flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap',
              activePriority === filter
                ? 'bg-cyan-dim text-cyan border border-cyan/30'
                : 'bg-bg-surface text-text-secondary border border-transparent hover:text-text-primary',
            )}
          >
            {filter}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
