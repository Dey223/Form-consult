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

    // Vérifier le rôle admin entreprise
    if (session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId') || session.user.companyId

    if (!companyId) {
      return NextResponse.json({ error: 'ID entreprise manquant' }, { status: 400 })
    }

    // Récupérer les informations de l'entreprise et son abonnement
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
        users: true,
        appointments: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    // Définir les limites par plan
    const planLimits = {
      ESSENTIEL: {
        consultations: 50,
        formations: 10,
        users: 25,
        storage: 50, // GB
        features: [
          { name: 'Consultations de base', included: true, limit: 50 },
          { name: 'Formations essentielles', included: true, limit: 10 },
          { name: 'Support email', included: true },
          { name: 'Analytics de base', included: true },
          { name: 'Support téléphonique', included: false },
          { name: 'Formations avancées', included: false },
          { name: 'API access', included: false }
        ]
      },
      PRO: {
        consultations: 200,
        formations: 50,
        users: 100,
        storage: 200, // GB
        features: [
          { name: 'Consultations avancées', included: true, limit: 200 },
          { name: 'Formations complètes', included: true, limit: 50 },
          { name: 'Support prioritaire', included: true },
          { name: 'Analytics avancées', included: true },
          { name: 'Support téléphonique', included: true },
          { name: 'Intégrations', included: true },
          { name: 'API access', included: false },
          { name: 'White-label', included: false }
        ]
      },
      ENTREPRISE: {
        consultations: null, // illimité
        formations: null, // illimité
        users: null, // illimité
        storage: null, // illimité
        features: [
          { name: 'Consultations illimitées', included: true },
          { name: 'Formations illimitées', included: true },
          { name: 'Support premium 24/7', included: true },
          { name: 'Analytics complètes', included: true },
          { name: 'Manager dédié', included: true },
          { name: 'API access complet', included: true },
          { name: 'White-label', included: true },
          { name: 'SLA garanti', included: true }
        ]
      }
    }

    // Déterminer le plan actuel
    const currentTier = company.subscription?.planType || 'ESSENTIEL'
    const limits = planLimits[currentTier as keyof typeof planLimits]

    // Calculer les statistiques d'usage
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Consultations (rendez-vous)
    const consultationsUsed = await prisma.appointment.count({
      where: { 
        companyId,
        status: { in: ['COMPLETED', 'CONFIRMED', 'ASSIGNED'] }
      }
    })

    const consultationsThisMonth = await prisma.appointment.count({
      where: { 
        companyId,
        status: 'COMPLETED',
        updatedAt: { gte: startOfMonth }
      }
    })

    const consultationsLastMonth = await prisma.appointment.count({
      where: { 
        companyId,
        status: 'COMPLETED',
        updatedAt: { 
          gte: startOfLastMonth,
          lte: endOfLastMonth 
        }
      }
    })

    // Formations
    const totalFormations = await prisma.formation.count()
    const formationsUsed = Math.min(totalFormations, limits.formations || totalFormations)

    const formationsCompletedThisMonth = await prisma.userFormation.count({
      where: {
        user: { companyId },
        completedAt: { 
          gte: startOfMonth,
          not: null
        }
      }
    })

    const formationsCompletedLastMonth = await prisma.userFormation.count({
      where: {
        user: { companyId },
        completedAt: { 
          gte: startOfLastMonth,
          lte: endOfLastMonth,
          not: null
        }
      }
    })

    // Utilisateurs
    const activeUsers = company.users.filter((user: any) => user.role !== 'SUPER_ADMIN').length
    const newUsersThisMonth = company.users.filter((user: any) => 
      user.createdAt >= startOfMonth
    ).length
    const newUsersLastMonth = company.users.filter((user: any) => 
      user.createdAt >= startOfLastMonth && user.createdAt <= endOfLastMonth
    ).length

    // Stockage (estimation basée sur les ressources uploadées)
    const storageUsed = Math.random() * 10 + 5 // Simulation pour le moment - à remplacer par vraie logique

    // Heures totales de consultation
    const totalHoursThisMonth = consultationsThisMonth * 1.5 // Estimation moyenne 1.5h/consultation
    const totalHoursLastMonth = consultationsLastMonth * 1.5

    // Calculer les pourcentages et valeurs restantes
    const calculateUsage = (used: number, total: number | null) => {
      if (total === null) {
        return {
          used,
          total: null,
          remaining: null,
          percentUsed: 0
        }
      }
      
      return {
        used,
        total,
        remaining: Math.max(0, total - used),
        percentUsed: total > 0 ? (used / total) * 100 : 0
      }
    }

    // Calculer la croissance
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const stats = {
      currentPlan: {
        id: company.subscription?.stripeSubscriptionId || 'default',
        name: currentTier,
        price: currentTier === 'ESSENTIEL' ? 4999 : currentTier === 'PRO' ? 9999 : currentTier === 'ENTREPRISE' ? 19999 : 0,
        currency: 'MAD',
        tier: currentTier,
        billingCycle: 'monthly',
        startDate: company.subscription?.currentPeriodStart?.toISOString() || now.toISOString(),
        endDate: company.subscription?.currentPeriodEnd?.toISOString() || new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString(),
        status: company.subscription?.status === 'ACTIVE' ? 'active' : 'canceled'
      },
      usage: {
        consultations: calculateUsage(consultationsUsed, limits.consultations),
        formations: calculateUsage(formationsUsed, limits.formations),
        users: calculateUsage(activeUsers, limits.users),
        storage: calculateUsage(storageUsed, limits.storage)
      },
      analytics: {
        thisMonth: {
          consultationsCompleted: consultationsThisMonth,
          formationsCompleted: formationsCompletedThisMonth,
          newUsers: newUsersThisMonth,
          totalHours: totalHoursThisMonth
        },
        lastMonth: {
          consultationsCompleted: consultationsLastMonth,
          formationsCompleted: formationsCompletedLastMonth,
          newUsers: newUsersLastMonth,
          totalHours: totalHoursLastMonth
        },
        growth: {
          consultations: calculateGrowth(consultationsThisMonth, consultationsLastMonth),
          formations: calculateGrowth(formationsCompletedThisMonth, formationsCompletedLastMonth),
          users: calculateGrowth(newUsersThisMonth, newUsersLastMonth),
          engagement: calculateGrowth(totalHoursThisMonth, totalHoursLastMonth)
        }
      },
      features: limits.features
    }

    return NextResponse.json({ 
      success: true, 
      stats 
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques du plan:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 