import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les données du consultant
    const consultant = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        consultantAppointments: {
          include: {
            company: true,
            user: true
          },
          orderBy: {
            scheduledAt: 'desc'
          }
        }
      }
    })

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant non trouvé' }, { status: 404 })
    }

    // Calculer les statistiques du consultant
    const totalSessions = consultant.consultantAppointments.filter(apt => apt.status === 'COMPLETED').length
    const thisMonthSessions = consultant.consultantAppointments.filter(apt => {
      const appointmentDate = new Date(apt.scheduledAt)
      const now = new Date()
      return apt.status === 'COMPLETED' && 
             appointmentDate.getMonth() === now.getMonth() && 
             appointmentDate.getFullYear() === now.getFullYear()
    }).length
    
    const pendingRequests = consultant.consultantAppointments.filter(apt => apt.status === 'PENDING').length
    
    // Calculer le nombre total d'étudiants uniques
    const uniqueStudents = new Set(consultant.consultantAppointments.map(apt => apt.userId)).size

    // Récupérer les formations (simulées pour le consultant)
    const formations = await prisma.formation.findMany({
      take: 5,
      include: {
        userFormations: true
      }
    })

    // Préparer les formations avec statistiques
    const formationsData = formations.map(formation => {
      const enrolledStudents = formation.userFormations.length
      const completedStudents = formation.userFormations.filter(uf => uf.completedAt !== null).length
      const completionRate = enrolledStudents > 0 ? Math.round((completedStudents / enrolledStudents) * 100) : 0
      
      return {
        id: formation.id,
        title: formation.title,
        enrolledStudents,
        completionRate,
        avgRating: 4.5 + Math.random() * 0.5, // Simulé entre 4.5 et 5.0
        totalRatings: enrolledStudents
      }
    })

    // Préparer les prochains rendez-vous
    const upcomingAppointments = consultant.consultantAppointments
      .filter(apt => new Date(apt.scheduledAt) > new Date())
      .slice(0, 5)
      .map(apt => ({
        id: apt.id,
        title: apt.title,
        company: apt.company.name,
        date: apt.scheduledAt.toISOString().split('T')[0],
        time: apt.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        duration: apt.duration,
        status: apt.status.toLowerCase()
      }))

    const dashboardData = {
      consultant: {
        name: consultant.name || 'Consultant',
        specialty: 'Management & Leadership', // Simulé
        totalSessions,
        rating: 4.8, // Simulé
        totalFormations: formations.length
      },
      stats: {
        thisMonthSessions,
        pendingRequests,
        averageRating: 4.8, // Simulé
        totalStudents: uniqueStudents
      },
      formations: formationsData,
      upcomingAppointments
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Erreur API dashboard consultant:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 