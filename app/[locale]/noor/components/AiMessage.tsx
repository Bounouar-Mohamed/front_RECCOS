'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { aiMessageStyles as styles } from './AiMessage.styles';

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
  availableAt?: string;
}

interface AiMessageProps {
  content: string;
  className?: string;
}

// === HOOKS ===
function useCountdown(targetDate: string | undefined) {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setCountdown(null);
      return;
    }

    let targetTimestamp: number;
    try {
      // Parser la date dans différents formats
      const frenchMonths: Record<string, number> = {
        'janvier': 0, 'janv': 0,
        'février': 1, 'fév': 1,
        'mars': 2,
        'avril': 3, 'avr': 3,
        'mai': 4,
        'juin': 5,
        'juillet': 6, 'juil': 6,
        'août': 7,
        'septembre': 8, 'sept': 8,
        'octobre': 9, 'oct': 9,
        'novembre': 10, 'nov': 10,
        'décembre': 11, 'déc': 11
      };
      
      // Format ISO (2024-12-12 ou 2024-12-12T15:28:00)
      if (targetDate.match(/^\d{4}-\d{2}-\d{2}/)) {
        targetTimestamp = new Date(targetDate).getTime();
      }
      // Format français avec heure (12 déc. 2025 à 15:28)
      else if (targetDate.match(/(\d+)\s+(\w+)\.?\s+(\d{4})(?:\s+à\s+(\d+):(\d+))?/)) {
        const match = targetDate.match(/(\d+)\s+(\w+)\.?\s+(\d{4})(?:\s+à\s+(\d+):(\d+))?/);
        if (match) {
          const day = parseInt(match[1]);
          const monthName = match[2].toLowerCase().replace('.', '');
          const month = frenchMonths[monthName];
          const year = parseInt(match[3]);
          const hour = match[4] ? parseInt(match[4]) : 0;
          const minute = match[5] ? parseInt(match[5]) : 0;
          
          if (month !== undefined) {
            targetTimestamp = new Date(year, month, day, hour, minute).getTime();
          } else {
            targetTimestamp = new Date(targetDate).getTime();
          }
        } else {
          targetTimestamp = new Date(targetDate).getTime();
        }
      }
      // Format français complet (12 décembre 2025)
      else {
        const match = targetDate.match(/(\d+)\s+(\w+)\s+(\d{4})/);
        if (match) {
          const day = parseInt(match[1]);
          const month = frenchMonths[match[2].toLowerCase()];
          const year = parseInt(match[3]);
          if (month !== undefined) {
            targetTimestamp = new Date(year, month, day).getTime();
          } else {
            targetTimestamp = new Date(targetDate).getTime();
          }
        } else {
          targetTimestamp = new Date(targetDate).getTime();
        }
      }
      
      if (isNaN(targetTimestamp)) {
        setCountdown(null);
        return;
      }
    } catch {
      setCountdown(null);
      return;
    }

    if (isNaN(targetTimestamp)) {
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
      
      if (days > 0) {
        setCountdown(`${days}j ${hours}h`);
      } else {
        setCountdown(`${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, [targetDate]);

  return countdown;
}

// === PARSERS ===
function sanitizeTitleText(rawTitle: string): string {
  return rawTitle
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/(✅|⏳).*/g, '')
    .replace(/\b(AVAILABLE|SOON|DISPONIBLE|Bient[oô]t).*/i, '')
    .trim();
}

function sanitizeUnsupportedPromises(text: string): string {
  return text
    .replace(/je (?:peux|vais) te mettre sur liste d'attente[^.?!]*[.?!]?/gi, "Je ne peux pas t'ajouter automatiquement à une liste d'attente, mais je peux te partager les disponibilités ici.")
    .replace(/i (?:can|will) put you on (?:the )?waitlist[^.?!]*[.?!]?/gi, "I can't automatically add you to a waitlist, but I can keep you updated here.");
}

function extractProperties(content: string): { properties: PropertyData[]; cleanContent: string } {
  const properties: PropertyData[] = [];
  let cleanContent = content;
  
  // ============================================
  // GARDE FLEXIBLE : analyser les listes explicites mais tolérer
  // les formulations courantes ("Voici ce qui est dispo", etc.)
  // ============================================
  const normalizedHeader = content.toLowerCase();
  const propertyTriggers = [
    'voici les propriétés disponibles',
    'voici ce qui est disponible',
    'voici ce qui est dispo',
    'voici les biens disponibles',
    'voici les opportunités disponibles',
    'voici ce que je peux te montrer',
    'voici ce qui est dispo en ce moment',
    'discover the properties',
    'available properties',
    'here are the properties',
    'here is what i can show you',
  ];
  const hasTrigger = propertyTriggers.some((trigger) => normalizedHeader.includes(trigger));
  const isPropertyListResponse = hasTrigger || /^━+$/m.test(content); // Format avec séparateurs
  
  // Si ce n'est PAS une liste de propriétés, on ne parse pas
  if (!isPropertyListResponse) {
    // Juste nettoyer les blocs mal formatés qui auraient pu être générés
    cleanContent = content
      .replace(/AVAILABLE PROPERT(Y|IES)/gi, '')
      .replace(/^🏠.*$/gm, '')
      .replace(/^DISCOVER$/gm, '')
      .replace(/^\d[\d,.\s]*AED\s*$/gm, '')
      .replace(/^#+\s*/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return { properties: [], cleanContent };
  }
  
  const normalizedContent = content
    .replace(/```/g, '')        // retirer les fences markdown qui cassent le parsing des cartes
    .replace(/\r/g, '')         // normaliser les retours chariot
    .replace(/  +\n/g, '\n')
    .replace(/\n   +- /g, '\n- ');

  // --- Détection avancée des blocs titres + puces (nouveau format NOOR) ---
  const bulletResult = extractBulletPropertyBlocks(normalizedContent);
  properties.push(...bulletResult.properties);
  cleanContent = bulletResult.cleanContent;

  // PATTERN 1: Format "1. **Titre**" avec astérisques
  const pattern1 = /(?:^|\n)(\d+)\.\s*\*\*([^*]+)\*\*\s*\n([\s\S]*?)(?=\n\d+\.\s*\*\*|\n\n[A-Z]|$)/g;
  let match;
  while ((match = pattern1.exec(normalizedContent)) !== null) {
    const title = match[2].trim();
    const details = match[3];
    const property = parsePropertyDetails(title, details);
    if (property) properties.push(property);
  }

  // PATTERN 2: Format "### Titre"
  if (properties.length === 0) {
  const pattern2 = /(?:^|\n)###\s*(?:\d+\.\s*)?([^\n]+)\n([\s\S]*?)(?=\n###|\n---\n|$)/g;
    while ((match = pattern2.exec(normalizedContent)) !== null) {
      const title = match[1].trim();
      const details = match[2];
      const property = parsePropertyDetails(title, details);
      if (property) properties.push(property);
    }
  }

  // PATTERN 3: Format libre - détection ultra-robuste de blocs de propriétés
  if (properties.length === 0) {
    const lines = cleanContent.split('\n');
    let currentTitle: string | null = null;
    let currentDetails: string[] = [];
    let emptyLineCount = 0;
    const propertyLabels = /^(Type|Zone|Prix|Chambres|Salles|Superficie|Statut|ID|Id|id)/i;
    const skipPatterns = /^(Voir|Si tu|Pour|Avec|Si|Quand|Comment|Pourquoi|Où|Quand|Voici|Voilà|Available properties)/i;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isEmpty = line === '';
      
      if (isEmpty) {
        emptyLineCount++;
        // Si on a accumulé des détails et qu'on rencontre 2+ lignes vides, sauvegarder la propriété
        if (currentTitle && currentDetails.length >= 2 && emptyLineCount >= 2) {
          const details = currentDetails.join('\n');
          if (details.match(propertyLabels)) {
            const property = parsePropertyDetails(currentTitle, details);
            if (property) {
              properties.push(property);
              currentTitle = null;
              currentDetails = [];
              emptyLineCount = 0;
            }
          }
        }
        continue;
      }
      
      // Détecter un label de propriété
      if (propertyLabels.test(line)) {
        if (currentTitle) {
          // On accumule les détails
          currentDetails.push(line);
          emptyLineCount = 0;
        } else {
          // Pas de titre encore, ignorer cette ligne
          continue;
        }
      }
      // Détecter un titre potentiel (ligne qui n'est pas un label ni un skip pattern)
      else if (line.length > 5 && 
               line.length < 150 &&
               !propertyLabels.test(line) &&
               !skipPatterns.test(line) &&
               !line.match(/^[-*#\d]/) &&
               !line.match(/^https?:\/\//) &&
               !line.match(/^!\[/) &&
               !line.match(/^✅|^⏳/)) {
        
        // Sauvegarder la propriété précédente si elle existe
        if (currentTitle && currentDetails.length >= 2) {
          const details = currentDetails.join('\n');
          if (details.match(propertyLabels)) {
            const property = parsePropertyDetails(currentTitle, details);
            if (property) {
              properties.push(property);
            }
          }
        }
        
        // Commencer une nouvelle propriété
        currentTitle = sanitizeTitleText(line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim());
        currentDetails = [];
        emptyLineCount = 0;
      }
      // Autre contenu - si on a un titre et que ça ressemble à un champ (contient ':')
      else if (currentTitle && line.includes(':')) {
        // Peut-être un champ sans label explicite, essayer de l'ajouter
        currentDetails.push(line);
        emptyLineCount = 0;
      }
      // Si on a un titre mais que la ligne ne correspond à rien, réinitialiser si trop de lignes vides
      else if (currentTitle && emptyLineCount >= 3) {
        // Trop de lignes vides, réinitialiser
        currentTitle = null;
        currentDetails = [];
        emptyLineCount = 0;
      }
    }
    
    // Sauvegarder la dernière propriété
    if (currentTitle && currentDetails.length >= 2) {
      const details = currentDetails.join('\n');
      if (details.match(propertyLabels)) {
        const property = parsePropertyDetails(currentTitle, details);
        if (property) properties.push(property);
      }
    }
  }

  if (properties.length > 0) {
    // Nettoyer le contenu pour retirer les blocs de propriétés détectés
    cleanContent = cleanContent
      .replace(/(?:^|\n)\d+\.\s*\*\*[^*]+\*\*\s*\n[\s\S]*?(?=\n\d+\.\s*\*\*|\n\n[A-Z]|$)/g, '')
      .replace(/(?:^|\n)###\s*(?:\d+\.\s*)?[^\n]+\n[\s\S]*?(?=\n###|\n---\n|$)/g, '')
      .replace(/^Voici les propriétés[^:]*:\s*/i, '')
      .replace(/^Voici quelques propriétés[^:]*:\s*/i, '')
      .replace(/\n---\n/g, '\n')
      // Retirer les blocs de propriétés détectés par le pattern 3 (format libre)
      .split('\n')
      .filter((line, index, arr) => {
        const trimmed = line.trim();
        // Retirer les lignes qui sont des titres de propriétés détectés
        if (properties.some(p => p.title === trimmed || trimmed.includes(p.title))) {
          return false;
        }
        // Retirer les lignes "Voir cette propriété" et similaires
        if (/^(Voir|Si tu|Pour|Avec)/i.test(trimmed)) {
          return false;
        }
        return true;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    const condensed = cleanContent.replace(/\s+/g, ' ').trim();
    if (!condensed || condensed.length < 40) {
      cleanContent = '';
    }
  }

  return { properties, cleanContent };
}

function extractBulletPropertyBlocks(content: string): { properties: PropertyData[]; cleanContent: string } {
  // Normaliser le contenu : supprimer les lignes vides multiples entre bullets
  const normalizedContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}(?=-\s)/g, '\n') // Fusionner les doubles sauts avant les bullets
    .replace(/(?<=-[^\n]+)\n{2,}(?=-\s)/g, '\n'); // Fusionner les doubles sauts entre bullets
  
  const lines = normalizedContent.split('\n');
  const properties: PropertyData[] = [];
  const linesToRemove = new Set<number>();
  
  let currentTitle: string | null = null;
  let currentTitleIndex: number | null = null;
  let currentStatusText: string | null = null;
  let currentDetails: Array<{ text: string; index: number }> = [];
  
  const skipTitlePattern = /^(AVAILABLE PROPERTIES|AVAILABLE PROPERTY|VOICI|HERE ARE|🚀|PROCHAIN|PROCHAINE|SOON|COMING|Tu veux|Si tu)/i;
  const bulletPattern = /^\s*[\-\u2022•]\s+/;
  
  const flushCurrentProperty = () => {
    if (currentTitle && currentDetails.length >= 2) {
      let detailText = currentDetails.map((entry) => entry.text.trim()).join('\n');
      if (currentStatusText) {
        detailText = `Statut: ${currentStatusText}\n${detailText}`;
      }
      const property = parsePropertyDetails(currentTitle.trim(), detailText);
      if (property) {
        properties.push(property);
        if (currentTitleIndex !== null) {
          linesToRemove.add(currentTitleIndex);
        }
        currentDetails.forEach((entry) => linesToRemove.add(entry.index));
      }
    }
    currentTitle = null;
    currentTitleIndex = null;
    currentStatusText = null;
    currentDetails = [];
  };
  
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    
    if (trimmed === '') {
      continue;
    }
    
    // Détecter les lignes bullet (avec ou sans espaces au début)
    if (bulletPattern.test(rawLine) || bulletPattern.test(trimmed)) {
      if (currentTitle) {
        currentDetails.push({ text: trimmed, index: i });
      }
      continue;
    }
    
    if (skipTitlePattern.test(trimmed)) {
      continue;
    }
    
    // Détecter les titres de propriétés (avec ou sans statut emoji)
    // Supporte les titres avec markdown bold (**titre**)
    const titleWithStatusPattern = /^(\*\*)?(.+?)(\*\*)?\s*(✅|⏳)\s*(Disponible|Bientôt).*$/i;
    const titleMatch = trimmed.match(titleWithStatusPattern);
    
    if (titleMatch) {
      flushCurrentProperty();
      // Nettoyer le titre des ** markdown et des espaces
      currentTitle = sanitizeTitleText(titleMatch[2].trim());
      currentStatusText = trimmed.substring(trimmed.indexOf(titleMatch[4])).trim();
      currentTitleIndex = i;
      continue;
    }
    
    const isPotentialTitle =
      trimmed.length > 5 &&
      trimmed.length < 200 &&
      !trimmed.startsWith('http') &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('•') &&
      !trimmed.includes(':') && // Les lignes avec ":" sont des détails, pas des titres
      !currentTitle; // Ne pas traiter comme titre si on en a déjà un
    
    if (isPotentialTitle) {
      flushCurrentProperty();
      // Nettoyer le titre des # et ** markdown
      let titleText = sanitizeTitleText(trimmed.replace(/^\*\*|\*\*$/g, '').trim());
      const statusMatch = titleText.match(/(✅|⏳|Disponible|Bient[oô]t|Available|Soon).*$/i);
      if (statusMatch) {
        currentStatusText = statusMatch[0].trim();
        titleText = titleText.replace(statusMatch[0], '').trim();
      }
      currentTitle = titleText;
      currentTitleIndex = i;
      continue;
    }
    
    // Si on rencontre une ligne qui ressemble à une conclusion, on clôture
    if (currentTitle && currentDetails.length >= 2 && /^(Tu veux|Si tu|Pour|Avec|N'hésite|Je suis)/i.test(trimmed)) {
      flushCurrentProperty();
    }
  }
  
  flushCurrentProperty();
  
  const cleanedContent = lines
    .map((line, index) => (linesToRemove.has(index) ? '' : line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return { properties, cleanContent: cleanedContent };
}

function parsePropertyDetails(title: string, details: string): PropertyData | null {
  // Normaliser les détails : remplacer les lignes vides multiples par une seule ligne vide
  const normalizedDetails = details.replace(/\n{3,}/g, '\n\n').trim();
  const sanitizedTitle = sanitizeTitleText(title);
  
  const getValue = (labels: string[]): string | undefined => {
    for (const label of labels) {
      // Pattern 1: Avec puce et astérisques "- **Type:** valeur"
      let pattern = new RegExp(`-\\s*\\*\\*${label}[^*]*\\*\\*\\s*:\\s*\\*?\\*?([^\\n*]+)`, 'i');
      let match = normalizedDetails.match(pattern);
      if (match) return match[1].trim().replace(/\*\*/g, '');
      
      // Pattern 2: Avec puce mais sans astérisques "- Type: valeur"
      pattern = new RegExp(`-\\s*${label}\\s*:\\s*([^\\n]+)`, 'i');
      match = normalizedDetails.match(pattern);
      if (match) return match[1].trim();
      
      // Pattern 3: Sans puce ni astérisques "Type: valeur" (format le plus tolérant)
      // Ce pattern doit gérer les lignes vides avant et après
      pattern = new RegExp(`(?:^|\\n)\\s*${label}\\s*:\\s*([^\\n]+)`, 'i');
      match = normalizedDetails.match(pattern);
      if (match) return match[1].trim();
      
      // Pattern 4: Avec espaces multiples "Type  :  valeur"
      pattern = new RegExp(`${label}\\s{1,}:\\s{1,}([^\\n]+)`, 'i');
      match = normalizedDetails.match(pattern);
      if (match) return match[1].trim();
      
      // Pattern 5: Format avec tiret et deux-points séparés par ligne vide "Type:\n\nVilla"
      pattern = new RegExp(`${label}\\s*:\\s*\\n\\s*([^\\n]+)`, 'i');
      match = normalizedDetails.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  };

  const type = getValue(['Type', 'Property type', 'Type de bien']);
  const zone = getValue(['Zone', 'Localisation', 'Location', 'Quartier']);
  const pricePerShare = getValue(['Prix par part', 'Prix/part', 'Price per share', 'Prix']);
  const bedrooms = getValue(['Chambres', 'Chambre', 'Bedrooms', 'Bedroom']);
  const bathrooms = getValue(['Salles de bain', 'Salle de bain', 'Bathrooms', 'Bathroom', 'Salles de bains']);
  const area = getValue(['Superficie', 'Surface', 'Area', 'Superficie totale', 'Surface totale', 'Total area']);
  const status = getValue(['Statut', 'Status', 'Disponibilité', 'Disponible']);
  const id = getValue(['ID', 'Id', 'id']);
  
  // Essayer aussi d'extraire l'ID depuis un lien ou un pattern UUID
  let extractedId = id;
  if (!extractedId) {
    // Pattern UUID
    const uuidMatch = details.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i);
    if (uuidMatch) {
      extractedId = uuidMatch[0];
    }
  }
  
  // Extraction de l'image avec plusieurs patterns (du plus spécifique au plus générique)
  // Pattern 0: Format Markdown standard ![alt](url)
  const imageMatch = details.match(/!\[[^\]]*\]\(([^)]+)\)/);
  let image = imageMatch?.[1];
  
  if (!image) {
    // Pattern 1: Format Markdown dans label "- Image : [Titre](URL)" - NOOR utilise parfois ce format
    const markdownLinkMatch = details.match(/[-•]?\s*(?:\*\*)?(?:Image|Visuel|Photo)(?:\*\*)?\s*:\s*\[[^\]]*\]\(([^)]+)\)/i);
    if (markdownLinkMatch) {
      image = markdownLinkMatch[1].trim();
    }
  }
  
  if (!image) {
    // Pattern 2: Format markdown avec astérisques "- **Image** : URL" ou "**Image** : URL"
    const markdownImageMatch = details.match(/[-•]?\s*\*\*(?:Image|Visuel|Photo)\*\*\s*:\s*(https?:\/\/[^\s\n]+)/i);
    if (markdownImageMatch) {
      image = markdownImageMatch[1].trim();
    }
  }
  
  if (!image) {
    // Pattern 3: Format simple "- Image : URL" ou "Image : URL"
    const imageLabelMatch = details.match(/(?:^|\n)\s*[-•]?\s*(?:Image|Visuel|Photo)\s*:\s*(https?:\/\/[^\s\n]+)/i);
    if (imageLabelMatch) {
      image = imageLabelMatch[1].trim();
    }
  }
  
  if (!image) {
    // Pattern 4: Toute URL d'image (avec extension)
    const genericUrlMatch = details.match(/https?:\/\/[^\s\n]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s\n]*)?/i);
    if (genericUrlMatch) {
      image = genericUrlMatch[0];
    }
  }
  
  if (!image) {
    // Pattern 5: URL Cloudinary ou CDN (sans extension mais avec indicateurs courants)
    const cdnUrlMatch = details.match(/https?:\/\/(?:res\.cloudinary\.com|cdn\.[^\s]+|images\.[^\s]+)[^\s\n]+/i);
    if (cdnUrlMatch) {
      image = cdnUrlMatch[0];
    }
  }
  
  const isAvailable = status?.includes('✅') || status?.toLowerCase().includes('disponible maintenant');
  const isUpcoming = status?.includes('⏳') || status?.toLowerCase().includes('bientôt');
  
  // Parser la date dans différents formats :
  // - "⏳ Bientôt disponible le 12 décembre 2025"
  // - "⏳ Disponible le 12 déc. 2025 à 15:28"
  // - "OUVERTURE 12 déc. 2025 à 15:28"
  // - "12 déc. 2025 à 15:28"
  // - "2024-12-12"
  let dateMatch = status?.match(/(?:disponible le|le|on|Bientôt disponible le|OUVERTURE)\s*(\d+\s+\w+\.?\s+\d{4}(?:\s+à\s+\d+:\d+)?|\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2})?)/i);
  let availableAt = dateMatch?.[1];
  
  // Si pas trouvé dans le statut, chercher directement une date dans les détails
  // Chercher d'abord avec "OUVERTURE" puis sans préfixe
  if (!availableAt) {
    const ouvertMatch = details.match(/OUVERTURE\s*(\d+\s+\w+\.?\s+\d{4}(?:\s+à\s+\d+:\d+)?|\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2})?)/i);
    if (ouvertMatch) {
      availableAt = ouvertMatch[1];
    } else {
      const directDateMatch = details.match(/(\d+\s+\w+\.?\s+\d{4}(?:\s+à\s+\d+:\d+)?|\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2})?)/i);
      if (directDateMatch) {
        availableAt = directDateMatch[1];
      }
    }
  }
  
  // Validation plus tolérante : on accepte si on a au moins un titre ET (un ID OU un type OU une zone)
  // Cela permet de détecter les propriétés même si certains champs manquent
  if (sanitizedTitle && sanitizedTitle.length > 3 && (extractedId || type || zone)) {
    return {
      id: extractedId,
      title: sanitizedTitle,
      zone: zone || '',
      type: type || '',
      pricePerShare: pricePerShare || '',
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      area,
      image,
      isAvailableNow: isAvailable || (!isUpcoming && !availableAt),
      availableAt,
    };
  }
  
  return null;
}

