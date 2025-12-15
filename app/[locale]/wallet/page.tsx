"use client";

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { walletPageStyles } from './walletPage.styles';
import { useAuthStore } from '@/lib/store/auth-store';
import { AvatarUpload } from '@/app/components/profile/AvatarUpload';
import { userService, UpdateProfilePayload } from '@/lib/api/user';
import { showToast } from '@/lib/ui/toast';
import { cn } from '@/lib/utils';

const optionalText = (max = 255) =>
  z
    .string()
    .max(max, `Max ${max} caractères`)
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value.trim() : ''));

const profileFormSchema = z.object({
  firstName: optionalText(100),
  lastName: optionalText(100),
  bankAccountHolder: optionalText(255),
  bankName: optionalText(255),
  iban: optionalText(34),
  swiftCode: optionalText(11),
  payoutMethod: optionalText(100),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const toFormDefaults = (user: ReturnType<typeof useAuthStore.getState>['user']): ProfileFormValues => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  bankAccountHolder: user?.bankAccountHolder ?? '',
  bankName: user?.bankName ?? '',
  iban: user?.iban ?? '',
  swiftCode: user?.swiftCode ?? '',
  payoutMethod: user?.payoutMethod ?? '',
});

const sanitizePayload = (values: ProfileFormValues): UpdateProfilePayload => {
  const entries = Object.entries(values).map(([key, value]) => [key, value?.trim ? value.trim() : value]);
  return Object.fromEntries(
    entries.map(([key, value]) => [key, value ? value : null]),
  ) as UpdateProfilePayload;
};

const getInitials = (value: string) => {
  if (!value) return '👤';
  const parts = value.trim().split(' ').filter(Boolean);
  if (!parts.length) return '👤';
  const [first, second] = parts;
  return `${first?.charAt(0) ?? ''}${second?.charAt(0) ?? ''}`.toUpperCase() || '👤';
};

