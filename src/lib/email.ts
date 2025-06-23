import nodemailer from 'nodemailer'
import { 
  invitationTemplate, 
  passwordResetTemplate, 
  welcomeTemplate,
  consultationApprovedTemplate,
  consultationRejectedTemplate
} from './email-templates'

// Configuration du transporteur email
const createTransporter = () => {
  // Configuration pour Gmail
  if (process.env.SMTP_PROVIDER === 'gmail' && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  // Configuration SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  }

  // Configuration SMTP générique
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  // Configuration de développement avec Ethereal
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass',
    },
  })
}

export interface EmailData {
  to: string
  from?: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: emailData.from || process.env.SMTP_FROM || '"FormConsult" <noreply@formconsult.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || extractTextFromHtml(emailData.html),
    }

    await transporter.verify()
    const info = await transporter.sendMail(mailOptions)

    console.log(`✅ Email envoyé avec succès à ${emailData.to}`)
    console.log(`📧 Message ID: ${info.messageId}`)

    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info))
    }

    return true
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)

    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Mode développement: l\'erreur d\'email n\'interrompt pas le processus')
      return true
    }

    return false
  }
}

const extractTextFromHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim()
}

export const sendInvitationEmail = async (
  to: string,
  inviterName: string,
  companyName: string,
  invitationLink: string,
  role: string
): Promise<boolean> => {
  const html = invitationTemplate({
    inviterName,
    companyName,
    invitationLink,
    role: role === 'ADMIN_ENTREPRISE' ? 'Administrateur' : 'Employé',
    appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  })

  return sendEmail({
    to,
    subject: `Invitation à rejoindre ${companyName} sur FormConsult`,
    html,
  })
}

export const sendWelcomeEmail = async (
  to: string,
  userName: string,
  companyName: string
): Promise<boolean> => {
  const html = welcomeTemplate({
    userName,
    companyName,
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  })

  return sendEmail({
    to,
    subject: `Bienvenue dans ${companyName} sur FormConsult !`,
    html,
  })
}

export const sendPasswordResetEmail = async (
  to: string,
  userName: string,
  resetLink: string
): Promise<boolean> => {
  const html = passwordResetTemplate({
    userName,
    resetLink,
    appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  })

  return sendEmail({
    to,
    subject: 'Réinitialisation de votre mot de passe FormConsult',
    html,
  })
}

// Test de configuration email
export const testEmailConfiguration = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const transporter = createTransporter()
    await transporter.verify()

    return {
      success: true,
      message: 'Configuration email valide et connectée'
    }
  } catch (error) {
    return {
      success: false,
      message: `Erreur de configuration email: ${error}`
    }
  }
}

// Envoi d'email pour demande de consultation approuvée
export const sendConsultationApprovedEmail = async (
  to: string,
  userName: string,
  consultationTitle: string,
  companyName: string,
  adminName: string
): Promise<boolean> => {
  const html = consultationApprovedTemplate({
    userName,
    consultationTitle,
    companyName,
    adminName,
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  })

  return sendEmail({
    to,
    subject: `✅ Demande de consultation approuvée - ${consultationTitle}`,
    html,
  })
}

// Envoi d'email pour demande de consultation refusée
export const sendConsultationRejectedEmail = async (
  to: string,
  userName: string,
  consultationTitle: string,
  companyName: string,
  adminName: string,
  rejectionReason?: string
): Promise<boolean> => {
  const html = consultationRejectedTemplate({
    userName,
    consultationTitle,
    companyName,
    adminName,
    rejectionReason,
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  })

  return sendEmail({
    to,
    subject: `❌ Demande de consultation refusée - ${consultationTitle}`,
    html,
  })
}