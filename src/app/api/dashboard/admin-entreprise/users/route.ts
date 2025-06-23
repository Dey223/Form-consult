import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const companyId = session.user.companyId

    if (!companyId) {
      return NextResponse.json({ error: 'ID entreprise manquant' }, { status: 400 })
    }

    // Récupérer tous les utilisateurs de l'entreprise sauf l'admin actuel
    const users = await prisma.user.findMany({
      where: { 
        companyId,
        NOT: {
          id: session.user.id // Exclure l'utilisateur actuel (l'admin)
        },
        role: 'EMPLOYE' // Afficher uniquement les employés
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
        // Ajouter des informations additionnelles si nécessaire
        userFormations: {
          select: {
            id: true,
            progress: true,
            completedAt: true
          }
        },
        appointments: {
          select: {
            id: true,
            status: true,
            scheduledAt: true
          }
        },
        // Inclure les invitations reçues
        receivedInvitations: {
          where: {
            companyId: companyId
          },
          select: {
            id: true,
            acceptedAt: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Prendre la plus récente
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformer les données pour ajouter des statistiques
    const usersWithStats = users.map(user => {
      const formationsCompleted = user.userFormations.filter(uf => uf.completedAt).length
      const consultationsBooked = user.appointments.length
      const totalHours = consultationsBooked * 1.5 // Estimation
      
      // Logique améliorée basée sur les invitations
      let status = 'ACTIVE' // Par défaut actif
      
      // Vérifier s'il y a une invitation pour cet utilisateur
      const latestInvitation = user.receivedInvitations[0]
      
      if (latestInvitation) {
        // Si l'invitation a été acceptée (acceptedAt n'est pas null), l'utilisateur est ACTIF
        if (latestInvitation.acceptedAt) {
          status = 'ACTIVE'
        } else {
          // Si l'invitation n'a pas été acceptée, l'utilisateur est en PENDING
          status = 'PENDING'
        }
      } else {
        // Si pas d'invitation trouvée, utiliser la logique basée sur le nom
        const emailPrefix = user.email.split('@')[0]
        if (!user.name || user.name.trim() === '' || user.name === emailPrefix || user.name.includes('@')) {
          status = 'PENDING'
        }
      }
      
      return {
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        status,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: null, // À implémenter si nécessaire
        profile: {
          avatar: user.image
        },
        stats: {
          formationsCompleted,
          consultationsBooked,
          totalHours,
          lastActivity: user.createdAt.toISOString()
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      users: usersWithStats 
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const url = new URL(request.url)
    const userId = url.pathname.split('/').pop()
    const { action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Vérifier que l'utilisateur appartient à la même entreprise
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: session.user.companyId
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Pour l'instant, on simule les actions
    // Dans une vraie implémentation, on pourrait avoir un champ 'status' dans le modèle User
    return NextResponse.json({ 
      success: true, 
      message: `Action ${action} appliquée à l'utilisateur ${user.name}` 
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'action utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 