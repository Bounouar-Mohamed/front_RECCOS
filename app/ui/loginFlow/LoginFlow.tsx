'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { VanishForm } from '../vanishForm';
import { authService } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { loginFlowStyles } from './loginFlow.styles';

type LoginStep = 'email' | 'password' | '2fa' | 'loading' | 'error' | 'success';

interface LoginData {
  email: string;
  password: string;
  twoFactorCode: string;
}

export function LoginFlow() {
  const t = useTranslations('auth.login');
  const authCommon = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<LoginStep>('email');
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoRedirected, setAutoRedirected] = useState(false);

  const fallbackNavigationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successRedirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accountDisabledMessage =
    authCommon('accountDisabled') ||
    'This account is disabled. Please contact contact@reccos.ae for assistance.';

  const redirectParam = searchParams?.get('redirect');
  const computeRedirectPath = useCallback(() => {
    const fallbackPath = `/${locale}/wallet`;
    if (!redirectParam) return fallbackPath;
    return redirectParam.startsWith('/') ? redirectParam : fallbackPath;
  }, [locale, redirectParam]);

  const clearSuccessRedirect = useCallback(() => {
    if (successRedirectTimeoutRef.current) {
      clearTimeout(successRedirectTimeoutRef.current);
      successRedirectTimeoutRef.current = null;
    }
  }, []);

  const clearNavigationFallback = useCallback(() => {
    if (fallbackNavigationRef.current) {
      clearTimeout(fallbackNavigationRef.current);
      fallbackNavigationRef.current = null;
    }
  }, []);

  const navigateWithFallback = useCallback(
    (targetPath: string) => {
      if (typeof window === 'undefined') {
        router.replace(targetPath);
        router.refresh();
        return;
      }

      clearNavigationFallback();

      const absoluteUrl = new URL(targetPath, window.location.origin);
      const expectedLocation = `${absoluteUrl.pathname}${absoluteUrl.search}`;

      try {
        router.prefetch?.(targetPath);
      } catch (prefetchError) {
        console.warn('[LoginFlow] router.prefetch failed', prefetchError);
      }

      try {
        router.replace(targetPath);
        router.refresh();
      } catch (navigationError) {
        console.warn('[LoginFlow] router.replace failed, forcing hard navigation', navigationError);
        window.location.assign(absoluteUrl.toString());
        return;
      }

      fallbackNavigationRef.current = setTimeout(() => {
        const currentLocation = `${window.location.pathname}${window.location.search}`;
        if (currentLocation !== expectedLocation) {
          window.location.assign(absoluteUrl.toString());
        }
      }, 1600);
    },
    [router, clearNavigationFallback],
  );

  useEffect(
    () => () => {
      clearNavigationFallback();
      clearSuccessRedirect();
    },
    [clearNavigationFallback, clearSuccessRedirect],
  );

  const triggerRedirect = useCallback(() => {
    const destination = computeRedirectPath();
    setAutoRedirected(true);
    clearSuccessRedirect();

    if (typeof window === 'undefined') {
      navigateWithFallback(destination);
      return;
    }

    successRedirectTimeoutRef.current = setTimeout(() => {
      navigateWithFallback(destination);
    }, 260);
  }, [clearSuccessRedirect, computeRedirectPath, navigateWithFallback]);

  useEffect(() => {
    if (!isAuthenticated || autoRedirected) return;
    setAutoRedirected(true);
    navigateWithFallback(computeRedirectPath());
  }, [isAuthenticated, autoRedirected, computeRedirectPath, navigateWithFallback]);

  const normalizeErrorMessage = useCallback(
    (message: string) => {
      const upper = message?.toUpperCase?.() ?? '';
      if (
        upper.includes('ACCOUNT IS NOT ACTIVE') ||
        upper.includes('ACCOUNT_NOT_ACTIVE') ||
        upper.includes('ACCOUNT DISABLED') ||
        upper.includes('ACCOUNT_DISABLED')
      ) {
        return accountDisabledMessage;
      }
      return message;
    },
    [accountDisabledMessage],
  );

  const requiresTwoFactorStep = (message: string) => {
    const lower = message.toLowerCase();
    return (
      lower.includes('2fa code required') ||
      lower.includes('two-factor') ||
      lower.includes('otp required') ||
      lower.includes('code required')
    );
  };

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginData.email || isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      setCurrentStep('password');
    }, 480);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginData.password || isAnimating) return;

    setIsAnimating(true);
    setCurrentStep('loading');
    setError(null);

    try {
      const response = await authService.login({
        email: loginData.email,
        password: loginData.password,
      });

      const loginSuccess = await login(response);
      if (!loginSuccess) {
        throw new Error('Échec de la connexion');
      }

      setIsAnimating(false);
      setCurrentStep('success');
      triggerRedirect();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      const normalizedMessage = normalizeErrorMessage(rawMessage);
      setError(normalizedMessage);
      setIsAnimating(false);

      if (requiresTwoFactorStep(rawMessage)) {
        setCurrentStep('2fa');
        return;
      }

      setCurrentStep('error');
    }
  };

  const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginData.twoFactorCode || isAnimating) return;

    setIsAnimating(true);
    setCurrentStep('loading');
    setError(null);

    try {
      const response = await authService.login({
        email: loginData.email,
        password: loginData.password,
        twoFactorCode: loginData.twoFactorCode,
      });

      const loginSuccess = await login(response);
      if (!loginSuccess) {
        throw new Error('Échec de la connexion');
      }

      setIsAnimating(false);
      setCurrentStep('success');
      triggerRedirect();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      const normalizedMessage = normalizeErrorMessage(rawMessage);
      setError(normalizedMessage);
      setIsAnimating(false);

      const lower = rawMessage.toLowerCase();
      if (lower.includes('invalid 2fa') || lower.includes('code invalide')) {
        setCurrentStep('2fa');
        setLoginData((prev) => ({ ...prev, twoFactorCode: '' }));
        return;
      }

      if (requiresTwoFactorStep(rawMessage)) {
        setCurrentStep('2fa');
        return;
      }

      setCurrentStep('error');
    }
  };

  const getStepPlaceholder = () => {
    switch (currentStep) {
      case 'email':
        return t('email');
      case 'password':
        return t('password');
      case '2fa':
        return t('twoFactorCode');
      default:
        return '';
    }
  };

  return (
    <div className={loginFlowStyles.container}>
      <AnimatePresence mode="wait">
        {currentStep === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={loginFlowStyles.stepContainer}
          >
            <VanishForm
              type="email"
              placeholder={getStepPlaceholder()}
              value={loginData.email}
              onChange={(e) =>
                setLoginData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              onSubmit={handleEmailSubmit}
              isLoading={isAnimating}
              loadingText={authCommon('sending')?.replace('...', '') || 'Send'}
            />
          </motion.div>
        )}

        {currentStep === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={loginFlowStyles.stepContainer}
          >
            <VanishForm
              type="password"
              placeholder={getStepPlaceholder()}
              value={loginData.password}
              onChange={(e) =>
                setLoginData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              onSubmit={handlePasswordSubmit}
            />
          </motion.div>
        )}

        {currentStep === '2fa' && (
          <motion.div
            key="2fa"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={loginFlowStyles.stepContainer}
          >
            <VanishForm
              type="text"
              placeholder={getStepPlaceholder()}
              value={loginData.twoFactorCode}
              onChange={(e) =>
                setLoginData((prev) => ({
                  ...prev,
                  twoFactorCode: e.target.value,
                }))
              }
              onSubmit={handle2FASubmit}
            />
          </motion.div>
        )}

        {currentStep === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={loginFlowStyles.loadingContainer}
          >
            <div className={loginFlowStyles.loadingSpinner} />
            <p className={loginFlowStyles.loadingText}>
              {authCommon('redirecting') || 'Connexion en cours...'}
            </p>
          </motion.div>
        )}

        {currentStep === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={loginFlowStyles.errorContainer}
          >
            <p className={loginFlowStyles.errorText}>{error || authCommon('error')}</p>
            <button
              onClick={() => {
                setError(null);
                setCurrentStep('email');
                setLoginData({ email: '', password: '', twoFactorCode: '' });
              }}
              className={loginFlowStyles.retryButton}
            >
              {authCommon('retry') || 'Réessayer'}
            </button>
          </motion.div>
        )}

        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={loginFlowStyles.successContainer}
          >
            <div className={loginFlowStyles.successIcon}>✓</div>
            <p className={loginFlowStyles.successText}>
              {authCommon('success') || 'Connexion réussie !'}
            </p>
            <p className={loginFlowStyles.successSubtext}>
              {authCommon('redirecting') || 'Redirection en cours...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
