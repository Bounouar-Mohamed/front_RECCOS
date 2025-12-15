import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route /api/auth/refresh-cookie
 * 
 * Cette route rafraîchit le token d'accès en utilisant le refresh token.
 * Elle met à jour le cookie httpOnly avec le nouveau token.
 * 
 * Appelée automatiquement quand l'access token expire mais que le refresh token est valide.
 */

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // 1. Récupérer le refresh token depuis le body
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken;
    
    console.log('[API /auth/refresh-cookie] Attempting token refresh', {
      hasRefreshToken: !!refreshToken,
    });
    
    if (!refreshToken) {
      console.log('[API /auth/refresh-cookie] No refresh token provided');
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 400 }
      );
    }
    
    // 2. Appeler le backend pour rafraîchir le token
    const backendUrl = `${BACKEND_URL}/api/auth/refresh`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    console.log('[API /auth/refresh-cookie] Backend response', {
      status: response.status,
      ok: response.ok,
    });
    
    if (!response.ok) {
      console.log('[API /auth/refresh-cookie] Backend rejected refresh token', {
        status: response.status,
      });
      
      // Refresh token expiré ou invalide - retourner une erreur
      return NextResponse.json(
        { success: false, error: 'Refresh token invalid or expired' },
        { status: 401 }
      );
    }
    
    // 3. Récupérer les nouveaux tokens
    const data = await response.json();
    const tokenData = data.data || data;
    
    const newAccessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token;
    const user = tokenData.user;
    
    if (!newAccessToken) {
      console.error('[API /auth/refresh-cookie] No access token in response');
      return NextResponse.json(
        { success: false, error: 'Invalid response from backend' },
        { status: 500 }
      );
    }
    
    console.log('[API /auth/refresh-cookie] Token refreshed successfully', {
      hasUser: !!user,
      userEmail: user?.email,
    });
    
    // 4. Créer la réponse avec le nouveau cookie
    const nextResponse = NextResponse.json({
      success: true,
      user,
      newRefreshToken,
    });
    
    // 5. Définir le nouveau cookie httpOnly
    const isProduction = process.env.NODE_ENV === 'production';
    nextResponse.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });
    
    console.log('[API /auth/refresh-cookie] New access token cookie set');
    
    return nextResponse;
    
  } catch (error) {
    console.error('[API /auth/refresh-cookie] Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unable to refresh token',
      },
      { status: 500 }
    );
  }
}



