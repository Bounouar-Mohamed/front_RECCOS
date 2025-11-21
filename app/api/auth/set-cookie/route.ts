import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route sécurisée pour définir le cookie httpOnly
 * Cette route est appelée après une authentification réussie
 * pour définir un cookie httpOnly sécurisé que le middleware peut lire
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token } = body;

    if (!access_token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Créer la réponse
    const response = NextResponse.json(
      { success: true, message: 'Cookie défini avec succès' },
      { status: 200 }
    );

    // Définir le cookie httpOnly sécurisé
    // httpOnly: true = inaccessible via JavaScript (protection XSS)
    // Secure: true = uniquement HTTPS en production
    // SameSite: Lax = permet la navigation tout en protégeant contre CSRF
    // MaxAge: 7 jours (en secondes)
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('access_token', access_token, {
      httpOnly: true, // CRITIQUE : Empêche l'accès JavaScript (protection XSS)
      secure: isProduction, // HTTPS uniquement en production
      sameSite: 'lax', // Permet la navigation après login (strict bloquait la redirection)
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/', // Accessible sur tout le site
    });

    return response;
  } catch (error) {
    console.error('[API /auth/set-cookie] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la définition du cookie' },
      { status: 500 }
    );
  }
}




