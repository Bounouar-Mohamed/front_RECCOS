/**
 * Hook React pour gérer la session Realtime
 * 
 * Fournit une interface simple pour contrôler la connexion WebRTC
 * et accéder à l'état de la session en temps réel.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ConnectionManager, createConnectionManager } from './ConnectionManager';
import { getRealtimeConfig } from './config';
import {
  RealtimeConfig,
  ConnectionStatus,
  AudioState,
  RealtimeSessionState,
  RealtimeMessage,
} from './types';

interface UseRealtimeSessionOptions {
  /** Configuration personnalisée (optionnel) */
  config?: Partial<RealtimeConfig>;
  /** Callback quand un message est reçu */
  onMessage?: (message: RealtimeMessage) => void;
  /** Callback quand une erreur survient */
  onError?: (error: Error) => void;
  /** Callback quand le statut change */
  onStatusChange?: (status: ConnectionStatus) => void;
}

interface UseRealtimeSessionReturn {
  /** État actuel de la session */
  state: RealtimeSessionState;
  /** Messages de la session */
  messages: RealtimeMessage[];
  /** Démarre la connexion realtime */
  connect: () => Promise<void>;
  /** Ferme la connexion */
  disconnect: () => Promise<void>;
  /** Toggle la connexion (connect/disconnect) */
  toggle: () => Promise<void>;
  /** Envoie un message texte */
  sendMessage: (text: string) => Promise<void>;
  /** Interrompt la réponse de l'assistant */
  interrupt: () => Promise<void>;
  /** Réinitialise les messages */
  clearMessages: () => void;
  /** Indique si la session est active */
  isActive: boolean;
  /** Indique si l'IA parle actuellement */
  isSpeaking: boolean;
  /** Indique si l'utilisateur parle */
  isListening: boolean;
}

export function useRealtimeSession(
  options: UseRealtimeSessionOptions = {}
): UseRealtimeSessionReturn {
  const { config: customConfig, onMessage, onError, onStatusChange } = options;

  // State
  const [state, setState] = useState<RealtimeSessionState>({
    status: 'disconnected',
    audioState: 'idle',
    userTranscript: '',
    assistantTranscript: '',
    error: null,
    inputVolume: 0,
    outputVolume: 0,
  });

  const [messages, setMessages] = useState<RealtimeMessage[]>([]);

  // Refs
  const managerRef = useRef<ConnectionManager | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  // Création du ConnectionManager avec la configuration
  const getManager = useCallback(() => {
    if (!managerRef.current) {
      const config = getRealtimeConfig(customConfig);
      
      managerRef.current = createConnectionManager({
        config,
        events: {
          onStatusChange: (status) => {
            setState(prev => ({ ...prev, status, error: null }));
            onStatusChange?.(status);
          },
          onAudioStateChange: (audioState) => {
            setState(prev => ({ ...prev, audioState }));
          },
          onUserTranscript: (transcript, isFinal) => {
            if (isFinal) {
              setState(prev => ({ ...prev, userTranscript: transcript }));
            }
          },
          onAssistantTranscript: (transcript, isFinal) => {
            if (isFinal) {
              setState(prev => ({ ...prev, assistantTranscript: transcript }));
              accumulatedTranscriptRef.current = '';
            } else {
              // Accumuler les deltas pour la transcription en temps réel
              accumulatedTranscriptRef.current += transcript;
              setState(prev => ({ 
                ...prev, 
                assistantTranscript: accumulatedTranscriptRef.current 
              }));
            }
          },
          onError: (error) => {
            setState(prev => ({ ...prev, error: error.message }));
            onError?.(error);
          },
          onMessage: (message) => {
            setMessages(prev => [...prev, message]);
            onMessage?.(message);
          },
          onVolumeChange: (inputVolume, outputVolume) => {
            setState(prev => ({ ...prev, inputVolume, outputVolume }));
          },
        },
      });
    }
    return managerRef.current;
  }, [customConfig, onMessage, onError, onStatusChange]);

  // Cleanup à la destruction du composant
  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.disconnect();
        managerRef.current = null;
      }
    };
  }, []);

  // Actions
  const connect = useCallback(async () => {
    const manager = getManager();
    await manager.connect();
  }, [getManager]);

  const disconnect = useCallback(async () => {
    const manager = getManager();
    await manager.disconnect();
  }, [getManager]);

  const toggle = useCallback(async () => {
    const manager = getManager();
    if (manager.isConnected()) {
      await manager.disconnect();
    } else {
      await manager.connect();
    }
  }, [getManager]);

  const sendMessage = useCallback(async (text: string) => {
    const manager = getManager();
    if (!manager.isConnected()) {
      throw new Error('Session non connectée');
    }
    await manager.sendTextMessage(text);
  }, [getManager]);

  const interrupt = useCallback(async () => {
    const manager = getManager();
    await manager.interrupt();
  }, [getManager]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    accumulatedTranscriptRef.current = '';
    setState(prev => ({
      ...prev,
      userTranscript: '',
      assistantTranscript: '',
    }));
  }, []);

  // Computed values
  const isActive = state.status === 'connected';
  const isSpeaking = state.audioState === 'speaking';
  const isListening = state.audioState === 'listening';

  return {
    state,
    messages,
    connect,
    disconnect,
    toggle,
    sendMessage,
    interrupt,
    clearMessages,
    isActive,
    isSpeaking,
    isListening,
  };
}

export default useRealtimeSession;

