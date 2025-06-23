import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const levels = await prisma.level.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedLevels = levels.map(level => ({
      label: level.name,
      value: level.id
    }))

    return NextResponse.json(formattedLevels)

  } catch (error) {
    console.error('Erreur lors de la récupération des niveaux:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 