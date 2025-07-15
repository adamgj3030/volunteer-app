'use client';

import { toast } from 'sonner';

type NotifyVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

type NotifyArgs = {
  title: string;
  description?: string;
  variant?: NotifyVariant;
};

export function Notify({ title, description, variant = 'default' }: NotifyArgs) {
  const variantMap: Record<NotifyVariant, (msg: string, opts?: any) => void> = {
    default: toast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    loading: toast.loading,
  };

  variantMap[variant](title, { description });
}