function parseMarkdown(text: string): string {
  if (!text || text.trim() === '') return '';
  
  const source = sanitizeUnsupportedPromises(text);
  
  let html = source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  // Wrap lists
  html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, (match) => `<ul>${match}</ul>`);
  
  // Wrap in paragraphs
  if (html && !html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }
  
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p><br \/><\/p>/g, '');

  return html;
}

// === COMPONENTS ===
function PropertyCard({ property }: { property: PropertyData }) {
  const [imageError, setImageError] = useState(false);
  const countdown = useCountdown(property.availableAt);
  const router = useRouter();
  const locale = useLocale();

  // Déterminer si la propriété est "upcoming" (pas encore disponible)
  // Elle est upcoming si :
  // 1. isAvailableNow est explicitement false
  // 2. OU si availableAt existe et est dans le futur
  const isUpcoming = (() => {
    if (property.isAvailableNow === false) return true;
    if (property.availableAt) {
      try {
        // Parser la date (format français ou ISO)
        const frenchMonths: Record<string, number> = {
          'janvier': 0, 'janv': 0,
          'février': 1, 'fév': 1,
          'mars': 2,
          'avril': 3, 'avr': 3,
          'mai': 4,
          'juin': 5,
          'juillet': 6, 'juil': 6,
          'août': 7,
          'septembre': 8, 'sept': 8,
          'octobre': 9, 'oct': 9,
          'novembre': 10, 'nov': 10,
          'décembre': 11, 'déc': 11
        };
        
        let targetDate: Date;
        const dateStr = property.availableAt.trim();
        
        // Format ISO (2024-12-12 ou 2024-12-12T15:28:00)
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
          targetDate = new Date(dateStr);
        } 
        // Format français avec abréviation (12 déc. 2025 à 15:28)
        else if (dateStr.match(/(\d+)\s+(\w+)\.?\s+(\d{4})(?:\s+à\s+(\d+):(\d+))?/)) {
          const match = dateStr.match(/(\d+)\s+(\w+)\.?\s+(\d{4})(?:\s+à\s+(\d+):(\d+))?/);
          if (match) {
            const day = parseInt(match[1]);
            const monthName = match[2].toLowerCase().replace('.', '');
            const month = frenchMonths[monthName];
            const year = parseInt(match[3]);
            const hour = match[4] ? parseInt(match[4]) : 0;
            const minute = match[5] ? parseInt(match[5]) : 0;
            
            if (month !== undefined) {
              targetDate = new Date(year, month, day, hour, minute);
            } else {
              targetDate = new Date(dateStr);
            }
          } else {
            targetDate = new Date(dateStr);
          }
        }
        // Format français complet (12 décembre 2025)
        else {
          const match = dateStr.match(/(\d+)\s+(\w+)\s+(\d{4})/);
          if (match) {
            const day = parseInt(match[1]);
            const month = frenchMonths[match[2].toLowerCase()];
            const year = parseInt(match[3]);
            if (month !== undefined) {
              targetDate = new Date(year, month, day);
            } else {
              targetDate = new Date(dateStr);
            }
          } else {
            targetDate = new Date(dateStr);
          }
        }
        
        // Si la date est dans le futur, c'est upcoming
        return targetDate.getTime() > Date.now();
      } catch {
        // Si erreur de parsing, considérer comme disponible
        return false;
      }
    }
    return false;
  })();

  const handleDiscover = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Ne pas permettre la navigation si la propriété n'est pas encore disponible
    if (!isUpcoming && property.id) {
      router.push(`/${locale}/product/${property.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        styles.propertyCard,
        isUpcoming ? styles.propertyCardDisabled : styles.propertyCardClickable
      )}
      onClick={isUpcoming ? undefined : handleDiscover}
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
        <div className={cn(
          styles.propertyImageFallback,
          isUpcoming && styles.propertyImageBlurred
        )}>🏠</div>
      )}

      {property.type && (
        <span className={styles.propertyTypeBadge}>{property.type}</span>
      )}

      {isUpcoming && countdown ? (
        <div className={styles.countdownBadge}>
          <span className={styles.countdownLabel}>Dans</span>
          <span className={styles.countdownTime}>{countdown}</span>
        </div>
      ) : isUpcoming ? (
        <span className={cn(styles.statusBadge)}>Soon</span>
      ) : (
        <span className={cn(styles.statusBadge)}>Available</span>
      )}

      <div className={styles.propertyOverlay}>
        <h4 className={styles.propertyTitle}>{property.title}</h4>
        <div className={styles.propertyMeta}>
          {property.zone && <span className={styles.propertyZone}>{property.zone}</span>}
          {property.pricePerShare && (
            <span className={styles.propertyPrice}>{property.pricePerShare}</span>
          )}
        </div>
        {!isUpcoming && property.id && (
          <button
            onClick={handleDiscover}
            className={styles.discoverButton}
          >
            Discover
          </button>
        )}
      </div>
    </motion.div>
  );
}

// === MAIN COMPONENT ===
export function AiMessage({ content, className }: AiMessageProps) {
  const { properties, cleanContent } = useMemo(() => {
    const result = extractProperties(content);
    // Debug en développement
    if (process.env.NODE_ENV === 'development' && result.properties.length === 0) {
      console.log('[AiMessage] Aucune propriété détectée dans le contenu:', content.substring(0, 500));
    }
    if (process.env.NODE_ENV === 'development' && result.properties.length > 0) {
      console.log('[AiMessage] Propriétés détectées:', result.properties.length, result.properties.map(p => p.title));
    }
    return result;
  }, [content]);
  const htmlContent = useMemo(() => parseMarkdown(cleanContent), [cleanContent]);

  return (
    <div className={cn(styles.container, className)}>
      {/* Contenu textuel principal */}
      {htmlContent && (
        <div 
          className={styles.textContent}
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      )}
      
      {/* Section propriétés (en bas, alignée à gauche) */}
      {properties.length > 0 && (
        <div className={styles.propertiesSection}>
          <span className={styles.propertiesSectionTitle}>
          Available properties
          </span>
          <div className={styles.propertiesGrid}>
            {properties.map((property, index) => (
              <PropertyCard key={index} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AiMessage;
