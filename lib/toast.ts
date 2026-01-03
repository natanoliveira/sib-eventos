import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export function showToast(type: ToastType, message: string, description?: string) {
  const common = {
    description,
    duration: 4000,
  };

  switch (type) {
    case 'success':
      return toast.success(message, common);
    case 'error':
      return toast.error(message, common);
    case 'warning':
      return toast.warning(message, common);
    default:
      return toast(message, common);
  }
}
