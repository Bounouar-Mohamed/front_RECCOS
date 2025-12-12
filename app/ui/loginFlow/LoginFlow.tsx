'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { VanishForm } from '../vanishForm';
import { authService } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { loginFlowStyles } from './loginFlow.styles';

type LoginStep = 'email' | 'password' | '2fa' | 'loading' | 'error' | 'success';

interface LoginData {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export function LoginFlow() {
  const t = useTranslations('auth.login');
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<LoginStep>('email');
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginData.email && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep('password');
        setIsAnimating(false);
      }, 800);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[LoginFlow] handlePasswordSubmit called', { 
      hasPassword: !!loginData.password, 
      isAnimating,
      email: loginData.email 
    });
    
    if (loginData.password && !isAnimating) {
      console.log('[LoginFlow] Starting login process...');
      setIsAnimating(true);
      setCurrentStep('loading');
      setError(null);
      
      try {
        console.log('[LoginFlow] Calling authService.login...', { 
          email: loginData.email,
          hasPassword: !!loginData.password 
        });
        
        const response = await authService.login({
          email: loginData.email,
          password: loginData.password,
        });
        
        console.log('[LoginFlow] Login successful!', { 
          hasToken: !!response.access_token,
          hasUser: !!response.user,
          userId: response.user?.id 
        });
        
        console.log('[LoginFlow] Calling login store method...');
        login(response);
        
        console.log('[LoginFlow] Setting success step...');
        // Afficher un message de succès avant la redirection
        setCurrentStep('success');
        
        console.log('[LoginFlow] Scheduling redirect to dashboard...');
        setTimeout(() => {
          console.log('[LoginFlow] Redirecting to dashboard...');
          router.push(`/${locale}/wallet`);
        }, 1000);
      } catch (err: any) {
        console.error('[LoginFlow] Login error caught:', err);
        console.error('[LoginFlow] Error type:', typeof err);
        console.error('[LoginFlow] Error instanceof Error:', err instanceof Error);
        console.error('[LoginFlow] Error message:', err?.message);
        console.error('[LoginFlow] Error response:', err?.response);
        console.error('[LoginFlow] Error response data:', err?.response?.data);
        
        const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
        console.log('[LoginFlow] Setting error message:', errorMessage);
        setError(errorMessage);
        setIsAnimating(false);
        
        // Détecter les différents cas d'erreur
        const errorLower = errorMessage.toLowerCase();
        console.log('[LoginFlow] Error message (lowercase):', errorLower);
        
        // Cas 2FA requis - le backend renvoie maintenant "2FA code required"
        if (
          errorLower.includes('2fa code required') ||
          errorLower.includes('2fa') || 
          errorLower.includes('two-factor') ||
          errorLower.includes('code required')
        ) {
          console.log('[LoginFlow] Detected 2FA required, moving to 2FA step');
          // Passer à l'étape 2FA
          setCurrentStep('2fa');
        } 
        // Compte verrouillé
        else if (errorLower.includes('locked') || errorLower.includes('verrouillé')) {
          console.log('[LoginFlow] Detected account locked, showing error');
          setCurrentStep('error');
        }
        // Email non vérifié
        else if (errorLower.includes('email not verified') || errorLower.includes('email non vérifié')) {
          console.log('[LoginFlow] Detected email not verified, showing error');
          setCurrentStep('error');
        }
        // Compte inactif
        else if (errorLower.includes('not active') || errorLower.includes('inactif')) {
          console.log('[LoginFlow] Detected account not active, showing error');
          setCurrentStep('error');
        }
        // Trop de tentatives
        else if (errorLower.includes('too many') || errorLower.includes('trop de')) {
          console.log('[LoginFlow] Detected too many attempts, showing error');
          setCurrentStep('error');
        }
        // Identifiants invalides ou autres erreurs
        else {
          console.log('[LoginFlow] Generic error, showing error step');
          setCurrentStep('error');
        }
        
        console.log('[LoginFlow] Error handling complete, currentStep should be:', 
          errorLower.includes('2fa') ? '2fa' : 'error'
        );
      }
    } else {
      console.log('[LoginFlow] Cannot submit:', { 
        hasPassword: !!loginData.password, 
        isAnimating 
      });
    }
  };

  const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginData.twoFactorCode && !isAnimating) {
      setIsAnimating(true);
      setCurrentStep('loading');
      setError(null);
      
      try {
        const response = await authService.login({
          email: loginData.email,
          password: loginData.password,
          twoFactorCode: loginData.twoFactorCode,
        });
        
        login(response);
        // Afficher un message de succès avant la redirection
        setCurrentStep('success');
        setTimeout(() => {
          router.push(`/${locale}/wallet`);
        }, 1000);
      } catch (err: any) {
        console.error('2FA error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
        setError(errorMessage);
        setIsAnimating(false);
        
        const errorLower = errorMessage.toLowerCase();
        
        // Si erreur 2FA invalide, on reste sur l'étape 2FA pour réessayer
        if (errorLower.includes('invalid 2fa') || errorLower.includes('code invalide')) {
          setCurrentStep('2fa');
          // Réinitialiser le code pour permettre une nouvelle tentative
          setLoginData({ ...loginData, twoFactorCode: '' });
        } 
        // Trop de tentatives 2FA
        else if (errorLower.includes('too many failed 2fa')) {
          setCurrentStep('error');
        }
        // Autres erreurs
        else {
          setCurrentStep('error');
        }
      }
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Email';
      case 'password':
        return 'Password';
      case '2fa':
        return '2FA Code';
      case 'loading':
        return 'Connexion...';
      case 'error':
        return error || 'Erreur';
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
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              onSubmit={handleEmailSubmit}
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
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
              onChange={(e) => setLoginData({ ...loginData, twoFactorCode: e.target.value })}
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
            <p className={loginFlowStyles.loadingText}>Connexion en cours...</p>
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
            <p className={loginFlowStyles.errorText}>{error || 'Une erreur est survenue'}</p>
            <button
              onClick={() => {
                setError(null);
                setCurrentStep('email');
                setLoginData({ email: '', password: '' });
              }}
              className={loginFlowStyles.retryButton}
            >
              Réessayer
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
            <p className={loginFlowStyles.successText}>Connexion réussie !</p>
            <p className={loginFlowStyles.successSubtext}>Redirection en cours...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

