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
  type StatHighlightProperty,
} from '@/lib/api/properties';
import { Select } from '@/app/ui/select';
import { adminDashboardStyles } from './adminDashboard.styles';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { developerBrandsApi, type DeveloperBrand } from '@/lib/api/developer-brands';
import type { AxiosError } from 'axios';
import {
  adminService,
  type AdminUser,
  type UserActionInsight,
  type UserInsights,
  type UserInvestmentInsight,
} from '@/lib/api/admin';

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

type QuickNavPanelKey = 'portfolio' | 'inventory' | 'brands' | 'users';

type QuickNavBase = {
  key: string;
  label: string;
  description: string;
  icon: string;
  accent: 'platinum' | 'onyx' | 'amber' | 'azure';
  size?: 'wide' | 'tall';
  metric?: string;
  metricLabel?: string;
};

type QuickNavPanelItem = QuickNavBase & {
  type: 'panel';
  panel: QuickNavPanelKey;
};

type QuickNavLinkItem = QuickNavBase & {
  type: 'link';
  href: string;
};

type QuickNavItem = QuickNavPanelItem | QuickNavLinkItem;

const isPanelItem = (item: QuickNavItem): item is QuickNavPanelItem => item.type === 'panel';

type CanonicalUserRole = 'client' | 'agent' | 'admin' | 'superadmin';
type UserRoleFilterValue = 'all' | CanonicalUserRole;
type UserStatusFilterValue = 'all' | 'active' | 'inactive';

const normalizeUserRole = (role?: string | null): CanonicalUserRole | string =>
  (role ?? '').toLowerCase();
const userInsightsFeatureEnabled =
  process.env.NEXT_PUBLIC_ENABLE_USER_INSIGHTS === 'true';

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

