import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendConsultationApprovedEmail, sendConsultationRejectedEmail } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { action, rejectionReason } = body

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    // Vérifier que la demande existe et appartient à l'entreprise
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        user: {
          company: {
            users: {
              some: {
                id: session.user.id
              }
            }
          }
        }
      },
      include: {
        user: {
          include: {
            company: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    // Mettre à jour le statut
    const newStatus = action === 'approve' ? 'CONFIRMED' : 'REJECTED'
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    })

    // Créer une notification pour l'employé
    await prisma.notification.create({
      data: {
        userId: appointment.userId,
        type: 'CONSULTATION_UPDATE',
        title: `Demande de consultation ${action === 'approve' ? 'approuvée' : 'rejetée'}`,
        message: `Votre demande "${appointment.title}" a été ${action === 'approve' ? 'approuvée' : 'rejetée'} par votre administrateur.`,
        data: {
          appointmentId: appointment.id,
          action: action
        }
      }
    })

    // Envoyer l'email de notification
    try {
      const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true }
      })

      const adminName = adminUser?.name || 'Administrateur'
      const companyName = appointment.user.company?.name || 'Votre entreprise'

      if (action === 'approve') {
        await sendConsultationApprovedEmail(
          appointment.user.email,
          appointment.user.name || 'Utilisateur',
          appointment.title,
          companyName,
          adminName
        )
      } else {
        await sendConsultationRejectedEmail(
          appointment.user.email,
          appointment.user.name || 'Utilisateur',
          appointment.title,
          companyName,
          adminName,
          rejectionReason
        )
      }

      console.log(`✅ Email de ${action === 'approve' ? 'approbation' : 'refus'} envoyé à ${appointment.user.email}`)
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
      // Ne pas faire échouer la requête si l'email échoue
    }

    return NextResponse.json({ 
      success: true, 
      appointment: updatedAppointment,
      message: `Demande ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès. Un email de notification a été envoyé.`
    })

  } catch (error) {
    console.error('Erreur mise à jour consultation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500 }
    )
  }
} 