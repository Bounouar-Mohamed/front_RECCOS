/**
 * Route API Proxy - Redirige toutes les requêtes /api/* vers le backend NestJS
 * 
 * Cette route catch-all intercepte toutes les requêtes vers /api/* et les redirige
 * vers le serveur backend NestJS.
 * 
 * IMPORTANT:
 * - Le backend doit être accessible sur le port configuré dans BACKEND_URL
 * - Par défaut: http://localhost:3000 (ou le port défini dans .env)
 * - Les headers (y compris Authorization) sont préservés
 * - Les erreurs du backend sont propagées au frontend
 */

import { NextRequest, NextResponse } from 'next/server';

// URL du backend - utiliser la variable d'environnement ou localhost:3000 par défaut
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Logger conditionnel - pas de logs sensibles en production
const isDev = process.env.NODE_ENV !== 'production';
const log = (...args: unknown[]) => isDev && console.log('[API Proxy]', ...args);
const logError = (...args: unknown[]) => console.error('[API Proxy]', ...args);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'DELETE');
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'OPTIONS');
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    const { path } = await params;
    const pathSegments = path || [];
    const apiPath = pathSegments.join('/');
    
    // Construire l'URL complète du backend
    // Le backend a déjà le préfixe /api dans son global prefix (voir backend/src/main.ts)
    const backendUrl = `${BACKEND_URL}/api/${apiPath}`;
    
    // Récupérer les query parameters
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl;
    
    log(method, apiPath);
    
    // Préparer les headers
    const headers = new Headers();
    
    // Copier les headers de la requête (sauf host et connection)
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
        headers.set(key, value);
      }
    });
    
    // Préparer le body pour les méthodes qui en ont besoin
    let body: BodyInit | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text();
      } catch (error) {
        // Si pas de body, laisser undefined
        body = undefined;
      }
    }
    
    // Faire la requête vers le backend
    
    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method,
        headers,
        body,
      });
      log('Response:', response.status);
    } catch (fetchError: any) {
      logError('Fetch error:', fetchError?.message);
      throw fetchError;
    }
    
    // Lire la réponse
    const data = await response.text();
    let jsonData: any;
    try {
      jsonData = JSON.parse(data);
    } catch {
      // Si ce n'est pas du JSON, retourner le texte brut
      jsonData = data;
    }
    
    // Créer la réponse Next.js avec les mêmes headers et status
    const nextResponse = NextResponse.json(jsonData, {
      status: response.status,
      statusText: response.statusText,
    });
    
    // SÉCURITÉ : Pour verify-otp, définir le cookie httpOnly sécurisé
    if (apiPath === 'auth/verify-otp' && response.status === 200) {
      const accessToken = jsonData?.data?.access_token || jsonData?.access_token;
      
      if (accessToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Définir le cookie httpOnly sécurisé
        // httpOnly: true = inaccessible via JavaScript (protection XSS)
        // Secure: true = uniquement HTTPS en production
        // SameSite: Lax = permet la navigation tout en protégeant contre CSRF
        // Lax est nécessaire pour que le cookie soit envoyé lors de la navigation après login
        nextResponse.cookies.set('access_token', accessToken, {
          httpOnly: true, // CRITIQUE : Empêche l'accès JavaScript
          secure: isProduction, // HTTPS uniquement en production
          sameSite: 'lax', // Permet la navigation après login (strict bloquait la redirection)
          maxAge: 60 * 60 * 24 * 7, // 7 jours
          path: '/', // Accessible sur tout le site
        });
        
        log('httpOnly cookie set for verify-otp');
      }
    }
    
    // Copier les headers de la réponse du backend
    response.headers.forEach((value, key) => {
      // Ne pas copier certains headers qui sont gérés par Next.js
      if (
        key.toLowerCase() !== 'content-encoding' &&
        key.toLowerCase() !== 'transfer-encoding' &&
        key.toLowerCase() !== 'connection'
      ) {
        nextResponse.headers.set(key, value);
      }
    });
    
    return nextResponse;
  } catch (error) {
    logError('Error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Vérifier si c'est une erreur de connexion
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isConnectionError = errorMessage.includes('ECONNREFUSED') || 
                              errorMessage.includes('fetch failed') ||
                              errorMessage.includes('network');
    
    return NextResponse.json(
      {
        statusCode: 500,
        message: isConnectionError 
          ? `Impossible de se connecter au backend sur ${BACKEND_URL}. Vérifiez que le backend est démarré.`
          : 'Erreur lors de la communication avec le serveur backend',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

