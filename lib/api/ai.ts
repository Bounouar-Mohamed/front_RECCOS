/**
 * API Client pour le chat IA (Noor -> Backend -> Quantix)
 */
import { apiClient } from './client';

export type MessageRole = 'system' | 'user' | 'assistant';

export interface AiMessage {
  role: MessageRole;
  content: string;
}

export interface AiChatRequest {
  messages: AiMessage[];
  conversationId?: string;
  tenantId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  useAssistants?: boolean;
}

export interface AiChatResponse {
  conversationId: string;
  tenantId: string;
  content: string;  // Quantix renvoie "content" pas "response"
  response?: string; // Alias pour compatibilité
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Interface pour une conversation dans l'historique
export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

// Interface pour les détails d'une conversation
export interface ConversationDetails {
  id: string;
  title: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

// Type pour la réponse enveloppée du backend
interface BackendResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

export const aiApi = {
  /**
   * Envoyer un message au chatbot IA (Noor)
   * Accessible avec ou sans authentification
   * Si authentifié, le token est envoyé pour sauvegarder l'historique
   */
  async chat(request: AiChatRequest, signal?: AbortSignal): Promise<AiChatResponse> {
    // Vérifier si l'utilisateur a un token (côté client uniquement)
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
    
    const response = await apiClient.post<BackendResponse<AiChatResponse>>('/ai/chat', request, {
      // Envoyer le token si l'utilisateur est authentifié, sinon permettre l'accès anonyme
      requiresAuth: hasToken,
      skipAuthRedirect: true, // Ne pas rediriger vers login en cas d'erreur 401
      signal, // Permettre l'annulation de la requête
    });
    // Le backend enveloppe la réponse dans { data: {...}, statusCode, message }
    return response.data.data;
  },

  /**
   * Envoyer un message simple et recevoir une réponse
   * Helper pour simplifier l'usage dans la page Noor
   */
  async sendMessage(
    userMessage: string,
    conversationId?: string,
    previousMessages: AiMessage[] = [],
    tenantId?: string,
    signal?: AbortSignal
  ): Promise<{ response: string; conversationId: string; tenantId: string }> {
    const messages: AiMessage[] = [
      ...previousMessages,
      { role: 'user', content: userMessage },
    ];

    const result = await this.chat({
      messages,
      conversationId,
      tenantId,
      useAssistants: true, // Utiliser les Assistants API d'OpenAI pour plus de contexte
    }, signal);

    return {
      response: result.content || result.response || '', // Quantix renvoie "content"
      conversationId: result.conversationId,
      tenantId: result.tenantId,
    };
  },

  /**
   * Récupérer l'historique des conversations de l'utilisateur
   * Requiert une authentification JWT
   */
  async getConversations(): Promise<ConversationSummary[]> {
    try {
      const response = await apiClient.get<BackendResponse<ConversationSummary[]>>('/ai/conversations');
      return response.data.data || [];
    } catch (error) {
      console.error('[AI API] Error fetching conversations:', error);
      return [];
    }
  },

  /**
   * Récupérer les détails d'une conversation (messages)
   */
  async getConversation(conversationId: string): Promise<ConversationDetails | null> {
    try {
      const response = await apiClient.get<BackendResponse<ConversationDetails>>(`/ai/conversations/${conversationId}`);
      return response.data.data;
    } catch (error) {
      console.error('[AI API] Error fetching conversation:', error);
      return null;
    }
  },

  /**
   * Supprimer une conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/ai/conversations/${conversationId}`);
      return true;
    } catch (error) {
      console.error('[AI API] Error deleting conversation:', error);
      return false;
    }
  },
};

