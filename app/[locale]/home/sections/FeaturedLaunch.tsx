'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { AnimatedNumbersShowcase } from '@/components/ui/AnimatedNumbers';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { featuredLaunchStyles } from './featuredLaunch.styles';

const notificationOptions = [
  { value: '1h', label: '1 heure avant' },
  { value: '1d', label: '1 jour avant' },
  { value: 'launch', label: 'Au lancement' },
];

export const FeaturedLaunch = () => {
  const t = useTranslations('home.featuredLaunch');
  const [selectedNotification, setSelectedNotification] = useState('launch');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const countdownLabels = t.raw('countdownLabels') as {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };

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

  const selectedNotificationLabel =
    notificationOptions.find((option) => option.value === selectedNotification)?.label ?? '';
  const notificationBellLabel = selectedNotificationLabel
    ? `${t('notifyCta')} • ${selectedNotificationLabel}`
    : t('notifyCta');

  return (
    <section className={featuredLaunchStyles.section}>
      <div className={featuredLaunchStyles.content}>
        <div className={featuredLaunchStyles.mediaPanel}>
        <div ref={notificationRef} className={featuredLaunchStyles.notificationContainer}>
          <NotificationBell
            active={isNotificationOpen}
            onClick={() => setIsNotificationOpen((prev) => !prev)}
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
              <span className={featuredLaunchStyles.dropdownTitle}>{t('notificationTitle')}</span>
              <p className={featuredLaunchStyles.dropdownSubtitle}>{t('notificationSubtitle')}</p>
              <div className={featuredLaunchStyles.dropdownOptions}>
                {notificationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedNotification(option.value);
                      setIsNotificationOpen(false);
                    }}
                    className={`${featuredLaunchStyles.dropdownOption} ${
                      selectedNotification === option.value
                        ? featuredLaunchStyles.dropdownOptionActive
                        : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <Image
          src="/images/TowerJBR.png"
          alt="Rendering of RECCOS signature residence"
          fill
          className={featuredLaunchStyles.mediaImage}
          priority
        />
        <div className={featuredLaunchStyles.mediaContent}>
          <AnimatedNumbersShowcase
            legend={t('countdownLegend')}
            labels={countdownLabels}
          />
        </div>
        </div>
        <div className={featuredLaunchStyles.detailsPanel}>
          <h2 className={featuredLaunchStyles.title}>{t('title')}</h2>
          <p className={featuredLaunchStyles.subtitle}>{t('description')}</p>

          <div className={featuredLaunchStyles.attributesGrid}>
            {t.raw('attributes').map((attribute: { label: string; value: string }) => (
              <div key={attribute.label} className={featuredLaunchStyles.attributeCard}>
                <span className={featuredLaunchStyles.attributeLabel}>{attribute.label}</span>
                <span className={featuredLaunchStyles.attributeValue}>{attribute.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

