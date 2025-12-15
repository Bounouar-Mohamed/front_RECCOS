import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route /api/auth/me
 * 
 * Cette route vérifie l'authentification de l'utilisateur en :
 * 1. Lisant le cookie httpOnly 'access_token'
 * 2. Appelant le backend sur /api/users/profile avec ce token
 * 3. Retournant les informations de l'utilisateur
 * 
 * C'est la source de vérité pour l'état d'authentification côté frontend.
 */

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    // 1. Récupérer le cookie httpOnly access_token
    const accessToken = request.cookies.get('access_token')?.value;
    
    console.log('[API /auth/me] Checking authentication', {
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
    });
    
    if (!accessToken) {
      console.log('[API /auth/me] No access token found in cookies');
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }
    
    // 2. Appeler le backend pour récupérer le profil utilisateur
    // Le backend utilise /api/users/profile pour le profil de l'utilisateur connecté
    const backendUrl = `${BACKEND_URL}/api/users/profile`;
    
    console.log('[API /auth/me] Fetching user profile from backend', {
      url: backendUrl,
    });
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('[API /auth/me] Backend response', {
      status: response.status,
      ok: response.ok,
    });
    
    if (!response.ok) {
      // Token invalide ou expiré
      console.log('[API /auth/me] Backend rejected token', {
        status: response.status,
      });
      
      // Nettoyer le cookie invalide
      const nextResponse = NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
      
      // Supprimer le cookie car il est invalide
      if (response.status === 401 || response.status === 403) {
        const isProduction = process.env.NODE_ENV === 'production';
        nextResponse.cookies.set('access_token', '', {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          maxAge: 0,
          expires: new Date(0),
          path: '/',
        });
        console.log('[API /auth/me] Cleared invalid token cookie');
      }
      
      return nextResponse;
    }
    
    // 3. Récupérer les données du profil
    const data = await response.json();
    
    // Le backend peut retourner les données directement ou dans un wrapper { data: ... }
    const userData = data.data || data;
    
    console.log('[API /auth/me] User authenticated', {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
    });
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        role: userData.role,
        emailVerified: userData.emailVerified,
        isActive: userData.isActive,
        avatarUrl: userData.avatarUrl,
        phone: userData.phone,
      },
    });
    
  } catch (error) {
    console.error('[API /auth/me] Error:', error);
    
    // En cas d'erreur réseau, retourner non authentifié
    return NextResponse.json(
      { 
        authenticated: false, 
        user: null,
        error: 'Unable to verify authentication',
      },
      { status: 200 }
    );
  }
}





