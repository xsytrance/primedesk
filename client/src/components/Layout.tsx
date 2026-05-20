import { useTheme } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/sonner';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  showTopBar?: boolean;
}

export default function Layout({ children, showTopBar = true }: LayoutProps) {
  const { theme } = useTheme();

  const getPattern = () => {
    switch (theme.effects.patternType) {
      case 'web':
        return (
          <>
            <div
              className="fixed inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: `linear-gradient(var(--theme-primary) 1px, transparent 1px), linear-gradient(90deg, var(--theme-primary) 1px, transparent 1px), linear-gradient(45deg, var(--theme-primary) 0.5px, transparent 0.5px)`,
                backgroundSize: '60px 60px, 60px 60px, 84px 84px',
                opacity: 0.03,
              }}
            />
            <div
              className="fixed inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `linear-gradient(-45deg, var(--theme-primary) 0.5px, transparent 0.5px)`,
                backgroundSize: '84px 84px',
                opacity: 0.02,
              }}
            />
          </>
        );
      case 'dots':
        return (
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(var(--theme-primary) 1px, transparent 0)',
              backgroundSize: '14px 14px',
              opacity: 0.04,
            }}
          />
        );
      default:
        return (
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(var(--theme-primary) 1px, transparent 1px), linear-gradient(90deg, var(--theme-primary) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
              opacity: 0.03,
            }}
          />
        );
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden overflow-y-visible">
      {/* Layer 1: Base gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)' }}
      />

      {/* Layer 2: Blurred color blobs — theme-aware */}
      <div
        className="fixed inset-0 pointer-events-none animate-drift"
        style={{
          background: 'radial-gradient(600px circle at 20% 30%, var(--theme-blob-1), transparent)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none animate-drift-reverse"
        style={{
          background: 'radial-gradient(500px circle at 80% 70%, var(--theme-blob-2), transparent)',
        }}
      />

      {/* Layer 3: Pattern — theme-aware */}
      {getPattern()}

      {/* Layer 4: Noise + scanlines */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: 'url(/noise-texture.svg)',
          backgroundRepeat: 'repeat',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }}
      />

      {/* Layer 5: Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, #0a0a0f 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100dvh]">
        <BottomNav />

        {/* Main content area */}
        <main className="flex-1 md:ml-[72px] overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {showTopBar && <TopBar />}
            <div
              className="px-4 md:px-6 lg:px-8"
              style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)' }}
            >
              {children}
            </div>
          </div>
        </main>
      </div>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#12121a',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#e8e8f0',
          },
        }}
      />
    </div>
  );
}
