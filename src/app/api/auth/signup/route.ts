import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { PlanType, UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      companyEmail,
      companyPhone,
      adminName,
      adminEmail,
      password,
      planType
    } = body

    // Logs pour debugging
   

    // Validation des données
    if (!companyName || !companyEmail || !adminName || !adminEmail || !password || !planType) {
      console.log('❌ Champs manquants détectés')
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email de l'entreprise ou de l'admin existe déjà
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail }
    })

    if (existingCompany) {
      console.log('❌ Email entreprise déjà utilisé:', companyEmail)
      return NextResponse.json(
        { message: 'Cette adresse email entreprise est déjà utilisée' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      console.log('❌ Email admin déjà utilisé:', adminEmail)
      return NextResponse.json(
        { message: 'Cette adresse email utilisateur est déjà utilisée' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Déterminer si le plan nécessite un paiement
    const isPaidPlan = planType === 'ESSENTIEL' || planType === 'PRO'

    //console.log('isPaidPlan', isPaidPlan)
    
    // Transaction pour créer l'entreprise, l'utilisateur et l'abonnement
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'entreprise
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          phone: companyPhone || null,
        }
      })

      // Créer l'utilisateur administrateur
      const user = await tx.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: UserRole.ADMIN_ENTREPRISE,
          companyId: company.id,
        }
      })

      // Créer l'abonnement
      const now = new Date()
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      
      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planType: planType as PlanType,
          // Les plans payants commencent en UNPAID, l'Entreprise est gratuit
          status: !isPaidPlan ? 'UNPAID' : 'ACTIVE',
          // Définir les dates de période pour le plan gratuit ENTREPRISE
          currentPeriodStart: !isPaidPlan ? null : now,
          currentPeriodEnd: !isPaidPlan ? null : nextMonth,
        }
      })

      return { company, user, subscription }
    })

    return NextResponse.json({
      message: 'Compte créé avec succès',
      companyId: result.company.id,
      userId: result.user.id,
      requiresPayment: isPaidPlan,
      planType: planType
    })

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error)
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 