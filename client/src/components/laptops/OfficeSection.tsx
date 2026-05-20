import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin } from 'lucide-react';

import GlassCard from '@/components/GlassCard';
import LaptopCard from './LaptopCard';
import type { Laptop } from '@/data/mock';

interface OfficeSectionProps {
  officeName: string;
  officeKey: string;
  color: string;
  laptops: Laptop[];
  onToggleComplete: (id: number) => void;
  onEdit: (laptop: Laptop) => void;
  onDelete: (id: number) => void;
  defaultExpanded?: boolean;
}

export default function OfficeSection({
  officeName,
  officeKey,
  color,
  laptops,
  onToggleComplete,
  onEdit,
  onDelete,
  defaultExpanded = true,
}: OfficeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const total = laptops.length;
  const completed = laptops.filter((l) => l.status === 'Completed').length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  // Sort: overdue first, then by due date, completed items last
  const sorted = [...laptops].sort((a, b) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <motion.div
      data-office={officeKey}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
    >
      <GlassCard topGlow={color}>
        {/* Section Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 md:p-4 text-left active:scale-[0.995] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <MapPin size={16} style={{ color }} />
            <span
              className="font-display text-xs md:text-sm uppercase tracking-wider font-bold"
              style={{ color }}
            >
              {officeName}
            </span>
            {/* Task count badge */}
            <span
              className="text-[10px] md:text-xs font-mono px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: color + '18',
                color,
              }}
            >
              {total} {total === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mini progress bar */}
            {total > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-16 md:w-20 h-1 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-text-secondary">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            )}

            {/* Chevron */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-text-muted"
            >
              <ChevronDown size={16} />
            </motion.div>
          </div>
        </button>

        {/* Task List */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              className="overflow-hidden"
            >
              {sorted.length > 0 ? (
                <div className="px-2 pb-2 md:px-3 md:pb-3 space-y-1.5">
                  {sorted.map((laptop, idx) => (
                    <LaptopCard
                      key={laptop.id}
                      laptop={laptop}
                      index={idx}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 pb-4 text-center">
                  <p className="text-sm text-text-muted py-4">
                    No laptop tasks for this office
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}
