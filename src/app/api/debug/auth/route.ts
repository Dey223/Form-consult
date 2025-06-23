import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Récupérer la session
    const session = await getServerSession(authOptions)
    
    // Vérifier les rôles disponibles
    const availableRoles = Object.values(UserRole)
    
    // Compter les utilisateurs par rôle
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true
      }
    })

    // Vérifier la connexion à la base de données
    const dbTest = await prisma.user.findFirst()

    return NextResponse.json({
      session: session ? {
        user: session.user,
        hasSession: true
      } : {
        hasSession: false
      },
      availableRoles,
      usersByRole,
      dbConnected: !!dbTest,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur debug auth:', error)
    return NextResponse.json({
      error: 'Erreur lors du debug',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      availableRoles: Object.values(UserRole)
    }, { status: 500 })
  }
} 