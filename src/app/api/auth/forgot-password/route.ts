import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Pour des raisons de sécurité, on renvoie une réponse positive même si l'email n'existe pas
      return NextResponse.json({
        message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.'
      })
    }

    // Supprimer les anciens tokens pour cet email
    await prisma.$queryRaw`
      DELETE FROM "PasswordResetToken" WHERE email = ${email.toLowerCase()}
    `

    // Générer un nouveau token
    const token = randomUUID()
    const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 heure

    // Créer le token en base
    await prisma.$queryRaw`
      INSERT INTO "PasswordResetToken" (id, email, token, expires, "createdAt") 
      VALUES (${randomUUID()}, ${email.toLowerCase()}, ${token}, ${expires}, ${new Date()})
    `

    // Créer le lien de réinitialisation
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    // Envoyer l'email
    const emailSent = await sendPasswordResetEmail(
      email.toLowerCase(),
      user.name || 'Utilisateur',
      resetLink
    )

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.'
    })

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 