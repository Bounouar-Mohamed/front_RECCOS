'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { Locale } from 'date-fns';
import { arSA, enUS, fr as frLocale } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';
import {
  propertiesApi,
  type PropertyRecord,
  type PropertyStatus,
  type PropertyStats,
} from '@/lib/api/properties';
import { Select } from '@/app/ui/select';
import { adminDashboardStyles } from './adminDashboard.styles';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { developerBrandsApi, type DeveloperBrand } from '@/lib/api/developer-brands';

type InvestorProfile = {
  name: string;
  email?: string;
  shares?: number;
  amount?: number;
  joinedAt?: string;
};

type AdminProperty = PropertyRecord & {
  investors: InvestorProfile[];
  investorCount: number;
};

const STATUS_ORDER: PropertyStatus[] = [
  'draft',
  'pending',
  'upcoming',
  'published',
  'sold',
  'rejected',
  'archived',
];

const PROPERTY_TYPES = [
  'apartment',
  'villa',
  'townhouse',
  'penthouse',
  'studio',
  'land',
  'commercial',
] as const;

const EMIRATES = [
  'dubai',
  'abu_dhabi',
  'sharjah',
  'ajman',
  'umm_al_quwain',
  'ras_al_khaimah',
  'fujairah',
] as const;

const statusClassMap: Record<PropertyStatus, string> = {
  draft: adminDashboardStyles.statusDraft,
  pending: adminDashboardStyles.statusPending,
  upcoming: adminDashboardStyles.statusUpcoming,
  published: adminDashboardStyles.statusPublished,
  sold: adminDashboardStyles.statusSold,
  rejected: adminDashboardStyles.statusRejected,
  archived: adminDashboardStyles.statusArchived,
};

const dateLocales: Record<string, Locale> = {
  fr: frLocale,
  en: enUS,
  ar: arSA,
};

