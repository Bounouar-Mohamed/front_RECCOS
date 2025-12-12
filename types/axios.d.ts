import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Indique si la requête nécessite une authentification.
     * Utilisé pour éviter les tentatives de refresh/redirect sur les appels publics.
     */
    requiresAuth?: boolean;
    /**
     * Empêche le redirect automatique vers /login quand une 401 est reçue.
     */
    skipAuthRedirect?: boolean;
  }

  interface InternalAxiosRequestConfig {
    requiresAuth?: boolean;
    skipAuthRedirect?: boolean;
    _retry?: boolean;
  }
}

