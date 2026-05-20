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
          'relative rounded-2xl backdrop-blur-xl',
          'bg-[rgba(18,18,26,0.72)] border border-[rgba(255,255,255,0.06)]',
          'transition-all duration-200',
          'hover:shadow-[0_0_30px_rgba(0,217,255,0.08)] hover:scale-[1.005]',
          gradientBorder && 'p-[1px] overflow-hidden',
          className,
        )}
        {...props}
      >
        {gradientBorder ? (
          <>
            <div
              className="absolute inset-0 rounded-2xl opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgba(0,217,255,0.5), rgba(255,79,216,0.5), rgba(125,255,158,0.5))',
              }}
            />
            <div className="relative rounded-2xl bg-[rgba(18,18,26,0.85)] backdrop-blur-xl">
              {topGlow && (
                <div
                  className="absolute top-0 left-4 right-4 h-[1px]"
                  style={{ background: `linear-gradient(to right, transparent, ${topGlow}, transparent)` }}
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
            {children}
          </>
        )}
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
