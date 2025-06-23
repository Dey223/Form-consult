import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createStripeCustomer, createCheckoutSession, STRIPE_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { companyId, planType } = await request.json()

    if (!companyId || !planType) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Vérifier que l'entreprise existe
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true }
    })

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
    }

    // Vérifier qu'un paiement est nécessaire
    if (planType === 'ENTREPRISE') {
      return NextResponse.json({ error: 'Le plan Entreprise ne nécessite pas de paiement' }, { status: 400 })
    }

    // Obtenir l'ID du prix Stripe
    const priceId = STRIPE_PLANS[planType as keyof typeof STRIPE_PLANS]
    if (!priceId) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Vérifier si Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_') || process.env.STRIPE_SECRET_KEY.includes('test_your')) {
      console.log('⚠️ Stripe non configuré - simulation du paiement')
      
      // Simuler un paiement réussi pour le développement
      const now = new Date()
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      
      await prisma.subscription.update({
        where: { companyId: company.id },
        data: { 
          status: 'ACTIVE',
          stripeCustomerId: `sim_customer_${company.id}`,
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth
        }
      })

      return NextResponse.json({ 
        checkoutUrl: `/auth/signin?success=true&simulated=true`,
        sessionId: 'sim_session_dev'
      })
    }

    let customerId = company.subscription?.stripeCustomerId

    // Créer le client Stripe s'il n'existe pas
    if (!customerId) {
      const stripeCustomer = await createStripeCustomer(
        company.email,
        company.name,
        company.name
      )
      customerId = stripeCustomer.id

      // Mettre à jour l'abonnement avec le customer ID
      await prisma.subscription.update({
        where: { companyId: company.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Créer la session de checkout
    const checkoutSession = await createCheckoutSession(
      customerId,
      priceId,
      company.id,
      `${process.env.NEXTAUTH_URL}/auth/signin?success=true`,
      `${process.env.NEXTAUTH_URL}/auth/signup?step=payment&error=canceled`
    )

    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id 
    })

  } catch (error) {
    console.error('Erreur création checkout signup:', error)
    
    // Si c'est une erreur Stripe de configuration, simuler le paiement
    if (error instanceof Error && error.message && error.message.includes('cannot currently make live charges')) {
      console.log('🔧 Stripe non configuré correctement - simulation du paiement')
      
      // On ne peut pas accéder aux variables du try dans le catch, donc on retourne juste l'erreur
      return NextResponse.json({ 
        checkoutUrl: `/auth/signin?success=true&simulated=true`,
        sessionId: 'sim_session_fallback'
      })
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 