const enhanceProperty = (property: PropertyRecord): AdminProperty => {
  const metadata = property.metadata ?? {};
  const rawInvestors = Array.isArray(metadata.investors) ? metadata.investors : [];
  const investors: InvestorProfile[] = rawInvestors.map((entry: any, index: number) => {
    if (typeof entry === 'string') {
      return { name: entry };
    }
    if (entry && typeof entry === 'object') {
      return {
        name: entry.name || `Investor ${index + 1}`,
        email: entry.email,
        shares: typeof entry.shares === 'number' ? entry.shares : undefined,
        amount: typeof entry.amount === 'number' ? entry.amount : undefined,
        joinedAt: entry.joinedAt,
      };
    }
    return { name: `Investor ${index + 1}` };
  });

  const metadataCount =
    Number(metadata.investorCount) ||
    Number(metadata.investorsCount) ||
    Number(metadata.investors_count) ||
    0;
  const fallbackCount =
    investors.length ||
    (property.soldShares > 0 ? Math.max(1, Math.round(property.soldShares / 50)) : 0);

  return {
    ...property,
    investors,
    investorCount: metadataCount || fallbackCount,
  };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('adminDashboard');
  const { user, isAuthenticated } = useAuthStore();
  const dateLocale = dateLocales[locale] ?? enUS;

  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<AdminProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | (typeof PROPERTY_TYPES)[number]>('all');
  const [emirateFilter, setEmirateFilter] = useState<'all' | (typeof EMIRATES)[number]>('all');
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [workflowAction, setWorkflowAction] = useState<'publish' | 'reject' | 'delete' | null>(null);
  const [workflowTarget, setWorkflowTarget] = useState<AdminProperty | null>(null);
  const [developerBrands, setDeveloperBrands] = useState<DeveloperBrand[]>([]);
  const [areBrandsLoading, setAreBrandsLoading] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [brandForm, setBrandForm] = useState<{ id: string | null; name: string; logoUrl: string }>({
    id: null,
    name: '',
    logoUrl: '',
  });
  const [brandError, setBrandError] = useState<string | null>(null);
  const [brandSuccess, setBrandSuccess] = useState<string | null>(null);

  const pageSize = 8;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push(`/${locale}/login`);
      return;
    }
    if (isAuthenticated && user && !isAdmin) {
      router.push(`/${locale}/wallet`);
    }
  }, [isAuthenticated, user, isAdmin, router, locale]);

  const fetchProperties = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertiesApi.list({
        page,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        propertyType: typeFilter === 'all' ? undefined : typeFilter,
        emirate: emirateFilter === 'all' ? undefined : emirateFilter,
        search: searchValue ? searchValue.trim() : undefined,
      });
      const normalized = response.properties.map(enhanceProperty);
      setProperties(normalized);
      setTotal(response.total);
      setSelectedProperty((prev) => {
        if (!normalized.length) {
          return null;
        }
        if (prev) {
          const stillExists = normalized.find((item) => item.id === prev.id);
          if (stillExists) {
            return stillExists;
          }
        }
        // Ne pas sélectionner automatiquement une propriété au chargement initial
        return null;
      });
    } catch (err: any) {
      setError(err.message || t('errors.fetch'));
    } finally {
      setIsLoading(false);
    }
  }, [
    emirateFilter,
    isAdmin,
    isAuthenticated,
    page,
    pageSize,
    searchValue,
    statusFilter,
    t,
    typeFilter,
  ]);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    setIsStatsLoading(true);
    try {
      const newStats = await propertiesApi.stats();
      setStats(newStats);
    } catch (err) {
      console.error('[AdminDashboard] Unable to load stats', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [isAdmin, isAuthenticated]);

  const fetchDeveloperBrands = useCallback(async () => {
    if (!isAuthenticated || !isSuperAdmin) {
      setDeveloperBrands([]);
      return;
    }
    try {
      setAreBrandsLoading(true);
      const list = await developerBrandsApi.list();
      setDeveloperBrands(list);
      setBrandError(null);
    } catch (err: any) {
      setBrandError(err.message || t('brands.errors.fetch'));
    } finally {
      setAreBrandsLoading(false);
    }
  }, [isAuthenticated, isSuperAdmin, t]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchDeveloperBrands();
  }, [fetchDeveloperBrands]);

  const handleBrandInputChange = (field: 'name' | 'logoUrl', value: string) => {
    setBrandForm((prev) => ({ ...prev, [field]: value }));
    setBrandError(null);
    setBrandSuccess(null);
  };

  const handleBrandEdit = (brand: DeveloperBrand) => {
    setBrandForm({
      id: brand.id,
      name: brand.name,
      logoUrl: brand.logoUrl ?? '',
    });
    setBrandError(null);
    setBrandSuccess(null);
  };

  const handleBrandReset = () => {
    setBrandForm({ id: null, name: '', logoUrl: '' });
    setBrandError(null);
    setBrandSuccess(null);
  };

  const handleBrandSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = brandForm.name.trim();
    if (!trimmedName) {
      setBrandError(t('brands.errors.nameRequired'));
      return;
    }
    const normalizedLogo = brandForm.logoUrl.trim();
    const wasEditing = Boolean(brandForm.id);

    setBrandError(null);
    setBrandSuccess(null);
    setIsSavingBrand(true);
    try {
      if (wasEditing && brandForm.id) {
        await developerBrandsApi.update(brandForm.id, {
          name: trimmedName,
          logoUrl: brandForm.logoUrl.length === 0 ? null : normalizedLogo || null,
        });
      } else {
        await developerBrandsApi.create({
          name: trimmedName,
          logoUrl: normalizedLogo ? normalizedLogo : undefined,
        });
      }
      await fetchDeveloperBrands();
      setBrandForm({ id: null, name: '', logoUrl: '' });
      setBrandSuccess(
        wasEditing ? t('brands.feedback.updated') : t('brands.feedback.created'),
      );
    } catch (err: any) {
      setBrandError(err.message || t('brands.errors.save'));
    } finally {
      setIsSavingBrand(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilter, typeFilter, emirateFilter]);

  const investorsMetric = useMemo(() => {
    return properties.reduce((acc, item) => acc + (item.investorCount || 0), 0);
  }, [properties]);

  const totalVolume = useMemo(() => {
    return properties.reduce((acc, item) => acc + item.pricePerShare * item.totalShares, 0);
  }, [properties]);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'AED',
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.status.all') },
      ...STATUS_ORDER.map((value) => ({
        value,
        label: t(`statuses.${value}`),
      })),
    ],
    [t],
  );

  const typeOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.type.all') },
      ...PROPERTY_TYPES.map((value) => ({
        value,
        label: t(`propertyTypes.${value}`),
      })),
    ],
    [t],
  );

  const emirateOptions = useMemo(
    () => [
      { value: 'all', label: t('filters.emirate.all') },
      ...EMIRATES.map((value) => ({
        value,
        label: t(`emirates.${value}`),
      })),
    ],
    [t],
  );

  const handleResetFilters = () => {
    setSearchValue('');
    setStatusFilter('all');
    setTypeFilter('all');
    setEmirateFilter('all');
  };

  const handleOpenCreate = () => {
    router.push(`/${locale}/admin/properties/new`);
  };

  const handleOpenEdit = (property: AdminProperty) => {
    router.push(`/${locale}/admin/properties/${property.id}/edit`);
  };

  const handleWorkflow = (action: 'publish' | 'reject' | 'delete', property: AdminProperty) => {
    if (action === 'delete') {
      // Pour la suppression, on ouvre directement la modal de confirmation
      setWorkflowAction(action);
      setWorkflowTarget(property);
    } else {
      // Pour publier/rejeter, on ouvre la modal de workflow normale
      setWorkflowAction(action);
      setWorkflowTarget(property);
    }
  };

  const handleWorkflowConfirm = async (payload?: { reason?: string; notes?: string }) => {
    if (!workflowAction || !workflowTarget) {
      return;
    }
    try {
      if (workflowAction === 'publish') {
        await propertiesApi.publish(workflowTarget.id, payload?.notes);
      }
      if (workflowAction === 'reject' && payload?.reason) {
        await propertiesApi.reject(workflowTarget.id, payload.reason);
      }
      if (workflowAction === 'delete') {
        await propertiesApi.remove(workflowTarget.id);
      }
      await fetchProperties();
      await fetchStats();
      // Fermer la modal de détails après une action réussie
      if (workflowAction === 'delete' || workflowAction === 'publish' || workflowAction === 'reject') {
        setSelectedProperty(null);
      }
    } catch (err: any) {
      setError(err.message || t('errors.action'));
    } finally {
      setWorkflowAction(null);
      setWorkflowTarget(null);
    }
  };

  if (!isAuthenticated || !user || !isAdmin) {
    return (
      <main className={adminDashboardStyles.container}>
        <div className={adminDashboardStyles.content}>
          <p>Chargement…</p>
        </div>
      </main>
    );
  }

  const statCards = [
    {
      key: 'total',
      label: t('stats.total'),
      value: isStatsLoading ? '—' : numberFormatter.format(stats?.total ?? 0),
    },
    {
      key: 'published',
      label: t('stats.published'),
      value: isStatsLoading ? '—' : numberFormatter.format(stats?.byStatus?.published ?? 0),
    },
    {
      key: 'pending',
      label: t('stats.pending'),
      value: isStatsLoading ? '—' : numberFormatter.format(stats?.byStatus?.pending ?? 0),
    },
    {
      key: 'investors',
      label: t('stats.investors'),
      value: numberFormatter.format(investorsMetric),
    },
    {
      key: 'volume',
      label: t('stats.volume'),
      value: currencyFormatter.format(totalVolume),
    },
  ];

  return (
    <main className={adminDashboardStyles.container}>
      <div className={adminDashboardStyles.content}>
        <section className={adminDashboardStyles.hero}>
          <div>
            <h1 className={adminDashboardStyles.heroTitle}>{t('title')}</h1>
            <p className={adminDashboardStyles.heroSubtitle}>{t('subtitle', { email: user.email })}</p>
            <div className={adminDashboardStyles.heroMeta}>
              <span>{t('meta.role', { role: user.role })}</span>
              <span>•</span>
              <span>{t('meta.propertiesVisible', { count: total })}</span>
            </div>
          </div>
          <div className={adminDashboardStyles.heroActions}>
            {isSuperAdmin && (
              <Link href={`/${locale}/admin/users`} className={adminDashboardStyles.ghostButton}>
                {t('actions.openUsers')}
              </Link>
            )}
            <button type="button" className={adminDashboardStyles.primaryButton} onClick={handleOpenCreate}>
              {t('actions.newProperty')}
            </button>
          </div>
        </section>

        <section className={adminDashboardStyles.statsGrid}>
          {statCards.map((card) => (
            <div key={card.key} className={adminDashboardStyles.statCard}>
              <span className={adminDashboardStyles.statLabel}>{card.label}</span>
              <span className={adminDashboardStyles.statValue}>{card.value}</span>
            </div>
          ))}
        </section>

        <section className={adminDashboardStyles.filtersCard}>
          <div className={adminDashboardStyles.filtersRow}>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t('filters.searchPlaceholder')}
              className={adminDashboardStyles.filterInput}
            />
            <div className={adminDashboardStyles.filterSelectWrapper}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | PropertyStatus)}
                options={statusOptions}
                variant="compact"
                className=""
                aria-label={t('filters.statusLabel')}
              />
            </div>
            <div className={adminDashboardStyles.filterSelectWrapper}>
              <Select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as 'all' | (typeof PROPERTY_TYPES)[number])
                }
                options={typeOptions}
                variant="compact"
                aria-label={t('filters.typeLabel')}
              />
            </div>
            <div className={adminDashboardStyles.filterSelectWrapper}>
              <Select
                value={emirateFilter}
                onChange={(e) =>
                  setEmirateFilter(e.target.value as 'all' | (typeof EMIRATES)[number])
                }
                options={emirateOptions}
                variant="compact"
                aria-label={t('filters.emirateLabel')}
              />
            </div>
          </div>
          <button type="button" className={adminDashboardStyles.ghostButton} onClick={handleResetFilters}>
            {t('filters.reset')}
          </button>
        </section>

        {isSuperAdmin && (
          <section className={adminDashboardStyles.brandsCard}>
            <div className={adminDashboardStyles.brandsHeader}>
              <div>
                <p className={adminDashboardStyles.brandsTitle}>{t('brands.title')}</p>
                <p className={adminDashboardStyles.brandsSubtitle}>{t('brands.subtitle')}</p>
              </div>
            </div>
            <div className={adminDashboardStyles.brandsContent}>
              <div className={adminDashboardStyles.brandList}>
                {areBrandsLoading ? (
                  <p className={adminDashboardStyles.brandListPlaceholder}>{t('brands.loading')}</p>
                ) : developerBrands.length === 0 ? (
                  <p className={adminDashboardStyles.brandListPlaceholder}>{t('brands.empty')}</p>
                ) : (
                  developerBrands.map((brand) => (
                    <div key={brand.id} className={adminDashboardStyles.brandItem}>
                      <div className={adminDashboardStyles.brandLogo}>
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} loading="lazy" />
                        ) : (
                          <span>{brand.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className={adminDashboardStyles.brandInfo}>
                        <span className={adminDashboardStyles.brandName}>{brand.name}</span>
                        <span className={adminDashboardStyles.brandMeta}>
                          {brand.logoUrl ? brand.logoUrl : t('brands.list.noLogo')}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={adminDashboardStyles.brandEditButton}
                        onClick={() => handleBrandEdit(brand)}
                      >
                        {t('brands.list.actions.edit')}
                      </button>
                    </div>
                  ))
                )}
              </div>
              <form className={adminDashboardStyles.brandForm} onSubmit={handleBrandSubmit}>
                <p className={adminDashboardStyles.brandFormTitle}>
                  {brandForm.id ? t('brands.form.editTitle') : t('brands.form.createTitle')}
                </p>
                <div className={adminDashboardStyles.brandFormGrid}>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(event) => handleBrandInputChange('name', event.target.value)}
                    placeholder={t('brands.form.namePlaceholder')}
                    className={adminDashboardStyles.brandFormInput}
                  />
                  <input
                    type="text"
                    value={brandForm.logoUrl}
                    onChange={(event) => handleBrandInputChange('logoUrl', event.target.value)}
                    placeholder={t('brands.form.logoPlaceholder')}
                    className={adminDashboardStyles.brandFormInput}
                  />
                </div>
                {brandError && <p className={adminDashboardStyles.brandFeedbackError}>{brandError}</p>}
                {brandSuccess && (
                  <p className={adminDashboardStyles.brandFeedbackSuccess}>{brandSuccess}</p>
                )}
                <div className={adminDashboardStyles.brandFormActions}>
                  <button type="submit" disabled={isSavingBrand}>
                    {isSavingBrand
                      ? t('brands.form.saving')
                      : brandForm.id
                        ? t('brands.form.update')
                        : t('brands.form.create')}
                  </button>
                  {brandForm.id && (
                    <button type="button" onClick={handleBrandReset}>
                      {t('brands.form.cancel')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        )}

        <section className={adminDashboardStyles.tableWrapper}>
          <div className={adminDashboardStyles.tableHeader}>
            <span className={adminDashboardStyles.tableTitle}>{t('table.title')}</span>
           
          </div>
          {error && <p className={adminDashboardStyles.errorText}>{error}</p>}
          <div className={adminDashboardStyles.tableScrollArea} data-lenis-prevent data-lenis-prevent-wheel>
            {isLoading ? (
              <p>{t('loading')}</p>
            ) : properties.length === 0 ? (
              <p>{t('empty')}</p>
            ) : (
              <table className={adminDashboardStyles.table}>
                <thead>
                  <tr>
                    <th className={adminDashboardStyles.theadCell}>{t('table.columns.asset')}</th>
                    <th className={adminDashboardStyles.theadCell}>{t('table.columns.status')}</th>
                    <th className={adminDashboardStyles.theadCell}>{t('table.columns.progress')}</th>
                    <th className={adminDashboardStyles.theadCell}>{t('table.columns.investors')}</th>
                    <th className={adminDashboardStyles.theadCell}>{t('table.columns.updated')}</th>
                    <th className={adminDashboardStyles.theadCell}>{t('table.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => {
                    const progress = Math.min(
                      100,
                      Math.round((property.soldShares / property.totalShares) * 100),
                    );
                    const isActive = selectedProperty?.id === property.id;
                    return (
                      <tr
                        key={property.id}
                        className={cn(adminDashboardStyles.row, isActive && adminDashboardStyles.rowActive)}
                        onClick={() => setSelectedProperty(property)}
                      >
                        <td className={cn(adminDashboardStyles.cell, adminDashboardStyles.assetCell)}>
                          <div className={adminDashboardStyles.assetImageWrapper}>
                            {(property.mainImage || property.images?.[0]) ? (
                              <img
                                src={property.mainImage || property.images?.[0] || ''}
                                alt={property.title}
                                className={adminDashboardStyles.assetImage}
                                loading="lazy"
                              />
                            ) : (
                              <span className={adminDashboardStyles.assetPlaceholder}>
                                {(property.title || '??').slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className={adminDashboardStyles.assetInfo}>
                            <span className={adminDashboardStyles.title}>{property.title}</span>
                            <span className={adminDashboardStyles.subtitle}>
                              {property.address || t('table.location', { zone: property.zone, emirate: t(`emirates.${property.emirate}`) })}
                            </span>
                          </div>
                        </td>
                        <td className={adminDashboardStyles.cell}>
                          {(() => {
                            const launchDate = property.availableAt ? new Date(property.availableAt) : null;
                            const isFutureLaunch = launchDate ? launchDate.getTime() > Date.now() : false;
                            const isUpcomingStatus = property.status === 'upcoming';
                            const showUpcomingBadge = (isUpcomingStatus || isFutureLaunch) && launchDate;

                            if (showUpcomingBadge && launchDate) {
                              const formattedDate = new Intl.DateTimeFormat(locale, {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              }).format(launchDate);
                              return (
                                <span
                                  className={cn(
                                    adminDashboardStyles.statusBadge,
                                    adminDashboardStyles.statusUpcoming,
                                  )}
                                  title={t('statuses.upcomingTooltip', { date: launchDate.toLocaleString(locale) })}
                                >
                                  🚀 {formattedDate}
                                </span>
                              );
                            }

                            return (
                              <span
                                className={cn(
                                  adminDashboardStyles.statusBadge,
                                  statusClassMap[property.status] ?? adminDashboardStyles.statusDraft,
                                )}
                              >
                                {t(`statuses.${property.status}`)}
                              </span>
                            );
                          })()}
                        </td>
                        <td className={adminDashboardStyles.cell}>
                          <div className={adminDashboardStyles.progressWrapper}>
                            <span>
                              {property.soldShares} / {property.totalShares}
                            </span>
                            <span className={adminDashboardStyles.progressTrack}>
                              <span
                                className={adminDashboardStyles.progressFill}
                                style={{ width: `${progress}%` }}
                              />
                            </span>
                          </div>
                        </td>
                        <td className={adminDashboardStyles.cell}>
                          {property.investorCount > 0
                            ? t('table.investorsCount', { count: property.investorCount })
                            : t('table.noInvestors')}
                        </td>
                        <td className={adminDashboardStyles.cell}>
                          {property.updatedAt || property.createdAt
                            ? formatDistanceToNow(new Date(property.updatedAt || property.createdAt || Date.now()), {
                                addSuffix: true,
                                locale: dateLocale,
                              })
                            : '—'}
                        </td>
                        <td className={adminDashboardStyles.cell}>
                          <button
                            type="button"
                            className={adminDashboardStyles.manageButton}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedProperty(property);
                            }}
                          >
                            {t('table.manage')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {properties.length > 0 && (
            <div className={adminDashboardStyles.paginationRow}>
              <span>
                {t('pagination.short', {
                  start: (page - 1) * pageSize + 1,
                  end: Math.min(page * pageSize, total),
                  total,
                })}
              </span>
              <div className={adminDashboardStyles.paginationButtons}>
                <button
                  type="button"
                  className={adminDashboardStyles.paginationButton}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  {t('pagination.prev')}
                </button>
                <button
                  type="button"
                  className={adminDashboardStyles.paginationButton}
                  onClick={() =>
                    setPage((prev) => Math.min(Math.ceil(total / pageSize), prev + 1))
                  }
                  disabled={page >= Math.ceil(total / pageSize)}
                >
                  {t('pagination.next')}
                </button>
              </div>
            </div>
          )}
        </section>

        <AnimatePresence>
          {selectedProperty && (
            <>
              <motion.div
                className={adminDashboardStyles.detailPanelOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedProperty(null)}
              />
              <motion.section
                className={adminDashboardStyles.detailPanel}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <div className={adminDashboardStyles.detailHeader}>
                  <div>
                    <h2 className={adminDashboardStyles.detailTitle}>{selectedProperty.title}</h2>
                    <p className={adminDashboardStyles.subtitle}>
                      {t('detail.location', {
                        zone: selectedProperty.zone,
                        emirate: t(`emirates.${selectedProperty.emirate}`),
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={adminDashboardStyles.closeButton}
                    onClick={() => setSelectedProperty(null)}
                  >
                    ✕
                  </button>
                </div>

                {(selectedProperty.status as PropertyStatus) !== 'published' && (
                  <div className={adminDashboardStyles.primaryActionsSection}>
                    <div className={adminDashboardStyles.primaryActions}>
                      <button
                        type="button"
                        className={adminDashboardStyles.publishButton}
                        onClick={() => handleWorkflow('publish', selectedProperty)}
                        disabled={!isAdmin || selectedProperty.status === 'published'}
                      >
                        {t('detail.actions.publish')}
                      </button>
                      <button
                        type="button"
                        className={adminDashboardStyles.rejectButton}
                        onClick={() => handleWorkflow('reject', selectedProperty)}
                        disabled={!isAdmin}
                      >
                        {t('detail.actions.reject')}
                      </button>
                    </div>
                  </div>
                )}

                <div className={adminDashboardStyles.secondaryActions}>
                  <Link
                    href={`/${locale}/product/${selectedProperty.id}`}
                    target="_blank"
                    className={adminDashboardStyles.ghostButton}
                  >
                    {t('detail.viewProduct')}
                  </Link>
                  <button
                    type="button"
                    className={adminDashboardStyles.ghostButton}
                    onClick={() => handleOpenEdit(selectedProperty)}
                  >
                    {t('detail.actions.edit')}
                  </button>
                  <button
                    type="button"
                    className={adminDashboardStyles.deleteButton}
                    onClick={() => handleWorkflow('delete', selectedProperty)}
                  >
                    {t('detail.actions.delete')}
                  </button>
                </div>

            <div className={adminDashboardStyles.detailGrid}>
              <div className={adminDashboardStyles.detailCard}>
                <span className={adminDashboardStyles.detailLabel}>{t('detail.pricePerShare')}</span>
                <span className={adminDashboardStyles.detailValue}>
                  {currencyFormatter.format(selectedProperty.pricePerShare)}
                </span>
              </div>
              <div className={adminDashboardStyles.detailCard}>
                <span className={adminDashboardStyles.detailLabel}>{t('detail.totalShares')}</span>
                <span className={adminDashboardStyles.detailValue}>
                  {numberFormatter.format(selectedProperty.totalShares)}
                </span>
              </div>
              <div className={adminDashboardStyles.detailCard}>
                <span className={adminDashboardStyles.detailLabel}>{t('detail.totalValue')}</span>
                <span className={adminDashboardStyles.detailValue}>
                  {currencyFormatter.format(selectedProperty.pricePerShare * selectedProperty.totalShares)}
                </span>
              </div>
            </div>

            <div className={adminDashboardStyles.investorsPanel}>
              <span className={adminDashboardStyles.detailSectionTitle}>{t('detail.investorsTitle')}</span>
              {selectedProperty.investors.length === 0 ? (
                <p className={adminDashboardStyles.subtitle}>{t('detail.noInvestors')}</p>
              ) : (
                <div className={adminDashboardStyles.investorList}>
                  {selectedProperty.investors.map((investor, index) => (
                    <div key={`${investor.email || investor.name}-${index}`} className={adminDashboardStyles.investorChip}>
                      <div className={adminDashboardStyles.investorInfo}>
                        <span className={adminDashboardStyles.investorName}>{investor.name}</span>
                        {investor.email && (
                          <span className={adminDashboardStyles.investorMeta}>{investor.email}</span>
                        )}
                      </div>
                      <div className={adminDashboardStyles.investorInfo}>
                        {investor.shares && (
                          <span className={adminDashboardStyles.investorMeta}>
                            {t('detail.shares', { count: investor.shares })}
                          </span>
                        )}
                        {investor.amount && (
                          <span className={adminDashboardStyles.investorMeta}>
                            {currencyFormatter.format(investor.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </motion.section>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {workflowAction && workflowTarget && (
          <WorkflowModal
            key="workflow"
            action={workflowAction}
            property={workflowTarget}
            onClose={() => {
              setWorkflowAction(null);
              setWorkflowTarget(null);
            }}
            onConfirm={handleWorkflowConfirm}
            t={t}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

interface FormControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  colSpan?: boolean;
  placeholder?: string;
}

function FormControl({ label, value, onChange, textarea, colSpan, placeholder }: FormControlProps) {
  const className = textarea ? adminDashboardStyles.textarea : adminDashboardStyles.input;
  return (
    <label
      className={adminDashboardStyles.formControl}
      style={colSpan ? { gridColumn: '1 / -1' } : undefined}
    >
      <span className={adminDashboardStyles.formLabel}>{label}</span>
      {textarea ? (
        <textarea
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

interface WorkflowModalProps {
  action: 'publish' | 'reject' | 'delete';
  property: AdminProperty;
  onClose: () => void;
  onConfirm: (payload?: { reason?: string; notes?: string }) => Promise<void>;
  t: ReturnType<typeof useTranslations>;
}

function WorkflowModal({ action, property, onClose, onConfirm, t }: WorkflowModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const needsReason = action === 'reject';

  const titleMap = {
    publish: t('workflow.publishTitle'),
    reject: t('workflow.rejectTitle'),
    delete: t('workflow.deleteTitle'),
  };

  const descriptionMap = {
    publish: t('workflow.publishDescription', { title: property.title }),
    reject: t('workflow.rejectDescription', { title: property.title }),
    delete: t('workflow.deleteDescription', { title: property.title }),
  };

  const handleConfirm = async () => {
    if (needsReason && !reason.trim()) {
      return;
    }
    setIsSubmitting(true);
    await onConfirm({ reason: reason.trim() || undefined, notes: notes.trim() || undefined });
    setIsSubmitting(false);
  };

  return (
    <div className={adminDashboardStyles.modalOverlay} role="dialog" aria-modal="true">
      <motion.div
        className={adminDashboardStyles.modalContent}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
      >
        <div className={adminDashboardStyles.modalHeader}>
          <h3 className={adminDashboardStyles.modalTitle}>{titleMap[action]}</h3>
          <p className={adminDashboardStyles.modalSubtitle}>{descriptionMap[action]}</p>
        </div>
        {action === 'publish' && (
          <FormControl
            label={t('workflow.notes')}
            value={notes}
            onChange={setNotes}
            textarea
            colSpan
            placeholder={t('workflow.notesPlaceholder')}
          />
        )}
        {action === 'reject' && (
          <FormControl
            label={t('workflow.reason')}
            value={reason}
            onChange={setReason}
            textarea
            colSpan
            placeholder={t('workflow.reasonPlaceholder')}
          />
        )}
        {action === 'delete' && (
          <div className={adminDashboardStyles.deleteWarning}>
            <p className={adminDashboardStyles.deleteWarningText}>
              ⚠️ {t('workflow.deleteWarning')}
            </p>
            <p className={adminDashboardStyles.deleteWarningSubtext}>
              {t('workflow.deleteWarningSubtext')}
            </p>
          </div>
        )}
        <div className={adminDashboardStyles.modalActions}>
          <button type="button" className={adminDashboardStyles.ghostButton} onClick={onClose}>
            {t('workflow.cancel')}
          </button>
          <button
            type="button"
            className={action === 'delete' ? adminDashboardStyles.deleteConfirmButton : adminDashboardStyles.primaryButton}
            onClick={handleConfirm}
            disabled={isSubmitting || (needsReason && !reason.trim())}
          >
            {isSubmitting ? t('workflow.confirming') : action === 'delete' ? t('workflow.deleteConfirm') : t('workflow.confirm')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}





