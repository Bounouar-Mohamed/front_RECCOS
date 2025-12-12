/**
 * Module Realtime - Export principal
 * 
 * Ce module fournit les outils pour intégrer la fonctionnalité
 * de conversation vocale en temps réel avec l'IA Noor.
 */

// Types
export * from './types';

// Configuration
export { getRealtimeConfig, REALTIME_TOKEN_ENDPOINT } from './config';

// ConnectionManager
export { ConnectionManager, createConnectionManager } from './ConnectionManager';

// Hook React
export { useRealtimeSession } from './useRealtimeSession';

