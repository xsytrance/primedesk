import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const CATEGORIES = ['All', 'Hardware', 'Network', 'Software', 'Procedures', 'Security', 'Infrastructure', 'Process', 'Troubleshooting'];

const categoryColors: Record<string, string> = {
  Hardware: 'text-cyan border-cyan/30 bg-cyan/10',
  Network: 'text-magenta border-magenta/30 bg-magenta/10',
  Software: 'text-green border-green/30 bg-green/10',
  Procedures: 'text-amber border-amber/30 bg-amber/10',
  Security: 'text-red border-red/30 bg-red/10',
  Infrastructure: 'text-cyan border-cyan/30 bg-cyan/10',
  Process: 'text-amber border-amber/30 bg-amber/10',
  Troubleshooting: 'text-amber border-amber/30 bg-amber/10',
};

interface ArticleFiltersProps {
  active: string;
  onChange: (cat: string) => void;
  counts: Record<string, number>;
}

export default function ArticleFilters({ active, onChange, counts }: ArticleFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-4 px-4">
      {CATEGORIES.map((cat, i) => {
        const isActive = active === cat;
        const count = counts[cat] || 0;
        return (
          <motion.button
            key={cat}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            onClick={() => onChange(cat)}
            className={cn(
              'flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 whitespace-nowrap border',
              isActive
                ? categoryColors[cat] || 'text-cyan border-cyan/30 bg-cyan/10'
                : 'border-transparent bg-bg-surface text-text-secondary hover:text-text-primary'
            )}
          >
            {cat} {count > 0 && <span className="text-text-muted ml-1">({count})</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
