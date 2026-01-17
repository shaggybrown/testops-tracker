'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function ClientProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const { login } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
    // Initialize auth on client side
    login('demo@example.com', 'demo').catch(() => {
      // Silent fail - will show on dashboard
    });
  }, [login]);

  if (!isClient) {
    return null;
  }

  return children;
}