export default function WalletPage() {
  const t = useTranslations('wallet');
  const { user, isAuthenticated, refreshUserProfile, setUser } = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    refreshUserProfile: state.refreshUserProfile,
    setUser: state.setUser,
  }));

  const [isHydrated, setIsHydrated] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'account' | 'preferences'>('personal');
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [parallaxStyle, setParallaxStyle] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const tabButtonRefs = {
    personal: useRef<HTMLButtonElement>(null),
    account: useRef<HTMLButtonElement>(null),
    preferences: useRef<HTMLButtonElement>(null),
  };
  
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toFormDefaults(user),
    mode: 'onBlur',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = form;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (user) {
      reset(toFormDefaults(user));
    }
  }, [user, reset]);

  useEffect(() => {
    if (!user && isAuthenticated) {
      refreshUserProfile().catch(() => undefined);
    }
  }, [user, isAuthenticated, refreshUserProfile]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = tabButtonRefs[activeTab].current;
      if (activeButton) {
        const buttonsContainer = activeButton.parentElement;
        if (buttonsContainer) {
          const containerRect = buttonsContainer.getBoundingClientRect();
          const buttonRect = activeButton.getBoundingClientRect();
          setIndicatorStyle({
            left: buttonRect.left - containerRect.left,
            width: buttonRect.width,
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardsContainerRef.current) return;
      
      const rect = cardsContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      
      setParallaxStyle({ x, y });
    };

    const container = cardsContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const fullName = useMemo(() => {
    if (!user) return '';
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  }, [user]);
  const heroInitials = useMemo(() => getInitials(fullName || user?.email || ''), [fullName, user?.email]);

  const walletSummary = useMemo(
    () => ({
      balance: '24 500 AED',
      incoming: '+4 200 AED',
      outgoing: '-1 150 AED',
    }),
    [],
  );

  const transactionHistory = useMemo(
    () => [
      { id: '1', label: t('history.deposit'), date: '15 Jan 2025 · 10:24', amount: '+2 000 AED', positive: true },
      { id: '2', label: t('history.transferOut'), date: '11 Jan 2025 · 18:12', amount: '-750 AED', positive: false },
      { id: '3', label: t('history.purchase'), date: '05 Jan 2025 · 09:05', amount: '-12 300 AED', positive: false },
    ],
    [t],
  );

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSubmit = async (values: ProfileFormValues) => {
    const payload = sanitizePayload(values);
    try {
      const updatedUser = await userService.updateProfile(payload);
      setUser(updatedUser);
      reset(toFormDefaults(updatedUser));
      showToast({
        title: t('notifications.profileUpdatedTitle'),
        description: t('notifications.profileUpdatedDescription'),
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: t('notifications.errorTitle'),
        description: error instanceof Error ? error.message : t('notifications.genericError'),
        variant: 'error',
      });
    }
  };

  const handleAvatarFile = async (file: File) => {
    setIsAvatarUploading(true);
    try {
      const response = await userService.uploadAvatar(file);
      setUser(response.user);
      showToast({
        title: t('notifications.avatarUpdatedTitle'),
        description: t('notifications.avatarUpdatedDescription'),
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: t('notifications.errorTitle'),
        description: error instanceof Error ? error.message : t('notifications.genericError'),
        variant: 'error',
      });
    } finally {
      setIsAvatarUploading(false);
    }
  };

  if (!isHydrated) {
    return (
      <main className={walletPageStyles.container}>
        <p className={walletPageStyles.loading}>{t('loading')}</p>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className={walletPageStyles.container}>
        <p className={walletPageStyles.loading}>{t('loading')}</p>
      </main>
    );
  }

  return (
    <main className={walletPageStyles.container}>
      <section className={walletPageStyles.hero}>
        <div className={walletPageStyles.heroOverlay}>
          <div className={walletPageStyles.heroGrid}>
            <div className={walletPageStyles.profileCard}>
              <div className={walletPageStyles.profileHeader}>
                <button
                  type="button"
                  className={walletPageStyles.profileAvatarButton}
                  onMouseEnter={() => setIsAvatarHovered(true)}
                  onMouseLeave={() => setIsAvatarHovered(false)}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/jpeg,image/png,image/webp';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleAvatarFile(file);
                    };
                    input.click();
                  }}
                  disabled={isAvatarUploading}
                >
                  <div
                    className={walletPageStyles.profileAvatar}
                    style={{
                      borderColor: isAvatarHovered ? 'rgba(255,255,255,0.4)' : undefined,
                    }}
                  >
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt="Avatar" width={80} height={80} />
                    ) : (
                      <span>{heroInitials}</span>
                    )}
                    {!isAvatarUploading && (
                      <div
                        className={walletPageStyles.avatarEditOverlay}
                        style={{ opacity: isAvatarHovered ? 1 : 0 }}
                      >
                        <span>✏️</span>
                      </div>
                    )}
                  </div>
                </button>
                <div className={walletPageStyles.profileText}>
                  <p className={walletPageStyles.profileName}>
                    {fullName || t('placeholders.noName')}
                  </p>
                  <p className={walletPageStyles.profileEmail}>{user.email}</p>
                </div>
              </div>

              <div className={walletPageStyles.tabsBox}>
                <div className={walletPageStyles.tabsButtonsContainer}>
                  <button
                    ref={tabButtonRefs.personal}
                    type="button"
                    className={cn(walletPageStyles.tabButton, activeTab === 'personal' && walletPageStyles.tabButtonActive)}
                    onClick={() => setActiveTab('personal')}
                  >
                    {t('tabs.personal')}
                  </button>
                  <button
                    ref={tabButtonRefs.account}
                    type="button"
                    className={cn(walletPageStyles.tabButton, activeTab === 'account' && walletPageStyles.tabButtonActive)}
                    onClick={() => setActiveTab('account')}
                  >
                    {t('tabs.account')}
                  </button>
                  <button
                    ref={tabButtonRefs.preferences}
                    type="button"
                    className={cn(walletPageStyles.tabButton, activeTab === 'preferences' && walletPageStyles.tabButtonActive)}
                    onClick={() => setActiveTab('preferences')}
                  >
                    {t('tabs.preferences')}
                  </button>
                </div>
                <div className={walletPageStyles.tabsBarContainer}>
                  <div className={walletPageStyles.tabsBar} />
                  {/* Underline blanc sur la barre */}
                  <div
                    className={walletPageStyles.tabsIndicator}
                    style={{
                      left: `${indicatorStyle.left}px`,
                      width: `${indicatorStyle.width}px`,
                    }}
                  />
                  {/* Zone blanche sous la barre (descendante) */}
                  <div
                    className={walletPageStyles.tabsUnderlay}
                    style={{
                      left: `${indicatorStyle.left}px`,
                      width: `${indicatorStyle.width}px`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={walletPageStyles.balanceCard}>
              <div className={walletPageStyles.cardsContainer} ref={cardsContainerRef}>
                {/* Carte arrière-plan 3 (la plus éloignée) */}
                <div 
                  className={walletPageStyles.bankCard}
                  style={{
                    // Base: petite, centrée, très haute
                    left: '50%',
                    transform: `translate3d(-50%, ${-40 + parallaxStyle.y * 8}px, -70px) scale(0.7)`,
                    top: '0px',
                    opacity: 0.5,
                    filter: 'brightness(0.6) saturate(1.05)',
                    zIndex: 1,
                  }}
                />
                
                {/* Carte arrière-plan 2 */}
                <div 
                  className={walletPageStyles.bankCard}
                  style={{
                    // Base: intermédiaire, centrée, au-dessus de la principale
                    left: '50%',
                    transform: `translate3d(-50%, ${-14 + parallaxStyle.y * 6}px, -35px) scale(0.84)`,
                    top: '12px',
                    opacity: 0.78,
                    filter: 'brightness(0.78) saturate(1.08)',
                    zIndex: 2,
                  }}
                />
                
                {/* Carte principale avec le solde */}
                <div 
                  className={walletPageStyles.bankCard}
                  style={{
                    // Base: la plus grande, centrée et nettement plus basse
                    left: '50%',
                    transform: `translate3d(-50%, ${18 + parallaxStyle.y * 5}px, 0px) scale(1)`,
                    top: '26px',
                    opacity: 1,
                    filter: 'brightness(1.06) saturate(1.15)',
                    zIndex: 3,
                  }}
                >
                  <div className={walletPageStyles.bankCardContent}>
                    <p className={walletPageStyles.balanceTitle}>{t('balance.title')}</p>
                    <p className={walletPageStyles.balanceValue}>{walletSummary.balance}</p>
                    <p className={walletPageStyles.balanceSubtext}>{t('balance.subtext')}</p>
                  </div>
                </div>
              </div>

              <div className={walletPageStyles.balanceStats}>
                <div className={walletPageStyles.statBlock}>
                  <span className={walletPageStyles.statLabel}>{t('balance.incomingLabel')}</span>
                  <span className={walletPageStyles.statValue}>{walletSummary.incoming}</span>
                </div>
                <div className={walletPageStyles.statBlock}>
                  <span className={walletPageStyles.statLabel}>{t('balance.outgoingLabel')}</span>
                  <span className={walletPageStyles.statValue}>{walletSummary.outgoing}</span>
                </div>
              </div>

              <div className={walletPageStyles.balanceActions}>
                <button type="button" className={walletPageStyles.primaryButton}>
                  {t('balance.addFunds')}
                </button>
                <button type="button" className={walletPageStyles.secondaryButton}>
                  {t('balance.transfer')}
                </button>
              </div>

              <div>
                <p className={walletPageStyles.balanceTitle}>{t('history.title')}</p>
                <div className={walletPageStyles.historyList}>
                  {transactionHistory.length === 0 ? (
                    <p className={walletPageStyles.balanceSubtext}>{t('history.empty')}</p>
                  ) : (
                    transactionHistory.map((entry) => (
                      <div key={entry.id} className={walletPageStyles.historyItem}>
                        <div className={walletPageStyles.historyMeta}>
                          <span>{entry.label}</span>
                          <span>{entry.date}</span>
                        </div>
                        <span
                          className={
                            entry.positive ? walletPageStyles.historyAmountPositive : walletPageStyles.historyAmountNegative
                          }
                        >
                          {entry.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={walletPageStyles.content}>
          <section className={walletPageStyles.panel}>
            <div className={walletPageStyles.panelHeader}>
            <p className={walletPageStyles.panelTitle}>{t('detailsPanelTitle')}</p>
            <p className={walletPageStyles.panelDescription}>{t('detailsPanelDescription')}</p>
            </div>

            <div className={walletPageStyles.avatarSection}>
              <AvatarUpload
                value={user.avatarUrl ?? undefined}
                fallbackName={fullName || user.email}
                isUploading={isAvatarUploading}
                onFileSelected={handleAvatarFile}
              />
            </div>

          <form ref={formRef} className={walletPageStyles.form} onSubmit={handleSubmit(onSubmit)}>
              <div className={walletPageStyles.twoColumns}>
                <div className={walletPageStyles.fieldGroup}>
                  <label className={walletPageStyles.fieldLabel}>{t('fields.firstName')}</label>
                  <input
                    className={walletPageStyles.textInput}
                    placeholder={t('placeholders.firstName')}
                    {...register('firstName')}
                  />
                  {errors.firstName && <span className={walletPageStyles.errorText}>{errors.firstName.message}</span>}
                </div>
                <div className={walletPageStyles.fieldGroup}>
                  <label className={walletPageStyles.fieldLabel}>{t('fields.lastName')}</label>
                  <input
                    className={walletPageStyles.textInput}
                    placeholder={t('placeholders.lastName')}
                    {...register('lastName')}
                  />
                  {errors.lastName && <span className={walletPageStyles.errorText}>{errors.lastName.message}</span>}
                </div>
              </div>

              <div className={walletPageStyles.sectionDivider}>
                <span className={walletPageStyles.bankStatusTag}>{t('bankStatus.tag')}</span>
              </div>

              <div className={walletPageStyles.twoColumns}>
                <div className={walletPageStyles.fieldGroup}>
                  <label className={walletPageStyles.fieldLabel}>{t('fields.bankAccountHolder')}</label>
                  <input
                    className={walletPageStyles.textInput}
                    placeholder={t('placeholders.bankAccountHolder')}
                    {...register('bankAccountHolder')}
                  />
                  {errors.bankAccountHolder && (
                    <span className={walletPageStyles.errorText}>{errors.bankAccountHolder.message}</span>
                  )}
                </div>
                <div className={walletPageStyles.fieldGroup}>
                  <label className={walletPageStyles.fieldLabel}>{t('fields.bankName')}</label>
                  <input
                    className={walletPageStyles.textInput}
                    placeholder={t('placeholders.bankName')}
                    {...register('bankName')}
                  />
                  {errors.bankName && <span className={walletPageStyles.errorText}>{errors.bankName.message}</span>}
                </div>
              </div>

              <div className={walletPageStyles.twoColumns}>
                <div className={walletPageStyles.fieldGroup}>
                  <label className={walletPageStyles.fieldLabel}>{t('fields.iban')}</label>
                  <input
                    className={walletPageStyles.textInput}
                    placeholder={t('placeholders.iban')}
                    {...register('iban')}
                  />
                  {errors.iban && <span className={walletPageStyles.errorText}>{errors.iban.message}</span>}
                </div>
                <div className={walletPageStyles.fieldGroup}>
                  <label className={walletPageStyles.fieldLabel}>{t('fields.swiftCode')}</label>
                  <input
                    className={walletPageStyles.textInput}
                    placeholder={t('placeholders.swiftCode')}
                    {...register('swiftCode')}
                  />
                  {errors.swiftCode && <span className={walletPageStyles.errorText}>{errors.swiftCode.message}</span>}
                </div>
              </div>

              <div className={walletPageStyles.fieldGroup}>
                <label className={walletPageStyles.fieldLabel}>{t('fields.payoutMethod')}</label>
                <input
                  className={walletPageStyles.textInput}
                  placeholder={t('placeholders.payoutMethod')}
                  {...register('payoutMethod')}
                />
                {errors.payoutMethod && <span className={walletPageStyles.errorText}>{errors.payoutMethod.message}</span>}
              </div>

              <div className={walletPageStyles.actionsRow}>
                <button type="submit" className={walletPageStyles.saveButton} disabled={!isDirty || isSubmitting}>
                  {isSubmitting ? t('actions.saving') : t('actions.save')}
                </button>
              </div>
            </form>
          </section>
      </div>
    </main>
  );
}