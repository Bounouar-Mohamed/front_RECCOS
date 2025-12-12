'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { stickyCard002Styles } from './stickyCard002.styles';
import { InvestorBadge } from '@/app/ui/investorBadge';
import { useAuthStore } from '@/lib/store/auth-store';
import { ParallaxStickyContainer } from '@/app/components';
import { publicPropertiesApi } from '@/lib/api/public-properties';
import PropertyMap, { type MapProperty } from '@/app/components/PropertyMap';

export interface CardData {
  id: number | string;
  image: string;
  title?: string;
  alt?: string;
  productUrl?: string; // URL vers la page produit
  investorCount?: number; // Nombre de personnes qui ont investi
  sharesAvailable?: number; // Nombre de shares disponibles
  pricePerShare?: number; // Prix par share (en AED)
  location?: string; // Localisation du bien
  totalShares?: number; // Nombre total de shares
  availableAt?: string | null; // Date d'ouverture des ventes
  latitude?: number | null; // Latitude GPS
  longitude?: number | null; // Longitude GPS
  // Champs supplémentaires pour MapPropertyPopupCard
  propertyType?: string;
  totalArea?: number; // Surface en m²
  bedrooms?: number | null;
  bathrooms?: number | null;
}

interface StickyCard002Props {
  cards: CardData[];
  className?: string;
  containerClassName?: string;
  imageClassName?: string;
  showMap?: boolean; // Afficher la carte à la fin
}


// Taille fixe des cartes
const CARD_SIZE = 450; // px
const CARD_GAP_HORIZONTAL = 24; // px
const ROW_VERTICAL_OFFSET = 35; // px - décalage vertical entre les lignes

type CountdownState = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

// Coordonnées par défaut (Dubai)
const DEFAULT_CENTER: [number, number] = [55.2708, 25.2048];

