/**
 * Utilitaires pour générer des événements de calendrier
 */

/**
 * Formate une date au format ISO 8601 pour les URLs de calendrier
 */
function formatDateForCalendar(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Échappe les caractères spéciaux pour les URLs
 */
function escapeUrl(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Traductions du préfixe pour le titre de l'événement calendrier
 */
const CALENDAR_PREFIX: Record<string, string> = {
  fr: 'RECCOS - Lancement de',
  en: 'RECCOS - Launch of',
  ar: 'RECCOS - إطلاق',
};

/**
 * Génère un lien Google Calendar pour ajouter un événement
 */
export function generateGoogleCalendarLink(params: {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  locale?: string;
  launchpadUrl?: string;
}): string {
  const { title, description, startDate, endDate, location, locale = 'en', launchpadUrl } = params;
  
  // Ajouter le préfixe traduit selon la locale
  const prefix = CALENDAR_PREFIX[locale] || CALENDAR_PREFIX.en;
  const prefixedTitle = `${prefix} ${title}`;
  
  // Construire la description avec le lien Launchpad
  let fullDescription = description;
  if (launchpadUrl) {
    fullDescription = `${description}\n\n${launchpadUrl}`;
  }
  
  // Par défaut, l'événement dure 1 heure
  const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);
  
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const urlParams = new URLSearchParams({
    text: prefixedTitle,
    dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(end)}`,
    details: fullDescription,
    ...(location && { location }),
  });
  
  return `${baseUrl}&${urlParams.toString()}`;
}

/**
 * Génère un fichier .ics (iCalendar) pour téléchargement
 */
export function generateICSFile(params: {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
}): string {
  const { title, description, startDate, endDate, location } = params;
  
  // Par défaut, l'événement dure 1 heure
  const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Formater les dates au format iCalendar (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  // Échapper les caractères spéciaux pour le format iCalendar
  const escapeICS = (text: string): string => {
    return text.replace(/\\/g, '\\\\')
               .replace(/;/g, '\\;')
               .replace(/,/g, '\\,')
               .replace(/\n/g, '\\n');
  };
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RECCOS//Launch Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@reccos.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    ...(location ? [`LOCATION:${escapeICS(location)}`] : []),
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  
  return icsContent;
}

/**
 * Télécharge un fichier .ics
 */
export function downloadICSFile(params: {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
}): void {
  const icsContent = generateICSFile(params);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${params.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

