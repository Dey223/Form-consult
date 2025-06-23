import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('❌ Stripe signature manquante')
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('❌ Erreur de validation webhook:', err)
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      )
    }

    console.log(`🔔 Webhook reçu: ${event.type}`)

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`⚠️ Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Erreur webhook:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('✅ Abonnement créé:', subscription.id)
  
  try {
    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id
      },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : 'UNPAID',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })
  } catch (error) {
    console.error('❌ Erreur mise à jour abonnement créé:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Abonnement mis à jour:', subscription.id)
  
  try {
    const statusMap: Record<string, string> = {
      'active': 'ACTIVE',
      'past_due': 'PAST_DUE',
      'canceled': 'CANCELED',
      'incomplete': 'UNPAID',
      'incomplete_expired': 'CANCELED',
      'trialing': 'ACTIVE',
      'unpaid': 'UNPAID'
    }

    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id
      },
      data: {
        status: statusMap[subscription.status] as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })
  } catch (error) {
    console.error('❌ Erreur mise à jour abonnement:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Abonnement supprimé:', subscription.id)
  
  try {
    await prisma.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id
      },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: true
      }
    })
  } catch (error) {
    console.error('❌ Erreur suppression abonnement:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Paiement réussi pour facture:', invoice.id)
  
  try {
    const subscription = await prisma.subscription.findUnique({
      where: {
        stripeSubscriptionId: invoice.subscription as string
      }
    })

    if (subscription) {
      // Créer ou mettre à jour la facture
      await prisma.invoice.upsert({
        where: {
          stripeInvoiceId: invoice.id
        },
        update: {
          status: 'paid',
          paidAt: new Date(invoice.status_transitions.paid_at! * 1000)
        },
        create: {
          subscriptionId: subscription.id,
          stripeInvoiceId: invoice.id,
          amount: (invoice.amount_paid || 0) / 100, // Convertir centimes en euros
          currency: invoice.currency,
          status: 'paid',
          paidAt: new Date(invoice.status_transitions.paid_at! * 1000)
        }
      })

      // Mettre à jour le statut de l'abonnement si nécessaire
      if (subscription.status !== 'ACTIVE') {
        await prisma.subscription.update({
          where: {
            id: subscription.id
          },
          data: {
            status: 'ACTIVE'
          }
        })
      }
    }
  } catch (error) {
    console.error('❌ Erreur traitement paiement réussi:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💸 Échec paiement pour facture:', invoice.id)
  
  try {
    const subscription = await prisma.subscription.findUnique({
      where: {
        stripeSubscriptionId: invoice.subscription as string
      }
    })

    if (subscription) {
      // Créer ou mettre à jour la facture
      await prisma.invoice.upsert({
        where: {
          stripeInvoiceId: invoice.id
        },
        update: {
          status: 'open'
        },
        create: {
          subscriptionId: subscription.id,
          stripeInvoiceId: invoice.id,
          amount: (invoice.amount_due || 0) / 100,
          currency: invoice.currency,
          status: 'open'
        }
      })

      // Mettre à jour le statut de l'abonnement
      await prisma.subscription.update({
        where: {
          id: subscription.id
        },
        data: {
          status: 'PAST_DUE'
        }
      })
    }
  } catch (error) {
    console.error('❌ Erreur traitement échec paiement:', error)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('⏰ Fin d\'essai proche pour:', subscription.id)
  
  try {
    // Ici on pourrait envoyer un email de notification
    // ou créer une notification dans la base de données
    console.log('TODO: Envoyer notification fin d\'essai')
  } catch (error) {
    console.error('❌ Erreur notification fin d\'essai:', error)
  }
} 