/**
 * Utilitaires pour tester la connexion frontend-backend
 */

import { apiClient } from './client';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Tester la connexion au backend
 */
export async function testBackendConnection(): Promise<ConnectionTestResult> {
  try {
    const response = await apiClient.get('/health');
    
    if (response.status === 200 && response.data) {
      return {
        success: true,
        message: 'Connexion au backend réussie',
        details: response.data,
      };
    }
    
    return {
      success: false,
      message: 'Réponse invalide du serveur',
      details: response,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Impossible de se connecter au backend',
      details: {
        code: error.code,
        response: error.response?.data,
      },
    };
  }
}

/**
 * Tester l'endpoint de login (sans authentification)
 */
export async function testLoginEndpoint(): Promise<ConnectionTestResult> {
  try {
    // Tester avec des credentials invalides pour vérifier que l'endpoint répond
    const response = await apiClient.post('/auth/login', {
      email: 'test@test.com',
      password: 'test123',
    });
    
    return {
      success: true,
      message: 'Endpoint login accessible',
      details: response.data,
    };
  } catch (error: any) {
    // Si on reçoit une erreur 401, c'est normal (credentials invalides)
    // Cela signifie que l'endpoint fonctionne
    if (error.response?.status === 401) {
      return {
        success: true,
        message: 'Endpoint login accessible (erreur attendue pour credentials invalides)',
        details: {
          status: error.response.status,
          message: error.response.data?.message,
        },
      };
    }
    
    // Si on reçoit une erreur réseau, c'est un problème de connexion
    if (!error.response) {
      return {
        success: false,
        message: 'Impossible de se connecter au backend',
        details: {
          code: error.code,
          message: error.message,
        },
      };
    }
    
    return {
      success: false,
      message: 'Erreur inattendue',
      details: {
        status: error.response.status,
        data: error.response.data,
      },
    };
  }
}







