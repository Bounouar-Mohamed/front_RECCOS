"use client";

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

import { walletPageStyles } from './walletPage.styles';
import { useAuthStore } from '@/lib/store/auth-store';
import { userService, UpdateProfilePayload } from '@/lib/api/user';
import { showToast } from '@/lib/ui/toast';
import { cn } from '@/lib/utils';
import { WalletHistoryRow, WalletHistoryTable } from '@/app/ui/walletHistoryTable';
import { TitleDeed } from '@/app/sections/titleDeed';
import { FilterBar } from '@/app/sections/filterBar';

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

const DRAWER_TOP_GAP = 18;

// Preferences state type
type UserPreferences = {
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorAuth: boolean;
};

// Payment method type (card or bank account)
type PaymentMethod = {
  id: string;
  methodType: 'card' | 'iban';
  // Card fields
  cardType?: 'mastercard' | 'visa';
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  // IBAN fields
  iban?: string;
  bankName?: string;
  swiftCode?: string;
  // Common fields
  holderName: string;
  isPrimary: boolean;
};

// Form state for adding/editing a payment method
type PaymentFormState = {
  methodType: 'card' | 'iban';
  // Card fields
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  // IBAN fields
  iban: string;
  bankName: string;
  swiftCode: string;
  // Common fields
  holderName: string;
  isPrimary: boolean;
};

