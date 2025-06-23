import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les informations de l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: { subscription: true }
    })

    if (!company?.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun abonnement Stripe trouvé' },
        { status: 404 }
      )
    }

    // Créer la session du portail de facturation
    const portalSession = await createBillingPortalSession(
      company.subscription.stripeCustomerId,
      `${process.env.NEXTAUTH_URL}/dashboard`
    )

    return NextResponse.json({ 
      portalUrl: portalSession.url 
    })

  } catch (error) {
    console.error('Erreur création portail facturation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 