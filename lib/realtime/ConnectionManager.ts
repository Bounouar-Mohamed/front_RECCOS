/**
 * ConnectionManager - Gestion de la connexion Realtime WebRTC
 * 
 * Utilise le SDK @openai/agents-realtime pour établir une connexion
 * WebRTC directe entre le navigateur et l'API OpenAI Realtime.
 * 
 * Le SDK gère automatiquement via WebRTC :
 * - L'accès au microphone
 * - La lecture audio via un élément <audio> auto-créé
 * - La connexion avec OpenAI
 */

import { 
  RealtimeAgent, 
  RealtimeSession,
  RealtimeSessionConnectOptions,
} from '@openai/agents-realtime';
import { tool } from '@openai/agents-core';
import { apiClient } from '../api/client';
import { 
  RealtimeConfig, 
  ConnectionStatus, 
  AudioState,
  RealtimeSessionEvents,
  RealtimeMessage,
  RealtimeSamplingConfig,
} from './types';
import { 
  REALTIME_TOKEN_ENDPOINT,
  REALTIME_CONFIG_ENDPOINT,
  RECONNECT_DELAY, 
  MAX_RECONNECT_ATTEMPTS 
} from './config';
import { buildVoiceInstructions } from './voiceInstructions';

interface ConnectionManagerOptions {
  config: RealtimeConfig;
  events: Partial<RealtimeSessionEvents>;
}

interface TokenResponse {
  data: {
    token: string;
    expires_in?: number;
    sessionId?: string;
    assistant_thread_id?: string;
  };
}

interface TokenRequest {
  userId?: string;
  tenantId?: string;
  conversationId?: string;
}

interface BackendConfig {
  model: string;
  voice: string;
  systemInstructions: string;
  sampling?: RealtimeSamplingConfig;
  features: {
    bargeInEnabled: boolean;
    vadThreshold: number;
    silenceDurationMs: number;
    inputTranscription?: boolean;
    supportedLocales: string[];
  };
  tools?: any[];
}

export class ConnectionManager {
  private agent: RealtimeAgent | null = null;
  private session: RealtimeSession | null = null;
  private config: RealtimeConfig;
  private backendConfig: BackendConfig | null = null;
  private events: Partial<RealtimeSessionEvents>;
  private status: ConnectionStatus = 'disconnected';
  private audioState: AudioState = 'idle';
  private reconnectAttempts = 0;
  private sessionId: string | null = null;
  private threadId: string | null = null;
  private currentTranscript: string = '';
  private audioElement: HTMLAudioElement | null = null;

  constructor(options: ConnectionManagerOptions) {
    this.config = options.config;
    this.events = options.events;
  }

  /**
   * Crée des tools proxy qui appellent le backend
   * Ces tools sont exécutés côté serveur via l'endpoint /chatbot/realtime/tools/execute
   */
  private createBackendTools(toolDefinitions: any[]): any[] {
    if (!toolDefinitions || toolDefinitions.length === 0) {
      console.log('[ConnectionManager] No tools to create');
      return [];
    }

    console.log('[ConnectionManager] Creating backend tools:', toolDefinitions.map(t => t.name));

    return toolDefinitions.map(toolDef => {
      return tool({
        name: toolDef.name,
        description: toolDef.description || '',
        parameters: toolDef.parameters || { type: 'object', properties: {} },
        strict: false,
        needsApproval: false, // Auto-execute, pas besoin d'approbation
        execute: async (input: unknown) => {
          console.log(`[ConnectionManager] 🔧 Executing tool: ${toolDef.name}`, input);
          
          try {
            const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const response = await apiClient.post('/chatbot/realtime/tools/execute', {
              name: toolDef.name,
              arguments: input,
              sessionId: this.sessionId || `sess_${Date.now()}`,
              userId: 'anonymous', // TODO: get from auth context
              correlationId,
            });
            
            const result = (response.data as any)?.output || (response.data as any)?.data?.output || response.data;
            console.log(`[ConnectionManager] ✅ Tool ${toolDef.name} result:`, typeof result === 'object' ? JSON.stringify(result).substring(0, 200) : result);
            
            // Retourner le résultat en string pour le modèle
            return typeof result === 'string' ? result : JSON.stringify(result);
          } catch (error: any) {
            console.error(`[ConnectionManager] ❌ Tool ${toolDef.name} error:`, error.response?.data || error.message);
            return JSON.stringify({ 
              error: true, 
              message: error.response?.data?.message || error.message || 'Tool execution failed' 
            });
          }
        },
      });
    });
  }

