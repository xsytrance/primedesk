import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradientBorder?: boolean;
  topGlow?: string;
  className?: string;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, gradientBorder = false, topGlow, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative backdrop-blur-xl',
          'bg-[rgba(18,18,26,0.72)] border border-[rgba(255,255,255,0.06)]',
          'transition-all duration-200',
          'hover:shadow-[0_0_30px_var(--theme-primary-glow)] hover:scale-[1.005]',
          gradientBorder && 'p-[1px] overflow-hidden',
          className,
        )}
        style={{
          borderRadius: 'var(--theme-border-radius)',
          ...props.style,
        }}
        {...props}
      >
        {gradientBorder ? (
          <>
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: 'linear-gradient(135deg, var(--theme-primary-glow), var(--theme-secondary-glow, var(--theme-secondary-dim)))',
                borderRadius: 'var(--theme-border-radius)',
              }}
            />
            <div
              className="relative bg-[rgba(18,18,26,0.85)] backdrop-blur-xl"
              style={{ borderRadius: 'calc(var(--theme-border-radius) - 1px)' }}
            >
              {topGlow && (
                <div
                  className="absolute top-0 left-4 right-4 h-[1px]"
                  style={{ background: `linear-gradient(to right, transparent, ${topGlow}, transparent)` }}
                />
              )}
              {!topGlow && (
                <div
                  className="absolute top-0 left-4 right-4 h-[1px]"
                  style={{ background: 'linear-gradient(to right, transparent, var(--theme-primary), transparent)' }}
                />
              )}
              {children}
            </div>
          </>
        ) : (
          <>
            {topGlow && (
              <div
                className="absolute top-0 left-4 right-4 h-[1px]"
                style={{ background: `linear-gradient(to right, transparent, ${topGlow}, transparent)` }}
              />
            )}
            {!topGlow && (
              <div
                className="absolute top-0 left-4 right-4 h-[1px]"
                style={{ background: 'linear-gradient(to right, transparent, var(--theme-primary), transparent)' }}
              />
            )}
            {children}
          </>
        )}
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
