'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { adminService, type AdminUser } from '@/lib/api/admin';
import { Select } from '@/app/ui/select';
import { adminUsersPageStyles } from './adminUsersPage.styles';

type StatusFilter = 'all' | 'active' | 'inactive';
type RoleFilter = 'all' | 'client' | 'admin' | 'superadmin';

export default function AdminUsersPage() {
  const router = useRouter();
  const locale = useLocale();
  const tAuth = useTranslations('auth');
  const tAdmin = useTranslations('adminUsers');
  const { user, isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusActionId, setStatusActionId] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<AdminUser | null>(null);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: tAdmin('filters.status.all') },
      { value: 'active', label: tAdmin('filters.status.active') },
      { value: 'inactive', label: tAdmin('filters.status.inactive') },
    ],
    [tAdmin],
  );

  const roleOptions = useMemo(
    () => [
      { value: 'all', label: tAdmin('filters.role.all') },
      { value: 'client', label: tAdmin('filters.role.client') },
      { value: 'admin', label: tAdmin('filters.role.admin') },
      { value: 'superadmin', label: tAdmin('filters.role.superadmin') },
    ],
    [tAdmin],
  );

  // Données filtrées
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Filtre par statut
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;

      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Filtre par recherche (email, prénom, nom)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchFirst = u.firstName?.toLowerCase().includes(q);
        const matchLast = u.lastName?.toLowerCase().includes(q);
        if (!matchEmail && !matchFirst && !matchLast) return false;
      }

      return true;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, totalPages]);

  // Reset pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  // Protection d'accès superadmin
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push(`/${locale}/login`);
      return;
    }

    if (user.role !== 'superadmin') {
      router.push(`/${locale}/wallet`);
    }
  }, [isAuthenticated, user, locale, router]);

  // Chargement des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminService.listUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des utilisateurs');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'superadmin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const handleRoleChange = async (id: string, nextRole: string) => {
    try {
      setError(null);
      const updated = await adminService.updateUserRole(id, nextRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u)),
      );
    } catch (err: any) {
      setError(err.message || tAdmin('errors.updateUser'));
    }
  };

  const handleStatusToggle = async (id: string, nextStatus: boolean) => {
    try {
      setError(null);
      setStatusActionId(id);
      const updated = await adminService.updateUserStatus(id, nextStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isActive: updated.isActive } : u,
        ),
      );
    } catch (err: any) {
      setError(err.message || tAdmin('errors.updateUser'));
    } finally {
      setStatusActionId(null);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <main className={adminUsersPageStyles.container}>
        <p className={adminUsersPageStyles.loading}>{tAuth('loading')}</p>
      </main>
    );
  }

  return (
    <main className={adminUsersPageStyles.container}>
      <motion.div
        className={adminUsersPageStyles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <header className={adminUsersPageStyles.headerRow}>
          <div>
            <h1 className={adminUsersPageStyles.title}>
              {tAdmin('title')}
            </h1>
            <p className={adminUsersPageStyles.subtitle}>
              {tAdmin('subtitle', { email: user.email })}
            </p>
          </div>
        </header>

        {error && <p className={adminUsersPageStyles.error}>{error}</p>}

        <section className={adminUsersPageStyles.tableWrapper}>
          <div className={adminUsersPageStyles.filtersRow}>
            <input
              type="text"
              placeholder={tAdmin('filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={adminUsersPageStyles.filterInput}
            />

            <div className={adminUsersPageStyles.filterSelectWrapper}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                options={statusOptions}
                aria-label={tAdmin('filters.status.all')}
                variant="compact"
                className={adminUsersPageStyles.filterSelect}
              />
            </div>

            <div className={adminUsersPageStyles.filterSelectWrapper}>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                options={roleOptions}
                aria-label={tAdmin('filters.role.all')}
                variant="compact"
                className={adminUsersPageStyles.filterSelect}
              />
            </div>
          </div>

          <div
            className={adminUsersPageStyles.tableScrollArea}
            data-lenis-prevent
            data-lenis-prevent-wheel
            data-lenis-prevent-touch
            tabIndex={0}
            aria-label={tAdmin('aria.table')}
          >
            {isLoading ? (
              <p className={adminUsersPageStyles.loading}>{tAuth('loading')}</p>
            ) : filteredUsers.length === 0 ? (
              <p className={adminUsersPageStyles.loading}>
                {users.length === 0
                  ? tAdmin('empty.noUsers')
                  : tAdmin('empty.noResults')}
              </p>
            ) : (
              <table className={adminUsersPageStyles.table}>
                <thead>
                  <tr>
                    <th className={adminUsersPageStyles.theadCell}>{tAdmin('headers.user')}</th>
                    <th className={adminUsersPageStyles.theadCell}>{tAdmin('headers.role')}</th>
                    <th className={adminUsersPageStyles.theadCell}>{tAdmin('headers.status')}</th>
                    <th className={adminUsersPageStyles.theadCell}>{tAdmin('headers.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u) => {
                    const isAdmin = u.role === 'admin';
                    const isSuperAdmin = u.role === 'superadmin';
                    return (
                      <tr key={u.id} className={adminUsersPageStyles.row}>
                        <td className={adminUsersPageStyles.cell}>
                          <div className={adminUsersPageStyles.emailCell}>
                            <div>{u.email}</div>
                            <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                              {u.firstName} {u.lastName}
                            </div>
                          </div>
                        </td>
                        <td className={adminUsersPageStyles.cell}>
                          <span
                            className={[
                              adminUsersPageStyles.roleBadge,
                              isAdmin
                                ? adminUsersPageStyles.roleBadgeAdmin
                                : isSuperAdmin
                                ? adminUsersPageStyles.roleBadgeSuperadmin
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className={adminUsersPageStyles.cell}>
                          <span className={adminUsersPageStyles.statusWrapper}>
                            <span
                              className={adminUsersPageStyles.statusDot}
                              style={{
                                backgroundColor: u.isActive
                                  ? '#00ff94'
                                  : 'rgba(255,255,255,0.3)',
                              }}
                            />
                            <span className={adminUsersPageStyles.statusText}>
                              {u.isActive ? tAdmin('status.active') : tAdmin('status.inactive')}
                            </span>
                          </span>
                        </td>
                        <td className={adminUsersPageStyles.cell}>
                          <button
                            type="button"
                            className={adminUsersPageStyles.actionsTriggerBtn}
                            onClick={() => setActiveUser(u)}
                          >
                            {tAdmin('actions.manage')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {!isLoading && filteredUsers.length > 0 && (
            <div className={adminUsersPageStyles.paginationRow}>
              <span className={adminUsersPageStyles.paginationInfo}>
                {tAdmin('pagination.info', {
                  currentPage,
                  totalPages,
                  total: filteredUsers.length,
                })}
              </span>
              <div className={adminUsersPageStyles.paginationButtons}>
                <button
                  type="button"
                  className={adminUsersPageStyles.paginationButton}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {tAdmin('pagination.prev')}
                </button>
                <button
                  type="button"
                  className={adminUsersPageStyles.paginationButton}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  {tAdmin('pagination.next')}
                </button>
              </div>
            </div>
          )}
        </section>
        {activeUser && (
          <UserActionsModal
            user={activeUser}
            isSavingId={statusActionId}
            onClose={() => setActiveUser(null)}
            onUserUpdated={(updated) => {
              setUsers((prev) =>
                prev.map((u) => (u.id === updated.id ? updated : u)),
              );
              setActiveUser(null);
            }}
            onRoleChange={handleRoleChange}
            onStatusToggle={handleStatusToggle}
          />
        )}
      </motion.div>
    </main>
  );
}

interface UserActionsModalProps {
  user: AdminUser;
  isSavingId: string | null;
  onClose: () => void;
  onUserUpdated: (user: AdminUser) => void;
  onRoleChange: (id: string, role: string) => Promise<void>;
  onStatusToggle: (id: string, nextStatus: boolean) => Promise<void>;
}

function UserActionsModal({
  user,
  isSavingId,
  onClose,
  onUserUpdated,
  onRoleChange,
  onStatusToggle,
}: UserActionsModalProps) {
  const tAdmin = useTranslations('adminUsers');
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      let current: AdminUser = user;

      if (role !== user.role) {
        await onRoleChange(user.id, role);
        current = { ...current, role };
      }

      if (isActive !== user.isActive) {
        await onStatusToggle(user.id, isActive);
        current = { ...current, isActive };
      }

      onUserUpdated(current);
    } catch (err: any) {
      setError(err.message || tAdmin('errors.updateUser'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={adminUsersPageStyles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-actions-title"
      onClick={onClose}
    >
      <motion.div
        className={adminUsersPageStyles.modalContent}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={adminUsersPageStyles.modalHeader}>
          <div>
            <h2
              id="user-actions-title"
              className={adminUsersPageStyles.modalTitle}
            >
              {tAdmin('modal.title')}
            </h2>
            <p className={adminUsersPageStyles.modalSubtitle}>{user.email}</p>
          </div>
          <button
            type="button"
            className={adminUsersPageStyles.modalCloseBtn}
            onClick={onClose}
            aria-label={tAdmin('modal.closeAriaLabel')}
          >
            ×
          </button>
        </div>

        <div className={adminUsersPageStyles.modalBody}>
          <div className={adminUsersPageStyles.modalFieldGroup}>
            <span className={adminUsersPageStyles.modalFieldLabel}>
              {tAdmin('modal.roleLabel')}
            </span>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'client', label: tAdmin('roles.client') },
                { value: 'admin', label: tAdmin('roles.admin') },
                { value: 'superadmin', label: tAdmin('roles.superadmin') },
              ]}
              aria-label={tAdmin('modal.roleAriaLabel')}
              variant="compact"
              className={adminUsersPageStyles.modalSelect}
            />
          </div>

          <div className={adminUsersPageStyles.modalFieldGroup}>
            <span className={adminUsersPageStyles.modalFieldLabel}>
              {tAdmin('modal.accountStatusLabel')}
            </span>
            <button
              type="button"
              className={[
                adminUsersPageStyles.modalStatusToggle,
                isActive
                  ? adminUsersPageStyles.modalStatusActive
                  : adminUsersPageStyles.modalStatusInactive,
              ].join(' ')}
              onClick={() => setIsActive((prev) => !prev)}
            >
              <span className={adminUsersPageStyles.modalStatusSwitchTrack}>
                <span
                  className={adminUsersPageStyles.modalStatusSwitchThumb}
                  data-active={isActive ? 'true' : 'false'}
                />
              </span>
              <span className={adminUsersPageStyles.modalStatusSwitchLabel}>
                {isActive
                  ? tAdmin('modal.statusActiveLabel')
                  : tAdmin('modal.statusInactiveLabel')}
              </span>
            </button>
            {!isActive && (
              <p className={adminUsersPageStyles.modalWarning}>
                {tAdmin('modal.deactivationWarning')}
              </p>
            )}
          </div>

          {error && (
            <p className={adminUsersPageStyles.modalError}>{error}</p>
          )}
        </div>

        <div className={adminUsersPageStyles.modalFooter}>
          <button
            type="button"
            className={adminUsersPageStyles.modalSecondaryBtn}
            onClick={onClose}
            disabled={isSaving}
          >
            {tAdmin('modal.cancel')}
          </button>
          <button
            type="button"
            className={adminUsersPageStyles.modalPrimaryBtn}
            onClick={handleSave}
            disabled={isSaving || (role === user.role && isActive === user.isActive)}
          >
            {isSaving || isSavingId === user.id
              ? tAdmin('modal.saving')
              : tAdmin('modal.save')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

