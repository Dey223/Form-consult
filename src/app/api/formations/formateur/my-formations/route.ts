import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'FORMATEUR') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formations = await prisma.formation.findMany({
      where: {
        authorId: session.user.id
      },
      include: {
        sections: {
          select: {
            id: true,
            title: true,
            orderIndex: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(formations)

  } catch (error) {
    console.error('Erreur récupération formations:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 