// Legacy type alias for backwards compatibility
type CreditCard = PaymentMethod;

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
  const [historySearch, setHistorySearch] = useState('');
  const [balanceDrawerOpen, setBalanceDrawerOpen] = useState(false);
  const [bankCardContentHeight, setBankCardContentHeight] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'fr',
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: false,
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      methodType: 'card',
      cardType: 'mastercard',
      last4: '1234',
      isPrimary: true,
      expiryMonth: '03',
      expiryYear: '2026',
      holderName: 'John Doe',
    },
  ]);
  // Legacy alias
  const cards = paymentMethods;
  const setCards = setPaymentMethods;
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<PaymentFormState>({
    methodType: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    iban: '',
    bankName: '',
    swiftCode: '',
    holderName: '',
    isPrimary: false,
  });

  const tabButtonRefs = {
    personal: useRef<HTMLButtonElement>(null),
    account: useRef<HTMLButtonElement>(null),
    preferences: useRef<HTMLButtonElement>(null),
  };
  const tabsBarContainerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const bankCardContentRef = useRef<HTMLDivElement>(null);
  const balanceCardInnerRef = useRef<HTMLDivElement>(null);

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
      const barContainer = tabsBarContainerRef.current;
      if (!activeButton || !barContainer) return;

      const buttonsContainer = activeButton.parentElement;
      if (!buttonsContainer) return;

      const containerRect = buttonsContainer.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const left = buttonRect.left - containerRect.left;
      const width = buttonRect.width;

      barContainer.style.setProperty('--indicator-left', `${left}px`);
      barContainer.style.setProperty('--indicator-width', `${width}px`);
    };

    // Utiliser requestAnimationFrame pour s'assurer que le DOM est rendu
    requestAnimationFrame(() => {
      updateIndicator();
    });

    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardsContainerRef.current) return;

      const containerEl = cardsContainerRef.current;
      const rect = containerEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const y = (e.clientY - centerY) / rect.height;
      containerEl.style.setProperty('--parallax-y', String(y));
    };

    const container = cardsContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  useEffect(() => {
    const measureBankCardContent = () => {
      if (bankCardContentRef.current && balanceCardInnerRef.current) {
        const contentRect = bankCardContentRef.current.getBoundingClientRect();
        const innerRect = balanceCardInnerRef.current.getBoundingClientRect();

        // On calcule la distance depuis le bas du balanceCardInner jusqu'au bas du bankCardContent
        // Le drawer doit commencer juste au-dessus du bankCardContent pour qu'il soit entièrement visible
        const innerBottom = innerRect.bottom;
        const contentBottom = contentRect.bottom;

        // Distance depuis le bas du balanceCardInner jusqu'au bas du bankCardContent
        const distanceFromBottom = innerBottom - contentBottom;

        // La hauteur visible du drawer = distance depuis le bas + petit offset pour s'assurer que le contenu est visible
        // On ajoute un offset de 15-20px pour garantir que le contenu est entièrement visible
        const peekHeight = distanceFromBottom + 40;

        setBankCardContentHeight(Math.max(peekHeight, 140)); // Minimum 140px pour le handle + actions
      }
    };

    measureBankCardContent();
    window.addEventListener('resize', measureBankCardContent);
    // Re-mesurer après un petit délai pour s'assurer que tout est rendu
    const timeoutId = setTimeout(measureBankCardContent, 100);
    return () => {
      window.removeEventListener('resize', measureBankCardContent);
      clearTimeout(timeoutId);
    };
  }, [isHydrated]);

  const fullName = useMemo(() => {
    if (!user) return '';
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  }, [user]);
  const heroInitials = useMemo(() => getInitials(fullName || user?.email || ''), [fullName, user?.email]);

  const walletSummary = useMemo(
    () => ({
      balance: '24 500',
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

  const historyRows: WalletHistoryRow[] = useMemo(
    () =>
      transactionHistory
        .filter((entry) => {
          if (!historySearch.trim()) return true;
          const q = historySearch.toLowerCase();
          return (
            entry.label.toLowerCase().includes(q) ||
            entry.date.toLowerCase().includes(q) ||
            entry.amount.toLowerCase().includes(q)
          );
        })
        .map((entry) => ({
          id: entry.id,
          name: entry.label,
          type: entry.positive ? t('history.typeCredit') : t('history.typeDebit'),
          // Statut simplifié : Completed (ok) vs Pending (en attente)
          status: entry.positive ? t('history.statusCompleted') : t('history.statusPending'),
          date: entry.date,
        })),
    [transactionHistory, historySearch],
  );

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

  // Payment method management functions
  const resetCardForm = () => {
    setCardForm({
      methodType: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      iban: '',
      bankName: '',
      swiftCode: '',
      holderName: '',
      isPrimary: false,
    });
    setEditingCardId(null);
  };

  const openAddCardModal = () => {
    resetCardForm();
    setIsCardModalOpen(true);
  };

  const openEditCardModal = (method: PaymentMethod) => {
    setEditingCardId(method.id);
    if (method.methodType === 'card') {
      setCardForm({
        methodType: 'card',
        cardNumber: `**** **** **** ${method.last4 || ''}`,
        expiryDate: `${method.expiryMonth || ''}/${(method.expiryYear || '').slice(-2)}`,
        cvv: '',
        iban: '',
        bankName: '',
        swiftCode: '',
        holderName: method.holderName || '',
        isPrimary: method.isPrimary,
      });
    } else {
      setCardForm({
        methodType: 'iban',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        iban: method.iban || '',
        bankName: method.bankName || '',
        swiftCode: method.swiftCode || '',
        holderName: method.holderName || '',
        isPrimary: method.isPrimary,
      });
    }
    setIsCardModalOpen(true);
  };

  const closeCardModal = () => {
    setIsCardModalOpen(false);
    resetCardForm();
  };

  const detectCardType = (number: string): 'mastercard' | 'visa' => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    return 'visa';
  };

  const formatIban = (value: string): string => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleSaveCard = () => {
    if (cardForm.methodType === 'card') {
      // Handle card
      const cleanNumber = cardForm.cardNumber.replace(/\s/g, '');
      const last4 = cleanNumber.slice(-4);
      const [month, year] = cardForm.expiryDate.split('/');
      const fullYear = year?.length === 2 ? `20${year}` : year;

      if (editingCardId) {
        setPaymentMethods((prev) =>
          prev.map((method) => {
            if (method.id === editingCardId) {
              return {
                ...method,
                last4: last4 || method.last4,
                expiryMonth: month || method.expiryMonth,
                expiryYear: fullYear || method.expiryYear,
                holderName: cardForm.holderName || method.holderName,
                isPrimary: cardForm.isPrimary,
              };
            }
            if (cardForm.isPrimary) {
              return { ...method, isPrimary: false };
            }
            return method;
          })
        );
      } else {
        const newMethod: PaymentMethod = {
          id: Date.now().toString(),
          methodType: 'card',
          cardType: detectCardType(cleanNumber),
          last4,
          expiryMonth: month || '01',
          expiryYear: fullYear || '2025',
          holderName: cardForm.holderName,
          isPrimary: cardForm.isPrimary || paymentMethods.length === 0,
        };

        if (newMethod.isPrimary) {
          setPaymentMethods((prev) => [...prev.map((m) => ({ ...m, isPrimary: false })), newMethod]);
        } else {
          setPaymentMethods((prev) => [...prev, newMethod]);
        }
      }
    } else {
      // Handle IBAN
      const cleanIban = cardForm.iban.replace(/\s/g, '').toUpperCase();

      if (editingCardId) {
        setPaymentMethods((prev) =>
          prev.map((method) => {
            if (method.id === editingCardId) {
              return {
                ...method,
                iban: cleanIban,
                bankName: cardForm.bankName,
                swiftCode: cardForm.swiftCode,
                holderName: cardForm.holderName,
                isPrimary: cardForm.isPrimary,
              };
            }
            if (cardForm.isPrimary) {
              return { ...method, isPrimary: false };
            }
            return method;
          })
        );
      } else {
        const newMethod: PaymentMethod = {
          id: Date.now().toString(),
          methodType: 'iban',
          iban: cleanIban,
          bankName: cardForm.bankName,
          swiftCode: cardForm.swiftCode,
          holderName: cardForm.holderName,
          isPrimary: cardForm.isPrimary || paymentMethods.length === 0,
        };

        if (newMethod.isPrimary) {
          setPaymentMethods((prev) => [...prev.map((m) => ({ ...m, isPrimary: false })), newMethod]);
        } else {
          setPaymentMethods((prev) => [...prev, newMethod]);
        }
      }
    }

    showToast({
      title: t('notifications.profileUpdatedTitle'),
      description: editingCardId ? t('cards.paymentMethodUpdated') : t('cards.paymentMethodAdded'),
      variant: 'success',
    });
    closeCardModal();
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm(t('cards.deleteConfirm'))) {
      setPaymentMethods((prev) => {
        const filtered = prev.filter((c) => c.id !== cardId);
        // If we deleted the primary, make the first remaining one primary
        if (filtered.length > 0 && !filtered.some((c) => c.isPrimary)) {
          filtered[0].isPrimary = true;
        }
        return filtered;
      });
      showToast({
        title: t('notifications.profileUpdatedTitle'),
        description: t('cards.paymentMethodDeleted'),
        variant: 'success',
      });
    }
  };

  const handleSetPrimary = (cardId: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isPrimary: method.id === cardId,
      }))
    );
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
                    className={cn(
                      walletPageStyles.profileAvatar,
                      isAvatarHovered && walletPageStyles.profileAvatarHovered,
                    )}
                  >
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={t('history.avatarAlt')} width={80} height={80} />
                    ) : (
                      <span>{heroInitials}</span>
                    )}
                    {!isAvatarUploading && (
                      <div
                        className={cn(
                          walletPageStyles.avatarEditOverlay,
                          isAvatarHovered && walletPageStyles.avatarEditOverlayVisible,
                        )}
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
                <div className={walletPageStyles.tabsBarContainer} ref={tabsBarContainerRef}>
                  <div className={walletPageStyles.tabsBar} />
                  <div className={walletPageStyles.tabsIndicator} />
                  <div className={walletPageStyles.tabsUnderlay} />
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={walletPageStyles.tabContent}
                    data-lenis-prevent
                  >
                    {activeTab === 'personal' && (
                      <form onSubmit={handleSubmit(onSubmit)} className={walletPageStyles.tabForm}>
                        <div className={walletPageStyles.tabTwoColumns}>
                          <div className={walletPageStyles.tabFieldGroup}>
                            <label className={walletPageStyles.tabFieldLabel}>{t('fields.firstName')}</label>
                            <input
                              className={walletPageStyles.tabFieldInput}
                              placeholder={t('placeholders.firstName')}
                              {...register('firstName')}
                            />
                            {errors.firstName && <span className={walletPageStyles.tabFieldError}>{errors.firstName.message}</span>}
                          </div>
                          <div className={walletPageStyles.tabFieldGroup}>
                            <label className={walletPageStyles.tabFieldLabel}>{t('fields.lastName')}</label>
                            <input
                              className={walletPageStyles.tabFieldInput}
                              placeholder={t('placeholders.lastName')}
                              {...register('lastName')}
                            />
                            {errors.lastName && <span className={walletPageStyles.tabFieldError}>{errors.lastName.message}</span>}
                          </div>
                        </div>
                        <div className={walletPageStyles.tabFormActions}>
                          <button
                            type="submit"
                            className={walletPageStyles.tabSaveButton}
                            disabled={!isDirty || isSubmitting}
                          >
                            {isSubmitting ? t('actions.saving') : t('actions.save')}
                          </button>
                        </div>
                      </form>
                    )}

                    {activeTab === 'account' && (
                      <div className={walletPageStyles.cardsList}>
                        {/* Add Payment Method Button */}
                        <button
                          type="button"
                          className={walletPageStyles.cardItemAdd}
                          onClick={openAddCardModal}
                        >
                          <span className={walletPageStyles.cardItemAddIcon}>+</span>
                          <span className={walletPageStyles.cardItemAddText}>{t('cards.addCard')}</span>
                        </button>

                        {/* Existing Cards */}
                        {cards.length === 0 && (
                          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', padding: '1rem 0' }}>
                            {t('cards.noCards')}
                          </p>
                        )}
                        {cards.map((method) => (
                          <div key={method.id} className={walletPageStyles.cardItem}>
                            <div className={walletPageStyles.cardItemLeft}>
                              <div className={walletPageStyles.cardLogo}>
                                {method.methodType === 'card' ? (
                                  method.cardType === 'mastercard' ? (
                                    <svg
                                      width="50"
                                      height="32"
                                      viewBox="0 0 50 32"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <rect width="50" height="32" rx="6" fill="#EB001B" />
                                      <circle cx="18" cy="16" r="9" fill="#F79E1B" />
                                      <circle cx="32" cy="16" r="9" fill="#FF5F00" />
                                    </svg>
                                  ) : (
                                    <svg
                                      width="50"
                                      height="32"
                                      viewBox="0 0 50 32"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <rect width="50" height="32" rx="6" fill="#1A1F71" />
                                      <path
                                        d="M21.5 11L24 21H26.5L29 11H26.5L24.5 18L22.5 11H21.5Z"
                                        fill="white"
                                      />
                                      <path
                                        d="M30.5 11V21H32.5V16.5H35C36.5 16.5 38 15 38 13.5C38 12 36.5 10.5 35 10.5H30.5V11ZM32.5 13.5V12.5H35C35.5 12.5 36 13 36 13.5C36 14 35.5 14.5 35 14.5H32.5V13.5Z"
                                        fill="white"
                                      />
                                    </svg>
                                  )
                                ) : (
                                  // Bank/IBAN icon
                                  <svg
                                    width="50"
                                    height="32"
                                    viewBox="0 0 50 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <rect width="50" height="32" rx="6" fill="#2563EB" />
                                    <path d="M25 8L35 14H15L25 8Z" fill="white" />
                                    <rect x="17" y="15" width="3" height="8" fill="white" />
                                    <rect x="23.5" y="15" width="3" height="8" fill="white" />
                                    <rect x="30" y="15" width="3" height="8" fill="white" />
                                    <rect x="14" y="24" width="22" height="2" fill="white" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className={walletPageStyles.cardItemRight}>
                              <div className={walletPageStyles.cardItemInfo}>
                                <span className={walletPageStyles.cardItemType}>
                                  {method.methodType === 'card'
                                    ? method.cardType === 'mastercard' ? 'Mastercard' : 'Visa'
                                    : t('cards.bankAccount')}
                                </span>
                                <span className={walletPageStyles.cardItemNumber}>
                                  {method.methodType === 'card'
                                    ? `****${method.last4 || ''}`
                                    : `****${(method.iban || '').slice(-4)}`}
                                </span>
                                {method.isPrimary && (
                                  <span className={walletPageStyles.cardItemPrimary}>{t('cards.primary')}</span>
                                )}
                              </div>
                              <div className={walletPageStyles.cardItemActions}>
                                <span className={walletPageStyles.cardItemExpiry}>
                                  {method.methodType === 'card'
                                    ? `${t('cards.expiry')} ${method.expiryMonth || ''}/${(method.expiryYear || '').slice(-2)}`
                                    : method.bankName || ''}
                                </span>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                  {!method.isPrimary && (
                                    <button
                                      type="button"
                                      className={walletPageStyles.cardItemEdit}
                                      onClick={() => handleSetPrimary(method.id)}
                                      style={{ color: 'rgba(74, 222, 128, 0.8)' }}
                                    >
                                      {t('cards.primary')}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className={walletPageStyles.cardItemEdit}
                                    onClick={() => openEditCardModal(method)}
                                  >
                                    {t('cards.edit')}
                                  </button>
                                  <button
                                    type="button"
                                    className={walletPageStyles.cardItemEdit}
                                    onClick={() => handleDeleteCard(method.id)}
                                    style={{ color: 'rgba(248, 113, 113, 0.8)' }}
                                  >
                                    {t('cards.delete')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      </div>
                    )}
                       

                    {activeTab === 'preferences' && (
                      <div>
                        <div className={walletPageStyles.tabFieldGroup}>
                          <label className={walletPageStyles.tabFieldLabel}>{t('preferences.language')}</label>
                          <select
                            className={walletPageStyles.tabSelect}
                            value={preferences.language}
                            onChange={(e) => setPreferences((p) => ({ ...p, language: e.target.value }))}
                          >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="ar">العربية</option>
                          </select>
                        </div>

                        <p className={walletPageStyles.tabSectionTitle}>{t('preferences.notifications')}</p>

                        <div className={walletPageStyles.tabPreferenceRow}>
                          <div className={walletPageStyles.tabPreferenceLabel}>
                            <span className={walletPageStyles.tabPreferenceTitle}>{t('preferences.emailNotifications')}</span>
                            <span className={walletPageStyles.tabPreferenceDescription}>{t('preferences.emailNotificationsDesc')}</span>
                          </div>
                          <button
                            type="button"
                            className={cn(
                              walletPageStyles.tabToggle,
                              preferences.emailNotifications && walletPageStyles.tabToggleActive
                            )}
                            onClick={() => setPreferences((p) => ({ ...p, emailNotifications: !p.emailNotifications }))}
                            aria-pressed={preferences.emailNotifications}
                          />
                        </div>

                        <div className={walletPageStyles.tabPreferenceRow}>
                          <div className={walletPageStyles.tabPreferenceLabel}>
                            <span className={walletPageStyles.tabPreferenceTitle}>{t('preferences.pushNotifications')}</span>
                            <span className={walletPageStyles.tabPreferenceDescription}>{t('preferences.pushNotificationsDesc')}</span>
                          </div>
                          <button
                            type="button"
                            className={cn(
                              walletPageStyles.tabToggle,
                              preferences.pushNotifications && walletPageStyles.tabToggleActive
                            )}
                            onClick={() => setPreferences((p) => ({ ...p, pushNotifications: !p.pushNotifications }))}
                            aria-pressed={preferences.pushNotifications}
                          />
                        </div>

                        <p className={walletPageStyles.tabSectionTitle}>{t('preferences.security')}</p>

                        <div className={walletPageStyles.tabPreferenceRow}>
                          <div className={walletPageStyles.tabPreferenceLabel}>
                            <span className={walletPageStyles.tabPreferenceTitle}>{t('preferences.twoFactorAuth')}</span>
                            <span className={walletPageStyles.tabPreferenceDescription}>{t('preferences.twoFactorAuthDesc')}</span>
                          </div>
                          <button
                            type="button"
                            className={cn(
                              walletPageStyles.tabToggle,
                              preferences.twoFactorAuth && walletPageStyles.tabToggleActive
                            )}
                            onClick={() => setPreferences((p) => ({ ...p, twoFactorAuth: !p.twoFactorAuth }))}
                            aria-pressed={preferences.twoFactorAuth}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className={walletPageStyles.balanceCard}>
              <div ref={balanceCardInnerRef} className={walletPageStyles.balanceCardInner}>
                <div className={walletPageStyles.cardsContainer} ref={cardsContainerRef}>
                  {/* Carte arrière-plan 3 (la plus éloignée) */}
                  <div
                    className={cn(walletPageStyles.bankCard, walletPageStyles.bankCardBackFar)}
                  />

                  {/* Carte arrière-plan 2 */}
                  <div
                    className={cn(walletPageStyles.bankCard, walletPageStyles.bankCardBackMid)}
                  />

                  {/* Carte principale avec le solde */}
                  <div
                    className={cn(
                      walletPageStyles.bankCard,
                      walletPageStyles.bankCardMain,
                      walletPageStyles.bankCardPrimary,
                    )}
                  >
                    <Image
                      src="/images/wallPaperWallet.png"
                      alt=""
                      fill
                      className={walletPageStyles.bankCardBg}
                      priority
                    />
                    <div ref={bankCardContentRef} className={walletPageStyles.bankCardContent}>
                      <div className={walletPageStyles.balanceSummaryBubble}>
                        <span className={walletPageStyles.balanceCurrencySmall}>+D</span>
                        <span>2 000</span>
                        <span className={walletPageStyles.balanceChange}>+4.2%</span>
                      </div>
                      <p className={walletPageStyles.balanceTitle}>{t('balance.title')}</p>
                      <div className={walletPageStyles.balanceValueRow}>
                        <div className={walletPageStyles.balanceAmount}>
                          <span className={walletPageStyles.balanceCurrencyText}>D</span>
                          <span className={walletPageStyles.balanceValueText}>
                            {walletSummary.balance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {balanceDrawerOpen && (
                    <motion.button
                      type="button"
                      className={walletPageStyles.balanceDrawerBackdrop}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setBalanceDrawerOpen(false)}
                      aria-label={t('history.closeDrawer')}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  className={walletPageStyles.balanceDrawer}
                  initial={false}
                  animate={{
                    y: balanceDrawerOpen ? DRAWER_TOP_GAP : bankCardContentHeight > 0 ? `calc(100% - ${bankCardContentHeight}px)` : 'calc(100% - 200px)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  drag="y"
                  dragElastic={{ top: 0.05, bottom: 0.15 }}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragTransition={{
                    bounceStiffness: 300,
                    bounceDamping: 20,
                    power: 0.3,
                    timeConstant: 200,
                  }}
                  dragMomentum={true}
                  onDragEnd={(_, info) => {
                    const velocityThreshold = 200;
                    const offsetThreshold = 60;

                    // Vers le bas = fermer, vers le haut = ouvrir
                    if (info.velocity.y > velocityThreshold || info.offset.y > offsetThreshold) {
                      setBalanceDrawerOpen(false);
                    } else if (info.velocity.y < -velocityThreshold || info.offset.y < -offsetThreshold) {
                      setBalanceDrawerOpen(true);
                    }
                  }}
                  role="dialog"
                  aria-modal="true"
                  style={{ willChange: 'transform' }}
                >
                  <button
                    type="button"
                    className={walletPageStyles.balanceDrawerHandle}
                    onClick={() => setBalanceDrawerOpen((v) => !v)}
                    aria-label={balanceDrawerOpen ? t('history.collapse') : t('history.expand')}
                  >
                    <span className={walletPageStyles.balanceDrawerGrabber} />
                  </button>

                  <div className={walletPageStyles.balanceDrawerContent}>
                    <div className={walletPageStyles.balanceActions}>
                      <button type="button" className={walletPageStyles.primaryButton}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="49"
                          fill="none"
                          viewBox="0 0 48 49"
                        >
                          <path
                            fill="#fff"
                            d="m32.303 25.068.137.181v-.552c0-1.216-.602-2.206-1.34-2.206h-1.18c-.826-4.881-3.64-7.507-7.826-7.507h-5.532s.758.904.758 3.749v3.76h-1.396c-.271 0-.526-.148-.737-.43l-.136-.18v.551c0 1.217.601 2.206 1.34 2.206h.93v2.146h-1.397c-.271 0-.526-.148-.736-.43l-.137-.182v.552c0 1.216.601 2.204 1.34 2.204h.93v3.927c0 2.764-.758 3.58-.758 3.58h5.532c4.318 0 7.042-2.643 7.835-7.509h1.637c.271 0 .526.148.737.43l.136.181v-.552c0-1.216-.601-2.205-1.34-2.205h-.952a23 23 0 0 0-.001-2.145h1.42c.27 0 .526.148.737.43m-12.716-9.01H21.9c3.112 0 4.914 1.955 5.451 6.434l-7.763.001zm2.332 19.308h-2.333V28.93l7.76-.002c-.503 4.053-2.122 6.322-5.427 6.438m5.604-9.655q0 .55-.017 1.073l-7.92.001V24.64l7.92-.002q.017.518.017 1.073"
                          />
                          <path
                            stroke="#fff"
                            d="M42.576 15.569a21.9 21.9 0 0 1 2.47 10.141c0 12.163-9.86 22.023-22.023 22.023S1 37.873 1 25.71 10.86 3.688 23.023 3.688c3.399 0 6.618.77 9.492 2.145"
                            strokeLinecap="round"
                            strokeWidth="2"
                          />
                          <g fill="#fff">
                            <rect
                              width="10.462"
                              height="1"
                              rx=".5"
                              transform="matrix(1 0 -.00002 1 30.297 17.633)"
                            />
                            <rect
                              width="10.463"
                              height="1"
                              rx=".5"
                              transform="rotate(-90 24.462 -5.835)skewX(.001)"
                            />
                            <rect
                              width="21.553"
                              height="1"
                              rx=".5"
                              transform="rotate(-45 34.965 -28.22)skewX(-.007)"
                            />
                            <rect
                              width="21.553"
                              height="1"
                              rx=".5"
                              transform="rotate(-45 37.615 -29.475)skewX(-.007)"
                            />
                          </g>
                        </svg>
                        <span>{t('balance.addFunds')}</span>
                      </button>

                      <div className={walletPageStyles.balanceActionsDivider} />

                      <button type="button" className={walletPageStyles.secondaryButton}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="45"
                          height="45"
                          fill="none"
                          viewBox="0 0 45 45"
                        >
                          <g fill="#fff">
                            <rect
                              width="28.354"
                              height="1.411"
                              rx=".705"
                              transform="matrix(.59418 -.80433 .59418 .80433 10.197 32.861)"
                            />
                            <rect
                              width="28.354"
                              height="1.411"
                              rx=".705"
                              transform="matrix(-.59418 .80433 -.59418 -.80433 33.853 11.189)"
                            />
                            <rect
                              width="10.421"
                              height="1.192"
                              rx=".596"
                              transform="matrix(-.08395 -.99647 .9883 -.15257 10.514 33.746)"
                            />
                            <rect
                              width="10.421"
                              height="1.192"
                              rx=".596"
                              transform="matrix(.08395 .99647 -.9883 .15257 33.536 10.305)"
                            />
                          </g>
                          <circle
                            cx="22.025"
                            cy="22.025"
                            r="21.025"
                            stroke="#fff"
                            strokeWidth="2"
                          />
                        </svg>
                        <span>{t('balance.transfer')}</span>
                      </button>
                    </div>

                    <div>
                      <div className={walletPageStyles.historyHeader}>
                        <p className={walletPageStyles.balanceTitle}>{t('history.title')}</p>
                        <div className={walletPageStyles.historySearch}>
                          <input
                            type="text"
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            placeholder={t('history.searchPlaceholder')}
                            className={walletPageStyles.historySearchInput}
                          />
                        </div>
                      </div>

                      <WalletHistoryTable rows={historyRows} emptyLabel={t('history.empty')} />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FilterBar
        title={t('titleDeed.title')}
        titlePosition="left"
        showSelects={false}
      />

      <TitleDeed />

 {/* Card Modal */}
 <AnimatePresence>
                          {isCardModalOpen && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 100,
                                padding: '1rem',
                              }}
                              onClick={closeCardModal}
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  background: 'rgba(20, 20, 20, 0.95)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  borderRadius: '24px',
                                  padding: '1.5rem',
                                  width: '100%',
                                  maxWidth: '400px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '1.25rem',
                                }}
                              >
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', margin: 0 }}>
                                  {editingCardId ? t('cards.edit') : t('cards.modalTitle')}
                                </h3>

                                {/* Type selector - only show when adding new */}
                                {!editingCardId && (
                                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <button
                                      type="button"
                                      onClick={() => setCardForm((prev) => ({ ...prev, methodType: 'card' }))}
                                      style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: cardForm.methodType === 'card' ? '2px solid white' : '1px solid rgba(255,255,255,0.25)',
                                        background: cardForm.methodType === 'card' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: cardForm.methodType === 'card' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      {t('cards.tabCard')}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setCardForm((prev) => ({ ...prev, methodType: 'iban' }))}
                                      style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: cardForm.methodType === 'iban' ? '2px solid white' : '1px solid rgba(255,255,255,0.25)',
                                        background: cardForm.methodType === 'iban' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: cardForm.methodType === 'iban' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      {t('cards.tabIban')}
                                    </button>
                                  </div>
                                )}

                                {/* Card fields */}
                                {cardForm.methodType === 'card' && (
                                  <>
                                    <div className={walletPageStyles.tabFieldGroup}>
                                      <label className={walletPageStyles.tabFieldLabel}>{t('cards.cardNumber')}</label>
                                      <input
                                        className={walletPageStyles.tabFieldInput}
                                        placeholder={t('cards.cardNumberPlaceholder')}
                                        value={cardForm.cardNumber}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                          const formatted = value.replace(/(.{4})/g, '$1 ').trim();
                                          setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
                                        }}
                                        disabled={!!editingCardId}
                                      />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                      <div className={walletPageStyles.tabFieldGroup}>
                                        <label className={walletPageStyles.tabFieldLabel}>{t('cards.expiryDate')}</label>
                                        <input
                                          className={walletPageStyles.tabFieldInput}
                                          placeholder={t('cards.expiryPlaceholder')}
                                          value={cardForm.expiryDate}
                                          onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            if (value.length >= 2) {
                                              value = value.slice(0, 2) + '/' + value.slice(2);
                                            }
                                            setCardForm((prev) => ({ ...prev, expiryDate: value }));
                                          }}
                                        />
                                      </div>
                                      <div className={walletPageStyles.tabFieldGroup}>
                                        <label className={walletPageStyles.tabFieldLabel}>{t('cards.cvv')}</label>
                                        <input
                                          className={walletPageStyles.tabFieldInput}
                                          placeholder={t('cards.cvvPlaceholder')}
                                          type="password"
                                          maxLength={4}
                                          value={cardForm.cvv}
                                          onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setCardForm((prev) => ({ ...prev, cvv: value }));
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* IBAN fields */}
                                {cardForm.methodType === 'iban' && (
                                  <>
                                    <div className={walletPageStyles.tabFieldGroup}>
                                      <label className={walletPageStyles.tabFieldLabel}>{t('cards.iban')}</label>
                                      <input
                                        className={walletPageStyles.tabFieldInput}
                                        placeholder={t('cards.ibanPlaceholder')}
                                        value={cardForm.iban}
                                        onChange={(e) => {
                                          const cleaned = e.target.value.replace(/\s/g, '').toUpperCase();
                                          const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
                                          setCardForm((prev) => ({ ...prev, iban: formatted }));
                                        }}
                                        disabled={!!editingCardId}
                                      />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                      <div className={walletPageStyles.tabFieldGroup}>
                                        <label className={walletPageStyles.tabFieldLabel}>{t('cards.bankName')}</label>
                                        <input
                                          className={walletPageStyles.tabFieldInput}
                                          placeholder={t('cards.bankNamePlaceholder')}
                                          value={cardForm.bankName}
                                          onChange={(e) => setCardForm((prev) => ({ ...prev, bankName: e.target.value }))}
                                        />
                                      </div>
                                      <div className={walletPageStyles.tabFieldGroup}>
                                        <label className={walletPageStyles.tabFieldLabel}>{t('cards.swiftCode')}</label>
                                        <input
                                          className={walletPageStyles.tabFieldInput}
                                          placeholder={t('cards.swiftPlaceholder')}
                                          value={cardForm.swiftCode}
                                          onChange={(e) => {
                                            const value = e.target.value.toUpperCase().slice(0, 11);
                                            setCardForm((prev) => ({ ...prev, swiftCode: value }));
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* Common: Holder name */}
                                <div className={walletPageStyles.tabFieldGroup}>
                                  <label className={walletPageStyles.tabFieldLabel}>{t('cards.holderName')}</label>
                                  <input
                                    className={walletPageStyles.tabFieldInput}
                                    placeholder={t('cards.holderPlaceholder')}
                                    value={cardForm.holderName}
                                    onChange={(e) => setCardForm((prev) => ({ ...prev, holderName: e.target.value }))}
                                  />
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={cardForm.isPrimary}
                                    onChange={(e) => setCardForm((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                                    style={{ width: '18px', height: '18px', accentColor: '#4ade80' }}
                                  />
                                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                                    {t('cards.setAsPrimary')}
                                  </span>
                                </label>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                  <button
                                    type="button"
                                    onClick={closeCardModal}
                                    style={{
                                      flex: 1,
                                      padding: '0.75rem',
                                      borderRadius: '12px',
                                      border: '1px solid rgba(255,255,255,0.25)',
                                      background: 'transparent',
                                      color: 'white',
                                      fontSize: '0.875rem',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {t('cards.cancel')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSaveCard}
                                    disabled={
                                      cardForm.methodType === 'card'
                                        ? !cardForm.cardNumber || !cardForm.expiryDate
                                        : !cardForm.iban
                                    }
                                    style={{
                                      flex: 1,
                                      padding: '0.75rem',
                                      borderRadius: '12px',
                                      border: 'none',
                                      background: 'white',
                                      color: '#050505',
                                      fontSize: '0.875rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      opacity: (cardForm.methodType === 'card' ? (!cardForm.cardNumber || !cardForm.expiryDate) : !cardForm.iban) ? 0.5 : 1,
                                    }}
                                  >
                                    {t('cards.save')}
                                  </button>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
    </main>
  );
}