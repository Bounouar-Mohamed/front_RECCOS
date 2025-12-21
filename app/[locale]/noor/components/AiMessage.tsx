'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { aiMessageStyles as styles } from './AiMessage.styles';
import { Buffer } from 'buffer';

const PROPERTY_MARKER_REGEX = /(?:<!--__NOOR_PROPERTIES__:(.*?)-->|__NOOR_PROPERTIES__:(.*?)__NOOR_END__)/s;

type SectionKey = 'available' | 'upcoming';

interface StructuredProperty {
  id?: string;
  title?: string;
  zone?: string;
  type?: string;
  pricePerShare?: number;
  pricePerShareFormatted?: string;
  bedrooms?: number;
  bathrooms?: number;
  totalArea?: string;
  mainImage?: string;
  isAvailableNow?: boolean;
  availableAt?: string | null;
  pitch?: string;
}

interface UiCopyPayload {
  sectionAvailable?: string;
  sectionUpcoming?: string;
  sectionEmpty?: string;
  badgeAvailable?: string;
  badgeUpcoming?: string;
  countdownLabel?: string;
  discoverCta?: string;
  comingSoonCta?: string;
  untitledProperty?: string;
  unknownZone?: string;
  unknownType?: string;
  unknownPrice?: string;
  currency?: string;
}

interface StructuredPayload {
  lang?: string;
  intro?: string;
  outro?: string;
  copy?: UiCopyPayload;
  sections?: Array<{
    key: SectionKey;
    title?: string;
    properties?: StructuredProperty[];
  }>;
}

interface PropertyData {
  id?: string;
  title: string;
  zone: string;
  type: string;
  pricePerShare: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  image?: string;
  isAvailableNow?: boolean;
  availableAt?: string | null;
  pitch?: string;
}

interface SectionData {
  key: SectionKey;
  title: string;
  properties: PropertyData[];
}

interface AiMessageProps {
  content: string;
  className?: string;
}

interface UiCopy {
  sectionAvailable: string;
  sectionUpcoming: string;
  sectionEmpty: string;
  badgeAvailable: string;
  badgeUpcoming: string;
  countdownLabel: string;
  discoverCta: string;
  comingSoonCta: string;
  untitledProperty: string;
  unknownZone: string;
  unknownType: string;
  unknownPrice: string;
  currency: string;
}

// Fallback copies (utilisées seulement si le backend n'envoie pas les traductions)
const FALLBACK_COPY: Record<string, UiCopy> = {
  fr: {
    sectionAvailable: 'Disponible maintenant',
    sectionUpcoming: 'Prochainement',
    sectionEmpty: "Aucune propriété dans cette section.",
    badgeAvailable: 'Disponible',
    badgeUpcoming: 'Bientôt',
    countdownLabel: 'Dans',
    discoverCta: 'Voir',
    comingSoonCta: 'Bientôt',
    untitledProperty: 'Propriété',
    unknownZone: 'Zone non précisée',
    unknownType: 'Type non précisé',
    unknownPrice: 'Prix sur demande',
    currency: 'AED',
  },
  en: {
    sectionAvailable: 'Available now',
    sectionUpcoming: 'Coming soon',
    sectionEmpty: 'No properties in this section.',
    badgeAvailable: 'Available',
    badgeUpcoming: 'Soon',
    countdownLabel: 'In',
    discoverCta: 'View',
    comingSoonCta: 'Soon',
    untitledProperty: 'Property',
    unknownZone: 'Zone not specified',
    unknownType: 'Type not specified',
    unknownPrice: 'Price on request',
    currency: 'AED',
  },
  ar: {
    sectionAvailable: 'متاح الآن',
    sectionUpcoming: 'قريباً',
    sectionEmpty: 'لا توجد عقارات.',
    badgeAvailable: 'متاح',
    badgeUpcoming: 'قريباً',
    countdownLabel: 'بعد',
    discoverCta: 'عرض',
    comingSoonCta: 'قريباً',
    untitledProperty: 'عقار',
    unknownZone: 'منطقة غير محددة',
    unknownType: 'نوع غير محدد',
    unknownPrice: 'السعر عند الطلب',
    currency: 'AED',
  },
};

