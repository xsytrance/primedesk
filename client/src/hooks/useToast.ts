import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  description?: string;
  duration?: number;
}

export function useToast() {
  const showToast = (message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const { description, duration = 4000 } = options || {};
    switch (type) {
      case 'success':
        sonnerToast.success(message, { description, duration });
        break;
      case 'error':
        sonnerToast.error(message, { description, duration });
        break;
      case 'warning':
        sonnerToast.warning(message, { description, duration });
        break;
      default:
        sonnerToast(message, { description, duration });
    }
  };

  return { showToast, toast: sonnerToast };
}
