'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { PropertyComposerTunnel } from '../PropertyComposerTunnel';

interface PageProps {
  params: { locale: string };
}

export default function NewPropertyPage({ params }: PageProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = !!user && (user.role === 'admin' || user.role === 'superadmin');

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (isAuthenticated && !isAdmin) {
      router.replace(`/${locale}/wallet`);
    }
  }, [isAuthenticated, isAdmin, router, locale]);

  if (!isAuthenticated || !user || !isAdmin) {
    return null;
  }

  return (
    <PropertyComposerTunnel
      mode="create"
      onCancel={() => router.push(`/${locale}/admin`)}
      onSuccess={() => router.push(`/${locale}/admin`)}
      isSuperAdmin={user.role === 'superadmin'}
    />
  );
}



