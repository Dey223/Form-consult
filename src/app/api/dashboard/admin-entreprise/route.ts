import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.companyId || session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const companyId = session.user.companyId

    // Récupérer l'entreprise avec ses détails complets
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
        users: {
          include: {
            userFormations: {
              include: {
                formation: true
              }
            }
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    // Calculer les statistiques des employés
    const employees = company.users.filter(user => user.role === 'EMPLOYE')
    const totalUsers = employees.length

    // Calculer les stats de formations
    const allUserFormations = employees.flatMap(user => user.userFormations)
    const activeFormations = new Set(allUserFormations.map(uf => uf.formationId)).size
    
    const completedFormations = allUserFormations.filter(uf => uf.completedAt).length
    const totalAssignedFormations = allUserFormations.length
    const completionRate = totalAssignedFormations > 0 
      ? Math.round((completedFormations / totalAssignedFormations) * 100) 
      : 0

    // Récupérer les rendez-vous de l'entreprise
    const appointments = await prisma.appointment.findMany({
      where: { 
        companyId,
        scheduledAt: {
          gte: new Date()
        }
      },
      include: {
        user: true,
        consultant: true
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      take: 10
    })

    // Récupérer les formations disponibles (publiées)
    const formations = await prisma.formation.findMany({
      where: { 
        isPublished: true 
      },
      include: {
        sections: {
          include: {
            lessons: true
          }
        },
        userFormations: {
          where: {
            user: {
              companyId
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformer les données pour l'interface
    const dashboardData = {
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        website: company.website,
        logo: company.logo,
        plan: company.subscription?.planType || 'Aucun',
        usersCount: totalUsers,
        subscription: {
          status: company.subscription?.status || 'INACTIVE',
          currentPeriodEnd: company.subscription?.currentPeriodEnd?.toISOString() || null
        }
      },
      stats: {
        totalUsers,
        activeFormations,
        completionRate,
        consultingHours: {
          used: appointments.filter(apt => apt.status === 'COMPLETED').length * 2, // Estimation 2h par consultation
          available: company.subscription?.planType === 'ENTREPRISE' ? 100 : 
                    company.subscription?.planType === 'PRO' ? 50 : 20
        }
      },
      recentUsers: employees.slice(0, 5).map(user => ({
        id: user.id,
        name: user.name || 'Non défini',
        email: user.email,
        progress: user.userFormations.length > 0 
          ? Math.round(user.userFormations.reduce((sum, uf) => sum + uf.progress, 0) / user.userFormations.length)
          : 0,
        status: user.emailVerified ? 'active' as const : 'pending' as const
      })),
      upcomingAppointments: appointments.slice(0, 5).map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        date: new Date(appointment.scheduledAt).toLocaleDateString('fr-FR'),
        consultant: appointment.consultant?.name || 'Non assigné',
        status: appointment.status.toLowerCase()
      })),
      allUsers: employees.map(user => ({
        id: user.id,
        name: user.name || 'Non défini',
        email: user.email,
        role: user.role,
        isActive: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.updatedAt.toISOString(),
        formationsCount: user.userFormations.length
      })),
      allFormations: formations.map(formation => {
        const lessonsCount = formation.sections.reduce((sum, section) => sum + section.lessons.length, 0)
        const enrolledFromCompany = formation.userFormations.length

        return {
          id: formation.id,
          title: formation.title,
          description: formation.description,
          level: formation.level,
          isPublished: formation.isPublished,
          enrolledCount: enrolledFromCompany,
          lessonsCount,
          createdAt: formation.createdAt.toISOString()
        }
      })
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard admin entreprise:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 