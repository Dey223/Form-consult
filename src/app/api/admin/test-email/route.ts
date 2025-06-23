import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { testEmailConfiguration, sendEmail } from '@/lib/email'
import { invitationTemplate } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seuls les SUPER_ADMIN et ADMIN_ENTREPRISE peuvent tester l'email
    if (!session?.user?.id || !['SUPER_ADMIN', 'ADMIN_ENTREPRISE'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { testEmail } = await request.json()

    if (!testEmail) {
      return NextResponse.json({ error: 'Email de test requis' }, { status: 400 })
    }

    // Tester la configuration
    const configTest = await testEmailConfiguration()
    
    if (!configTest.success) {
      return NextResponse.json({
        success: false,
        message: 'Configuration email invalide',
        details: configTest.message
      })
    }

    // Envoyer un email de test
    const testHtml = invitationTemplate({
      inviterName: session.user.name || 'Administrateur Test',
      companyName: 'Entreprise Test',
      invitationLink: `${process.env.NEXTAUTH_URL}/auth/signup`,
      role: 'Test',
      appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
    })

    const emailSent = await sendEmail({
      to: testEmail,
      subject: '🧪 Test de configuration email FormConsult',
      html: testHtml
    })

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Email de test envoyé avec succès à ${testEmail}`,
        configuration: 'Valide'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Échec de l\'envoi de l\'email de test',
        configuration: 'Erreur d\'envoi'
      })
    }

  } catch (error) {
    console.error('❌ Erreur test email:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
} 