function getNormalizedLocale(locale: string): string {
  if (!locale) return 'en';
  if (locale.startsWith('fr')) return 'fr';
  if (locale.startsWith('ar')) return 'ar';
  return 'en';
}

function getFallbackCopy(locale: string): UiCopy {
  const normalized = getNormalizedLocale(locale);
  return FALLBACK_COPY[normalized] || FALLBACK_COPY.en;
}

function mergeCopy(payloadCopy: UiCopyPayload | undefined, fallback: UiCopy): UiCopy {
  if (!payloadCopy) return fallback;
  return {
    sectionAvailable: payloadCopy.sectionAvailable || fallback.sectionAvailable,
    sectionUpcoming: payloadCopy.sectionUpcoming || fallback.sectionUpcoming,
    sectionEmpty: payloadCopy.sectionEmpty || fallback.sectionEmpty,
    badgeAvailable: payloadCopy.badgeAvailable || fallback.badgeAvailable,
    badgeUpcoming: payloadCopy.badgeUpcoming || fallback.badgeUpcoming,
    countdownLabel: payloadCopy.countdownLabel || fallback.countdownLabel,
    discoverCta: payloadCopy.discoverCta || fallback.discoverCta,
    comingSoonCta: payloadCopy.comingSoonCta || fallback.comingSoonCta,
    untitledProperty: payloadCopy.untitledProperty || fallback.untitledProperty,
    unknownZone: payloadCopy.unknownZone || fallback.unknownZone,
    unknownType: payloadCopy.unknownType || fallback.unknownType,
    unknownPrice: payloadCopy.unknownPrice || fallback.unknownPrice,
    currency: payloadCopy.currency || fallback.currency,
  };
}

function decodeStructuredPayload(content: string): { cleanContent: string; payload: StructuredPayload | null } {
  const match = PROPERTY_MARKER_REGEX.exec(content);
  if (!match) {
    return { cleanContent: content.trim(), payload: null };
  }

  const base64 = match[1] || match[2];
  if (!base64) {
    return { cleanContent: content.replace(match[0], '').trim(), payload: null };
  }

  let payload: StructuredPayload | null = null;
  try {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      const binary = window.atob(base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const decoder = new TextDecoder('utf-8');
      payload = JSON.parse(decoder.decode(bytes));
    } else if (typeof Buffer !== 'undefined') {
      const decoded = Buffer.from(base64, 'base64').toString('utf-8');
      payload = JSON.parse(decoded);
    }
  } catch {
    payload = null;
  }

  const cleanContent = content.replace(match[0], '').trim();
  return { cleanContent, payload };
}

