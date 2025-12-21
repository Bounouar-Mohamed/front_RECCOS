import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route /api/auth/me - Vérifie l'authentification de l'utilisateur
 * Source de vérité pour l'état d'authentification côté frontend.
 */

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }
    
    const backendUrl = `${BACKEND_URL}/api/users/profile`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const nextResponse = NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
      
      // Supprimer le cookie invalide
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
      }
      
      return nextResponse;
    }
    
    const data = await response.json();
    const userData = data.data || data;
    
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





