import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Lister tous les cookies NextAuth
    const nextAuthCookies = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      '__Secure-next-auth.callback-url'
    ]

    // Créer la réponse
    const response = NextResponse.json({
      message: 'Session cleared successfully',
      clearedCookies: nextAuthCookies,
      timestamp: new Date().toISOString()
    })

    // Supprimer tous les cookies NextAuth
    nextAuthCookies.forEach(cookieName => {
      response.cookies.delete(cookieName)
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0)
      })
    })

    return response

  } catch (error) {
    console.error('Erreur lors du nettoyage de session:', error)
    return NextResponse.json({
      error: 'Erreur lors du nettoyage',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
} 