import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupération des vraies données de la base
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Informations de l'utilisateur connecté (pour identifier "moi" dans la liste)
    const currentUserId = session.user.id

    // Statistiques globales
    const [
      totalCompanies,
      totalUsers,
      totalFormations,
      publishedFormations,
      totalLessons,
      recentSignups,
      activeSubscriptions
    ] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.formation.count(),
      prisma.formation.count({ where: { isPublished: true } }),
      prisma.lesson.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } })
    ])

    // Entreprises avec leurs plans et détails
    const companiesWithDetails = await prisma.company.findMany({
      include: {
        subscription: true,
        users: {
          select: { 
            id: true, 
            role: true,
            userFormations: {
              select: {
                progress: true,
                completedAt: true,
                formation: {
                  select: { title: true }
                }
              }
            }
          }
        },
        _count: {
          select: { 
            users: true,
            appointments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Utilisateurs récents avec leurs entreprises et détails spécialisés
    const allUsers = await prisma.user.findMany({
      include: {
        company: {
          select: { name: true }
        },
        // Pour les formateurs
        authoredFormations: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            createdAt: true,
            _count: {
              select: { userFormations: true }
            }
          }
        },
        // Pour les consultants et formateurs (rendez-vous)
        consultantAppointments: {
          select: {
            id: true,
            status: true,
            duration: true,
            scheduledAt: true
          }
        },
        // Statistiques des formations suivies
        userFormations: {
          select: {
            id: true,
            progress: true,
            completedAt: true,
            formation: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calcul des limites par plan pour les entreprises
    const planLimits = {
      'ESSENTIEL': 10,
      'PRO': 50,
      'ENTREPRISE': 999 // Illimité représenté par un grand nombre
    }

    // Problèmes de paiement (subscriptions avec statut problématique)
    const paymentIssues = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: 'PAST_DUE' },
          { status: 'UNPAID' },
          { status: 'CANCELED' }
        ]
      },
      include: {
        company: {
          select: { name: true }
        }
      },
      take: 10
    })

    // Calcul du revenu mensuel approximatif (basé sur les subscriptions actives)
    const monthlyRevenue = activeSubscriptions * 8332 // Prix moyen pondéré par abonnement (moyenne des 3 plans)

    // Données pour les graphiques - derniers 12 mois
    const currentDate = new Date()
    const monthsData: Array<{
      month: string
      revenue: number
      subscriptions: number
      activeSubscriptions: number
      target: number
      growth: number
    }> = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1)
      
      // Compter les nouvelles souscriptions pour ce mois
      const newSubscriptions = await prisma.subscription.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        }
      })
      
      // Compter les souscriptions actives à la fin du mois
      const activeInMonth = await prisma.subscription.count({
        where: {
          createdAt: { lt: nextMonth },
          status: 'ACTIVE'
        }
      })
      
      // Calculer le revenu pour ce mois
      const monthRevenue = activeInMonth * 8332 // Revenu moyen par abonnement
      
      monthsData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: monthRevenue,
        subscriptions: newSubscriptions,
        activeSubscriptions: activeInMonth,
        target: Math.max(monthRevenue * 1.1, 5000), // Objectif 10% au-dessus du réel
        growth: i === 11 ? 0 : Math.round(((monthRevenue - (monthsData[monthsData.length - 1]?.revenue || monthRevenue)) / (monthsData[monthsData.length - 1]?.revenue || monthRevenue)) * 100)
      })
    }

    // Données pour les graphiques de statut des paiements
    const paymentStatusData = [
      { 
        name: 'Réussis', 
        value: activeSubscriptions, 
        color: '#10b981' 
      },
      { 
        name: 'Échoués', 
        value: paymentIssues.length, 
        color: '#ef4444' 
      },
      { 
        name: 'En attente', 
        value: Math.max(Math.floor(activeSubscriptions * 0.03), 1), 
        color: '#f59e0b' 
      },
      { 
        name: 'Remboursés', 
        value: Math.max(Math.floor(activeSubscriptions * 0.01), 0), 
        color: '#6b7280' 
      }
    ]

    // Données de tendances des abonnements (4 dernières semaines)
    const weeksData: Array<{
      week: string
      new: number
      canceled: number
      active: number
    }> = []
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000))
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000))
      
      const newThisWeek = await prisma.subscription.count({
        where: {
          createdAt: {
            gte: weekStart,
            lt: weekEnd
          }
        }
      })
      
      // Utiliser les abonnements inactifs comme proxy pour les annulations
      const canceledThisWeek = await prisma.subscription.count({
        where: {
          updatedAt: {
            gte: weekStart,
            lt: weekEnd
          },
          status: {
            in: ['CANCELED', 'PAST_DUE', 'UNPAID']
          }
        }
      })
      
      weeksData.push({
        week: `S${4-i}`,
        new: newThisWeek,
        canceled: canceledThisWeek,
        active: activeSubscriptions - (i * 2) // Simulation croissance progressive
      })
    }

    // Répartition par plan
    const planDistribution = await prisma.subscription.groupBy({
      by: ['planType'],
      where: {
        status: 'ACTIVE'
      },
      _count: {
        id: true
      }
    })

    const planDistributionData = planDistribution.map(plan => ({
      plan: plan.planType,
      count: plan._count.id,
      revenue: plan._count.id * (plan.planType === 'ENTREPRISE' ? 19999 : plan.planType === 'PRO' ? 9999 : 4999)
    }))

    // Méthodes de paiement (simulation basée sur les données réelles)
    const totalPayments = activeSubscriptions
    const paymentMethodsData = [
      { 
        method: 'Carte de crédit', 
        count: Math.round(totalPayments * 0.78), 
        percentage: 78 
      },
      { 
        method: 'Virement bancaire', 
        count: Math.round(totalPayments * 0.16), 
        percentage: 16 
      },
      { 
        method: 'PayPal', 
        count: Math.round(totalPayments * 0.06), 
        percentage: 6 
      }
    ]

    // Données pour graphique radial de performance
    const radialPerformanceData = [
      { 
        name: 'Ventes', 
        value: Math.min(Math.round((activeSubscriptions / Math.max(totalCompanies, 1)) * 100), 100), 
        target: 100, 
        fill: '#6366f1' 
      },
      { 
        name: 'Rétention', 
        value: Math.min(Math.round(((activeSubscriptions - paymentIssues.length) / Math.max(activeSubscriptions, 1)) * 100), 100), 
        target: 100, 
        fill: '#a855f7' 
      },
      { 
        name: 'Support', 
        value: 94, // Simulation - à remplacer par vraies données support
        target: 100, 
        fill: '#ec4899' 
      },
      { 
        name: 'Croissance', 
        value: Math.min(Math.round((recentSignups / Math.max(totalUsers - recentSignups, 1)) * 100), 100), 
        target: 100, 
        fill: '#22c55e' 
      }
    ]

    // Données financières pour donut chart
    const totalRevenue = monthlyRevenue * 12
    const donutFinancialData = [
      { 
        name: 'Abonnements', 
        value: 70, 
        amount: Math.round(totalRevenue * 0.70) 
      },
      { 
        name: 'Formations', 
        value: 20, 
        amount: Math.round(totalRevenue * 0.20) 
      },
      { 
        name: 'Consulting', 
        value: 10, 
        amount: Math.round(totalRevenue * 0.10) 
      }
    ]

    const dashboardData = {
      globalStats: {
        totalCompanies,
        totalUsers,
        monthlyRevenue,
        activeSubscriptions,
        newSignups: recentSignups
      },
      recentCompanies: companiesWithDetails.map(company => {
        const planType = company.subscription?.planType || 'Aucun'
        const maxUsers = planLimits[planType as keyof typeof planLimits] || 0
        
        // Calculer les statistiques de formations
        const allUserFormations = company.users.flatMap(u => u.userFormations)
        const completedFormations = allUserFormations.filter(uf => uf.completedAt)
        const totalProgress = allUserFormations.length > 0 
          ? allUserFormations.reduce((acc, uf) => acc + uf.progress, 0) / allUserFormations.length
          : 0
        
        // Calculer les heures de consulting
        const totalAppointments = company._count.appointments
        const consultingHours = totalAppointments * 1.5 // Estimation moyenne 1.5h par RDV
        
        return {
          id: company.id,
          name: company.name,
          email: company.email,
          plan: planType,
          planStatus: company.subscription?.status || 'INACTIVE',
          users: company._count.users,
          maxUsers: maxUsers,
          status: company.subscription?.status || 'INACTIVE',
          createdAt: company.createdAt.toISOString().split('T')[0],
          subscriptionDetails: company.subscription ? {
            planType: company.subscription.planType,
            status: company.subscription.status,
            currentPeriodStart: company.subscription.currentPeriodStart,
            currentPeriodEnd: company.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: company.subscription.cancelAtPeriodEnd,
            stripeCustomerId: company.subscription.stripeCustomerId
          } : null,
          website: company.website,
          phone: company.phone,
          address: company.address,
          formationStats: {
            totalFormations: allUserFormations.length,
            completedFormations: completedFormations.length,
            averageProgress: Math.round(totalProgress),
            uniqueFormations: new Set(allUserFormations.map(uf => uf.formation.title)).size
          },
          consultingStats: {
            totalAppointments: totalAppointments,
            estimatedHours: Math.round(consultingHours * 10) / 10,
            monthlyLimit: planType === 'PRO' ? 5 : planType === 'ENTREPRISE' ? 999 : 0
          }
        }
      }),
      paymentIssues: paymentIssues.map(sub => ({
        id: sub.id,
        company: sub.company.name,
        amount: sub.planType === 'ENTREPRISE' ? 19999 : sub.planType === 'PRO' ? 9999 : 4999,
        issue: sub.status === 'PAST_DUE' ? 'Paiement en retard' : 
               sub.status === 'UNPAID' ? 'Paiement non effectué' : 'Abonnement annulé',
        date: sub.updatedAt.toISOString().split('T')[0],
        planType: sub.planType
      })),
      systemHealth: {
        apiStatus: 'healthy' as const,
        dbStatus: 'healthy' as const,
        stripeStatus: paymentIssues.length > 5 ? 'warning' as const : 'healthy' as const
      },
      allUsers: allUsers.map(user => {
        // Calculer les détails spécialisés selon le rôle
        let specialDetails = {}
        
        if (user.role === 'FORMATEUR') {
          const publishedFormations = user.authoredFormations.filter(f => f.isPublished)
          const totalStudents = user.authoredFormations.reduce((acc, f) => acc + (f._count?.userFormations || 0), 0)
          specialDetails = {
            totalFormations: user.authoredFormations.length,
            publishedFormations: publishedFormations.length,
            totalStudents,
            latestFormation: user.authoredFormations[0]?.title || 'Aucune'
          }
        } else if (user.role === 'CONSULTANT') {
          const totalAppointments = user.consultantAppointments.length
          const completedAppointments = user.consultantAppointments.filter(a => a.status === 'COMPLETED')
          const totalHours = user.consultantAppointments.reduce((acc, a) => acc + (a.duration || 0), 0) / 60
          specialDetails = {
            totalAppointments,
            completedAppointments: completedAppointments.length,
            totalHours: Math.round(totalHours * 10) / 10,
            rating: 4.8 // Placeholder - à implémenter avec un système de notation
          }
        } else if (user.role === 'EMPLOYE' || user.role === 'ADMIN_ENTREPRISE') {
          const completedFormations = user.userFormations.filter(uf => uf.completedAt)
          const avgProgress = user.userFormations.length > 0 
            ? user.userFormations.reduce((acc, uf) => acc + (uf.progress || 0), 0) / user.userFormations.length
            : 0
          specialDetails = {
            completedFormations: completedFormations.length,
            totalFormations: user.userFormations.length,
            avgProgress: Math.round(avgProgress),
            companyMember: true
          }
        }

        // Construire les stats pour le modal UserDetails
        const stats = {
          totalFormations: user.role === 'FORMATEUR' ? user.authoredFormations.length : user.userFormations.length,
          completedFormations: user.role === 'FORMATEUR' 
            ? user.authoredFormations.filter(f => f.isPublished).length
            : user.userFormations.filter(uf => uf.completedAt).length,
          inProgressFormations: user.role === 'FORMATEUR' 
            ? user.authoredFormations.filter(f => !f.isPublished).length
            : user.userFormations.filter(uf => !uf.completedAt).length,
          averageScore: user.role === 'CONSULTANT' ? 4.8 : 85, // Placeholder
          totalHours: user.role === 'CONSULTANT' 
            ? Math.round(user.consultantAppointments.reduce((acc, a) => acc + (a.duration || 0), 0) / 60 * 10) / 10
            : Math.round(Math.random() * 100) + 50, // Placeholder
          certificatesEarned: user.role === 'EMPLOYE' 
            ? user.userFormations.filter(uf => uf.completedAt).length
            : 0,
          lastFormationDate: undefined,
          consultingHours: user.role === 'CONSULTANT' 
            ? Math.round(user.consultantAppointments.reduce((acc, a) => acc + (a.duration || 0), 0) / 60 * 10) / 10
            : undefined,
          appointmentsCount: user.role === 'CONSULTANT' ? user.consultantAppointments.length : undefined,
          formationsCreated: user.role === 'FORMATEUR' ? user.authoredFormations.length : undefined,
          studentsManaged: user.role === 'FORMATEUR' 
            ? user.authoredFormations.reduce((acc, f) => acc + (f._count?.userFormations || 0), 0)
            : undefined
        }

        return {
          id: user.id,
          name: user.name || 'Non défini',
          email: user.email,
          company: { id: user.companyId || '', name: user.company?.name || 'Aucune entreprise' },
          role: user.role,
          status: (user.role === 'FORMATEUR' || user.role === 'CONSULTANT') ? 'active' : (user.emailVerified ? 'active' : 'pending'),
          lastActive: user.updatedAt.toISOString(),
          joinedAt: user.createdAt.toISOString(),
          stats,
          specialDetails
        }
      }),
      currentUserId,
      contentStats: {
        totalFormations,
        publishedFormations,
        draftFormations: totalFormations - publishedFormations,
        totalLessons,
        totalConsultants: await prisma.user.count({ where: { role: 'CONSULTANT' } }),
        pendingContent: totalFormations - publishedFormations
      },
      // Nouvelles données détaillées pour la section contenu
      detailedContent: {
        formations: await prisma.formation.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            level: true,
            isPublished: true,
            isActive: true,
            createdAt: true,
            author: { select: { name: true, email: true } },
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
            levelRelation: { select: { name: true } },
            sections: {
              select: {
                id: true,
                title: true,
                isPublished: true,
                lessons: {
                  select: {
                    id: true,
                    title: true,
                    isPublished: true,
                    duration: true
                  }
                }
              }
            },
            userFormations: {
              where: {
                // Filtrer uniquement les employés
                user: { role: 'EMPLOYE' }
              },
              select: {
                progress: true,
                completedAt: true,
                user: { select: { name: true, role: true } }
              }
            },
            _count: { select: { userFormations: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }),
        categories: await prisma.category.findMany({
          include: {
            subCategories: { select: { id: true, name: true } },
            _count: { select: { formations: true } }
          }
        }),
        recentLessons: await prisma.lesson.findMany({
          select: {
            id: true,
            title: true,
            duration: true,
            type: true,
            isPublished: true,
            createdAt: true,
            section: {
              select: {
                formation: { 
                  select: { title: true } 
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      },
      // Nouvelles données détaillées pour les consultations
      consultingData: {
        appointments: await prisma.appointment.findMany({
          include: {
            user: { select: { name: true, email: true } },
            consultant: { select: { name: true, email: true } },
            company: { select: { name: true } }
          },
          orderBy: { scheduledAt: 'desc' },
          take: 20
        }),
        consultants: await prisma.user.findMany({
          where: { role: 'CONSULTANT' },
          include: {
            consultantAppointments: {
              select: {
                id: true,
                status: true,
                scheduledAt: true,
                duration: true
              }
            }
          }
        }),
        appointmentStats: {
          total: await prisma.appointment.count(),
          pending: await prisma.appointment.count({ where: { status: 'PENDING' } }),
          confirmed: await prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
          completed: await prisma.appointment.count({ where: { status: 'COMPLETED' } }),
          canceled: await prisma.appointment.count({ where: { status: 'CANCELED' } }),
          thisMonth: await prisma.appointment.count({
            where: {
              scheduledAt: {
                gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
              }
            }
          })
        }
      },
      paymentStats: {
        totalRevenue: monthlyRevenue * 12, // Estimation annuelle
        thisMonthRevenue: monthlyRevenue,
        successfulPayments: activeSubscriptions,
        failedPayments: paymentIssues.length,
        refunds: 0, // À implémenter avec Stripe webhooks
        averageOrderValue: monthlyRevenue > 0 ? Math.round(monthlyRevenue / activeSubscriptions) : 0
      },
      supportTickets: [], // À implémenter selon votre système de tickets
      // Nouvelles données pour les graphiques
      chartData: {
        revenueData: monthsData,
        paymentStatusData,
        subscriptionTrendsData: weeksData,
        planDistributionData,
        paymentMethodsData,
        radialPerformanceData,
        donutFinancialData
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard super admin:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 