import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInvitationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId || session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role = 'EMPLOYE' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 400 })
    }

    // Vérifier si une invitation existe déjà
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        companyId: session.user.companyId,
        acceptedAt: null
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Une invitation est déjà en cours pour cet email' }, { status: 400 })
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

    // Créer l'invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        companyId: session.user.companyId,
        senderId: session.user.id,
        role,
        token,
        expiresAt
      },
      include: {
        company: true,
        sender: true
      }
    })

    // Envoyer l'email d'invitation
    const invitationLink = `${process.env.NEXTAUTH_URL}/auth/accept-invitation?token=${token}`
    const emailSent = await sendInvitationEmail(
      email,
      invitation.sender.name || 'L\'administrateur',
      invitation.company.name,
      invitationLink,
      role
    )

    if (!emailSent) {
      console.warn('⚠️ Échec de l\'envoi de l\'email d\'invitation, mais l\'invitation a été créée')
    } else {
      console.log(`✅ Email d'invitation envoyé avec succès à ${email}`)
    }

    return NextResponse.json({
      message: 'Invitation envoyée avec succès',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        invitationLink: `${process.env.NEXTAUTH_URL}/auth/accept-invitation?token=${token}`
      }
    })

  } catch (error) {
    console.error('Erreur envoi invitation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId || session.user.role !== 'ADMIN_ENTREPRISE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer toutes les invitations de l'entreprise
    const invitations = await prisma.invitation.findMany({
      where: {
        companyId: session.user.companyId
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invitations)

  } catch (error) {
    console.error('Erreur récupération invitations:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 