  /**
   * Récupère la configuration realtime depuis le backend
   * Cette config contient le modèle et la voix utilisés par Quantix
   */
  private async getBackendConfig(): Promise<BackendConfig> {
    try {
      console.log('[ConnectionManager] Fetching backend config...');
      const response = await apiClient.get<{ data: BackendConfig }>(
        REALTIME_CONFIG_ENDPOINT,
        { skipAuthRedirect: true } as any
      );
      
      // La réponse peut être directement l'objet ou wrappée dans data
      const config = (response.data as any).model 
        ? (response.data as unknown as BackendConfig)
        : response.data.data;
      
      console.log('[ConnectionManager] Backend config received:', {
        model: config.model,
        voice: config.voice,
      });
      
      return config;
    } catch (error) {
      console.warn('[ConnectionManager] Failed to fetch backend config, using defaults:', error);
      // Fallback sur la config locale
      return {
        model: this.config.model,
        voice: this.config.voice,
        systemInstructions: this.config.systemInstructions,
        sampling: this.config.sampling,
        features: {
          bargeInEnabled: this.config.features.bargeInEnabled,
          vadThreshold: this.config.features.vadThreshold,
          silenceDurationMs: this.config.features.silenceDurationMs,
          inputTranscription: this.config.features.inputTranscription,
          supportedLocales: ['fr', 'en'],
        },
      };
    }
  }