function useCountdown(targetDate?: string | null) {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setCountdown(null);
      return;
    }

    let targetTimestamp = Date.parse(targetDate);
    if (Number.isNaN(targetTimestamp)) {
      const match = targetDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
      if (match) {
        const [_, day, monthName, year] = match;
        const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
        const index = months.findIndex((m) => monthName.toLowerCase().startsWith(m.slice(0, 3)));
        if (index >= 0) {
          targetTimestamp = new Date(Number(year), index, Number(day)).getTime();
        }
      }
    }

    if (Number.isNaN(targetTimestamp)) {
      setCountdown(null);
      return;
    }

    const update = () => {
      const diff = targetTimestamp - Date.now();
      if (diff <= 0) {
        setCountdown(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      if (days > 0) {
        setCountdown(`${days}j ${hours}h`);
      } else {
        setCountdown(`${hours}h ${minutes}m`);
      }
    };

    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  return countdown;
}

function formatPrice(value: number | undefined, locale: string, currency: string): string | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  try {
    const formatted = new Intl.NumberFormat(locale || 'en-US', {
      maximumFractionDigits: 0,
    }).format(value);
    return `${formatted} ${currency}`;
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}

/**
 * Vérifie si une propriété a des données valides (pas juste des placeholders)
 */
function isValidProperty(property: StructuredProperty): boolean {
  // Une propriété est valide si elle a au moins un ID ET un titre réel
  const hasId = !!property.id && property.id.length > 3;
  const hasTitle = !!property.title && property.title.length > 3;
  const hasPrice = typeof property.pricePerShare === 'number' && property.pricePerShare > 0;
  
  // Doit avoir au minimum (ID ou titre) ET un prix
  return (hasId || hasTitle) && hasPrice;
}

function normalizeProperty(property: StructuredProperty, locale: string, copy: UiCopy, sectionKey: SectionKey): PropertyData | null {
  // Filtrer les propriétés invalides
  if (!isValidProperty(property)) {
    return null;
  }
  
  return {
    id: property.id,
    title: property.title || copy.untitledProperty,
    zone: property.zone || copy.unknownZone,
    type: property.type || copy.unknownType,
    pricePerShare:
      property.pricePerShareFormatted ||
      formatPrice(property.pricePerShare, locale, copy.currency) ||
      copy.unknownPrice,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.totalArea || undefined,
    image: property.mainImage,
    isAvailableNow: sectionKey === 'available' ? true : property.isAvailableNow ?? false,
    availableAt: property.availableAt || null,
    pitch: property.pitch,
  };
}

function parseStructuredSections(payload: StructuredPayload | null, locale: string, copy: UiCopy): SectionData[] {
  if (!payload?.sections) {
    return [];
  }

  return payload.sections.map((section) => {
    const key: SectionKey = section.key === 'upcoming' ? 'upcoming' : 'available';
    // Utiliser le titre du payload s'il existe, sinon fallback
    const title = section.title || (key === 'upcoming' ? copy.sectionUpcoming : copy.sectionAvailable);
    // Filtrer les propriétés invalides (normalizeProperty retourne null pour les invalides)
    const properties = (section.properties || [])
      .map((property) => normalizeProperty(property, locale, copy, key))
      .filter((p): p is PropertyData => p !== null);
    return { key, title, properties };
  });
}

// Parser fallback pour le texte brut (quand pas de payload structuré)
const LABEL_PATTERNS = {
  id: [/^id\b/i, /^-?\s*id\b/i],
  price: [/prix par part/i, /price per share/i, /^-?\s*prix/i, /^-?\s*price/i],
  shares: [/parts restantes/i, /shares remaining/i, /^-?\s*parts/i, /^-?\s*shares/i],
  zone: [/^-?\s*zone/i, /quartier/i, /^-?\s*area/i, /^-?\s*location/i],
  type: [/^-?\s*type/i],
  bedrooms: [/chambres/i, /bedrooms/i],
  bathrooms: [/salles de bains/i, /bathrooms/i],
  area: [/superficie/i, /surface/i, /^-?\s*area\s*:/i, /sqft/i],
  image: [/^-?\s*image/i, /photo/i, /visuel/i],
};

const SECTION_PATTERNS = {
  available: [
    /^✅/,
    /disponible(?:s)?\s+maintenant/i,
    /available\s+now/i,
    /^disponible\s*$/i,
    /^available\s*$/i,
    /العقارات المتاحة/,
  ],
  upcoming: [
    /^⏳/,
    /à venir/i,
    /prochaines?\s+opportunit[eé]s?/i,
    /upcoming/i,
    /coming\s+soon/i,
    /العقارات القادمة/,
  ],
};

const PROPERTY_TITLE_PATTERN = /(✅|⏳)/;
const DATA_LINE_PATTERN = /^-?\s*[\w\s]+\s*:/i;

function matchesAny(label: string, patterns: RegExp[]): boolean {
  return patterns.some((regex) => regex.test(label));
}

function detectSectionFromLine(line: string): SectionKey | null {
  for (const pattern of SECTION_PATTERNS.available) {
    if (pattern.test(line)) return 'available';
  }
  for (const pattern of SECTION_PATTERNS.upcoming) {
    if (pattern.test(line)) return 'upcoming';
  }
  return null;
}

function isPropertyTitleLine(line: string): boolean {
  if (!PROPERTY_TITLE_PATTERN.test(line)) return false;
  const sectionDetected = detectSectionFromLine(line);
  const beforeEmoji = line.split(/[✅⏳]/)[0].trim();
  if (sectionDetected && beforeEmoji.length < 5) return false;
  return true;
}

function parseBackendTemplate(content: string, locale: string, copy: UiCopy): SectionData[] {
  if (!content) return [];

  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l !== '');
  const sections: SectionData[] = [
    { key: 'available', title: copy.sectionAvailable, properties: [] },
    { key: 'upcoming', title: copy.sectionUpcoming, properties: [] },
  ];

  let currentSection: SectionKey | null = null;
  let buffer: string[] = [];
  let currentPropertyTitle: string | null = null;

  const flush = () => {
    if (!currentSection || (buffer.length === 0 && !currentPropertyTitle)) return;
    
    const titleLine = currentPropertyTitle || 
      buffer.find((line) => PROPERTY_TITLE_PATTERN.test(line)) ||
      buffer.find((line) => !DATA_LINE_PATTERN.test(line)) || null;

    let id: string | undefined;
    let pricePerShare: string | undefined;
    let zone: string | undefined;
    let type: string | undefined;
    let bedrooms: number | undefined;
    let bathrooms: number | undefined;
    let area: string | undefined;
    let image: string | undefined;
    let availableAt: string | null = null;

    const allLines = currentPropertyTitle ? [currentPropertyTitle, ...buffer] : buffer;
    
    for (const rawLine of allLines) {
      const colonIndex = rawLine.indexOf(':');
      if (colonIndex === -1) continue;
      
      const rawLabel = rawLine.substring(0, colonIndex).replace(/^-\s*/, '').trim();
      const rawValue = rawLine.substring(colonIndex + 1).trim();
      
      if (!rawValue || !rawLabel) continue;
      const label = rawLabel.toLowerCase();

      if (matchesAny(label, LABEL_PATTERNS.id)) { id = rawValue; continue; }
      if (matchesAny(label, LABEL_PATTERNS.price)) { pricePerShare = rawValue; continue; }
      if (matchesAny(label, LABEL_PATTERNS.zone)) { zone = rawValue; continue; }
      if (matchesAny(label, LABEL_PATTERNS.type)) { type = rawValue; continue; }
      if (matchesAny(label, LABEL_PATTERNS.bedrooms)) {
        const bedsMatch = rawValue.match(/^(\d+)/);
        if (bedsMatch) bedrooms = Number(bedsMatch[1]);
        const bathsMatch = rawValue.match(/salles?\s+de\s+bains?\s*:\s*(\d+)|bathrooms?\s*:\s*(\d+)/i);
        if (bathsMatch) bathrooms = Number(bathsMatch[1] || bathsMatch[2]);
        continue;
      }
      if (matchesAny(label, LABEL_PATTERNS.bathrooms)) {
        const match = rawValue.match(/\d+/);
        if (match) bathrooms = Number(match[0]);
        continue;
      }
      if (matchesAny(label, LABEL_PATTERNS.area)) { area = rawValue; continue; }
      if (matchesAny(label, LABEL_PATTERNS.image)) {
        const urlMatch = rawValue.match(/https?:\/\/\S+/);
        image = urlMatch ? urlMatch[0] : undefined;
        continue;
      }
    }

    if (titleLine) {
      const dateMatch = titleLine.match(/\(([^)]+)\)/);
      if (dateMatch && currentSection === 'upcoming') {
        availableAt = dateMatch[1];
      }
    }

    const cleanTitle = titleLine
      ? titleLine.replace(/(✅|⏳)\s*(Available now|Coming soon|Disponible|Bientôt)?\s*(\([^)]+\))?/gi, '').trim()
      : copy.untitledProperty;

    const prop: PropertyData = {
      id,
      title: cleanTitle || copy.untitledProperty,
      zone: zone || copy.unknownZone,
      type: type || copy.unknownType,
      pricePerShare: pricePerShare || copy.unknownPrice,
      bedrooms,
      bathrooms,
      area,
      image,
      isAvailableNow: currentSection === 'available',
      availableAt,
    };

    // ════════════════════════════════════════════════════════════════════════════════
    // VALIDATION: Ne pas afficher de card si pas de données substantielles
    // Une propriété valide doit avoir: (ID OU titre réel) ET un prix réel
    // ════════════════════════════════════════════════════════════════════════════════
    const hasSubstantialTitle = prop.title && prop.title.length > 3 && prop.title !== copy.untitledProperty;
    const hasValidId = prop.id && prop.id.length > 3;
    const hasRealPrice = pricePerShare && !pricePerShare.includes(copy.unknownPrice) && pricePerShare !== 'N/A';
    
    // Doit avoir (ID ou titre) ET un prix valide pour être affiché
    if ((hasSubstantialTitle || hasValidId) && hasRealPrice) {
      sections.find((s) => s.key === currentSection)?.properties.push(prop);
    }
    buffer = [];
    currentPropertyTitle = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const detectedSection = detectSectionFromLine(line);
    if (detectedSection) {
      flush();
      currentSection = detectedSection;
      if (!isPropertyTitleLine(line)) continue;
    }
    
    if (isPropertyTitleLine(line)) {
      flush();
      if (!currentSection) {
        currentSection = line.includes('✅') ? 'available' : 'upcoming';
      }
      currentPropertyTitle = line;
      continue;
    }
    
    if (!currentSection) {
      if (DATA_LINE_PATTERN.test(line)) {
        currentSection = 'available';
      } else {
        continue;
      }
    }
    
    buffer.push(line);
  }
  flush();

  return sections.filter((s) => s.properties.length > 0);
}

