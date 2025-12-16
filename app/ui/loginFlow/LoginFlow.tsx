'use client';

import { useState } from 'react';
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
    
    if (!loginData.password || isAnimating) return;
    
    setIsAnimating(true);
    setCurrentStep('loading');
    setError(null);
    
    try {
      const response = await authService.login({
        email: loginData.email,
        password: loginData.password,
      });
      
      // Login: définir le cookie ET mettre à jour le store
      const loginSuccess = await login(response);
      
      if (!loginSuccess) {
        throw new Error('Échec de la connexion');
      }
      
      setCurrentStep('success');
      const targetPath = `/${locale}/wallet`;
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.assign(targetPath);
        } else {
          router.push(targetPath);
        }
      }, 300);
      
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      setIsAnimating(false);
      
      const errorLower = errorMessage.toLowerCase();
      
      if (
        errorLower.includes('2fa code required') ||
        errorLower.includes('2fa') || 
        errorLower.includes('two-factor') ||
        errorLower.includes('code required')
      ) {
        setCurrentStep('2fa');
      } else {
        setCurrentStep('error');
      }
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
      
      setCurrentStep('success');
      const targetPath = `/${locale}/wallet`;
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.assign(targetPath);
        } else {
          router.push(targetPath);
        }
      }, 300);
      
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      setIsAnimating(false);
      
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('invalid 2fa') || errorLower.includes('code invalide')) {
        setCurrentStep('2fa');
        setLoginData({ ...loginData, twoFactorCode: '' });
      } else {
        setCurrentStep('error');
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
