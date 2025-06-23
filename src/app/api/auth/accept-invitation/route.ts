import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    // Récupérer l'invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        company: true,
        sender: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }

    // Vérifier si l'invitation a expiré
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'Cette invitation a expiré' }, { status: 400 })
    }

    // Vérifier si l'invitation a déjà été acceptée
    if (invitation.acceptedAt) {
      return NextResponse.json({ error: 'Cette invitation a déjà été acceptée' }, { status: 400 })
    }

    // Retourner les informations de l'invitation
    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        company: {
          name: invitation.company.name
        },
        sender: {
          name: invitation.sender.name
        }
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'invitation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, name, password } = body

    if (!token || !name || !password) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    // Récupérer l'invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        company: true,
        sender: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }

    // Vérifier si l'invitation a expiré
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'Cette invitation a expiré' }, { status: 400 })
    }

    // Vérifier si l'invitation a déjà été acceptée
    if (invitation.acceptedAt) {
      return NextResponse.json({ error: 'Cette invitation a déjà été acceptée' }, { status: 400 })
    }

    // Vérifier si un utilisateur avec cet email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 400 })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Transaction pour créer l'utilisateur et marquer l'invitation comme acceptée
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name: name.trim(),
          password: hashedPassword,
          role: invitation.role,
          companyId: invitation.companyId,
          emailVerified: new Date() // Marquer l'email comme vérifié puisque l'invitation vient par email
        }
      })

      // Marquer l'invitation comme acceptée
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date(),
          receiverId: user.id
        }
      })

      return { user }
    })

    // Envoyer un email de bienvenue (optionnel)
    try {
      await sendWelcomeEmail(
        invitation.email,
        name.trim(),
        invitation.company.name
      )
    } catch (emailError) {
      console.warn('⚠️ Échec de l\'envoi de l\'email de bienvenue:', emailError)
      // Ne pas faire échouer la création du compte pour un problème d'email
    }

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 