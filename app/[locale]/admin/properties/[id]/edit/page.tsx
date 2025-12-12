'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { propertiesApi, type PropertyRecord } from '@/lib/api/properties';
import { PropertyComposerTunnel } from '../../PropertyComposerTunnel';
import { propertyTunnelStyles } from '../../propertyTunnel.styles';

interface PageProps {
  params: { locale: string; id: string };
}

export default function EditPropertyPage({ params }: PageProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('adminPropertyTunnel');
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = !!user && (user.role === 'admin' || user.role === 'superadmin');
  const [property, setProperty] = useState<PropertyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (isAuthenticated && !isAdmin) {
      router.replace(`/${locale}/wallet`);
    }
  }, [isAuthenticated, isAdmin, router, locale]);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setIsLoading(true);
        const detail = await propertiesApi.get(params.id);
        setProperty(detail);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Unable to load property');
      } finally {
        setIsLoading(false);
      }
    };
    if (isAdmin) {
      loadProperty();
    }
  }, [isAdmin, params.id]);

  if (!isAuthenticated || !user || !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <main className={propertyTunnelStyles.container}>
        <div className={propertyTunnelStyles.loadingState}>{t('messages.loading')}</div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className={propertyTunnelStyles.container}>
        <div className={propertyTunnelStyles.loadingState}>{error || t('messages.error')}</div>
      </main>
    );
  }

  return (
    <PropertyComposerTunnel
      mode="edit"
      initialProperty={property}
      onCancel={() => router.push(`/${locale}/admin`)}
      onSuccess={() => router.push(`/${locale}/admin`)}
      isSuperAdmin={user.role === 'superadmin'}
    />
  );
}

