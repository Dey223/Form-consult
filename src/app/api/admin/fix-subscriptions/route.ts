import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seuls les SUPER_ADMIN peuvent exécuter cette maintenance
    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('🔧 Début de la correction des abonnements...')

    // Trouver tous les abonnements actifs sans dates de période
    const subscriptionsToFix = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { currentPeriodStart: null },
          { currentPeriodEnd: null }
        ]
      },
      include: {
        company: true
      }
    })

    console.log(`📊 ${subscriptionsToFix.length} abonnements à corriger`)

    const results = []
    const now = new Date()
    
    for (const subscription of subscriptionsToFix) {
      try {
        // Calculer les dates selon le plan
        let currentPeriodStart = now
        let currentPeriodEnd = new Date()
        
        if (subscription.planType === 'ESSENTIEL' || subscription.planType === 'PRO') {
          // Plans mensuels
          currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        } else {
          // Plan ENTREPRISE - période d'un an
          currentPeriodEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        }

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            currentPeriodStart,
            currentPeriodEnd
          }
        })

        results.push({
          companyId: subscription.companyId,
          companyName: subscription.company.name,
          planType: subscription.planType,
          status: 'Corrigé',
          currentPeriodStart: currentPeriodStart.toISOString(),
          currentPeriodEnd: currentPeriodEnd.toISOString()
        })

        console.log(`✅ Corrigé: ${subscription.company.name} (${subscription.planType})`)
      } catch (error) {
        console.error(`❌ Erreur pour ${subscription.company.name}:`, error)
        results.push({
          companyId: subscription.companyId,
          companyName: subscription.company.name,
          planType: subscription.planType,
          status: 'Erreur',
          error: error.message
        })
      }
    }

    console.log('🎉 Correction des abonnements terminée')

    return NextResponse.json({
      message: `${results.filter(r => r.status === 'Corrigé').length} abonnements corrigés`,
      totalProcessed: results.length,
      results
    })

  } catch (error) {
    console.error('❌ Erreur lors de la correction des abonnements:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 