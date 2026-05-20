import { cn } from '@/lib/utils';

interface OfficeBadgeProps {
  office: 'NYC' | 'SF' | 'DC';
  showLabel?: boolean;
  className?: string;
}

const officeConfig = {
  NYC: { label: 'NYC', color: '#00d9ff' },
  SF: { label: 'SF', color: '#ff4fd8' },
  DC: { label: 'DC', color: '#7dff9e' },
};

export default function OfficeBadge({ office, showLabel = true, className }: OfficeBadgeProps) {
  const config = officeConfig[office];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {showLabel && (
        <span className="text-xs font-mono" style={{ color: config.color }}>
          {config.label}
        </span>
      )}
    </span>
  );
}