// Extraire l'intro du message (texte avant les propriétés)
function extractIntroFromContent(content: string): string {
  const patterns = [
    /✅\s*(Propriétés|Available|العقارات)/i,
    /⏳\s*(Prochaines|Upcoming|العقارات)/i,
    /^[^\n]+\s*✅/m,
    /^[^\n]+\s*⏳/m,
  ];
  
  let earliestIndex = content.length;
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match.index !== undefined && match.index < earliestIndex) {
      earliestIndex = match.index;
    }
  }
  
  if (earliestIndex > 0 && earliestIndex < content.length) {
    return content.substring(0, earliestIndex).trim();
  }
  return '';
}

function PropertyCard({ property, copy, locale, sectionKey }: { property: PropertyData; copy: UiCopy; locale: string; sectionKey: SectionKey }) {
  const [imageError, setImageError] = useState(false);
  const countdown = useCountdown(property.availableAt || undefined);
  const router = useRouter();
  const isUpcoming = sectionKey === 'upcoming' || property.isAvailableNow === false;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isUpcoming && property.id) {
      router.push(`/${locale}/product/${property.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        styles.propertyCard,
        isUpcoming ? styles.propertyCardDisabled : styles.propertyCardClickable
      )}
      onClick={isUpcoming ? undefined : handleClick}
    >
      {property.image && !imageError ? (
        <img
          src={property.image}
          alt={property.title}
          className={isUpcoming ? styles.propertyImageBlurred : styles.propertyImage}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={cn(styles.propertyImageFallback, isUpcoming && styles.propertyImageBlurred)}>
          🏠
        </div>
      )}

      {property.type && <span className={styles.propertyTypeBadge}>{property.type}</span>}

      {isUpcoming ? (
        countdown ? (
          <div className={styles.countdownBadge}>
            <span className={styles.countdownLabel}>{copy.countdownLabel}</span>
            <span className={styles.countdownTime}>{countdown}</span>
          </div>
        ) : (
          <span className={styles.statusBadge}>{copy.badgeUpcoming}</span>
        )
      ) : (
        <span className={styles.statusBadge}>{copy.badgeAvailable}</span>
      )}

      <div className={styles.propertyOverlay}>
        <h4 className={styles.propertyTitle}>{property.title}</h4>
        {property.pitch && <p className={styles.propertyPitch}>{property.pitch}</p>}
        <div className={styles.propertyMeta}>
          {property.zone && <span className={styles.propertyZone}>{property.zone}</span>}
          {property.pricePerShare && (
            <span className={styles.propertyPrice}>{property.pricePerShare}</span>
          )}
        </div>
        {(property.bedrooms !== undefined || property.bathrooms !== undefined || property.area) && (
          <div className={styles.propertyDetailsRow}>
            {property.bedrooms !== undefined && <span>{property.bedrooms}🛏</span>}
            {property.bathrooms !== undefined && <span>{property.bathrooms}🛁</span>}
            {property.area && <span>{property.area}</span>}
          </div>
        )}
        {!isUpcoming && property.id && (
          <button onClick={handleClick} className={styles.discoverButton}>
            {copy.discoverCta}
          </button>
        )}
        {isUpcoming && (
          <div className={styles.upcomingHint}>{copy.comingSoonCta}</div>
        )}
      </div>
    </motion.div>
  );
}

function transformContent(content: string, routeLocale: string) {
  const { cleanContent: baseContent, payload } = decodeStructuredPayload(content);
  
  // Utiliser la langue du payload si disponible, sinon la locale de la route
  const lang = payload?.lang || routeLocale;
  const fallbackCopy = getFallbackCopy(lang);
  const copy = mergeCopy(payload?.copy, fallbackCopy);
  
  // Parser les sections structurées ou fallback sur le texte
  let sections = parseStructuredSections(payload, lang, copy);
  const hasStructuredCards = sections.some((section) => section.properties.length > 0);
  
  if (!hasStructuredCards) {
    sections = parseBackendTemplate(baseContent, lang, copy);
  }

  const hasCards = sections.some((section) => section.properties.length > 0);
  
  // Utiliser l'intro/outro du payload, ou extraire du texte
  const intro = payload?.intro || (hasCards ? extractIntroFromContent(baseContent) : '');
  const outro = payload?.outro || '';
  
  // Le contenu textuel à afficher (seulement si pas de cartes)
  const textContent = hasCards ? '' : baseContent;

  return { textContent, sections, intro, outro, lang, copy };
}

export function AiMessage({ content, className }: AiMessageProps) {
  const routeLocale = useLocale();

  const { textContent, sections, intro, outro, lang, copy } = useMemo(
    () => transformContent(content, routeLocale),
    [content, routeLocale],
  );
  
  const htmlContent = useMemo(() => {
    if (!textContent) return '';
    const source = textContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    let html = source
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/- (.+)/g, '<li>$1</li>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    html = html.replace(/(<li>[^<]+<\/li>)+/g, (match) => `<ul>${match}</ul>`);
    if (html && !html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }
    return html.replace(/<p>\s*<\/p>/g, '');
  }, [textContent]);

  const hasCards = sections.some((section) => section.properties.length > 0);

  return (
    <div className={cn(styles.container, className)}>
      {/* Introduction (du LLM via payload ou extraite du texte) */}
      {intro && hasCards && (
        <div className={styles.textContent}>
          <p className={styles.introText}>{intro}</p>
        </div>
      )}
      
      {/* Contenu textuel (quand pas de cartes) */}
      {htmlContent && (
        <div className={styles.textContent} dangerouslySetInnerHTML={{ __html: htmlContent }} />
      )}

      {/* Cartes de propriétés */}
      {sections.length > 0 && (
        <div className={styles.propertiesWrapper}>
          {sections.map((section) => (
            <div key={section.key} className={styles.propertiesSection}>
              <span className={styles.propertiesSectionTitle}>{section.title}</span>
              {section.properties.length ? (
                <div className={styles.propertiesGrid}>
                  {section.properties.map((property, index) => (
                    <PropertyCard
                      key={`${section.key}-${property.id ?? index}`}
                      property={property}
                      copy={copy}
                      locale={lang}
                      sectionKey={section.key}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.propertiesEmpty}>{copy.sectionEmpty}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Outro (du LLM via payload) - seulement si fourni par le backend */}
      {outro && hasCards && (
        <div className={styles.textContent}>
          <p className={styles.outroText}>{outro}</p>
        </div>
      )}
    </div>
  );
}

export default AiMessage;
