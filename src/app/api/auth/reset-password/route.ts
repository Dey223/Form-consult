import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Vérifier le token (nous utiliserons des requêtes SQL directes temporairement)
    const resetToken = await prisma.$queryRaw`
      SELECT * FROM "PasswordResetToken" 
      WHERE token = ${token} AND expires > ${new Date()}
    ` as any[]

    if (!resetToken || resetToken.length === 0) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    const tokenData = resetToken[0]

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: tokenData.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { email: tokenData.email },
      data: { password: hashedPassword }
    })

    // Supprimer le token utilisé
    await prisma.$queryRaw`
      DELETE FROM "PasswordResetToken" WHERE token = ${token}
    `

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 