import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'utilisateur actuel pour obtenir son entreprise
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!currentUser?.companyId) {
      return NextResponse.json({ error: 'Aucune entreprise associée' }, { status: 400 })
    }

    // Récupérer toutes les demandes de consultation de l'entreprise en attente
    const consultationRequests = await prisma.appointment.findMany({
      where: {
        user: {
          companyId: currentUser.companyId
        },
        status: 'PENDING' // Seulement les demandes en attente
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        consultant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      requests: consultationRequests,
      total: consultationRequests.length
    })

  } catch (error) {
    console.error('Erreur récupération demandes consultation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    )
  }
} 
