import { prisma } from '@/lib/prisma'

export interface NotificationData {
  appointmentId?: string
  consultantName?: string
  clientName?: string
  companyName?: string
  scheduledAt?: string
  duration?: number
  reason?: string
  meetingUrl?: string
}

// Fonction principale pour créer une notification
export async function createNotification(
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
        data: data ? JSON.stringify(data) : null,
        isRead: false
      }
    })
    console.log(`✅ Notification créée: ${title}`)
  } catch (error) {
    console.error('❌ Erreur notification:', error)
  }
}

// Notifications pour assignation de consultant
export async function notifyConsultantAssigned(
  consultantId: string,
  clientId: string,
  appointment: any,
  assignedBy: string
) {
  await createNotification(
    consultantId,
    'consultation_assigned',
    'Nouvelle consultation assignée 📋',
    `Une consultation "${appointment.title}" vous a été assignée par ${assignedBy}.`,
    {
      appointmentId: appointment.id,
      clientName: appointment.user.name,
      scheduledAt: appointment.scheduledAt
    }
  )

  await createNotification(
    clientId,
    'consultation_assigned',
    'Consultant assigné ✅',
    `Un consultant a été assigné à votre consultation "${appointment.title}".`,
    {
      appointmentId: appointment.id,
      scheduledAt: appointment.scheduledAt
    }
  )
}

// Notifications pour confirmation de consultation
export async function notifyConsultationConfirmed(
  consultantId: string,
  clientId: string,
  appointment: any,
  meetingUrl?: string
) {
  await createNotification(
    consultantId,
    'consultation_confirmed',
    'Consultation confirmée ✅',
    `Consultation "${appointment.title}" confirmée.`,
    {
      appointmentId: appointment.id,
      scheduledAt: appointment.scheduledAt,
      meetingUrl
    }
  )

  await createNotification(
    clientId,
    'consultation_confirmed',
    'Consultation confirmée 🎉',
    `Votre consultation "${appointment.title}" est confirmée !`,
    {
      appointmentId: appointment.id,
      scheduledAt: appointment.scheduledAt,
      meetingUrl
    }
  )
}

// Notifications pour rejet de consultation
export async function notifyConsultationRejected(
  consultantId: string,
  clientId: string,
  appointment: any,
  reason?: string,
  rejectedBy?: string
) {
  // Notifier le consultant (si rejeté par admin)
  if (rejectedBy && consultantId) {
    await createNotification(
      consultantId,
      'consultation_rejected',
      'Consultation annulée ❌',
      `La consultation "${appointment.title}" a été annulée par ${rejectedBy}. ${reason ? `Raison: ${reason}` : ''}`,
      {
        appointmentId: appointment.id,
        reason
      }
    )
  }

  // Notifier le client
  await createNotification(
    clientId,
    'consultation_rejected',
    'Consultation annulée ❌',
    `Votre demande de consultation "${appointment.title}" a été annulée. ${reason ? `Raison: ${reason}` : 'Nous vous contacterons pour reprogrammer si nécessaire.'}`,
    {
      appointmentId: appointment.id,
      reason
    }
  )
}

// Notifications pour consultation terminée
export async function notifyConsultationCompleted(
  consultantId: string,
  clientId: string,
  appointment: any
) {
  // Notifier le consultant
  await createNotification(
    consultantId,
    'consultation_completed',
    'Consultation terminée ✅',
    `La consultation "${appointment.title}" avec ${appointment.user.name} a été marquée comme terminée.`,
    {
      appointmentId: appointment.id,
      clientName: appointment.user.name
    }
  )

  // Notifier le client avec demande de feedback
  await createNotification(
    clientId,
    'consultation_completed',
    'Consultation terminée - Votre avis compte ! 💬',
    `Votre consultation "${appointment.title}" est terminée. Nous aimerions connaître votre avis pour améliorer nos services.`,
    {
      appointmentId: appointment.id,
      consultantName: appointment.consultant?.name
    }
  )
}

// Notifications pour rappels
export async function notifyConsultationReminder(
  userId: string,
  appointment: any,
  hoursBeforeStart: number
) {
  const isConsultant = appointment.consultantId === userId
  const title = `Rappel: Consultation dans ${hoursBeforeStart}h ⏰`
  
  const message = isConsultant 
    ? `N'oubliez pas votre consultation "${appointment.title}" avec ${appointment.user.name} prévue à ${new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`
    : `N'oubliez pas votre consultation "${appointment.title}" prévue à ${new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`

  await createNotification(
    userId,
    'consultation_reminder',
    title,
    message,
    {
      appointmentId: appointment.id,
      scheduledAt: appointment.scheduledAt,
      meetingUrl: appointment.meetingUrl
    }
  )
}

// Fonction pour marquer les notifications comme lues
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() }
    })
  } catch (error) {
    console.error('Erreur marquage notification comme lue:', error)
  }
}

// Fonction pour récupérer les notifications d'un utilisateur
export async function getUserNotifications(userId: string, limit = 20) {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  } catch (error) {
    console.error('Erreur récupération notifications:', error)
    return []
  }
} 