'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { VanishForm } from '../vanishForm';
import { authService } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { authFlowStyles } from './authFlow.styles';

type AuthStep = 'email' | 'otp' | 'error';

interface AuthData {
  email: string;
  otpCode: string;
}

export function AuthFlow() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<AuthStep>('email');
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    otpCode: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [autoRedirected, setAutoRedirected] = useState(false);

  const accountDisabledMessage =
    t('accountDisabled') ||
    'This account is disabled. Please contact contact@reccos.ae for assistance.';

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (authData.email && !isAnimating) {
      setIsAnimating(true);
      setIsVerifyingOTP(false);
      setError(null);

      try {
        await authService.sendOTP(authData.email);
        setError(null);
        setCurrentStep('otp');
        setIsAnimating(false);
      } catch (err: any) {
        const rawMessage =
          err instanceof Error ? err.message : "Erreur lors de l'envoi du code";
        const normalized = rawMessage?.toUpperCase() ?? '';

        if (
          normalized.includes('ACCOUNT_DISABLED') ||
          normalized.includes('ACCOUNT IS NOT ACTIVE')
        ) {
          setError(accountDisabledMessage);
        } else {
          setError(rawMessage);
        }

        setIsAnimating(false);
        setIsVerifyingOTP(false);
      }
    }
  };

  const redirectParam = searchParams?.get('redirect');

  const computeRedirectPath = useCallback(() => {
    const fallbackPath = `/${locale}/wallet`;
    if (!redirectParam) return fallbackPath;
    return redirectParam.startsWith('/') ? redirectParam : fallbackPath;
  }, [locale, redirectParam]);

  const fallbackNavigationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        // Précharger la destination pour éviter un flash de chargement
        router.prefetch?.(targetPath);
      } catch (prefetchError) {
        console.warn('[AuthFlow] router.prefetch failed', prefetchError);
      }

      try {
        router.replace(targetPath);
        router.refresh();
      } catch (error) {
        console.warn('[AuthFlow] router.replace failed, forcing hard navigation', error);
        window.location.assign(absoluteUrl.toString());
        return;
      }

      // Fallback tardif uniquement si la navigation client-side échoue
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
    },
    [clearNavigationFallback],
  );

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!authData.otpCode || isAnimating) return;
    
      setIsAnimating(true);
      setIsVerifyingOTP(true);
      setError(null);

      try {
      console.log('[AuthFlow] Verifying OTP...');

      // 1. Vérifier l'OTP auprès du backend
        const response = await authService.verifyOTP(authData.email, authData.otpCode);

      console.log('[AuthFlow] OTP verified, response:', {
        hasToken: !!response.access_token,
        hasUser: !!response.user,
      });

      if (!response.access_token || !response.user) {
          throw new Error('Réponse invalide du serveur');
        }

      // 2. Login: définir le cookie ET mettre à jour le store
      console.log('[AuthFlow] Calling login...');
      const loginSuccess = await login(response);

      if (!loginSuccess) {
        throw new Error('Échec de la connexion');
        }

      console.log('[AuthFlow] Login successful, redirecting...');
      
      // 3. Rediriger
        setIsVerifyingOTP(false);
        setIsAnimating(false);
        const redirectPath = computeRedirectPath();
        setAutoRedirected(true);
        navigateWithFallback(redirectPath);
        return;
      
      } catch (err: any) {
      console.error('[AuthFlow] Error:', err);

      const rawMessage = err instanceof Error ? err.message : t('invalidOTP') || 'Code OTP invalide';
        const normalized = rawMessage?.toUpperCase() ?? '';

        if (
          normalized.includes('ACCOUNT IS NOT ACTIVE') ||
          normalized.includes('ACCOUNT_DISABLED')
        ) {
          setError(accountDisabledMessage);
          setCurrentStep('email');
        } else {
          setError(rawMessage);
        }

        setIsAnimating(false);
        setIsVerifyingOTP(false);
        setAuthData({ ...authData, otpCode: '' });
    }
  };

  useEffect(() => {
    if (!isAuthenticated || autoRedirected) return;
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      return;
    }
    setAutoRedirected(true);
    const redirectPath = computeRedirectPath();
    navigateWithFallback(redirectPath);
  }, [isAuthenticated, autoRedirected, computeRedirectPath, navigateWithFallback]);

  const getStepPlaceholder = () => {
    switch (currentStep) {
      case 'email':
            return t('emailPlaceholder') || 'yo@gmail.com';
      case 'otp':
            return t('otpCodePlaceholder') || '000000';
      default:
        return '';
    }
  };

  const handleRetry = () => {
    setError(null);
    setCurrentStep('email');
    setAuthData({ email: '', otpCode: '' });
  };

  return (
    <div className={authFlowStyles.container}>
      <AnimatePresence mode="wait">
        {currentStep === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={authFlowStyles.stepContainer}
          >
            <VanishForm
              type="email"
              placeholder={getStepPlaceholder()}
              value={authData.email}
              onChange={(e) => {
                setAuthData({ ...authData, email: e.target.value });
                if (error) setError(null);
              }}
              onSubmit={handleEmailSubmit}
              isLoading={isAnimating && !isVerifyingOTP}
              loadingText={t('sending')?.replace('...', '') || 'Send'}
            />
            {error && currentStep === 'email' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={authFlowStyles.errorTextInline}
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {currentStep === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={authFlowStyles.stepContainer}
          >
            <h2 className={authFlowStyles.otpTitle}>
              {(t('oneTimePassword') || 'One-Time Password').toUpperCase()}
            </h2>
            <VanishForm
              type="text"
              placeholder={getStepPlaceholder()}
              value={authData.otpCode}
              onChange={(e) => {
                setAuthData({ ...authData, otpCode: e.target.value });
                if (error) setError(null);
              }}
              onSubmit={handleOTPSubmit}
              isLoading={isAnimating && isVerifyingOTP}
              loadingText={t('verifying')?.replace('...', '') || 'Verification'}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={authFlowStyles.errorTextInline}
              >
                {error}
              </motion.p>
            )}
            <p className={authFlowStyles.otpHint}>
              {t('otpSent') || 'Un code a été envoyé à votre adresse email'}
            </p>
          </motion.div>
        )}

        {currentStep === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={authFlowStyles.errorContainer}
          >
            <p className={authFlowStyles.errorText}>
              {error || (t('error') || 'Une erreur est survenue')}
            </p>
            <button
              onClick={handleRetry}
              className={authFlowStyles.retryButton}
            >
              {t('retry') || 'Réessayer'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={authFlowStyles.footer}
      >
        <p className={authFlowStyles.copyright}>
          {t('copyright') || 'reccos.ar © 2025'}
        </p>
      </motion.footer>
    </div>
  );
}
