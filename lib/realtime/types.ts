/**
 * Types pour la fonctionnalité Realtime AI (Noor Voice)
 */

export type RealtimeVoice = 'alloy' | 'echo' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';

export type RealtimeModel = 'gpt-4o-realtime-preview' | 'gpt-4o-realtime-preview-2024-10-01' | 'gpt-4o-mini-realtime-preview';

export type ConnectionStatus = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'error'
  | 'reconnecting';

export type AudioState = 
  | 'idle' 
  | 'listening' 
  | 'speaking' 
  | 'thinking';

export interface RealtimeSamplingConfig {
  /** Température d'échantillonnage du modèle */
  temperature: number;
  /** Pénalité appliquée sur les répétitions */
  frequencyPenalty?: number;
  /** Pénalité appliquée sur la redite de sujets */
  presencePenalty?: number;
}

export interface RealtimeConfig {
  /** Voix de l'assistant */
  voice: RealtimeVoice;
  /** Modèle à utiliser */
  model: RealtimeModel;
  /** Instructions système pour l'IA */
  systemInstructions: string;
  /** Paramètres de sampling */
  sampling: RealtimeSamplingConfig;
  /** Fonctionnalités activées */
  features: {
    /** Seuil de détection vocale (0-1) */
    vadThreshold: number;
    /** Durée (ms) de silence avant fin de tour */
    silenceDurationMs: number;
    /** Permettre l'interruption pendant que l'IA parle */
    bargeInEnabled: boolean;
    /** Activer la transcription de l'entrée audio */
    inputTranscription: boolean;
    /** Langues supportées côté backend */
    supportedLocales?: string[];
  };
}

export interface RealtimeSessionState {
  /** Statut de la connexion */
  status: ConnectionStatus;
  /** État audio actuel */
  audioState: AudioState;
  /** Transcription en temps réel de l'utilisateur */
  userTranscript: string;
  /** Transcription en temps réel de l'assistant */
  assistantTranscript: string;
  /** Message d'erreur si applicable */
  error: string | null;
  /** Volume audio détecté (0-1) pour la visualisation */
  inputVolume: number;
  /** Volume de sortie pour la visualisation */
  outputVolume: number;
}

export interface RealtimeMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPartial?: boolean;
}

export interface RealtimeSessionEvents {
  onStatusChange: (status: ConnectionStatus) => void;
  onAudioStateChange: (state: AudioState) => void;
  onUserTranscript: (transcript: string, isFinal: boolean) => void;
  onAssistantTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (error: Error) => void;
  onMessage: (message: RealtimeMessage) => void;
  onVolumeChange: (input: number, output: number) => void;
}

export interface RealtimeSessionOptions {
  config: RealtimeConfig;
  events: Partial<RealtimeSessionEvents>;
  /** Token d'authentification pour le backend */
  getAuthToken?: () => Promise<string>;
}

export const DEFAULT_REALTIME_CONFIG: RealtimeConfig = {
  voice: 'shimmer',
  model: 'gpt-4o-realtime-preview',
  systemInstructions: `Tu es Noor, l'assistante IA de Reccos, une plateforme d'investissement immobilier tokenisé à Dubaï.

Tu aides les utilisateurs à :
- Découvrir les propriétés disponibles
- Comprendre le processus d'investissement
- Répondre aux questions sur la tokenisation immobilière
- Guider dans l'achat de parts

Tu es professionnelle, amicale et experte en immobilier. Tu parles en français par défaut mais peux t'adapter à la langue de l'utilisateur.`,
  sampling: {
    temperature: 0.78,
    frequencyPenalty: 0.35,
    presencePenalty: 0.15,
  },
  features: {
    vadThreshold: 0.75,
    silenceDurationMs: 600,
    bargeInEnabled: true,
    inputTranscription: true,
    supportedLocales: ['fr', 'en'],
  },
};

