import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { Pencil, Trash2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/GlassCard';
import type { Laptop } from '@/data/mock';

interface LaptopCardProps {
  laptop: Laptop;
  index: number;
  onToggleComplete: (id: number) => void;
  onEdit: (laptop: Laptop) => void;
  onDelete: (id: number) => void;
}

const officeShortCode = {
  'New York City': 'NYC',
  'San Francisco': 'SF',
  'Washington DC': 'DC',
} as const;

const officeColors = {
  'New York City': '#00d9ff',
  'San Francisco': '#ff4fd8',
  'Washington DC': '#7dff9e',
} as const;

const stageColors: Record<string, string> = {
  acquire: '#00d9ff',
  configure: '#ff4fd8',
  ship: '#7dff9e',
};

const stageLabels: Record<string, string> = {
  acquire: 'Acquiring',
  configure: 'Configuring',
  ship: 'Shipping',
};

export default function LaptopCard({ laptop, index, onToggleComplete, onEdit, onDelete }: LaptopCardProps) {
  const [celebrate, setCelebrate] = useState(false);

  const isCompleted = laptop.status === 'Completed';
  const dueDate = parseISO(laptop.due_date);
  const isOverdue = !isCompleted && isPast(dueDate) && !isToday(dueDate);
  const isDueSoon = !isCompleted && !isOverdue && !isPast(dueDate);
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const showSoonBadge = isDueSoon && daysUntilDue <= 3 && daysUntilDue >= 0;

  const officeColor = officeColors[laptop.office];
  const stageKey = laptop.stage || 'acquire';
  const stageColor = stageColors[stageKey] || officeColor;
  const stageLabel = isCompleted ? 'Completed' : stageLabels[stageKey] || 'Acquiring';

  const handleToggle = () => {
    if (!isCompleted) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 800);
    }
    onToggleComplete(laptop.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: isCompleted ? 0.5 : 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      layout
      className="relative"
    >
      {/* Completion celebration flash */}
      {celebrate && (
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          style={{ boxShadow: `0 0 40px ${stageColor}40, inset 0 0 20px ${stageColor}20` }}
        />
      )}

      <GlassCard
        className={cn(
          'relative overflow-hidden',
          isOverdue && 'shadow-[0_0_20px_rgba(255,77,106,0.15)]',
        )}
      >
        <div className="p-3 md:p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={handleToggle}
              className={cn(
                'mt-0.5 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-90',
                isCompleted
                  ? 'bg-green border-green'
                  : 'border-text-muted hover:border-cyan',
              )}
            >
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Check size={14} className="text-bg-base" strokeWidth={3} />
                </motion.div>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className={cn(
                    'text-sm font-medium text-text-primary',
                    isCompleted && 'line-through decoration-text-muted',
                  )}
                >
                  {laptop.laptop_tag}
                </h4>
                {/* Action type badge */}
                <span
                  className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: laptop.action_type === 'send' ? 'rgba(0,217,255,0.12)' : 'rgba(255,79,216,0.12)',
                    color: laptop.action_type === 'send' ? '#00d9ff' : '#ff4fd8',
                  }}
                >
                  {laptop.action_type}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary flex-wrap">
                <span>{laptop.assignee_name}</span>
                <span className="text-text-muted">|</span>
                {/* Due date with overdue highlighting */}
                <span className="flex items-center gap-1">
                  {isOverdue && <AlertCircle size={12} className="text-red flex-shrink-0" />}
                  <span
                    className={cn(
                      isOverdue && 'text-red font-medium',
                      showSoonBadge && 'text-amber',
                    )}
                  >
                    {isCompleted
                      ? `Done: ${laptop.completed_at ? format(parseISO(laptop.completed_at), 'MMM d') : 'N/A'}`
                      : `Due: ${format(dueDate, 'MMM d')}`}
                  </span>
                </span>
                <span className="text-text-muted">|</span>
                {/* Stage badge */}
                <span
                  className="text-[10px] font-mono uppercase tracking-wide"
                  style={{ color: stageColor }}
                >
                  {stageLabel}
                </span>
              </div>

              {/* Office + Actions row */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Office badge */}
                  <span className="inline-flex items-center gap-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: officeColor }} />
                    <span className="font-mono" style={{ color: officeColor }}>
                      {officeShortCode[laptop.office]}
                    </span>
                  </span>

                  {/* Overdue badge */}
                  {isOverdue && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-red-dim text-red border border-red/30">
                      Overdue
                    </span>
                  )}

                  {/* Soon badge */}
                  {showSoonBadge && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/30">
                      {daysUntilDue === 0 ? 'Today' : `${daysUntilDue}d`}
                    </span>
                  )}
                </div>

                {/* Edit/Delete actions - desktop always visible, mobile on hover/tap */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(laptop)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-cyan hover:bg-cyan-dim transition-all active:scale-90"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(laptop.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red hover:bg-red-dim transition-all active:scale-90"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Notes preview */}
              {laptop.notes && (
                <p className="mt-1.5 text-xs text-text-muted line-clamp-1">
                  {laptop.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
