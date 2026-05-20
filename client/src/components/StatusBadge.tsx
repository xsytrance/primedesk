import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, { color: string; bg: string; border: string }> = {
  Open: { color: 'text-cyan', bg: 'bg-cyan/10', border: 'border-cyan/40' },
  'In Progress': { color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/40' },
  Pending: { color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/40' },
  Resolved: { color: 'text-green', bg: 'bg-green/10', border: 'border-green/40' },
  Closed: { color: 'text-text-secondary', bg: 'bg-text-muted/10', border: 'border-text-muted/40' },
  Critical: { color: 'text-red', bg: 'bg-red/10', border: 'border-red/40' },
  acquire: { color: 'text-cyan', bg: 'bg-cyan/10', border: 'border-cyan/40' },
  configure: { color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/40' },
  ship: { color: 'text-magenta', bg: 'bg-magenta/10', border: 'border-magenta/40' },
  delivered: { color: 'text-green', bg: 'bg-green/10', border: 'border-green/40' },
  Online: { color: 'text-green', bg: 'bg-green/10', border: 'border-green/40' },
  Degraded: { color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/40' },
  Offline: { color: 'text-red', bg: 'bg-red/10', border: 'border-red/40' },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles['Closed'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full',
        'text-xs font-medium font-body',
        'border',
        style.color,
        style.bg,
        style.border,
        className,
      )}
    >
      <span className="w-[6px] h-[6px] rounded-full animate-pulse-dot" style={{ backgroundColor: 'currentColor' }} />
      {status}
    </span>
  );
}
