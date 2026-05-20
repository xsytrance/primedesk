import { Toaster } from '@/components/ui/sonner';

export default function Toast() {
  return (
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
  );
}
