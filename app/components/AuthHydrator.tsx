'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export const AuthHydrator = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth().catch(() => undefined);
  }, [checkAuth]);

  return null;
};


