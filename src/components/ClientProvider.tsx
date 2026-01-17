'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function ClientProvider({ children }: { children: ReactNode }) {
  const { login } = useAuthStore();

  useEffect(() => {
    // Initialize auth on client side
    login('demo@example.com', 'demo').catch(() => {
      // Silent fail - will show on dashboard
    });
  }, [login]);

  return children;
}
