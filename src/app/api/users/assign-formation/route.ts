import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId || session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { userIds, formationId } = body

    if (!userIds || !Array.isArray(userIds) || !formationId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Vérifier que la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: formationId }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Vérifier que tous les utilisateurs appartiennent à l'entreprise
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        companyId: session.user.companyId
      }
    })

    if (users.length !== userIds.length) {
      return NextResponse.json({ error: 'Certains utilisateurs ne sont pas valides' }, { status: 400 })
    }

    // Créer les assignations de formation (ou les mettre à jour si elles existent)
    const assignments = await Promise.all(
      userIds.map(async (userId: string) => {
        return prisma.userFormation.upsert({
          where: {
            userId_formationId: {
              userId,
              formationId
            }
          },
          update: {
            // Ne rien mettre à jour si l'assignation existe déjà
          },
          create: {
            userId,
            formationId,
            progress: 0
          }
        })
      })
    )

    return NextResponse.json({
      message: `Formation assignée à ${assignments.length} utilisateur(s)`,
      assignments
    })

  } catch (error) {
    console.error('Erreur assignation formation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 