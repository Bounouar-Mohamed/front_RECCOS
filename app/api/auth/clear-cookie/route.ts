import { NextResponse } from 'next/server';

/**
 * API Route pour supprimer le cookie httpOnly
 * Appelée lors de la déconnexion
 */
export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Cookie supprimé' },
    { status: 200 }
  );

  // Supprimer le cookie httpOnly
  response.cookies.delete('access_token');

  return response;
}




