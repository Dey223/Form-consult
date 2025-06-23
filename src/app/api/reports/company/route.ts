import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId || session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, quarter, year
    const type = searchParams.get('type') || 'general' // general, formations, consulting

    // Calculer les dates selon la période
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Récupérer les données de l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: {
        users: {
          include: {
            userFormations: {
              include: {
                formation: true
              },
              where: {
                createdAt: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        },
        appointments: {
          include: {
            consultant: true
          },
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        subscription: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    // Calculer les statistiques générales
    const totalUsers = company.users.length
    const activeUsers = company.users.filter(user => 
      user.userFormations.some(uf => uf.createdAt >= startDate)
    ).length

    const totalFormations = company.users.flatMap(user => user.userFormations).length
    const completedFormations = company.users.flatMap(user => user.userFormations)
      .filter(uf => uf.completedAt !== null).length

    const totalAppointments = company.appointments.length
    const completedAppointments = company.appointments.filter(apt => apt.status === 'COMPLETED').length

    // Calculs spécifiques selon le type de rapport
    let reportData: any = {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      company: {
        name: company.name,
        plan: company.subscription?.planType || 'ESSENTIEL',
        totalUsers
      },
      overview: {
        activeUsers,
        totalFormations,
        completedFormations,
        completionRate: totalFormations > 0 ? Math.round((completedFormations / totalFormations) * 100) : 0,
        totalAppointments,
        completedAppointments
      }
    }

    if (type === 'formations' || type === 'general') {
      // Statistiques des formations
      const formationStats = await prisma.formation.findMany({
        include: {
          userFormations: {
            where: {
              userId: {
                in: company.users.map(u => u.id)
              },
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      })

      const formationsData = formationStats.map(formation => {
        const enrolled = formation.userFormations.length
        const completed = formation.userFormations.filter(uf => uf.completedAt !== null).length
        const avgProgress = enrolled > 0 
          ? Math.round(formation.userFormations.reduce((acc, uf) => acc + uf.progress, 0) / enrolled)
          : 0

        return {
          id: formation.id,
          title: formation.title,
          enrolled,
          completed,
          completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
          avgProgress
        }
      }).filter(f => f.enrolled > 0)

      reportData.formations = {
        totalFormations: formationsData.length,
        data: formationsData
      }
    }

    if (type === 'consulting' || type === 'general') {
      // Statistiques des consultings
      const consultingStats = company.appointments.reduce((acc, apt) => {
        const status = apt.status.toLowerCase()
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const totalHours = company.appointments
        .filter(apt => apt.status === 'COMPLETED')
        .reduce((acc, apt) => acc + apt.duration, 0) / 60

      reportData.consulting = {
        totalHours: Math.round(totalHours * 100) / 100,
        statusBreakdown: consultingStats,
        consultants: company.appointments
          .filter(apt => apt.consultant)
          .reduce((acc, apt) => {
            const consultantName = apt.consultant!.name || 'Consultant'
            acc[consultantName] = (acc[consultantName] || 0) + 1
            return acc
          }, {} as Record<string, number>)
      }
    }

    // Données pour graphiques (progression dans le temps)
    if (type === 'general') {
      const dailyStats = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate)
        const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
        
        const dayFormations = company.users.flatMap(user => user.userFormations)
          .filter(uf => uf.createdAt >= dayStart && uf.createdAt < dayEnd).length
        
        const dayAppointments = company.appointments
          .filter(apt => apt.createdAt >= dayStart && apt.createdAt < dayEnd).length

        dailyStats.push({
          date: currentDate.toISOString().split('T')[0],
          formations: dayFormations,
          appointments: dayAppointments
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      reportData.timeline = dailyStats
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Erreur génération rapport:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 