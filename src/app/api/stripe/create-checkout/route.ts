import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession, createStripeCustomer, STRIPE_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { planType } = await request.json()

    if (!planType || !STRIPE_PLANS[planType as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Récupérer les informations de l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: { subscription: true }
    })

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 })
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

    // Obtenir l'ID du prix Stripe
    const priceId = STRIPE_PLANS[planType as keyof typeof STRIPE_PLANS]

    // Créer la session de checkout
    const checkoutSession = await createCheckoutSession(
      customerId,
      priceId,
      company.id,
      `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      `${process.env.NEXTAUTH_URL}/dashboard?canceled=true`
    )

    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id 
    })

  } catch (error) {
    console.error('Erreur création checkout:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 