import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  fallback?: string;
  alt?: string;
  size?: number;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

export default function Avatar({
  src,
  fallback = 'U',
  alt = 'Avatar',
  size = 40,
  borderColor = '#00d9ff',
  className,
  onClick,
}: AvatarProps) {
  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0',
        'flex items-center justify-center',
        onClick && 'cursor-pointer active:scale-95 transition-transform',
        className,
      )}
      style={{
        width: size,
        height: size,
        border: `2px solid ${borderColor}`,
      }}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
      <div
        className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm"
        style={{
          background: `linear-gradient(135deg, ${borderColor}22, ${borderColor}44)`,
          color: borderColor,
          display: src ? 'none' : 'flex',
        }}
      >
        {fallback}
      </div>
      {/* Fallback when image fails to load */}
      <div
        className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm"
        style={{
          background: `linear-gradient(135deg, ${borderColor}22, ${borderColor}44)`,
          color: borderColor,
        }}
        id={`avatar-fallback-${fallback}`}
      >
        {fallback}
      </div>
    </div>
  );
}
