'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatedNumbersShowcase } from '@/app/ui/animatedNumbers';
import { NotificationBell } from '@/app/ui/notificationBell';
import { featuredLaunchStyles } from './featuredLaunch.styles';
import { type PropertyRecord } from '@/lib/api/properties';
import { publicPropertiesApi } from '@/lib/api/public-properties';
import { launchNotificationsApi, type NotificationTiming } from '@/lib/api/launch-notifications';
import { useAuthStore } from '@/lib/store/auth-store';
import { generateGoogleCalendarLink } from '@/lib/utils/calendar';

const NOTIFICATION_OPTIONS: { value: NotificationTiming; msBeforeLaunch: number }[] = [
  { value: '1d', msBeforeLaunch: 24 * 60 * 60 * 1000 }, // 24 heures
  { value: '1h', msBeforeLaunch: 60 * 60 * 1000 },      // 1 heure
  { value: 'launch', msBeforeLaunch: 0 },               // Au lancement
];

export const FeaturedLaunch = () => {
  const t = useTranslations('home.featuredLaunch');
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);
  
  const [selectedNotification, setSelectedNotification] = useState<NotificationTiming | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [featuredProperty, setFeaturedProperty] = useState<PropertyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  
  // Subscription state
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const countdownLabels = t.raw('countdownLabels') as {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };

  const notificationOptionsLabels = t.raw('notificationOptions') as Record<NotificationTiming, string>;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale || 'en', {
        style: 'currency',
        currency: 'AED',
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale || 'en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProperty = async () => {
      setIsLoading(true);
      try {
        const response = await publicPropertiesApi.list({
          limit: 12,
          locale,
        });
        const properties = response.properties || [];
        const now = Date.now();
        const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

        // Mapper les propriétés avec leur timestamp
        const propertiesWithTimestamp = properties
          .map((property) => {
            const timestamp = property.availableAt ? Date.parse(property.availableAt) : NaN;
            return { property, timestamp };
          })
          .filter(({ timestamp }) => !Number.isNaN(timestamp));

        // Priorité 1 : Propriétés "juste lancées" (moins de 2h depuis le lancement)
        const justLaunched = propertiesWithTimestamp
          .filter(({ timestamp }) => timestamp <= now && now - timestamp <= TWO_HOURS_MS)
          .sort((a, b) => b.timestamp - a.timestamp); // Le plus récemment lancé en premier

        // Priorité 2 : Propriétés à venir
        const upcoming = propertiesWithTimestamp
          .filter(({ timestamp }) => timestamp > now)
          .sort((a, b) => a.timestamp - b.timestamp); // Le plus proche en premier

        // Choisir la meilleure propriété
        const nextProperty = justLaunched[0]?.property ?? upcoming[0]?.property ?? null;

        if (isMounted) {
          if (nextProperty) {
            setFeaturedProperty(nextProperty);
            setError(null);
          } else {
            setFeaturedProperty(null);
            setError(
              tRef.current('errors.noneUpcoming', {
                defaultValue: 'No upcoming launch yet.',
              }),
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error
              ? err.message
              : tRef.current('errors.fetchFailed', {
                  defaultValue: 'Unable to load featured launch.',
                });
          setError(message);
          setFeaturedProperty(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeaturedProperty();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const countdownTarget = useMemo(() => {
    if (!featuredProperty?.availableAt) {
      return undefined;
    }
    const parsed = new Date(featuredProperty.availableAt);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [featuredProperty?.availableAt]);

  // Vérifier si le bien est "juste lancé" (moins de 2h depuis le lancement)
  const isJustLaunched = useMemo(() => {
    if (!countdownTarget) return false;
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const launchTime = countdownTarget.getTime();
    return currentTime >= launchTime && currentTime - launchTime <= TWO_HOURS_MS;
  }, [countdownTarget, currentTime]);

  const heroImage = useMemo(() => {
    if (featuredProperty?.mainImage) {
      return featuredProperty.mainImage;
    }
    if (featuredProperty?.images?.length) {
      return featuredProperty.images[0]!;
    }
    return '/images/TowerJBR.png';
  }, [featuredProperty]);

  // Mettre à jour le temps courant toutes les secondes pour détecter automatiquement le lancement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Toutes les secondes pour transition fluide
    return () => clearInterval(interval);
  }, []);

  // Calculer quelles options de notification sont encore disponibles
  const availableOptions = useMemo(() => {
    if (!countdownTarget) return [];
    const launchTime = countdownTarget.getTime();
    const timeUntilLaunch = launchTime - currentTime;
    
    return NOTIFICATION_OPTIONS.map((opt) => ({
      ...opt,
      isAvailable: timeUntilLaunch > opt.msBeforeLaunch,
    }));
  }, [countdownTarget, currentTime]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion du clic sur la cloche
  const handleBellClick = () => {
    // Permettre d'ouvrir le dropdown même sans être connecté (pour accéder au calendrier)
    setIsNotificationOpen((prev) => !prev);
  };

  const handleSubscribe = async () => {
    if (!featuredProperty?.id || !user?.email || !selectedNotification) return;

    setIsSubscribing(true);
    setSubscribeError(null);
    setSubscribeSuccess(false);

    try {
      await launchNotificationsApi.subscribe({
        email: user.email,
        propertyId: featuredProperty.id,
        timing: selectedNotification,
        locale,
      });
      setSubscribeSuccess(true);
      // Fermer le dropdown après un succès
      setTimeout(() => {
        setIsNotificationOpen(false);
        setSubscribeSuccess(false);
      }, 2000);
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_SUBSCRIBED') {
        setSubscribeError(t('alreadySubscribed'));
      } else {
        setSubscribeError(t('subscribeError'));
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!featuredProperty || !countdownTarget) return;

    const eventTitle = featuredProperty.title || t('title');
    const eventDescription = featuredProperty.description || t('description');
    const eventLocation = [
      featuredProperty.zone,
      featuredProperty.emirate,
    ]
      .filter(Boolean)
      .join(', ') || featuredProperty.address || '';

    // Construire l'URL de la page Launchpad
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const launchpadUrl = `${baseUrl}/${locale}/launchpad`;

    const googleCalendarUrl = generateGoogleCalendarLink({
      title: eventTitle,
      description: eventDescription,
      startDate: countdownTarget,
      location: eventLocation,
      locale,
      launchpadUrl,
    });
    window.open(googleCalendarUrl, '_blank');
  };

  const selectedNotificationLabel = selectedNotification ? notificationOptionsLabels[selectedNotification] : '';
  const notificationBellLabel = selectedNotificationLabel
    ? `${t('notifyCta')} • ${selectedNotificationLabel}`
    : t('notifyCta');

  // Ne pas afficher si pas de propriété ou si le countdown est passé depuis plus de 2h
  if (!featuredProperty || !countdownTarget || (currentTime > countdownTarget.getTime() + 2 * 60 * 60 * 1000)) {
    return (
      <section className={featuredLaunchStyles.section}>
        <div className={featuredLaunchStyles.content}>
          {/* Panel gauche - même structure que mediaPanel */}
          <div className={featuredLaunchStyles.emptyMediaPanel}>
            {isLoading ? (
              <div className={featuredLaunchStyles.emptyStateLoader}>
                <span className={featuredLaunchStyles.emptyStateLoaderDot} />
                <span className={featuredLaunchStyles.emptyStateLoaderDot} />
                <span className={featuredLaunchStyles.emptyStateLoaderDot} />
              </div>
            ) : (
              <span className={featuredLaunchStyles.emptyStateIcon}>—</span>
            )}
          </div>
          
          {/* Panel droite - même structure que detailsPanel */}
          <div className={featuredLaunchStyles.detailsPanel}>
            <h2 className={featuredLaunchStyles.emptyStateTitle}>
              {t('emptyState.title', { defaultValue: 'Coming Soon' })}
            </h2>
            <p className={featuredLaunchStyles.emptyStateSubtitle}>
              {t('emptyState.subtitle', { defaultValue: 'We\'re preparing something exceptional for you. Stay tuned.' })}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const fallbackValue = t('dynamicAttributes.fallback', { defaultValue: '—' });
  const heroTitle = featuredProperty.title || t('title');
  const heroDescription = featuredProperty.description || t('description');
  const locationValue =
    [featuredProperty.zone, featuredProperty.emirate].filter(Boolean).join(', ') ||
    featuredProperty.address ||
    fallbackValue;
  const priceValue =
    typeof featuredProperty.pricePerShare === 'number' && featuredProperty.pricePerShare > 0
      ? currencyFormatter.format(featuredProperty.pricePerShare)
      : fallbackValue;
  const availableValue = dateFormatter.format(countdownTarget);
  const attributesToDisplay = [
    { label: t('dynamicAttributes.location'), value: locationValue },
    { label: t('dynamicAttributes.pricePerShare'), value: priceValue },
    { label: t('dynamicAttributes.availableAt'), value: availableValue },
  ];

  return (
    <section className={featuredLaunchStyles.section}>
      <div className={featuredLaunchStyles.content}>
        <div className={featuredLaunchStyles.mediaPanel}>
          {/* Cloche de notification - uniquement si pas encore lancé */}
          {!isJustLaunched && (
            <div ref={notificationRef} className={featuredLaunchStyles.notificationContainer}>
              <NotificationBell
                active={isNotificationOpen}
                onClick={handleBellClick}
                aria-haspopup="true"
                aria-expanded={isNotificationOpen}
                label={notificationBellLabel}
              />
              {isNotificationOpen && (
                <div
                  className={featuredLaunchStyles.notificationDropdown}
                  role="menu"
                  aria-label={t('notificationTitle')}
                >
                  {/* Section Calendrier - accessible sans connexion */}
                  <div className={featuredLaunchStyles.calendarSection}>
                    <span className={featuredLaunchStyles.dropdownTitle}>{t('addToCalendarTitle')}</span>
                    <p className={featuredLaunchStyles.dropdownSubtitle}>{t('addToCalendarSubtitle')}</p>
                    
                    <button
                      type="button"
                      onClick={handleAddToCalendar}
                      className={featuredLaunchStyles.calendarButton}
                      title={t('addToGoogleCalendar')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{t('addToGoogleCalendar')}</span>
                    </button>
                  </div>

                  {/* Séparateur */}
                  <div className={featuredLaunchStyles.calendarSeparator}>
                    <span>{t('calendarSeparator')}</span>
                  </div>

                  {/* Section Notifications - nécessite connexion */}
                  {isAuthenticated ? (
                    <>
                      <span className={featuredLaunchStyles.dropdownTitle}>{t('notificationTitle')}</span>
                      <p className={featuredLaunchStyles.dropdownSubtitle}>{t('notificationSubtitle')}</p>
                      
                      <div className={featuredLaunchStyles.dropdownOptions}>
                        {availableOptions.map((option) => {
                          const isSelected = selectedNotification === option.value;
                          const isDisabled = !option.isAvailable;
                          
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setSelectedNotification(option.value)}
                              className={`${featuredLaunchStyles.dropdownOption} ${
                                isSelected ? featuredLaunchStyles.dropdownOptionActive : ''
                              } ${isDisabled ? featuredLaunchStyles.dropdownOptionDisabled : ''}`}
                              disabled={isDisabled}
                            >
                              {notificationOptionsLabels[option.value]}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bouton d'inscription - désactivé tant qu'aucune option n'est sélectionnée */}
                      <button
                        type="button"
                        onClick={handleSubscribe}
                        className={featuredLaunchStyles.subscribeButton}
                        disabled={isSubscribing || !selectedNotification}
                      >
                        {isSubscribing ? t('subscribing') : t('subscribeButton')}
                      </button>

                      {/* Feedback messages */}
                      {subscribeSuccess && (
                        <div className={`${featuredLaunchStyles.feedbackMessage} ${featuredLaunchStyles.feedbackSuccess}`}>
                          {t('subscribeSuccess')}
                        </div>
                      )}
                      {subscribeError && (
                        <div className={`${featuredLaunchStyles.feedbackMessage} ${featuredLaunchStyles.feedbackError}`}>
                          {subscribeError}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={featuredLaunchStyles.loginPrompt}>
                      <span className={featuredLaunchStyles.dropdownTitle}>{t('notificationTitle')}</span>
                      <p className={featuredLaunchStyles.dropdownSubtitle}>{t('loginToSubscribe')}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationOpen(false);
                          router.push(`/${locale}/login`);
                        }}
                        className={featuredLaunchStyles.loginButton}
                      >
                        {t('loginButton')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <Image
            src={heroImage}
            alt={heroTitle}
            fill
            className={isJustLaunched ? featuredLaunchStyles.mediaImageClear : featuredLaunchStyles.mediaImage}
            priority
            unoptimized
          />
          {/* Badge "Disponible" en haut à droite quand live */}
          {isJustLaunched && (
            <div className={featuredLaunchStyles.liveBadgeTopRight}>
              <span className={featuredLaunchStyles.liveDot} />
              <span className={featuredLaunchStyles.liveText}>{t('nowAvailable.badge')}</span>
            </div>
          )}
          
          {/* Countdown centré quand pas encore lancé */}
          {!isJustLaunched && (
            <div className={featuredLaunchStyles.mediaContent}>
              <AnimatedNumbersShowcase
                legend={t('countdownLegend')}
                labels={countdownLabels}
                targetDate={countdownTarget}
              />
            </div>
          )}
          
          {/* CTA overlay en bas de l'image quand live */}
          {isJustLaunched && (
            <button
              type="button"
              onClick={() => router.push(`/${locale}/product/${featuredProperty.id}`)}
              className={featuredLaunchStyles.liveCtaOverlay}
            >
              <span>{t('nowAvailable.cta')}</span>
            </button>
          )}
        </div>
        <div className={featuredLaunchStyles.detailsPanel}>
          {/* Tagline quand live */}
          {isJustLaunched && (
            <span className={featuredLaunchStyles.liveTagline}>{t('nowAvailable.tagline')}</span>
          )}
          
          <h2 className={featuredLaunchStyles.title}>{heroTitle}</h2>
          <p className={featuredLaunchStyles.subtitle}>{heroDescription}</p>

          {/* Attributs - toujours affichés */}
          <div className={featuredLaunchStyles.attributesGrid}>
            {attributesToDisplay.map((attribute) => (
              <div key={attribute.label} className={featuredLaunchStyles.attributeCard}>
                <span className={featuredLaunchStyles.attributeLabel}>{attribute.label}</span>
                <span className={featuredLaunchStyles.attributeValue}>{attribute.value}</span>
              </div>
            ))}
          </div>

          {/* Message d'urgence quand live */}
          {isJustLaunched && (
            <div className={featuredLaunchStyles.liveUrgency}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{t('nowAvailable.urgency')}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
