import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Fonction helper pour créer une notification
async function createNotification(
  userId: string, 
  type: string, 
  title: string, 
  message: string, 
  data?: any
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : undefined,
        isRead: false
      }
    })
    console.log(`✅ Notification créée pour ${userId}: ${title}`)
  } catch (error) {
    console.error('❌ Erreur création notification:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Debug de la session
    console.log('🔍 Debug session assignation:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userName: session?.user?.name,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.id) {
      console.log('❌ Pas de session utilisateur')
      return NextResponse.json({ error: 'Non autorisé - Pas de session' }, { status: 401 })
    }

    // Vérifier les rôles autorisés (plus permissif pour debug)
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN_ENTREPRISE', 'ADMIN', 'EMPLOYE']
    if (!allowedRoles.includes(session.user.role)) {
      console.log('❌ Rôle non autorisé:', {
        currentRole: session.user.role,
        allowedRoles
      })
      return NextResponse.json({ 
        error: `Accès refusé. Rôle: ${session.user.role}. Autorisés: ${allowedRoles.join(', ')}` 
      }, { status: 403 })
    }

    console.log('✅ Utilisateur autorisé:', session.user.role)

    const body = await request.json()
    const { appointmentId, consultantId, notes } = body

    if (!appointmentId || !consultantId) {
      return NextResponse.json({ error: 'ID de consultation et consultant requis' }, { status: 400 })
    }

    // Vérifier que la consultation existe et est en attente
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true,
        company: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Consultation non trouvée' }, { status: 404 })
    }

    // Vérifier que la consultation peut recevoir un consultant
    const assignableStatuses = ['PENDING', 'CONFIRMED', 'ASSIGNED']
    if (!assignableStatuses.includes(appointment.status)) {
      return NextResponse.json({ 
        error: `Impossible d'assigner un consultant. Statut actuel: ${appointment.status}. Statuts autorisés: ${assignableStatuses.join(', ')}` 
      }, { status: 400 })
    }

    // Si déjà assigné, vérifier qu'on peut réassigner
    if (appointment.status === 'ASSIGNED' && appointment.consultantId) {
      console.log(`⚠️ Réassignation: consultation ${appointmentId} déjà assignée au consultant ${appointment.consultantId}`)
    }

    // Vérifier que le consultant existe et est actif
    const consultant = await prisma.user.findUnique({
      where: { 
        id: consultantId,
        role: 'CONSULTANT'
      }
    })

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant non trouvé' }, { status: 404 })
    }

    // Vérifier la disponibilité du consultant (optionnel)
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        consultantId: consultantId,
        scheduledAt: appointment.scheduledAt,
        status: {
          in: ['CONFIRMED', 'ASSIGNED']
        }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json({ 
        error: 'Le consultant a déjà une consultation à cette date/heure' 
      }, { status: 409 })
    }

    // Assigner le consultant
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        consultantId: consultantId,
        status: 'ASSIGNED',
        notes: notes || null,
        updatedAt: new Date()
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
        },
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Créer des notifications
    try {
      // Notifier le consultant assigné
      await createNotification(
        consultantId,
        'consultation_assigned',
        'Nouvelle consultation assignée 📋',
        `Une consultation "${appointment.title}" vous a été assignée par ${session.user.name}. Client: ${appointment.user.name} (${appointment.company.name})`,
        { 
          appointmentId: appointment.id,
          scheduledAt: appointment.scheduledAt,
          duration: appointment.duration,
          clientName: appointment.user.name,
          companyName: appointment.company.name
        }
      )

      // Notifier le demandeur
      await createNotification(
        appointment.userId,
        'consultation_assigned',
        'Consultant assigné à votre demande ✅',
        `Excellente nouvelle ! ${consultant.name} a été assigné à votre consultation "${appointment.title}". Vous recevrez bientôt une confirmation.`,
        { 
          appointmentId: appointment.id,
          consultantName: consultant.name,
          scheduledAt: appointment.scheduledAt
        }
      )
    } catch (notificationError) {
      console.warn('Erreur lors de l\'envoi des notifications:', notificationError)
    }

    return NextResponse.json({
      message: 'Consultant assigné avec succès',
      appointment: updatedAppointment,
      details: {
        consultant: {
          name: consultant.name,
          email: consultant.email
        },
        client: {
          name: appointment.user.name,
          company: appointment.company.name
        },
        scheduledAt: appointment.scheduledAt,
        status: 'ASSIGNED'
      }
    })

  } catch (error) {
    console.error('Erreur assignation consultant:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'assignation' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les assignations possibles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID de consultation requis' }, { status: 400 })
    }

    // Récupérer la consultation
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true,
        company: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Consultation non trouvée' }, { status: 404 })
    }

    // Récupérer les consultants disponibles à cette date/heure
    const consultants = await prisma.user.findMany({
      where: {
        role: 'CONSULTANT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            consultantAppointments: true
          }
        }
      }
    })

    // Vérifier la disponibilité de chaque consultant
    const availableConsultants = await Promise.all(
      consultants.map(async (consultant) => {
        const conflict = await prisma.appointment.findFirst({
          where: {
            consultantId: consultant.id,
            scheduledAt: appointment.scheduledAt,
            status: {
              in: ['CONFIRMED', 'ASSIGNED']
            }
          }
        })

        return {
          ...consultant,
          isAvailable: !conflict,
          conflictReason: conflict ? 'Déjà une consultation à cette heure' : null
        }
      })
    )

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        title: appointment.title,
        scheduledAt: appointment.scheduledAt,
        client: appointment.user.name,
        company: appointment.company.name
      },
      consultants: availableConsultants
    })

  } catch (error) {
    console.error('Erreur récupération assignations:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 