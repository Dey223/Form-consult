import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'FORMATEUR') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, overview, level, price, thumbnail } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 })
    }

    // Créer la formation avec une section par défaut
    const formation = await prisma.formation.create({
      data: {
        title,
        description,
        overview,
        level: level || 'DEBUTANT',
        price: price || 0,
        thumbnail,
        authorId: session.user.id,
        isActive: true,
        sections: {
          create: {
            title: 'Introduction',
            description: 'Section d\'introduction à la formation',
            orderIndex: 1
          }
        }
      },
      include: {
        sections: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Formation créée avec succès',
      formation
    })

  } catch (error) {
    console.error('Erreur création formation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 