// Composant pour la carte étendue (modal) - utilise PropertyMap
const ExpandedMapModal = ({
  isOpen,
  onClose,
  properties,
}: {
  isOpen: boolean;
  onClose: () => void;
  properties: CardData[];
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations('stickyCard');

  // Convertir CardData en MapProperty
  const mapProperties = useMemo<MapProperty[]>(() => 
    properties
      .filter(p => p.latitude != null && p.longitude != null)
      .map(p => ({
        id: p.id,
        latitude: p.latitude!,
        longitude: p.longitude!,
        title: p.title,
        location: p.location,
        price: p.pricePerShare,
        investorCount: p.investorCount,
        propertyType: p.propertyType,
        squareFeet: p.totalArea,
        bedrooms: p.bedrooms ?? undefined,
        bathrooms: p.bathrooms ?? undefined,
        image: p.image,
      })),
    [properties]
  );

  // Gérer le montage/démontage avec animation
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Fermer avec Escape et bloquer le scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return createPortal(
    <div 
      className={stickyCard002Styles.mapExpandedBackdrop}
      data-visible={isVisible}
      onClick={onClose}
    >
      <div 
        className={stickyCard002Styles.mapExpandedContainer}
        data-visible={isVisible}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          className={stickyCard002Styles.mapExpandedCloseButton}
          onClick={onClose}
          aria-label={t('map.close')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Container de la carte - utilise PropertyMap */}
        {isVisible && (
          <div className={stickyCard002Styles.mapExpandedMap}>
            <PropertyMap
              properties={mapProperties}
              showNavigationControls
              hideCloseButton={false}
            />
          </div>
        )}

        {/* Info bar en bas */}
        <div className={stickyCard002Styles.mapExpandedInfo}>
          <span className={stickyCard002Styles.mapExpandedTitle}>
            {t('map.exploreTitle')}
          </span>
          <span className={stickyCard002Styles.mapExpandedCount}>
            {mapProperties.length} {mapProperties.length === 1 ? t('map.property') : t('map.properties')}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Composant MapCard pour afficher toutes les propriétés sur une carte (aperçu statique)
const MapCard = ({
  properties,
  index = 0,
}: {
  properties: CardData[];
  index?: number;
}) => {
  const previewMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations('stickyCard');

  const propertiesWithCoords = useMemo(() => 
    properties.filter(p => p.latitude != null && p.longitude != null),
    [properties]
  );

  // Initialiser la carte statique (aperçu non interactif)
  useEffect(() => {
    if (!previewMapRef.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.warn('NEXT_PUBLIC_MAPBOX_TOKEN is not defined');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: previewMapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DEFAULT_CENTER,
      zoom: 11,
      pitch: 30,
      bearing: -10,
      attributionControl: false,
      antialias: true,
      interactive: false, // Désactiver toute interactivité
    });

    mapInstanceRef.current = map;

    map.on('load', () => {
      // Ajouter des marqueurs statiques (non cliquables)
      propertiesWithCoords.forEach((property) => {
        if (property.longitude == null || property.latitude == null) return;

        const el = document.createElement('div');
        el.style.cssText = `
          width: 16px;
          height: 16px;
          background: #ffffff;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          pointer-events: none;
        `;

        new mapboxgl.Marker({ element: el })
          .setLngLat([property.longitude, property.latitude])
          .addTo(map);
      });
    });

    return () => {
      map.remove();
    };
  }, [propertiesWithCoords]);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return (
    <>
      <div 
        className={stickyCard002Styles.card}
        style={{
          position: 'relative',
          zIndex: 20,
          // Délai d'animation pour effet cascade
          animationDelay: `${index * 0.08}s`,
        }}
      >
        {/* Bouton flèche en haut à droite */}
        <button
          className={stickyCard002Styles.mapExpandButton}
          onClick={handleExpand}
          aria-label={t('map.expand')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Container de la carte statique */}
        <div 
          ref={previewMapRef}
          className={stickyCard002Styles.mapContainer}
        />

        {/* Overlay cliquable pour ouvrir la carte */}
        <div 
          className={stickyCard002Styles.mapPreviewOverlay}
          onClick={handleExpand}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleExpand()}
          aria-label={t('map.expand')}
        />

        {/* Overlay avec le nombre de propriétés */}
        <div className={stickyCard002Styles.mapOverlay}>
          <span className={stickyCard002Styles.mapPropertyCount}>
            {propertiesWithCoords.length} {propertiesWithCoords.length === 1 ? t('map.property') : t('map.properties')}
          </span>
        </div>
      </div>

      {/* Modal de la carte étendue */}
      <ExpandedMapModal
        isOpen={isExpanded}
        onClose={handleClose}
        properties={properties}
      />
    </>
  );
};

// Composant pour une card individuelle
const Card = ({
  card,
  imageClassName,
  index = 0,
}: {
  card: CardData;
  imageClassName?: string;
  index?: number;
}) => {
  const [countdown, setCountdown] = useState<CountdownState | null>(null);
  const locale = useLocale();
  const t = useTranslations('stickyCard');
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const title = card.title || card.alt || `Card ${card.id}`;
  const productUrl = card.productUrl || `/product/${card.id}`;
  const fullProductUrl = productUrl.startsWith('/') ? `/${locale}${productUrl}` : productUrl;

  const investorCount = card.investorCount ?? 0;
  const targetTimestamp = useMemo(() => {
    if (!card.availableAt) {
      return null;
    }
    const ts = new Date(card.availableAt).getTime();
    return Number.isNaN(ts) ? null : ts;
  }, [card.availableAt]);

  useEffect(() => {
    if (!targetTimestamp) {
      setCountdown(null);
      return;
    }
    const updateCountdown = () => {
      const diff = targetTimestamp - Date.now();
      if (diff <= 0) {
        setCountdown(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ total: diff, days, hours, minutes, seconds });
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [targetTimestamp]);

  const isUpcoming = !!countdown;
  const formattedAvailableOn = useMemo(() => {
    if (!targetTimestamp) {
      return '';
    }
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(targetTimestamp));
    } catch {
      return new Date(targetTimestamp).toLocaleString();
    }
  }, [locale, targetTimestamp]);

  const countdownUnits: { key: 'days' | 'hours' | 'minutes' | 'seconds'; value: number; label: string }[] = countdown
    ? [
        { key: 'days', value: countdown.days, label: t('countdown.days') },
        { key: 'hours', value: countdown.hours, label: t('countdown.hours') },
        { key: 'minutes', value: countdown.minutes, label: t('countdown.minutes') },
        { key: 'seconds', value: countdown.seconds, label: t('countdown.seconds') },
      ]
    : [];

  return (
    <div 
      className={stickyCard002Styles.card}
      style={{
        // Z-index élevé pour que les cards soient toujours au-dessus
        position: 'relative',
        zIndex: 20,
        // Délai d'animation pour effet cascade
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {isUpcoming && countdown && (
        <div className={stickyCard002Styles.countdownBadge}>
          <span className={stickyCard002Styles.countdownTitle}>{t('countdown.title')}</span>
          <div className={stickyCard002Styles.countdownGrid}>
            {countdownUnits.map((unit) => (
              <div key={unit.key} className={stickyCard002Styles.countdownCell}>
                <span className={stickyCard002Styles.countdownValue}>
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className={stickyCard002Styles.countdownLabel}>{unit.label}</span>
              </div>
            ))}
          </div>
          <span className={stickyCard002Styles.countdownDate}>
            {t('countdown.availableOn', { date: formattedAvailableOn })}
          </span>
        </div>
      )}
      {/* Indicateur d'investisseurs en haut à gauche */}
      {investorCount > 0 && (
        <InvestorBadge
          count={investorCount}
          singularLabel={t('investor')}
          pluralLabel={t('investors')}
          className={stickyCard002Styles.investorBadgePosition}
        />
      )}
      <img
        src={card.image}
        alt={title}
        className={cn(stickyCard002Styles.image(imageClassName))}
      />
      <div 
        className={stickyCard002Styles.cardOverlay} 
        data-card-overlay
      >
        <div className={stickyCard002Styles.cardDetails}>
          <h3 className={stickyCard002Styles.cardTitle}>{title}</h3>
          
          {/* Informations du bien */}
          <div className={stickyCard002Styles.cardInfoList}>
            {card.location && (
              <div className={stickyCard002Styles.cardInfoItem}>
                <span className={stickyCard002Styles.cardInfoLabel}>{t('location')}:</span>
                <span className={stickyCard002Styles.cardInfoValue}>{card.location}</span>
              </div>
            )}
            
            {card.pricePerShare !== undefined && (
              <div className={stickyCard002Styles.cardInfoItem}>
                <span className={stickyCard002Styles.cardInfoLabel}>{t('pricePerShare')}:</span>
                <span className={stickyCard002Styles.cardInfoValue}>
                  {new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: 'AED',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(card.pricePerShare)}
                </span>
              </div>
            )}
            
            {card.sharesAvailable !== undefined && card.totalShares !== undefined && (
              <div className={stickyCard002Styles.cardInfoItem}>
                <span className={stickyCard002Styles.cardInfoLabel}>{t('sharesAvailable')}:</span>
                <span className={stickyCard002Styles.cardInfoValue}>
                  {card.sharesAvailable} / {card.totalShares}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Bouton de redirection en bas */}
        {productUrl && (
          <Link 
            href={fullProductUrl}
            className={stickyCard002Styles.cardButton}
            onClick={(e) => {
              e.stopPropagation();
              if (isUpcoming) {
                e.preventDefault();
                return;
              }
              if (isAuthenticated) {
                return;
              }
              e.preventDefault();
              const redirectParam = encodeURIComponent(fullProductUrl);
              router.push(`/${locale}/login?redirect=${redirectParam}`);
            }}
          >
            <span className={stickyCard002Styles.cardButtonText}>
              {isUpcoming ? t('countdown.ctaLocked') : t('discover')}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

// Type pour distinguer les items normaux de la map
type CardItem = { type: 'card'; data: CardData } | { type: 'map'; properties: CardData[] };

const StickyCard002 = ({
  cards,
  className,
  containerClassName,
  imageClassName,
  showMap = true,
}: StickyCard002Props) => {
  const list = cards ?? [];

  if (!list.length) {
    return null;
  }

  // Créer la liste des items avec la map à la fin si showMap est true
  const items: CardItem[] = useMemo(() => {
    const cardItems: CardItem[] = list.map(card => ({ type: 'card' as const, data: card }));
    if (showMap) {
      cardItems.push({ type: 'map' as const, properties: list });
    }
    return cardItems;
  }, [list, showMap]);

  return (
    <ParallaxStickyContainer
      items={items}
      renderItem={(item, index) => {
        if (item.type === 'map') {
          return (
            <MapCard 
              key="map-card"
              properties={item.properties}
              index={index}
            />
          );
        }
        return (
          <Card 
            key={item.data.id} 
            card={item.data} 
            imageClassName={imageClassName}
            index={index}
          />
        );
      }}
      itemSize={CARD_SIZE}
      itemGap={CARD_GAP_HORIZONTAL}
      itemHeight={CARD_SIZE}
      rowVerticalOffset={ROW_VERTICAL_OFFSET}
      wrapperClassName={cn(stickyCard002Styles.wrapper(className))}
      containerClassName={cn(stickyCard002Styles.main(containerClassName))}
      rowContainerClassName={stickyCard002Styles.stickyContainer}
      rowWrapperClassName={stickyCard002Styles.rowWrapper}
    />
  );
};

export { StickyCard002 };

export const StickyCard002Default = () => {
  const t = useTranslations('stickyCard');
  const locale = useLocale();
  const tRef = useRef(t);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const fetchAvailableCards = async () => {
      setIsLoading(true);
      try {
        const response = await publicPropertiesApi.list({
          limit: 32,
          status: 'published',
          locale,
        });
        const properties = response.properties || [];
        const now = Date.now();

        const normalizedCards = properties
          .filter((property) => {
            if (!property.availableAt) {
              return true;
            }
            const timestamp = Date.parse(property.availableAt);
            return Number.isNaN(timestamp) || timestamp <= now;
          })
          .map<CardData>((property) => {
            const sharesAvailable = Math.max(
              (property.totalShares ?? 0) - (property.soldShares ?? 0),
              0,
            );
            const location = property.address || [property.zone, property.emirate].filter(Boolean).join(', ');

            return {
              id: property.id,
              image: property.mainImage || property.images?.[0] || '/images/TowerJBR.png',
              title: property.title,
              productUrl: `/product/${property.id}`,
              investorCount: (property.metadata as any)?.investorCount ?? property.soldShares ?? 0,
              sharesAvailable,
              totalShares: property.totalShares,
              pricePerShare: property.pricePerShare,
              location,
              availableAt: property.availableAt,
              latitude: property.latitude,
              longitude: property.longitude,
              // Champs pour MapPropertyPopupCard
              propertyType: property.propertyType,
              totalArea: property.totalArea,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
            };
          })
          .filter((card) => card.totalShares && card.image);

        if (isMounted) {
          if (normalizedCards.length) {
            setCards(normalizedCards);
            setError(null);
          } else {
            setCards([]);
            setError(
              tRef.current('empty', {
                defaultValue: 'No live opportunities yet.',
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
                  defaultValue: 'Unable to load opportunities.',
                });
          setError(message);
          setCards([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAvailableCards();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const emptyMessage =
    error ?? t('empty', { defaultValue: 'No opportunities available right now.' });

  if (isLoading) {
    return (
      <div className={stickyCard002Styles.defaultWrapper}>
        <div className={stickyCard002Styles.placeholderPanel}>
          <div className={stickyCard002Styles.loaderContainer}>
            <span className={stickyCard002Styles.loaderDot} />
            <span className={stickyCard002Styles.loaderDot} />
            <span className={stickyCard002Styles.loaderDot} />
          </div>
        </div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className={stickyCard002Styles.defaultWrapper}>
        <div className={stickyCard002Styles.placeholderPanel}>
          <p className={stickyCard002Styles.placeholderText}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={stickyCard002Styles.defaultWrapper}>
      <StickyCard002 cards={cards} />
    </div>
  );
};