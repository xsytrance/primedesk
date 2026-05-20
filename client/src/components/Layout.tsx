import { Toaster } from '@/components/ui/sonner';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  showTopBar?: boolean;
}

export default function Layout({ children, showTopBar = true }: LayoutProps) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* Layer 1: Base gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)' }}
      />

      {/* Layer 2: Blurred color blobs */}
      <div
        className="fixed inset-0 pointer-events-none animate-drift"
        style={{
          background: 'radial-gradient(600px circle at 20% 30%, rgba(0,217,255,0.08), transparent)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none animate-drift-reverse"
        style={{
          background: 'radial-gradient(500px circle at 80% 70%, rgba(255,79,216,0.06), transparent)',
        }}
      />

      {/* Layer 3: Tactical grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

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
