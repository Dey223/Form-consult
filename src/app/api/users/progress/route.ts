import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { formationId, progress } = body

    if (!formationId || progress === undefined) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json({ error: 'Progress doit être entre 0 et 100' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès à cette formation
    const userFormation = await prisma.userFormation.findUnique({
      where: {
        userId_formationId: {
          userId: session.user.id,
          formationId
        }
      },
      include: {
        formation: true
      }
    })

    if (!userFormation) {
      return NextResponse.json({ error: 'Formation non assignée à cet utilisateur' }, { status: 404 })
    }

    // Mettre à jour la progression
    const updatedUserFormation = await prisma.userFormation.update({
      where: {
        userId_formationId: {
          userId: session.user.id,
          formationId
        }
      },
      data: {
        progress: Math.round(progress),
        completedAt: progress >= 100 ? new Date() : null,
        // Générer une URL de certificat si la formation est terminée
        certificateUrl: progress >= 100 && !userFormation.certificateUrl 
          ? `/certificates/${session.user.id}-${formationId}.pdf`
          : userFormation.certificateUrl
      }
    })

    return NextResponse.json({
      message: progress >= 100 ? 'Formation terminée !' : 'Progression mise à jour',
      userFormation: updatedUserFormation
    })

  } catch (error) {
    console.error('Erreur mise à jour progression:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 