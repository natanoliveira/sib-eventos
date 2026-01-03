import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

/**
 * Função genérica de toast para uso em todo o projeto
 * @param type - Tipo do toast (success, error, info, warning)
 * @param message - Mensagem principal
 * @param options - Opções adicionais (título, descrição, duração)
 */
export function toast(
  type: ToastType,
  message: string,
  options?: ToastOptions
) {
  const { title, description, duration = 4000 } = options || {};

  switch (type) {
    case 'success':
      sonnerToast.success(title || message, {
        description: description || (title ? message : undefined),
        duration,
      });
      break;
    case 'error':
      sonnerToast.error(title || message, {
        description: description || (title ? message : undefined),
        duration,
      });
      break;
    case 'warning':
      sonnerToast.warning(title || message, {
        description: description || (title ? message : undefined),
        duration,
      });
      break;
    case 'info':
      sonnerToast.info(title || message, {
        description: description || (title ? message : undefined),
        duration,
      });
      break;
    default:
      sonnerToast(message, { duration });
  }
}

// Exportar funções auxiliares para uso mais conveniente
export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast('success', message, options);

export const toastError = (message: string, options?: ToastOptions) =>
  toast('error', message, options);

export const toastWarning = (message: string, options?: ToastOptions) =>
  toast('warning', message, options);

export const toastInfo = (message: string, options?: ToastOptions) =>
  toast('info', message, options);
