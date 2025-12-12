import { NextResponse } from 'next/server';

/**
 * API Route pour supprimer le cookie httpOnly
 * Appelée lors de la déconnexion
 */
export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Cookie supprimé' },
    { status: 200 },
  );

  const isProduction = process.env.NODE_ENV === 'production';

  // Forcer la suppression du cookie httpOnly avec les mêmes attributs que lors de la création
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  return response;
}




