'use client';

import { useState } from 'react';
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
  const { login } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<AuthStep>('email');
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    otpCode: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

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
        // Succès : passer à l'étape OTP
        setError(null); // Effacer toute erreur précédente
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

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[AuthFlow.handleOTPSubmit] START', {
      hasOTPCode: !!authData.otpCode,
      otpCodeLength: authData.otpCode?.length,
      email: authData.email,
      isAnimating,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
    });

    if (authData.otpCode && !isAnimating) {
      setIsAnimating(true);
      setIsVerifyingOTP(true);
      setError(null);

      try {
        console.log('[AuthFlow.handleOTPSubmit] Calling verifyOTP...', {
          email: authData.email,
          otpCodeLength: authData.otpCode.length,
        });

        const response = await authService.verifyOTP(authData.email, authData.otpCode);

        console.log('[AuthFlow.handleOTPSubmit] verifyOTP response received', {
          hasResponse: !!response,
          hasUser: !!response?.user,
          hasToken: !!response?.access_token,
          userId: response?.user?.id,
          userEmail: response?.user?.email,
          tokenLength: response?.access_token?.length,
        });

        // Vérification de sécurité : s'assurer que response.user existe
        if (!response || !response.user) {
          console.error('[AuthFlow.handleOTPSubmit] Invalid response from server', { response });
          throw new Error('Réponse invalide du serveur');
        }

        // Vérifier que le token existe
        if (!response.access_token) {
          console.error('[AuthFlow.handleOTPSubmit] Missing access token');
          throw new Error('Token d\'accès manquant');
        }

        console.log('[AuthFlow.handleOTPSubmit] Calling login store method...', {
          hasUser: !!response.user,
          hasToken: !!response.access_token,
          tokenPreview: response.access_token.substring(0, 20) + '...',
        });

        login(response);

        // Réinitialiser les états avant la redirection
        setIsVerifyingOTP(false);
        setIsAnimating(false);

        console.log('[AuthFlow.handleOTPSubmit] States reset', {
          isVerifyingOTP: false,
          isAnimating: false,
        });
        
        const fallbackPath = `/${locale}/wallet`;
        const redirectParam = searchParams?.get('redirect');
        const redirectPath = redirectParam && redirectParam.startsWith('/') ? redirectParam : fallbackPath;
        console.log('[AuthFlow.handleOTPSubmit] Preparing redirect...', {
          locale,
          redirectPath,
          currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
          hasToken: !!response.access_token,
          hasUser: !!response.user,
        });
        
        // Rediriger directement vers la destination demandée (ou /wallet par défaut) après connexion réussie
        // Utiliser window.location.href pour forcer une navigation complète
        // Cela permet au middleware de vérifier le cookie httpOnly correctement
        // Délai de 300ms pour s'assurer que le cookie httpOnly est bien défini dans le navigateur
        console.log('[AuthFlow.handleOTPSubmit] Setting timeout for redirect...', {
          redirectPath,
          delay: 300,
        });

        setTimeout(() => {
          console.log('[AuthFlow.handleOTPSubmit] Timeout executed, attempting redirect...', {
            redirectPath,
            currentPath: window.location.pathname,
            currentHref: window.location.href,
            // Note: document.cookie ne peut pas lire les cookies httpOnly, c'est normal
            documentCookie: document.cookie,
            localStorageToken: localStorage.getItem('access_token')?.substring(0, 20) + '...',
            localStorageUser: localStorage.getItem('user'),
          });

          // Vérifier si on est toujours sur la page login
          if (window.location.pathname.includes('/login')) {
            console.warn('[AuthFlow.handleOTPSubmit] Still on login page, forcing redirect...');
          }

          try {
            console.log('[AuthFlow.handleOTPSubmit] Executing window.location.href =', redirectPath);
            const previousHref = window.location.href;
            // Utiliser window.location.href pour forcer une navigation complète
            // Cela permet au middleware de vérifier le cookie httpOnly
            window.location.href = redirectPath;
            console.log('[AuthFlow.handleOTPSubmit] window.location.href executed', {
              previousHref,
              newHref: redirectPath,
              // Note: window.location.href peut toujours afficher l'ancienne URL ici
              // car la navigation est asynchrone
            });

            // Vérifier après un délai si la redirection a fonctionné
            setTimeout(() => {
              console.log('[AuthFlow.handleOTPSubmit] Checking if redirect worked...', {
                currentPath: window.location.pathname,
                expectedPath: redirectPath,
                redirectWorked: window.location.pathname === redirectPath || window.location.href.includes(redirectPath),
              });
            }, 500);
          } catch (redirectError: any) {
            console.error('[AuthFlow.handleOTPSubmit] Error during redirect:', {
              error: redirectError,
              errorType: redirectError?.constructor?.name,
              message: redirectError?.message,
              stack: redirectError?.stack,
            });
          }
        }, 300);

        console.log('[AuthFlow.handleOTPSubmit] setTimeout scheduled, function will continue...');
      } catch (err: any) {
        console.error('[AuthFlow.handleOTPSubmit] ERROR caught:', {
          error: err,
          errorType: err?.constructor?.name,
          message: err?.message,
          stack: err?.stack,
          response: err?.response,
          responseStatus: err?.response?.status,
          responseData: err?.response?.data,
          responseHeaders: err?.response?.headers,
        });

        const rawMessage =
          err instanceof Error ? err.message : t('invalidOTP') || 'Code OTP invalide';
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
    }
  };

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
                // Effacer l'erreur quand l'utilisateur tape
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
              {error 
                ? (t('invalidOTP') || 'Code OTP invalide').toUpperCase()
                : (t('oneTimePassword') || 'One-Time Password').toUpperCase()
              }
            </h2>
            <VanishForm
              type="text"
              placeholder={getStepPlaceholder()}
              value={authData.otpCode}
              onChange={(e) => {
                setAuthData({ ...authData, otpCode: e.target.value });
                // Effacer l'erreur quand l'utilisateur tape
                if (error) setError(null);
              }}
              onSubmit={handleOTPSubmit}
              isLoading={isAnimating && isVerifyingOTP}
              loadingText={t('verifying')?.replace('...', '') || 'Verification'}
            />
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
      
      {/* Footer avec copyright */}
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

