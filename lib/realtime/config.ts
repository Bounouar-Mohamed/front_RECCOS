/**
 * Configuration pour la fonctionnalité Realtime AI
 */

import { RealtimeConfig, DEFAULT_REALTIME_CONFIG } from './types';

/**
 * Récupère la configuration realtime depuis les variables d'environnement
 * ou utilise les valeurs par défaut
 */
export function getRealtimeConfig(overrides?: Partial<RealtimeConfig>): RealtimeConfig {
  const baseConfig: RealtimeConfig = {
    ...DEFAULT_REALTIME_CONFIG,
    // Surcharges depuis les variables d'environnement
    voice: (process.env.NEXT_PUBLIC_REALTIME_VOICE as RealtimeConfig['voice']) || DEFAULT_REALTIME_CONFIG.voice,
    model: (process.env.NEXT_PUBLIC_REALTIME_MODEL as RealtimeConfig['model']) || DEFAULT_REALTIME_CONFIG.model,
  };

  // Appliquer les surcharges personnalisées
  if (overrides) {
    return {
      ...baseConfig,
      ...overrides,
      features: {
        ...baseConfig.features,
        ...(overrides.features || {}),
      },
      sampling: {
        ...baseConfig.sampling,
        ...(overrides.sampling || {}),
      },
    };
  }

  return baseConfig;
}

/**
 * Endpoint backend pour obtenir le token ephemeral OpenAI
 * Le backend génère un token sécurisé pour la connexion WebRTC
 * Note: Le backend CRM-API expose cet endpoint sur /api/chatbot/realtime/ephemeral-token
 * Le gateway route ensuite vers Quantix
 */
export const REALTIME_TOKEN_ENDPOINT = '/chatbot/realtime/ephemeral-token';

/**
 * Endpoint pour la configuration realtime
 */
export const REALTIME_CONFIG_ENDPOINT = '/chatbot/realtime/config';

/**
 * Durée maximale d'une session realtime (en ms)
 * Après ce délai, la session sera automatiquement fermée
 */
export const MAX_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Délai avant de tenter une reconnexion automatique (en ms)
 */
export const RECONNECT_DELAY = 2000;

/**
 * Nombre maximum de tentatives de reconnexion
 */
export const MAX_RECONNECT_ATTEMPTS = 3;