  /**
   * Récupère un token ephemeral depuis le backend
   */
  private async getEphemeralToken(): Promise<string> {
    try {
      let userId: string | undefined;
      let tenantId: string | undefined;
      
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = user.id || user.userId;
            tenantId = user.tenantId;
          } catch {
            // Ignore parse error
          }
        }
      }

      const requestBody: TokenRequest = { userId, tenantId };

      console.log('[ConnectionManager] Requesting ephemeral token...');
      const response = await apiClient.post<TokenResponse>(
        REALTIME_TOKEN_ENDPOINT,
        requestBody,
        { skipAuthRedirect: true } as any
      );

      if (response.data.data.sessionId) {
        this.sessionId = response.data.data.sessionId;
      }
      if (response.data.data.assistant_thread_id) {
        this.threadId = response.data.data.assistant_thread_id;
      }

      const token = response.data.data.token;
      // Log du token complet pour diagnostic (à supprimer en production)
      console.log('[ConnectionManager] Got ephemeral token (length):', token?.length);
      console.log('[ConnectionManager] Token prefix:', token?.substring(0, 3));
      if (!token || typeof token !== 'string' || !token.startsWith('ek_')) {
        console.error('[ConnectionManager] ❌ Invalid token format:', token);
        throw new Error('Token invalide reçu du backend');
      }
      console.log('[ConnectionManager] Got ephemeral token:', token.substring(0, 15) + '...');
      return token;
    } catch (error) {
      console.error('[ConnectionManager] Failed to get ephemeral token:', error);
      throw new Error('Impossible d\'obtenir le token de connexion');
    }
  }

  private setStatus(status: ConnectionStatus): void {
    console.log('[ConnectionManager] Status:', this.status, '->', status);
    this.status = status;
    this.events.onStatusChange?.(status);
  }

  private setAudioState(state: AudioState): void {
    console.log('[ConnectionManager] AudioState:', this.audioState, '->', state);
    this.audioState = state;
    this.events.onAudioStateChange?.(state);
  }

  /**
   * Normalise le payload envoyé via session.update pour éviter les erreurs OpenAI
   * CRITIQUE: Cette fonction doit s'assurer que l'audio est correctement configuré
   */
  private sanitizeSessionUpdatePayload(session: any): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    const defaultVoice =
      typeof (this.agent as any)?.voice === 'string'
        ? (this.agent as any).voice
        : this.backendConfig?.voice || this.config.voice || 'alloy';

    const instructions =
      typeof session?.instructions === 'string'
        ? session.instructions
        : typeof (this.agent as any)?.instructions === 'string'
          ? (this.agent as any).instructions
          : undefined;
    if (instructions) {
      sanitized.instructions = instructions;
    }

    const voice =
      typeof session?.voice === 'string'
        ? session.voice
        : typeof session?.audio?.output?.voice === 'string'
          ? session.audio.output.voice
          : defaultVoice;
    sanitized.voice = voice;

    // CRITIQUE: Toujours forcer audio + text pour que le modèle réponde en voix
    const preferredModalities =
      (Array.isArray(session?.modalities) && session.modalities.length > 0
        ? session.modalities
        : Array.isArray(session?.output_modalities) && session.output_modalities.length > 0
          ? session.output_modalities
          : null) || [];
    const normalizedModalities = Array.from(new Set(preferredModalities));
    if (!normalizedModalities.includes('audio') || !normalizedModalities.includes('text')) {
      sanitized.modalities = ['audio', 'text'];
    } else {
      sanitized.modalities = normalizedModalities;
    }

    if (typeof session?.temperature === 'number') {
      sanitized.temperature = session.temperature;
    }

    if (session?.tool_choice) {
      sanitized.tool_choice = session.tool_choice;
    }

    // CRITIQUE: Configurer turn_detection pour que le modèle génère des réponses automatiquement
    // C'est ESSENTIEL pour que le modèle réponde après que l'utilisateur ait parlé
    sanitized.turn_detection = {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
      create_response: true,  // ✅ CRUCIAL: Le modèle doit créer une réponse automatiquement
      interrupt_response: true,
    };

    // NOTE: input_audio_transcription peut causer des erreurs si mal configuré
    // On l'omet pour le moment pour diagnostiquer le problème de réponse audio

    return sanitized;
  }

  private logAudioElementState(context: string): void {
    if (!this.audioElement) {
      console.warn(`[ConnectionManager] 🔈 (${context}) Aucun audioElement attaché`);
      return;
    }

    const { currentTime, muted, volume, readyState, srcObject, networkState } = this.audioElement;
    console.log(`[ConnectionManager] 🔈 (${context}) audio element state`, {
      currentTime,
      muted,
      volume,
      readyState,
      networkState,
      hasSrcObject: !!srcObject,
    });
  }

  private createAudioElement(): HTMLAudioElement {
    if (typeof document === 'undefined') {
      throw new Error('Document non disponible pour créer un élément audio');
    }

    if (this.audioElement) {
      this.audioElement.remove();
      this.audioElement = null;
    }

    const audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    audioElement.id = 'realtime-audio-output';
    audioElement.style.display = 'none';
    
    // CRITIQUE: S'assurer que l'audio n'est pas muted et que le volume est à 1
    audioElement.muted = false;
    audioElement.volume = 1.0;

    const logEvent = (eventName: string) => () => {
      console.log(`[ConnectionManager] 🔈 Audio element event: ${eventName}`);
      this.logAudioElementState(`audio:${eventName}`);
    };

    audioElement.addEventListener('play', logEvent('play'));
    audioElement.addEventListener('pause', logEvent('pause'));
    audioElement.addEventListener('volumechange', logEvent('volumechange'));
    audioElement.addEventListener('ended', logEvent('ended'));
    audioElement.addEventListener('loadeddata', logEvent('loadeddata'));
    audioElement.addEventListener('stalled', logEvent('stalled'));
    audioElement.addEventListener('suspend', logEvent('suspend'));
    audioElement.addEventListener('waiting', logEvent('waiting'));
    audioElement.addEventListener('error', () => {
      console.error('[ConnectionManager] 🔈 Audio element error', audioElement.error);
      this.logAudioElementState('audio:error');
    });
    
    // Log quand il y a réellement de l'audio qui joue
    audioElement.addEventListener('playing', () => {
      console.log('[ConnectionManager] 🔊 Audio is NOW PLAYING!');
      this.logAudioElementState('audio:playing');
    });
    
    // Log quand les données arrivent
    audioElement.addEventListener('canplaythrough', () => {
      console.log('[ConnectionManager] 🔊 Audio can play through!');
    });

    const existingAudio = document.getElementById('realtime-audio-output');
    if (existingAudio) {
      existingAudio.remove();
    }
    document.body.appendChild(audioElement);
    this.audioElement = audioElement;
    this.logAudioElementState('audio:created');
    return audioElement;
  }

  /**
   * Configure les événements de la session
   * Ref: realtimeSessionEvents.d.ts
   */
  private setupSessionEvents(): void {
    if (!this.session) return;

    console.log('[ConnectionManager] Setting up session events...');

    // === Événements audio de l'agent ===
    
    // L'agent commence à générer de l'audio
    this.session.on('audio_start', () => {
      console.log(`[ConnectionManager] 🔊 Agent audio_start @ ${new Date().toISOString()}`);
      this.logAudioElementState('agent:audio_start');
      this.setAudioState('speaking');
    });

    // L'agent arrête de générer de l'audio
    this.session.on('audio_stopped', () => {
      console.log(`[ConnectionManager] 🔇 Agent audio_stopped @ ${new Date().toISOString()}`);
      this.logAudioElementState('agent:audio_stopped');
      this.setAudioState('idle');
    });

    // Interruption audio (utilisateur a interrompu l'agent)
    this.session.on('audio_interrupted', () => {
      console.log('[ConnectionManager] ⚡ Audio interrupted');
      this.logAudioElementState('agent:audio_interrupted');
      this.setAudioState('idle');
    });

    // === Événements d'historique ===

    // Mise à jour de l'historique complet
    this.session.on('history_updated', (history: any) => {
      console.log('[ConnectionManager] 📜 History updated:', history?.length || 0, 'items');
    });

    // Nouvel élément ajouté à l'historique
    this.session.on('history_added', (item: any) => {
      console.log('[ConnectionManager] ➕ History item added:', item?.type, item?.role);
      
      // Extraire les transcriptions des items
      if (item?.type === 'message') {
        const role = item?.role;
        const content = item?.content?.[0];
        
        if (content?.type === 'input_audio' && content?.transcript) {
          // Transcription de l'utilisateur
          console.log('[ConnectionManager] 👤 User transcript:', content.transcript);
          this.events.onUserTranscript?.(content.transcript, true);
          this.events.onMessage?.({
            id: item.id || crypto.randomUUID(),
            role: 'user',
            content: content.transcript,
            timestamp: new Date(),
            isPartial: false,
          });
        } else if (content?.type === 'audio' && content?.transcript) {
          // Transcription de l'assistant
          console.log('[ConnectionManager] 🤖 Assistant transcript:', content.transcript);
          this.events.onAssistantTranscript?.(content.transcript, true);
          this.events.onMessage?.({
            id: item.id || crypto.randomUUID(),
            role: 'assistant',
            content: content.transcript,
            timestamp: new Date(),
            isPartial: false,
          });
        } else if (role === 'assistant' && content?.text) {
          // Message texte de l'assistant
          console.log('[ConnectionManager] 🤖 Assistant text:', content.text);
          this.events.onAssistantTranscript?.(content.text, true);
          this.events.onMessage?.({
            id: item.id || crypto.randomUUID(),
            role: 'assistant',
            content: content.text,
            timestamp: new Date(),
            isPartial: false,
          });
        }
      }
    });

    // === Événements d'erreur ===

    this.session.on('error', (errorEvent: any) => {
      const payload = errorEvent?.error ?? errorEvent;
      const nested = payload?.error ?? null;
      const message =
        nested?.message ||
        payload?.message ||
        errorEvent?.message ||
        'Session error';
      const code = nested?.code || payload?.code || nested?.error_code;
      const detailedError = message + (code ? ` (code: ${code})` : '');

      console.error('[ConnectionManager] ❌ Session error:', {
        event: errorEvent,
        payload,
        nested,
        message: detailedError,
      });

      const error =
        payload instanceof Error
          ? payload
          : new Error(detailedError || 'Session error');

      (error as any).details = nested || payload;
      this.events.onError?.(error);
    });

    // === Événements du transport (pour debug) ===

    this.session.on('transport_event', (event: any) => {
      // Log TOUS les événements de type response.* pour diagnostic
      if (event?.type?.startsWith('response.')) {
        console.log('[ConnectionManager] 📡 Response event:', event.type, {
          responseId: event?.response?.id,
          status: event?.response?.status,
          outputItemCount: event?.response?.output?.length,
        });
      }
      
      // Log les événements session.* pour voir la config
      if (event?.type?.startsWith('session.')) {
        console.log('[ConnectionManager] 📡 Session event:', event.type, {
          modalities: event?.session?.modalities,
          voice: event?.session?.voice,
          turnDetection: event?.session?.turn_detection?.type,
          createResponse: event?.session?.turn_detection?.create_response,
        });
      }
      
      // Log seulement les événements importants
      if (event?.type?.includes('speech') || event?.type?.includes('transcription')) {
        console.log('[ConnectionManager] 📡 Transport event:', event.type);
      }
      
      // Détection de la parole utilisateur via events transport
      if (event?.type === 'input_audio_buffer.speech_started') {
        console.log('[ConnectionManager] 🎤 User started speaking');
        this.setAudioState('listening');
      }
      
      if (event?.type === 'input_audio_buffer.speech_stopped') {
        console.log('[ConnectionManager] 🎤 User stopped speaking');
        this.setAudioState('thinking');
      }
      
      // CRITIQUE: Log quand le modèle commence à générer une réponse
      if (event?.type === 'response.created') {
        console.log('[ConnectionManager] 🤖 Response CREATED - model is generating!', {
          responseId: event?.response?.id,
          modalities: event?.response?.modalities,
        });
      }
      
      // Log quand l'audio est généré
      if (event?.type === 'response.audio.delta') {
        console.log('[ConnectionManager] 🔊 Audio delta received (model speaking)');
      }
      
      // Log quand la réponse est terminée
      if (event?.type === 'response.done') {
        const response = event?.response;
        console.log('[ConnectionManager] ✅ Response DONE', {
          responseId: response?.id,
          status: response?.status,
          usage: response?.usage,
        });
        
        // Si la réponse a échoué, afficher les détails de l'erreur
        if (response?.status === 'failed') {
          console.error('[ConnectionManager] ❌ Response FAILED! Details:', {
            status_details: response?.status_details,
            error: response?.error,
            output: response?.output,
            full_response: response,
          });
        }
      }
      
      // Log les erreurs de transcription
      if (event?.type === 'conversation.item.input_audio_transcription.failed') {
        console.error('[ConnectionManager] ❌ Transcription FAILED!', {
          error: event?.error,
          item_id: event?.item_id,
          full_event: event,
        });
      }
      
      // Log les erreurs de réponse
      if (event?.type === 'error') {
        console.error('[ConnectionManager] ❌ Transport ERROR:', {
          type: event?.error?.type,
          code: event?.error?.code,
          message: event?.error?.message,
          param: event?.error?.param,
          full_error: event?.error,
        });
      }

      // Transcription de l'entrée audio
      if (event?.type === 'conversation.item.input_audio_transcription.completed') {
        console.log('[ConnectionManager] 📝 User transcription completed:', event.transcript);
        if (event.transcript) {
          this.events.onUserTranscript?.(event.transcript, true);
        }
      }
    });

    // === Événements de tool calls ===

    this.session.on('tool_approval_requested', (context: any, agent: any, approvalRequest: any) => {
      console.log('[ConnectionManager] 🔧 Tool approval requested:', approvalRequest);
      // Auto-approve tous les tools backend
      if (this.session && approvalRequest?.approvalItem) {
        console.log('[ConnectionManager] ✅ Auto-approving tool:', approvalRequest.approvalItem);
        this.session.approve(approvalRequest.approvalItem);
      }
    });

    // Événement quand un tool commence
    this.session.on('agent_tool_start', (context: any, agent: any, tool: any, details: any) => {
      console.log('[ConnectionManager] 🔧 Tool started:', tool?.name, details);
      this.events.onAssistantTranscript?.('Je vérifie...', false);
    });

    // Événement quand un tool termine
    this.session.on('agent_tool_end', (context: any, agent: any, tool: any, result: any, details: any) => {
      console.log('[ConnectionManager] ✅ Tool completed:', tool?.name, 'result:', result);
    });

    console.log('[ConnectionManager] ✅ Session events configured');
  }

  /**
   * Vérifie et demande l'accès au microphone
   */
  private async checkMicrophoneAccess(): Promise<MediaStream> {
    console.log('[ConnectionManager] 🎤 Checking microphone access...');
    
    try {
      // Vérifier si l'API est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC non supporté par ce navigateur');
      }

      // Demander l'accès au microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[ConnectionManager] ✅ Microphone access granted');
      console.log('[ConnectionManager] Audio tracks:', stream.getAudioTracks().length);
      
      return stream;
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Accès au microphone refusé. Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('Aucun microphone détecté. Veuillez connecter un microphone.');
      } else {
        throw new Error(`Erreur d'accès au microphone: ${error.message}`);
      }
    }
  }

  /**
   * Établit la connexion realtime
   */
  async connect(): Promise<void> {
    if (this.status === 'connecting' || this.status === 'connected') {
      console.log('[ConnectionManager] Already connected or connecting');
      return;
    }

    try {
      this.setStatus('connecting');
      console.log('[ConnectionManager] 🚀 Starting connection...');
      
      // Le SDK va gérer l'accès au microphone lui-même
      // On ne le fait plus manuellement pour éviter les conflits

      // 1. Récupérer la config du backend (modèle, voix, instructions)
      // C'est CRITIQUE car le token est créé avec ce modèle
      this.backendConfig = await this.getBackendConfig();
      
      // 2. Obtenir le token ephemeral depuis le backend
      const token = await this.getEphemeralToken();

      // Utiliser la config backend avec fallback sur la config locale
      const effectiveModel = this.backendConfig.model || this.config.model;
      const effectiveVoice = this.backendConfig.voice || this.config.voice;
      const effectiveInstructions = buildVoiceInstructions(
        this.backendConfig.systemInstructions || this.config.systemInstructions,
      );

      // 3. Créer les tools proxy vers le backend
      const backendTools = this.createBackendTools(this.backendConfig.tools || []);
      console.log('[ConnectionManager] Created', backendTools.length, 'backend tools');

      // 4. Créer l'agent avec la config du backend et les tools
      console.log('[ConnectionManager] Creating agent with voice:', effectiveVoice);
      this.agent = new RealtimeAgent({
        name: 'noor-assistant',
        voice: effectiveVoice as any,
        instructions: effectiveInstructions,
        tools: backendTools,
      });

      // 4. Créer la session avec le modèle du backend
      // IMPORTANT: Le modèle DOIT correspondre à celui utilisé pour créer le token
      console.log('[ConnectionManager] Creating session with model:', effectiveModel);
      
      // Créer un élément audio pour la sortie et l'attacher au DOM
      const audioElement = this.createAudioElement();
      
      // Créer le transport WebRTC
      const { OpenAIRealtimeWebRTC } = await import('@openai/agents-realtime');
      const transport = new OpenAIRealtimeWebRTC({
        audioElement: audioElement,
      });
      
      // PATCH: Convertir les session.update du SDK v0.3.4 vers le format API
      // Le SDK envoie output_modalities, type: "realtime", audio.input/output
      // L'API attend modalities, voice, turn_detection au niveau racine
      const originalSendEvent = transport.sendEvent.bind(transport);
      transport.sendEvent = (event: any) => {
        if (event?.type === 'session.update' && event?.session) {
          const s = event.session;
          
          // Construire une session convertie
          const converted: Record<string, any> = {};
          
          // IMPORTANT: L'API n'accepte que ['text'] ou ['audio', 'text']
          // Le SDK par défaut envoie ['audio'] qui est INVALIDE
          // On force TOUJOURS ['audio', 'text']
          converted.modalities = ['audio', 'text'];
          
          // instructions
          if (s.instructions) {
            converted.instructions = s.instructions;
          }
          
          // voice (peut être dans audio.output.voice ou directement)
          if (s.audio?.output?.voice) {
            converted.voice = s.audio.output.voice;
          } else if (s.voice) {
            converted.voice = s.voice;
          }
          
          // turn_detection (peut être dans audio.input.turnDetection)
          if (s.audio?.input?.turnDetection) {
            const td = s.audio.input.turnDetection;
            converted.turn_detection = {
              type: td.type || 'server_vad',
              threshold: td.threshold,
              prefix_padding_ms: td.prefixPaddingMs || td.prefix_padding_ms,
              silence_duration_ms: td.silenceDurationMs || td.silence_duration_ms,
              create_response: td.createResponse ?? td.create_response ?? true,
            };
          }
          
          // tools
          if (s.tools && s.tools.length > 0) {
            converted.tools = s.tools;
          }
          
          // tool_choice
          if (s.toolChoice || s.tool_choice) {
            converted.tool_choice = s.toolChoice || s.tool_choice;
          }
          
          console.log('[ConnectionManager] 📤 Session.update converti:', {
            from: Object.keys(s).filter(k => k !== 'type' && k !== 'tracing'),
            to: Object.keys(converted),
            hasTools: !!converted.tools?.length,
          });
          
          // Si vide après conversion, ne pas envoyer
          if (Object.keys(converted).length === 0) {
            console.log('[ConnectionManager] ⚠️ Session.update ignoré (vide)');
            return;
          }
          
          return originalSendEvent({
            type: 'session.update',
            session: converted,
          });
        }
        return originalSendEvent(event);
      };
      
      // Configuration de la session
      this.session = new RealtimeSession(this.agent, {
        transport: transport,
        model: effectiveModel,
        tracingDisabled: true,
      });

      // 5. Configurer les événements AVANT de se connecter
      this.setupSessionEvents();

      // 6. Se connecter - Le SDK va automatiquement:
      //    - Demander l'accès au microphone
      //    - Créer un élément <audio> pour la sortie
      //    - Établir la connexion WebRTC avec OpenAI
      console.log('[ConnectionManager] 🌐 Connecting to OpenAI Realtime API...');
      
      // Intercepteur temporaire pour diagnostiquer les erreurs
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
        if (url.includes('openai.com/v1/realtime')) {
          let bodyPreview = '[non-string]';
          let bodyLength = 0;
          if (typeof init?.body === 'string') {
            bodyPreview = init.body.substring(0, 80);
            bodyLength = init.body.length;
          }

          // Forcer l'en-tête Beta requis par l'API Realtime
          const headers = new Headers(init?.headers || {});
          if (!headers.has('OpenAI-Beta')) {
            headers.set('OpenAI-Beta', 'realtime=v1');
          }
          init = {
            ...init,
            headers,
          };

          console.log('[ConnectionManager] 📡 OpenAI Realtime request:', {
            url,
            method: init?.method,
            contentType: headers.get('Content-Type'),
            bodyLength,
            bodyPreview,
          });
          try {
            const response = await originalFetch(input, init);
            console.log('[ConnectionManager] 📡 OpenAI Response status:', response.status);
            if (!response.ok) {
              // Clone pour pouvoir lire le body sans le consommer
              const cloned = response.clone();
              const errorBody = await cloned.text();
              console.error('[ConnectionManager] ❌ OpenAI Error body:', errorBody);
            }
            return response;
          } catch (e) {
            console.error('[ConnectionManager] ❌ Fetch error:', e);
            throw e;
          }
        }
        return originalFetch(input, init);
      };
      
      const connectOptions: RealtimeSessionConnectOptions = {
        apiKey: token,
      };

      try {
        await this.session.connect(connectOptions);
      } finally {
        // Restaurer fetch original
        globalThis.fetch = originalFetch;
      }

      console.log('[ConnectionManager] ✅ Connected successfully!');
      console.log('[ConnectionManager] 🎙️ Microphone and audio output should be active');
      
      // NOTE: La session est déjà configurée par le backend lors de la création du token
      // On n'envoie PAS de session.update supplémentaire pour éviter les conflits
      // Les modalities, voice, instructions sont déjà configurés
      console.log('[ConnectionManager] ✅ Session configurée par le backend, pas de session.update supplémentaire');
      
      this.setStatus('connected');
      this.reconnectAttempts = 0;

    } catch (error) {
      console.error('[ConnectionManager] ❌ Connection failed:', error);
      this.setStatus('error');
      this.events.onError?.(error as Error);

      if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        this.attemptReconnect();
      }
    }
  }

  private async attemptReconnect(): Promise<void> {
    this.reconnectAttempts++;
    console.log(`[ConnectionManager] 🔄 Reconnecting (${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    
    this.setStatus('reconnecting');
    await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));
    
    try {
      await this.connect();
    } catch (error) {
      console.error('[ConnectionManager] Reconnect failed:', error);
      if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        this.setStatus('error');
        this.events.onError?.(new Error('Impossible de se reconnecter'));
      }
    }
  }

  async disconnect(): Promise<void> {
    console.log('[ConnectionManager] 🔌 Disconnecting...');

    if (this.session) {
      try {
        this.session.close();
      } catch (error) {
        console.error('[ConnectionManager] Error closing session:', error);
      }
      this.session = null;
    }

    // Nettoyer l'élément audio
    if (this.audioElement) {
      this.audioElement.remove();
      console.log('[ConnectionManager] 🔇 Audio element removed');
      this.audioElement = null;
    } else {
      const fallbackAudio = document.getElementById('realtime-audio-output');
      if (fallbackAudio) {
        fallbackAudio.remove();
        console.log('[ConnectionManager] 🔇 Audio element removed (fallback)');
      }
    }

    this.agent = null;
    this.currentTranscript = '';
    this.setStatus('disconnected');
    this.setAudioState('idle');
    console.log('[ConnectionManager] ✅ Disconnected');
  }

  async sendTextMessage(text: string): Promise<void> {
    if (!this.session || this.status !== 'connected') {
      throw new Error('Session non connectée');
    }

    try {
      console.log('[ConnectionManager] 💬 Sending text message:', text);
      this.session.sendMessage(text);
    } catch (error) {
      console.error('[ConnectionManager] Failed to send message:', error);
      throw error;
    }
  }

  async interrupt(): Promise<void> {
    if (!this.session || this.status !== 'connected') return;

    try {
      console.log('[ConnectionManager] ⏹️ Interrupting...');
      this.session.interrupt();
      this.setAudioState('idle');
    } catch (error) {
      console.error('[ConnectionManager] Failed to interrupt:', error);
    }
  }

  mute(muted: boolean): void {
    if (!this.session) return;
    
    try {
      this.session.mute(muted);
      console.log('[ConnectionManager] 🔇 Mute:', muted);
    } catch (error) {
      console.error('[ConnectionManager] Failed to mute:', error);
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getAudioState(): AudioState {
    return this.audioState;
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }

  isMuted(): boolean | null {
    return this.session?.muted ?? null;
  }

  updateConfig(config: Partial<RealtimeConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export function createConnectionManager(options: ConnectionManagerOptions): ConnectionManager {
  return new ConnectionManager(options);
}
