import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { subject, justification } = body

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!subject || !justification) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Récupérer l'utilisateur actuel
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!currentUser?.companyId) {
      return NextResponse.json({ error: 'Aucune entreprise associée' }, { status: 400 })
    }

    // Envoyer une notification aux super admins pour la demande de formation
    const superAdmins = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN'
      }
    })

    // Créer des notifications pour tous les super admins
    for (const admin of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'FORMATION_REQUEST',
          title: 'Nouvelle demande de formation',
          message: `${currentUser.name} de ${currentUser.company?.name} a demandé une formation: "${subject}"`,
          data: {
            requesterId: session.user.id,
            companyId: currentUser.companyId,
            companyName: currentUser.company?.name,
            requesterName: currentUser.name,
            requesterEmail: currentUser.email,
            subject,
            justification
          }
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demande de formation envoyée avec succès'
    })

  } catch (error) {
    console.error('Erreur création demande formation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    )
  }
} 