const CACHE_TTL_MS = 30_000;

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
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isAdminUsersLoading, setIsAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<UserRoleFilterValue>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilterValue>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
  const [isUserInsightsLoading, setIsUserInsightsLoading] = useState(false);
  const [userInsightsError, setUserInsightsError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<QuickNavPanelKey | null>(null);

  const pageSize = 8;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';
  const canManageUsers = isSuperAdmin;
  const userInsightsFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_USER_INSIGHTS !== 'false';

  const propertiesCacheRef = useRef<{
    key: string;
    timestamp: number;
    value: { items: AdminProperty[]; total: number };
  } | null>(null);
  const statsCacheRef = useRef<{ timestamp: number; value: PropertyStats | null } | null>(null);
  const brandsCacheRef = useRef<{ timestamp: number; value: DeveloperBrand[] } | null>(null);
  const adminUsersCacheRef = useRef<{ timestamp: number; value: AdminUser[] } | null>(null);

  const propertiesLoadingRef = useRef(false);
  const statsLoadingRef = useRef(false);
  const brandsLoadingRef = useRef(false);
  const adminUsersLoadingRef = useRef(false);
  const isCacheValid = useCallback((timestamp: number) => Date.now() - timestamp < CACHE_TTL_MS, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push(`/${locale}/login`);
      return;
    }
    if (isAuthenticated && user && !isAdmin) {
      router.push(`/${locale}/wallet`);
    }
  }, [isAuthenticated, user, isAdmin, router, locale]);

  const fetchProperties = useCallback(
    async (options: { force?: boolean } = {}) => {
      if (!isAuthenticated || !isAdmin) {
        return;
      }
      const force = options.force ?? false;
      const cacheKey = JSON.stringify({
        page,
        pageSize,
        statusFilter,
        typeFilter,
        emirateFilter,
        searchValue: searchValue.trim(),
      });
      const cache = propertiesCacheRef.current;
      if (!force && cache && cache.key === cacheKey && isCacheValid(cache.timestamp)) {
        setProperties(cache.value.items);
        setTotal(cache.value.total);
        setIsLoading(false);
        setError(null);
        setSelectedProperty((prev) => {
          if (!cache.value.items.length) {
            return null;
          }
          if (prev) {
            const stillExists = cache.value.items.find((item) => item.id === prev.id);
            if (stillExists) {
              return stillExists;
            }
          }
          return null;
        });
        return;
      }
      if (!force && propertiesLoadingRef.current) {
        return;
      }
      propertiesLoadingRef.current = true;
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
        propertiesCacheRef.current = {
          key: cacheKey,
          timestamp: Date.now(),
          value: { items: normalized, total: response.total },
        };
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
          return null;
        });
      } catch (err: any) {
        const axiosError = err as AxiosError;
        const status = axiosError?.response?.status;
        const message =
          status === 429 ? t('errors.rateLimit') : err.message || t('errors.fetch');
        setError(message);
      } finally {
        setIsLoading(false);
        propertiesLoadingRef.current = false;
      }
    },
    [
      emirateFilter,
      isAdmin,
      isAuthenticated,
      isCacheValid,
      page,
      pageSize,
      searchValue,
      statusFilter,
      t,
      typeFilter,
    ],
  );

  const fetchStats = useCallback(
    async (options: { force?: boolean } = {}) => {
      if (!isAuthenticated || !isAdmin) {
        return;
      }
      const force = options.force ?? false;
      const cache = statsCacheRef.current;
      if (!force && cache && isCacheValid(cache.timestamp)) {
        setStats(cache.value);
        setIsStatsLoading(false);
        return;
      }
      if (!force && statsLoadingRef.current) {
        return;
      }
      statsLoadingRef.current = true;
      setIsStatsLoading(true);
      try {
        const newStats = await propertiesApi.stats();
        setStats(newStats);
        statsCacheRef.current = { timestamp: Date.now(), value: newStats };
      } catch (err) {
        console.error('[AdminDashboard] Unable to load stats', err);
      } finally {
        setIsStatsLoading(false);
        statsLoadingRef.current = false;
      }
    },
    [isAdmin, isAuthenticated, isCacheValid],
  );

  const fetchDeveloperBrands = useCallback(
    async (options: { force?: boolean } = {}) => {
      if (!isAuthenticated || !isSuperAdmin) {
        setDeveloperBrands([]);
        return;
      }
      const force = options.force ?? false;
      const cache = brandsCacheRef.current;
      if (!force && cache && isCacheValid(cache.timestamp)) {
        setDeveloperBrands(cache.value);
        setAreBrandsLoading(false);
        setBrandError(null);
        return;
      }
      if (!force && brandsLoadingRef.current) {
        return;
      }
      brandsLoadingRef.current = true;
      setAreBrandsLoading(true);
      try {
        const list = await developerBrandsApi.list();
        setDeveloperBrands(list);
        brandsCacheRef.current = { timestamp: Date.now(), value: list };
        setBrandError(null);
      } catch (err: any) {
        setBrandError(err.message || t('brands.errors.fetch'));
      } finally {
        setAreBrandsLoading(false);
        brandsLoadingRef.current = false;
      }
    },
    [isAuthenticated, isCacheValid, isSuperAdmin, t],
  );

  const fetchAdminUsers = useCallback(
    async (options: { force?: boolean } = {}) => {
      if (!isAuthenticated || !isAdmin) {
        setAdminUsers([]);
        return;
      }
      const force = options.force ?? false;
      const cache = adminUsersCacheRef.current;
      if (!force && cache && isCacheValid(cache.timestamp)) {
        setAdminUsers(cache.value);
        setIsAdminUsersLoading(false);
        setAdminUsersError(null);
        return;
      }
      if (!force && adminUsersLoadingRef.current) {
        return;
      }
      adminUsersLoadingRef.current = true;
      setIsAdminUsersLoading(true);
      try {
        const list = await adminService.listUsers();
        setAdminUsers(list);
        adminUsersCacheRef.current = { timestamp: Date.now(), value: list };
        setAdminUsersError(null);
      } catch (err: any) {
        setAdminUsersError(err.message || t('usersPanel.errors.fetch'));
      } finally {
        setIsAdminUsersLoading(false);
        adminUsersLoadingRef.current = false;
      }
    },
    [isAdmin, isAuthenticated, isCacheValid, t],
  );

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchDeveloperBrands();
  }, [fetchDeveloperBrands]);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  useEffect(() => {
    if (!selectedUser) {
      setUserInsights(null);
      setUserInsightsError(null);
      return;
    }
    if (!userInsightsFeatureEnabled) {
      setUserInsights(null);
      setUserInsightsError(null);
      return;
    }
    let ignore = false;
    const load = async () => {
      setIsUserInsightsLoading(true);
      try {
        const insights = await adminService.getUserInsights(selectedUser.id);
        if (!ignore) {
          setUserInsights(insights);
          setUserInsightsError(null);
        }
      } catch (err: any) {
        if (!ignore) {
          setUserInsights(null);
          setUserInsightsError(err.message || t('usersPanel.details.error'));
        }
      } finally {
        if (!ignore) {
          setIsUserInsightsLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [selectedUser, t, userInsightsFeatureEnabled]);

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
      await fetchDeveloperBrands({ force: true });
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

  const handleResetUserFilters = () => {
    setUserSearch('');
    setUserRoleFilter('all');
    setUserStatusFilter('all');
  };

  const handleSelectUser = (account: AdminUser) => {
    setSelectedUser(account);
  };

  const handleCloseUserDetail = () => {
    setSelectedUser(null);
  };

  const handleUserRoleChange = async (id: string, nextRole: CanonicalUserRole) => {
    if (!isSuperAdmin || updatingUserId === id) {
      return;
    }
    const currentUser = adminUsers.find((item) => item.id === id);
    if (!currentUser || currentUser.role === nextRole) {
      return;
    }
    setUpdatingUserId(id);
    setAdminUsersError(null);
    try {
      const payloadRole =
        nextRole === 'client' || nextRole === 'agent' ? nextRole.toUpperCase() : nextRole;
      await adminService.updateUserRole(id, payloadRole);
      await fetchAdminUsers({ force: true });
    } catch (err: any) {
      setAdminUsersError(err.message || t('usersPanel.errors.updateRole'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUserStatusToggle = async (id: string, isActive: boolean) => {
    if (!isSuperAdmin || updatingUserId === id) {
      return;
    }
    setUpdatingUserId(id);
    setAdminUsersError(null);
    try {
      await adminService.updateUserStatus(id, isActive);
      await fetchAdminUsers({ force: true });
    } catch (err: any) {
      setAdminUsersError(err.message || t('usersPanel.errors.updateStatus'));
    } finally {
      setUpdatingUserId(null);
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

  const compactNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    [locale],
  );

  const compactCurrencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        notation: 'compact',
        style: 'currency',
        currency: 'AED',
        maximumFractionDigits: 1,
      }),
    [locale],
  );

  const getRoleLabel = useCallback(
    (role?: string | null) => {
      const normalized = normalizeUserRole(role);
      if (normalized === 'client') {
        return t('usersPanel.roleLabels.client');
      }
      if (normalized === 'agent') {
        return t('usersPanel.roleLabels.agent');
      }
      if (normalized === 'superadmin') {
        return t('usersPanel.roleLabels.superadmin');
      }
      if (normalized === 'admin') {
        return t('usersPanel.roleLabels.admin');
      }
      return role ?? '—';
    },
    [t],
  );

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return adminUsers.filter((account) => {
      const normalizedRole = normalizeUserRole(account.role);
      if (userRoleFilter !== 'all' && normalizedRole !== userRoleFilter) {
        return false;
      }
      if (userStatusFilter !== 'all') {
        const isActive = Boolean(account.isActive);
        if (userStatusFilter === 'active' && !isActive) {
          return false;
        }
        if (userStatusFilter === 'inactive' && isActive) {
          return false;
        }
      }
      if (query) {
        const haystack = [
          account.email,
          account.firstName,
          account.lastName,
          account.username,
          account.phoneNumber,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [adminUsers, userRoleFilter, userSearch, userStatusFilter]);

  const userOverview = useMemo(() => {
    const total = adminUsers.length;
    const active = adminUsers.filter((account) => account.isActive).length;
    const clients = adminUsers.filter((account) => normalizeUserRole(account.role) === 'client').length;
    const adminsCount = adminUsers.filter((account) => {
      const normalized = normalizeUserRole(account.role);
      return normalized === 'admin' || normalized === 'superadmin';
    }).length;
    return { total, active, clients, admins: adminsCount };
  }, [adminUsers]);

  const userDetailStats = useMemo(() => {
    const stats = userInsights?.stats;
    return [
      {
        key: 'totalInvestments',
        label: t('usersPanel.details.stats.totalInvestments'),
        value: numberFormatter.format(stats?.totalInvestments ?? 0),
      },
      {
        key: 'investedAmount',
        label: t('usersPanel.details.stats.investedAmount'),
        value: currencyFormatter.format(stats?.investedAmount ?? 0),
      },
      {
        key: 'propertiesCount',
        label: t('usersPanel.details.stats.propertiesCount'),
        value: numberFormatter.format(stats?.propertiesCount ?? 0),
      },
      {
        key: 'averageTicket',
        label: t('usersPanel.details.stats.averageTicket'),
        value: currencyFormatter.format(stats?.averageTicket ?? 0),
      },
      {
        key: 'sessionsCount',
        label: t('usersPanel.details.stats.sessionsCount'),
        value: numberFormatter.format(stats?.sessionsCount ?? 0),
      },
      {
        key: 'lastLogin',
        label: t('usersPanel.details.stats.lastLogin'),
        value: stats?.lastLoginAt
          ? formatDistanceToNow(new Date(stats.lastLoginAt), {
              addSuffix: true,
              locale: dateLocale,
            })
          : t('usersPanel.details.stats.never'),
      },
    ];
  }, [currencyFormatter, dateLocale, numberFormatter, t, userInsights]);

  const isUserInsightsPlaceholder =
    !userInsightsFeatureEnabled || Boolean(userInsights?.placeholder);

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

  const userRoleActionOptions = useMemo(
    () => [
      { value: 'client', label: t('usersPanel.roleLabels.client') },
      { value: 'agent', label: t('usersPanel.roleLabels.agent') },
      { value: 'admin', label: t('usersPanel.roleLabels.admin') },
      { value: 'superadmin', label: t('usersPanel.roleLabels.superadmin') },
    ],
    [t],
  );

  const userRoleFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('usersPanel.filters.role.all') },
      ...userRoleActionOptions,
    ],
    [t, userRoleActionOptions],
  );

  const userStatusFilterOptions = useMemo(
    () => [
      { value: 'all', label: t('usersPanel.filters.status.all') },
      { value: 'active', label: t('usersPanel.filters.status.active') },
      { value: 'inactive', label: t('usersPanel.filters.status.inactive') },
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
      await fetchProperties({ force: true });
      await fetchStats({ force: true });
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

  const portfolioStats = stats?.aggregates;

  const heroHighlights = useMemo(
    () => [
      {
        key: 'assets',
        label: t('heroHighlights.assets'),
        value: numberFormatter.format(total),
      },
      {
        key: 'aum',
        label: t('heroHighlights.aum'),
        value: isStatsLoading ? '—' : compactCurrencyFormatter.format(portfolioStats?.totalValue ?? 0),
      },
      {
        key: 'investors',
        label: t('heroHighlights.investors'),
        value: numberFormatter.format(investorsMetric),
      },
      {
        key: 'volume',
        label: t('heroHighlights.volume'),
        value: compactCurrencyFormatter.format(totalVolume),
      },
    ],
    [
      compactCurrencyFormatter,
      investorsMetric,
      isStatsLoading,
      numberFormatter,
      portfolioStats?.totalValue,
      t,
      total,
      totalVolume,
    ],
  );

  const statCards = [
    {
      key: 'aum',
      label: t('stats.aum'),
      value: isStatsLoading ? '—' : currencyFormatter.format(portfolioStats?.totalValue ?? 0),
      helper: t('stats.aumHelper'),
    },
    {
      key: 'capital',
      label: t('stats.capital'),
      value: isStatsLoading ? '—' : currencyFormatter.format(portfolioStats?.investedValue ?? 0),
      helper: t('stats.capitalHelper'),
    },
    {
      key: 'available',
      label: t('stats.available'),
      value: isStatsLoading ? '—' : currencyFormatter.format(portfolioStats?.availableValue ?? 0),
      helper: t('stats.availableHelper'),
    },
    {
      key: 'monthlyIncome',
      label: t('stats.monthlyIncome'),
      value: isStatsLoading ? '—' : currencyFormatter.format(portfolioStats?.projectedMonthlyIncome ?? 0),
      helper: t('stats.monthlyIncomeHelper'),
    },
    {
      key: 'avgRoi',
      label: t('stats.avgRoi'),
      value: isStatsLoading
        ? '—'
        : `${(portfolioStats?.averageExpectedRoi ?? 0).toFixed(1)}%`,
      helper: t('stats.avgRoiHelper'),
    },
    {
      key: 'avgYield',
      label: t('stats.avgYield'),
      value: isStatsLoading
        ? '—'
        : `${(portfolioStats?.averageRentalYield ?? 0).toFixed(1)}%`,
      helper: t('stats.avgYieldHelper'),
    },
  ];

  const distributionSections = useMemo(() => {
    const totalCount = stats?.total ?? 0;
    const buildEntries = (data?: Record<string, number>, labelPrefix?: string) => {
      if (!data) {
        return [];
      }
      return Object.entries(data)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value]) => {
          const percentage = totalCount > 0 ? Math.round((value / totalCount) * 100) : 0;
          let label = key;
          if (labelPrefix && key) {
            label = t(`${labelPrefix}.${key}`);
          }
          return {
            key,
            label,
            value,
            percentage,
          };
        });
    };
    return [
      {
        key: 'status',
        title: t('distributions.status'),
        entries: buildEntries(stats?.byStatus, 'statuses'),
      },
      {
        key: 'type',
        title: t('distributions.type'),
        entries: buildEntries(stats?.byType, 'propertyTypes'),
      },
      {
        key: 'emirate',
        title: t('distributions.emirate'),
        entries: buildEntries(stats?.byEmirate, 'emirates'),
      },
    ];
  }, [stats, t]);

  const performanceSections = useMemo<
    {
      key: string;
      title: string;
      data: StatHighlightProperty[];
      badge: string;
      metricKey?: keyof StatHighlightProperty;
      formatValue: (value?: number | null, item?: StatHighlightProperty) => string;
    }[]
  >(() => {
    const formatOccupancy = (item: StatHighlightProperty) => {
      if (!item.totalShares) {
        return '0%';
      }
      const percentage = Math.min(100, Math.round((item.soldShares / item.totalShares) * 100));
      return `${percentage}%`;
    };
    return [
      {
        key: 'roi',
        title: t('performance.roi'),
        data: stats?.performance?.topRoi ?? [],
        metricKey: 'expectedROI',
        badge: t('performance.badge.roi'),
        formatValue: (value?: number | null) =>
          typeof value === 'number' ? `${value.toFixed(1)}%` : t('performance.notAvailable'),
      },
      {
        key: 'yield',
        title: t('performance.yield'),
        data: stats?.performance?.topRentalYield ?? [],
        metricKey: 'rentalYield',
        badge: t('performance.badge.yield'),
        formatValue: (value?: number | null) =>
          typeof value === 'number' ? `${value.toFixed(1)}%` : t('performance.notAvailable'),
      },
      {
        key: 'liquidity',
        title: t('performance.liquidity'),
        data: stats?.performance?.topOccupancy ?? [],
        badge: t('performance.badge.occupancy'),
        metricKey: undefined,
        formatValue: (_value: number | null | undefined, item?: StatHighlightProperty) =>
          item ? formatOccupancy(item) : '—',
      },
    ];
  }, [stats, t]);

  const quickNavItems = useMemo<QuickNavItem[]>(() => {
    const items: QuickNavItem[] = [
      {
        key: 'portfolio',
        label: t('navigation.portfolio'),
        description: t('navigation.portfolioDesc'),
        icon: '📊',
        accent: 'platinum',
        type: 'panel',
        panel: 'portfolio',
        metric: isStatsLoading ? '—' : compactCurrencyFormatter.format(portfolioStats?.totalValue ?? 0),
        metricLabel: t('navigation.meta.aum'),
      },
      {
        key: 'inventory',
        label: t('navigation.inventory'),
        description: t('navigation.inventoryDesc'),
        icon: '📁',
        accent: 'onyx',
        type: 'panel',
        panel: 'inventory',
        metric: numberFormatter.format(total),
        metricLabel: t('navigation.meta.inventory'),
      },
    ];
    if (isSuperAdmin) {
      items.push({
        key: 'brands',
        label: t('navigation.brands'),
        description: t('navigation.brandsDesc'),
        icon: '🏗️',
        accent: 'platinum',
        type: 'panel',
        panel: 'brands',
        metric: developerBrands.length ? numberFormatter.format(developerBrands.length) : '—',
        metricLabel: t('navigation.meta.brands'),
      });
    }
    if (isAdmin) {
      items.push({
        key: 'users',
        label: t('navigation.users'),
        description: t('navigation.usersDesc'),
        icon: '🛡️',
        accent: 'onyx',
        type: 'panel',
        panel: 'users',
        metric: adminUsers.length ? numberFormatter.format(adminUsers.length) : '—',
        metricLabel: t('navigation.meta.users'),
      });
    }
    return items;
  }, [
    adminUsers.length,
    compactCurrencyFormatter,
    developerBrands.length,
    isStatsLoading,
    isAdmin,
    isSuperAdmin,
    numberFormatter,
    portfolioStats?.totalValue,
    t,
    total,
  ]);

  useEffect(() => {
    const panelItems = quickNavItems.filter(isPanelItem);
    if (panelItems.length === 0) {
      if (activePanel !== null) {
        setActivePanel(null);
      }
      return;
    }
    if (!activePanel || !panelItems.some((item) => item.panel === activePanel)) {
      setActivePanel(panelItems[0].panel);
    }
  }, [quickNavItems, activePanel]);

  const portfolioPanel = (
    <div className={adminDashboardStyles.sectionGroup}>
      <section className={adminDashboardStyles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.key} className={adminDashboardStyles.statCard}>
            <span className={adminDashboardStyles.statLabel}>{card.label}</span>
            <span className={adminDashboardStyles.statValue}>{card.value}</span>
            {card.helper && <span className={adminDashboardStyles.statHelper}>{card.helper}</span>}
          </div>
        ))}
      </section>

      <section className={adminDashboardStyles.distributionCard}>
        <div className={adminDashboardStyles.sectionHeader}>
          <div>
            <p className={adminDashboardStyles.sectionTitle}>{t('distributions.title')}</p>
            <p className={adminDashboardStyles.sectionSubtitle}>{t('distributions.subtitle')}</p>
          </div>
        </div>
        <div className={adminDashboardStyles.distributionGrid}>
          {distributionSections.map((section) => (
            <div key={section.key} className={adminDashboardStyles.distributionColumn}>
              <p className={adminDashboardStyles.distributionTitle}>{section.title}</p>
              {section.entries.length === 0 ? (
                <p className={adminDashboardStyles.distributionPlaceholder}>{t('distributions.empty')}</p>
              ) : (
                section.entries.map((entry) => (
                  <div key={entry.key} className={adminDashboardStyles.distributionItem}>
                    <div className={adminDashboardStyles.distributionMeta}>
                      <span>{entry.label}</span>
                      <span>
                        {entry.value}{' '}
                        <span className={adminDashboardStyles.distributionPercentage}>
                          ({entry.percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className={adminDashboardStyles.distributionTrack}>
                      <span style={{ width: `${entry.percentage}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={adminDashboardStyles.performanceCard}>
        <div className={adminDashboardStyles.sectionHeader}>
          <div>
            <p className={adminDashboardStyles.sectionTitle}>{t('performance.title')}</p>
            <p className={adminDashboardStyles.sectionSubtitle}>{t('performance.subtitle')}</p>
          </div>
        </div>
        <div className={adminDashboardStyles.performanceGrid}>
          {performanceSections.map((section) => (
            <div key={section.key} className={adminDashboardStyles.performanceColumn}>
              <p className={adminDashboardStyles.performanceTitle}>{section.title}</p>
              <div className={adminDashboardStyles.performanceList}>
                {section.data.length === 0 ? (
                  <p className={adminDashboardStyles.distributionPlaceholder}>{t('performance.empty')}</p>
                ) : (
                  section.data.map((item) => (
                    <div key={`${section.key}-${item.id}`} className={adminDashboardStyles.performanceItem}>
                      <div>
                        <p className={adminDashboardStyles.performanceAsset}>{item.title}</p>
                        <p className={adminDashboardStyles.performanceMeta}>
                          {t(`propertyTypes.${item.propertyType}`)} · {t(`emirates.${item.emirate}`)}
                        </p>
                      </div>
                      <div className={adminDashboardStyles.performanceMetric}>
                        <span className={adminDashboardStyles.performanceBadge}>{section.badge}</span>
                        <span className={adminDashboardStyles.performanceValue}>
                          {section.formatValue(
                            section.metricKey ? (item[section.metricKey] as number | null | undefined) ?? null : null,
                            item,
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const inventoryPanel = (
    <div className={adminDashboardStyles.sectionGroup}>
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
                              )}>
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

    </div>
  );

  const brandsPanel = (
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
  );

  const usersPanel = (
    <section className={adminDashboardStyles.usersCard}>
      <div className={adminDashboardStyles.sectionHeader}>
        <div>
          <p className={adminDashboardStyles.sectionTitle}>{t('navigation.users')}</p>
          <p className={adminDashboardStyles.sectionSubtitle}>{t('navigation.usersDesc')}</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className={adminDashboardStyles.userRefreshButton}
            onClick={() => {
              fetchAdminUsers({ force: true });
            }}
            disabled={isAdminUsersLoading}
          >
            {isAdminUsersLoading ? t('usersPanel.refreshing') : t('usersPanel.refresh')}
          </button>
        )}
      </div>

      <div className={adminDashboardStyles.userStatsRow}>
        <div className={adminDashboardStyles.userStatCard}>
          <span className={adminDashboardStyles.userStatValue}>
            {numberFormatter.format(userOverview.total)}
          </span>
          <span className={adminDashboardStyles.userStatLabel}>{t('usersPanel.stats.total')}</span>
        </div>
        <div className={adminDashboardStyles.userStatCard}>
          <span className={adminDashboardStyles.userStatValue}>
            {numberFormatter.format(userOverview.active)}
          </span>
          <span className={adminDashboardStyles.userStatLabel}>{t('usersPanel.stats.active')}</span>
        </div>
        <div className={adminDashboardStyles.userStatCard}>
          <span className={adminDashboardStyles.userStatValue}>
            {numberFormatter.format(userOverview.clients)}
          </span>
          <span className={adminDashboardStyles.userStatLabel}>{t('usersPanel.stats.clients')}</span>
        </div>
        <div className={adminDashboardStyles.userStatCard}>
          <span className={adminDashboardStyles.userStatValue}>
            {numberFormatter.format(userOverview.admins)}
          </span>
          <span className={adminDashboardStyles.userStatLabel}>{t('usersPanel.stats.admins')}</span>
        </div>
      </div>

      <div className={adminDashboardStyles.filtersCard}>
        <div className={adminDashboardStyles.filtersRow}>
          <input
            type="text"
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder={t('usersPanel.filters.searchPlaceholder')}
            className={adminDashboardStyles.filterInput}
          />
          <div className={adminDashboardStyles.filterSelectWrapper}>
            <Select
              value={userRoleFilter}
              onChange={(event) => setUserRoleFilter(event.target.value as UserRoleFilterValue)}
              options={userRoleFilterOptions}
              variant="compact"
              aria-label={t('usersPanel.filters.roleLabel')}
            />
          </div>
          <div className={adminDashboardStyles.filterSelectWrapper}>
            <Select
              value={userStatusFilter}
              onChange={(event) => setUserStatusFilter(event.target.value as UserStatusFilterValue)}
              options={userStatusFilterOptions}
              variant="compact"
              aria-label={t('usersPanel.filters.statusLabel')}
            />
          </div>
        </div>
        <button type="button" className={adminDashboardStyles.ghostButton} onClick={handleResetUserFilters}>
          {t('filters.reset')}
        </button>
      </div>

      <section className={adminDashboardStyles.tableWrapper}>
        <div className={adminDashboardStyles.tableHeader}>
          <span className={adminDashboardStyles.tableTitle}>{t('usersPanel.table.title')}</span>
          <span>{t('usersPanel.table.count', { count: filteredUsers.length })}</span>
        </div>
        {adminUsersError && <p className={adminDashboardStyles.errorText}>{adminUsersError}</p>}
        {isAdminUsersLoading ? (
          <p className={adminDashboardStyles.usersPlaceholder}>{t('usersPanel.loading')}</p>
        ) : filteredUsers.length === 0 ? (
          <p className={adminDashboardStyles.usersPlaceholder}>{t('usersPanel.empty')}</p>
        ) : (
          <div className={adminDashboardStyles.tableScrollArea} data-lenis-prevent data-lenis-prevent-wheel>
            <table className={adminDashboardStyles.table}>
              <thead>
                <tr>
                  <th className={adminDashboardStyles.theadCell}>{t('usersPanel.table.columns.user')}</th>
                  <th className={adminDashboardStyles.theadCell}>{t('usersPanel.table.columns.role')}</th>
                  <th className={adminDashboardStyles.theadCell}>{t('usersPanel.table.columns.status')}</th>
                  <th className={adminDashboardStyles.theadCell}>{t('usersPanel.table.columns.created')}</th>
                  <th className={adminDashboardStyles.theadCell}>{t('usersPanel.table.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((account) => {
                  const initialsSource = [
                    account.firstName?.[0],
                    account.lastName?.[0],
                    account.email?.[0],
                    account.email?.[1],
                  ]
                    .filter(Boolean)
                    .join('');
                  const initials = (initialsSource || '?').slice(0, 2).toUpperCase();
                  const relativeCreation = account.createdAt
                    ? formatDistanceToNow(new Date(account.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })
                    : null;
                  const isSelf = account.id === user.id;
                  const isUpdating = updatingUserId === account.id;
                  const normalizedRole = normalizeUserRole(account.role);
                  const manageableRoles: CanonicalUserRole[] = ['client', 'agent', 'admin', 'superadmin'];
                  const roleValue = manageableRoles.includes(normalizedRole as CanonicalUserRole)
                    ? (normalizedRole as CanonicalUserRole)
                    : 'client';
                  return (
                    <tr key={account.id} className={adminDashboardStyles.row}>
                      <td className={cn(adminDashboardStyles.cell, adminDashboardStyles.assetCell)}>
                        <div className={adminDashboardStyles.userAvatar}>{initials}</div>
                        <div className={adminDashboardStyles.assetInfo}>
                          <button
                            type="button"
                            className={adminDashboardStyles.userNameButton}
                            onClick={() => handleSelectUser(account)}
                          >
                            {account.firstName || account.lastName
                              ? `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim()
                              : account.email}
                          </button>
                          <span className={adminDashboardStyles.subtitle}>
                            {account.email}
                            {account.username ? ` · @${account.username}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className={adminDashboardStyles.cell}>
                        <span className={adminDashboardStyles.userRoleBadge}>{getRoleLabel(account.role)}</span>
                      </td>
                      <td className={adminDashboardStyles.cell}>
                        <span
                          className={cn(
                            adminDashboardStyles.userStatusBadge,
                            account.isActive
                              ? adminDashboardStyles.userStatusActive
                              : adminDashboardStyles.userStatusInactive,
                          )}
                        >
                          {account.isActive ? t('usersPanel.status.active') : t('usersPanel.status.inactive')}
                        </span>
                      </td>
                      <td className={adminDashboardStyles.cell}>
                        {relativeCreation ?? t('usersPanel.table.never')}
                      </td>
                      <td className={adminDashboardStyles.cell}>
                        {canManageUsers ? (
                          <div className={adminDashboardStyles.userControls}>
                            <Select
                              value={roleValue}
                              onChange={(event) =>
                                handleUserRoleChange(account.id, event.target.value as CanonicalUserRole)
                              }
                              options={userRoleActionOptions}
                              variant="compact"
                              disabled={isUpdating || isSelf}
                            />
                            <button
                              type="button"
                              className={adminDashboardStyles.userControlButton}
                              onClick={() => handleUserStatusToggle(account.id, !account.isActive)}
                              disabled={isUpdating || isSelf}
                            >
                              {account.isActive
                                ? t('usersPanel.actions.deactivate')
                                : t('usersPanel.actions.activate')}
                            </button>
                          </div>
                        ) : (
                          <span className={adminDashboardStyles.userMeta}>{t('usersPanel.readOnly')}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );

  const userDetailPanel =
    selectedUser && (
      <>
        <motion.div
          className={adminDashboardStyles.detailPanelOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleCloseUserDetail}
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
              <h2 className={adminDashboardStyles.detailTitle}>
                {selectedUser.firstName || selectedUser.lastName
                  ? `${selectedUser.firstName ?? ''} ${selectedUser.lastName ?? ''}`.trim()
                  : selectedUser.email}
              </h2>
              <p className={adminDashboardStyles.subtitle}>
                {selectedUser.email}
                {selectedUser.username ? ` · @${selectedUser.username}` : ''}
              </p>
            </div>
            <button
              type="button"
              className={adminDashboardStyles.closeButton}
              onClick={handleCloseUserDetail}
              aria-label={t('usersPanel.details.close')}
            >
              ✕
            </button>
          </div>

          {isUserInsightsPlaceholder && (
            <div className={adminDashboardStyles.infoAlert}>
              <p>
                {userInsightsFeatureEnabled
                  ? t('usersPanel.details.placeholder')
                  : t('usersPanel.details.disabled')}
              </p>
            </div>
          )}

          {userInsightsError && (
            <p className={adminDashboardStyles.errorText}>{userInsightsError}</p>
          )}

          <section className={adminDashboardStyles.userDetailGrid}>
            {userDetailStats.map((card) => (
              <div key={card.key} className={adminDashboardStyles.userDetailCard}>
                <span className={adminDashboardStyles.detailLabel}>{card.label}</span>
                <span className={adminDashboardStyles.detailValue}>{card.value}</span>
              </div>
            ))}
          </section>

          <section className={adminDashboardStyles.userDetailSection}>
            <div className={adminDashboardStyles.sectionHeader}>
              <div>
                <p className={adminDashboardStyles.sectionTitle}>
                  {t('usersPanel.details.investments.title')}
                </p>
                <p className={adminDashboardStyles.sectionSubtitle}>
                  {t('usersPanel.details.investments.subtitle')}
                </p>
              </div>
            </div>
            <div className={adminDashboardStyles.userDetailTableWrapper}>
              {isUserInsightsLoading ? (
                <p className={adminDashboardStyles.usersPlaceholder}>{t('usersPanel.loading')}</p>
              ) : userInsights?.investments?.length ? (
                <table className={adminDashboardStyles.table}>
                  <thead>
                    <tr>
                      <th className={adminDashboardStyles.theadCell}>
                        {t('usersPanel.details.investments.columns.property')}
                      </th>
                      <th className={adminDashboardStyles.theadCell}>
                        {t('usersPanel.details.investments.columns.amount')}
                      </th>
                      <th className={adminDashboardStyles.theadCell}>
                        {t('usersPanel.details.investments.columns.date')}
                      </th>
                      <th className={adminDashboardStyles.theadCell}>
                        {t('usersPanel.details.investments.columns.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userInsights.investments.map((investment) => (
                      <tr key={`${investment.propertyId}-${investment.investedAt}`}>
                        <td className={adminDashboardStyles.cell}>
                          <div className={adminDashboardStyles.assetInfo}>
                            <span className={adminDashboardStyles.title}>{investment.propertyTitle}</span>
                            {typeof investment.shares === 'number' && (
                              <span className={adminDashboardStyles.subtitle}>
                                {t('usersPanel.details.investments.shares', { count: investment.shares })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={adminDashboardStyles.cell}>
                          {currencyFormatter.format(investment.amount)}
                        </td>
                        <td className={adminDashboardStyles.cell}>
                          {investment.investedAt
                            ? new Intl.DateTimeFormat(locale, {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit',
                              }).format(new Date(investment.investedAt))
                            : '—'}
                        </td>
                        <td className={adminDashboardStyles.cell}>
                          {investment.status ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={adminDashboardStyles.usersPlaceholder}>
                  {t('usersPanel.details.investments.empty')}
                </p>
              )}
            </div>
          </section>

          <section className={adminDashboardStyles.userDetailSection}>
            <div className={adminDashboardStyles.sectionHeader}>
              <div>
                <p className={adminDashboardStyles.sectionTitle}>
                  {t('usersPanel.details.activity.title')}
                </p>
                <p className={adminDashboardStyles.sectionSubtitle}>
                  {t('usersPanel.details.activity.subtitle')}
                </p>
              </div>
            </div>
            {isUserInsightsLoading ? (
              <p className={adminDashboardStyles.usersPlaceholder}>{t('usersPanel.loading')}</p>
            ) : userInsights?.activity?.length ? (
              <ul className={adminDashboardStyles.userActivityList}>
                {userInsights.activity.map((action) => (
                  <li key={action.id} className={adminDashboardStyles.userActivityItem}>
                    <div>
                      <p className={adminDashboardStyles.userActivityType}>{action.type}</p>
                      <p className={adminDashboardStyles.userActivityDescription}>{action.description}</p>
                    </div>
                    <span className={adminDashboardStyles.userActivityDate}>
                      {formatDistanceToNow(new Date(action.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={adminDashboardStyles.usersPlaceholder}>
                {t('usersPanel.details.activity.empty')}
              </p>
            )}
          </section>
        </motion.section>
      </>
    );

  const renderActivePanel = () => {
    if (!activePanel) {
      return (
        <div className={adminDashboardStyles.panelPlaceholder}>
          <p>{t('navigation.selectPrompt')}</p>
        </div>
      );
    }
    if (activePanel === 'portfolio') {
      return portfolioPanel;
    }
    if (activePanel === 'inventory') {
      return inventoryPanel;
    }
    if (activePanel === 'brands') {
      if (!isSuperAdmin) {
        return (
          <div className={adminDashboardStyles.panelPlaceholder}>
            <p>{t('navigation.locked')}</p>
          </div>
        );
      }
      return brandsPanel;
    }
    if (activePanel === 'users') {
      if (!isAdmin) {
        return (
          <div className={adminDashboardStyles.panelPlaceholder}>
            <p>{t('navigation.locked')}</p>
          </div>
        );
      }
      return usersPanel;
    }
    return null;
  };

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
            {isAdmin && (
              <button
                type="button"
                className={adminDashboardStyles.ghostButton}
                onClick={() => setActivePanel('users')}
              >
                {t('actions.openUsers')}
              </button>
            )}
            <button type="button" className={adminDashboardStyles.primaryButton} onClick={handleOpenCreate}>
              {t('actions.newProperty')}
            </button>
          </div>
        </section>

        <section className={adminDashboardStyles.heroHighlights}>
          {heroHighlights.map((highlight) => (
            <div key={highlight.key} className={adminDashboardStyles.heroHighlightCard}>
              <span className={adminDashboardStyles.heroHighlightValue}>{highlight.value}</span>
              <span className={adminDashboardStyles.heroHighlightLabel}>{highlight.label}</span>
            </div>
          ))}
        </section>

        <section className={adminDashboardStyles.quickNavGrid}>
          {quickNavItems.map((item) => {
            const cardContent = (
              <>
                <div className={adminDashboardStyles.quickNavHeader}>
                  <span className={adminDashboardStyles.quickNavIcon}>{item.icon}</span>
                  <span className={adminDashboardStyles.quickNavLabel}>{item.label}</span>
                  <span aria-hidden="true" className={adminDashboardStyles.quickNavGlyph}>
                    ↗
                  </span>
                </div>
                <p className={adminDashboardStyles.quickNavDescription}>{item.description}</p>
                {item.metric && (
                  <div className={adminDashboardStyles.quickNavMetric}>
                    <span className={adminDashboardStyles.quickNavMetricValue}>{item.metric}</span>
                    {item.metricLabel && (
                      <span className={adminDashboardStyles.quickNavMetricLabel}>{item.metricLabel}</span>
                    )}
                  </div>
                )}
              </>
            );
            if (item.type === 'link') {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={adminDashboardStyles.quickNavCard}
                  data-accent={item.accent}
                  data-size={item.size}
                  aria-label={item.label}
                >
                  {cardContent}
                </Link>
              );
            }
            const isActive = activePanel === item.panel;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActivePanel(item.panel)}
                className={adminDashboardStyles.quickNavCard}
                data-accent={item.accent}
                data-size={item.size}
                data-active={isActive ? 'true' : 'false'}
                aria-label={item.label}
                aria-pressed={isActive}
              >
                {cardContent}
              </button>
            );
          })}
        </section>

        <div className={adminDashboardStyles.panelViewport}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel ?? 'placeholder'}
              className={adminDashboardStyles.panelShell}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderActivePanel()}
            </motion.div>
          </AnimatePresence>
        </div>
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
      <AnimatePresence>{selectedUser && userDetailPanel}</AnimatePresence>
      <AnimatePresence>
        {selectedProperty && (
          <PropertyDetailModal
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
            onEdit={handleOpenEdit}
            onWorkflow={handleWorkflow}
            currencyFormatter={currencyFormatter}
            numberFormatter={numberFormatter}
            dateLocale={dateLocale}
            locale={locale}
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

interface PropertyDetailModalProps {
  property: AdminProperty;
  onClose: () => void;
  onEdit: (property: AdminProperty) => void;
  onWorkflow: (action: 'publish' | 'reject' | 'delete', property: AdminProperty) => void;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
  dateLocale: Locale;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

function PropertyDetailModal({
  property,
  onClose,
  onEdit,
  onWorkflow,
  currencyFormatter,
  numberFormatter,
  dateLocale,
  locale,
  t,
}: PropertyDetailModalProps) {
  const progress = Math.min(100, Math.round((property.soldShares / property.totalShares) * 100));
  const totalValue = property.pricePerShare * property.totalShares;

  return (
    <>
      <motion.div
        className={adminDashboardStyles.detailPanelOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
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
            <h2 className={adminDashboardStyles.detailTitle}>{property.title}</h2>
            <p className={adminDashboardStyles.subtitle}>
              {property.address || t('detail.location', { zone: property.zone, emirate: t(`emirates.${property.emirate}`) })}
            </p>
          </div>
          <button
            type="button"
            className={adminDashboardStyles.closeButton}
            onClick={onClose}
            aria-label={t('usersPanel.details.close')}
          >
            ✕
          </button>
        </div>

        <div className={adminDashboardStyles.detailGrid}>
          <div className={adminDashboardStyles.detailCard}>
            <span className={adminDashboardStyles.detailLabel}>{t('detail.pricePerShare')}</span>
            <span className={adminDashboardStyles.detailValue}>
              {currencyFormatter.format(property.pricePerShare)}
            </span>
          </div>
          <div className={adminDashboardStyles.detailCard}>
            <span className={adminDashboardStyles.detailLabel}>{t('detail.totalShares')}</span>
            <span className={adminDashboardStyles.detailValue}>
              {numberFormatter.format(property.totalShares)}
            </span>
          </div>
          <div className={adminDashboardStyles.detailCard}>
            <span className={adminDashboardStyles.detailLabel}>{t('detail.totalValue')}</span>
            <span className={adminDashboardStyles.detailValue}>
              {currencyFormatter.format(totalValue)}
            </span>
          </div>
        </div>

        <div className={adminDashboardStyles.detailSection}>
          <span className={adminDashboardStyles.detailSectionTitle}>{t('table.columns.progress')}</span>
          <div className={adminDashboardStyles.progressWrapper}>
            <span>
              {property.soldShares} / {property.totalShares} ({progress}%)
            </span>
            <span className={adminDashboardStyles.progressTrack}>
              <span
                className={adminDashboardStyles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </span>
          </div>
        </div>

        <div className={adminDashboardStyles.detailSection}>
          <span className={adminDashboardStyles.detailSectionTitle}>{t('detail.investorsTitle')}</span>
          {property.investors.length > 0 ? (
            <div className={adminDashboardStyles.investorsPanel}>
              <div className={adminDashboardStyles.investorList}>
                {property.investors.slice(0, 5).map((investor, index) => (
                  <div key={index} className={adminDashboardStyles.investorChip}>
                    <div className={adminDashboardStyles.investorInfo}>
                      <span className={adminDashboardStyles.investorName}>{investor.name}</span>
                      {investor.email && (
                        <span className={adminDashboardStyles.investorMeta}>{investor.email}</span>
                      )}
                    </div>
                    <div className={adminDashboardStyles.investorMeta}>
                      {investor.shares && (
                        <span>{t('detail.shares', { count: investor.shares })}</span>
                      )}
                      {investor.amount && (
                        <span>{currencyFormatter.format(investor.amount)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {property.investors.length > 5 && (
                <p className={adminDashboardStyles.subtitle}>
                  +{property.investors.length - 5} {t('table.investorsCount', { count: property.investors.length - 5 })}
                </p>
              )}
            </div>
          ) : (
            <p className={adminDashboardStyles.subtitle}>{t('detail.noInvestors')}</p>
          )}
        </div>

        <div className={adminDashboardStyles.primaryActionsSection}>
          <div className={adminDashboardStyles.primaryActions}>
            {property.status !== 'published' && (
              <button
                type="button"
                className={adminDashboardStyles.publishButton}
                onClick={() => onWorkflow('publish', property)}
              >
                {t('detail.actions.publish')}
              </button>
            )}
            {property.status !== 'rejected' && property.status !== 'published' && (
              <button
                type="button"
                className={adminDashboardStyles.rejectButton}
                onClick={() => onWorkflow('reject', property)}
              >
                {t('detail.actions.reject')}
              </button>
            )}
          </div>
          <div className={adminDashboardStyles.secondaryActions}>
            <button
              type="button"
              className={adminDashboardStyles.ghostButton}
              onClick={() => onEdit(property)}
            >
              {t('detail.actions.edit')}
            </button>
            <button
              type="button"
              className={adminDashboardStyles.deleteButton}
              onClick={() => onWorkflow('delete', property)}
            >
              {t('detail.actions.delete')}
            </button>
          </div>
        </div>
      </motion.section>
    </>
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