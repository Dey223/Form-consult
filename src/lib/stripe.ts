import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export { stripe }

// Plans de prix Stripe (à créer dans votre dashboard Stripe)
export const STRIPE_PLANS = {
  ESSENTIEL: process.env.STRIPE_PRICE_ESSENTIEL || 'price_1234567890',
  PRO: process.env.STRIPE_PRICE_PRO || 'price_0987654321',
  ENTREPRISE: process.env.STRIPE_PRICE_ENTREPRISE || 'price_1111111111'
}

/**
 * Créer un client Stripe
 */
export async function createStripeCustomer(
  email: string,
  name: string,
  companyName: string
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      companyName
    }
  })
}

/**
 * Créer un abonnement Stripe
 */
export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = 0
): Promise<Stripe.Subscription> {
  const subscriptionData: any = {
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { 
      save_default_payment_method: 'on_subscription' 
    },
    expand: ['latest_invoice.payment_intent']
  }

  // Ajouter la période d'essai seulement si spécifiée
  if (trialDays > 0) {
    subscriptionData.trial_period_days = trialDays
  }

  return await stripe.subscriptions.create(subscriptionData)
}

/**
 * Récupérer un abonnement Stripe
 */
export async function getStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * Annuler un abonnement Stripe
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId)
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
  }
}

/**
 * Réactiver un abonnement annulé
 */
export async function reactivateStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  })
}

/**
 * Mettre à jour le plan d'un abonnement
 */
export async function updateStripeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId
    }],
    proration_behavior: 'create_prorations'
  })
}

/**
 * Créer une session de checkout Stripe
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  companyId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      companyId
    },
    subscription_data: {
      metadata: {
        companyId
      }
    }
  })
}

/**
 * Créer un portail client Stripe
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })
}

/**
 * Récupérer les factures d'un client
 */
export async function getCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit
  })
  
  return invoices.data
}

/**
 * Obtenir l'URL du PDF d'une facture
 */
export async function getInvoicePdf(invoiceId: string): Promise<string | null> {
  const invoice = await stripe.invoices.retrieve(invoiceId)
  return invoice.invoice_pdf || null
}

/**
 * Calculer le prix proratisé pour un changement de plan
 */
export async function calculateProration(
  subscriptionId: string,
  newPriceId: string
): Promise<{
  immediate_total: number
  next_invoice_sum: number
  total_cost: number
}> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  const proration = await stripe.invoices.retrieveUpcoming({
    customer: subscription.customer as string,
    subscription: subscriptionId,
    subscription_items: [{
      id: subscription.items.data[0].id,
      price: newPriceId
    }],
    subscription_proration_behavior: 'create_prorations'
  })
  
  const immediate_total = proration.amount_due
  const next_invoice_sum = proration.amount_remaining
  const total_cost = immediate_total + next_invoice_sum
  
  return {
    immediate_total: immediate_total / 100, // Convertir en euros
    next_invoice_sum: next_invoice_sum / 100,
    total_cost: total_cost / 100
  }
}

/**
 * Vérifier si un webhook est valide
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
} 