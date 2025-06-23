// Template de base pour tous les emails
const baseEmailTemplate = (content: string, appUrl: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FormConsult</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #f9fafb;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      text-decoration: none;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .text {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 20px;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    
    .button:hover {
      transform: translateY(-1px);
    }
    
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    
    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .footer-link {
      color: #3b82f6;
      text-decoration: none;
    }
    
    .highlight {
      background-color: #fef3c7;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      
      .header, .content, .footer {
        padding: 30px 20px;
      }
      
      .title {
        font-size: 20px;
      }
      
      .text {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div style="padding: 40px 20px;">
    <div class="container">
      <div class="header">
        <a href="${appUrl}" class="logo">📚 FormConsult</a>
      </div>
      
      ${content}
      
      <div class="footer">
        <p class="footer-text">
          Cet email a été envoyé par <strong>FormConsult</strong><br>
          <a href="${appUrl}" class="footer-link">Accéder à la plateforme</a> | 
          <a href="${appUrl}/contact" class="footer-link">Support</a>
        </p>
        <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
          Si vous avez des questions, contactez-nous à 
          <a href="mailto:support@formconsult.com" class="footer-link">support@formconsult.com</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
// Template d'invitation
export const invitationTemplate = ({
  inviterName,
  companyName,
  invitationLink,
  role,
  appUrl
}: {
  inviterName: string
  companyName: string
  invitationLink: string
  role: string
  appUrl: string
}) => {
  const content = `
    <div class="content">
      <h1 class="title">Vous êtes invité(e) à rejoindre ${companyName}</h1>
      
      <p class="text">Bonjour,</p>
      
      <p class="text">
        <strong>${inviterName}</strong> vous invite à rejoindre l'équipe de <span class="highlight">${companyName}</span> 
        sur FormConsult en tant que <strong>${role}</strong>.
      </p>
      
      <div class="info-box">
        <p style="margin: 0; font-weight: 600;">🎯 Avec FormConsult, vous pourrez :</p>
        <ul style="margin: 10px 0 0 20px; color: #4b5563;">
          <li>Accéder à des formations professionnelles certifiantes</li>
          <li>Suivre votre progression et obtenir des certificats</li>
          <li>Bénéficier de sessions de consulting personnalisées</li>
          <li>Développer vos compétences avec un accompagnement expert</li>
        </ul>
      </div>
      
      <div class="button-container">
        <a href="${invitationLink}" class="button">
          ✨ Accepter l'invitation
        </a>
      </div>
      
      <p class="text">
        Cette invitation expire dans <strong>7 jours</strong>. 
        Cliquez sur le bouton ci-dessus pour créer votre compte et commencer votre parcours de formation.
      </p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #dc2626;">
          <strong>🔒 Sécurité :</strong> Si vous n'attendiez pas cette invitation ou si vous ne connaissez pas l'expéditeur, 
          vous pouvez ignorer cet email en toute sécurité.
        </p>
      </div>
    </div>
  `
  
  return baseEmailTemplate(content, appUrl)
}

// Template de bienvenue
export const welcomeTemplate = ({
  userName,
  companyName,
  dashboardUrl,
  appUrl
}: {
  userName: string
  companyName: string
  dashboardUrl: string
  appUrl: string
}) => {
  const content = `
    <div class="content">
      <h1 class="title">🎉 Bienvenue sur FormConsult !</h1>
      
      <p class="text">Bonjour <strong>${userName}</strong>,</p>
      
      <p class="text">
        Félicitations ! Votre compte a été créé avec succès et vous faites maintenant partie de l'équipe 
        <span class="highlight">${companyName}</span> sur FormConsult.
      </p>
      
      <div class="info-box">
        <p style="margin: 0; font-weight: 600;">🚀 Prêt(e) à commencer ? Voici vos prochaines étapes :</p>
        <ul style="margin: 10px 0 0 20px; color: #4b5563;">
          <li><strong>Explorez votre dashboard</strong> - Découvrez les formations qui vous sont assignées</li>
          <li><strong>Configurez votre profil</strong> - Personnalisez vos informations</li>
          <li><strong>Commencez une formation</strong> - Lancez-vous dans votre premier module</li>
          <li><strong>Planifiez du consulting</strong> - Réservez des sessions avec nos experts</li>
        </ul>
      </div>
      
      <div class="button-container">
        <a href="${dashboardUrl}" class="button">
          🎯 Accéder à mon dashboard
        </a>
      </div>
      
      <p class="text">
        Notre équipe de support est là pour vous accompagner dans vos premiers pas. 
        N'hésitez pas à nous contacter si vous avez des questions !
      </p>
      
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #0284c7;">
          <strong>💡 Astuce :</strong> Marquez cet email comme important et ajoutez notre adresse 
          (noreply@formconsult.com) à vos contacts pour ne manquer aucune mise à jour !
        </p>
      </div>
    </div>
  `
  
  return baseEmailTemplate(content, appUrl)
}

// Template de réinitialisation de mot de passe
export const passwordResetTemplate = ({
  userName,
  resetLink,
  appUrl
}: {
  userName: string
  resetLink: string
  appUrl: string
}) => {
  const content = `
    <div class="content">
      <h1 class="title">🔐 Réinitialisation de mot de passe</h1>
      
      <p class="text">Bonjour <strong>${userName}</strong>,</p>
      
      <p class="text">
        Vous avez demandé la réinitialisation de votre mot de passe FormConsult. 
        Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
      </p>
      
      <div class="button-container">
        <a href="${resetLink}" class="button">
          🔑 Réinitialiser mon mot de passe
        </a>
      </div>
      
      <div class="info-box">
        <p style="margin: 0; font-weight: 600;">⏰ Important à savoir :</p>
        <ul style="margin: 10px 0 0 20px; color: #4b5563;">
          <li>Ce lien expire dans <strong>1 heure</strong> pour votre sécurité</li>
          <li>Une fois utilisé, ce lien ne sera plus valide</li>
          <li>Votre mot de passe actuel reste valide tant que vous n'en définissez pas un nouveau</li>
        </ul>
      </div>
      
      <p class="text">
        Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. 
        Votre compte reste protégé.
      </p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #dc2626;">
          <strong>🛡️ Sécurité :</strong> Ne partagez jamais ce lien avec qui que ce soit. 
          Notre équipe ne vous demandera jamais votre mot de passe par email.
        </p>
      </div>
    </div>
  `
  
  return baseEmailTemplate(content, appUrl)
}

// Template de notification de formation assignée
export const formationAssignedTemplate = ({
  userName,
  formationTitle,
  companyName,
  dashboardUrl,
  appUrl
}: {
  userName: string
  formationTitle: string
  companyName: string
  dashboardUrl: string
  appUrl: string
}) => {
  const content = `
    <div class="content">
      <h1 class="title">📚 Nouvelle formation assignée</h1>
      
      <p class="text">Bonjour <strong>${userName}</strong>,</p>
      
      <p class="text">
        Excellente nouvelle ! Une nouvelle formation vous a été assignée par votre entreprise 
        <span class="highlight">${companyName}</span>.
      </p>
      
      <div class="info-box">
        <p style="margin: 0; font-weight: 600;">🎓 Formation assignée :</p>
        <p style="margin: 10px 0 0 0; font-size: 18px; color: #1f2937; font-weight: 600;">
          ${formationTitle}
        </p>
      </div>
      
      <div class="button-container">
        <a href="${dashboardUrl}" class="button">
          🚀 Commencer la formation
        </a>
      </div>
      
      <p class="text">
        Connectez-vous à votre dashboard pour découvrir le contenu de cette formation, 
        suivre votre progression et obtenir votre certificat une fois terminée.
      </p>
    </div>
  `
  
  return baseEmailTemplate(content, appUrl)
}

// Template de rappel de rendez-vous
export const appointmentReminderTemplate = ({
  userName,
  appointmentTitle,
  appointmentDate,
  consultantName,
  meetingUrl,
  appUrl
}: {
  userName: string
  appointmentTitle: string
  appointmentDate: string
  consultantName: string
  meetingUrl?: string
  appUrl: string
}) => {
  const content = `
    <div class="content">
      <h1 class="title">⏰ Rappel de rendez-vous</h1>
      
      <p class="text">Bonjour <strong>${userName}</strong>,</p>
      
      <p class="text">
        Votre session de consulting approche ! Voici les détails de votre rendez-vous :
      </p>
      
      <div class="info-box">
        <p style="margin: 0; font-weight: 600;">📅 Détails du rendez-vous :</p>
        <ul style="margin: 10px 0 0 20px; color: #4b5563;">
          <li><strong>Sujet :</strong> ${appointmentTitle}</li>
          <li><strong>Date :</strong> ${appointmentDate}</li>
          <li><strong>Consultant :</strong> ${consultantName}</li>
        </ul>
      </div>
      
      ${meetingUrl ? `
        <div class="button-container">
          <a href="${meetingUrl}" class="button">
            🎥 Rejoindre la réunion
          </a>
        </div>
      ` : ''}
      
      <p class="text">
        Préparez vos questions et assurez-vous d'avoir une connexion internet stable. 
        Votre consultant vous attend !
      </p>
    </div>
  `
  
  return baseEmailTemplate(content, appUrl)
}

// Template de demande de consultation acceptée
export const consultationApprovedTemplate = ({
  userName,
  consultationTitle,
  companyName,
  adminName,
  dashboardUrl,
  appUrl
}: {
  userName: string
  consultationTitle: string
  companyName: string
  adminName: string
  dashboardUrl: string
  appUrl: string
}) => {
  const content = `
    <div class="content">
      <h1 class="title">✅ Demande de consultation approuvée</h1>
      
      <p class="text">Bonjour <strong>${userName}</strong>,</p>
      
      <p class="text">
        Excellente nouvelle ! Votre demande de consultation a été <span class="highlight">approuvée</span> 
        par l'administration de <strong>${companyName}</strong>.
      </p>
      
      <div class="info-box">
        <p style="margin: 0; font-weight: 600;">📋 Détails de votre demande :</p>
        <ul style="margin: 10px 0 0 20px; color: #4b5563;">
          <li><strong>Sujet :</strong> ${consultationTitle}</li>
          <li><strong>Approuvée par :</strong> ${adminName}</li>
          <li><strong>Entreprise :</strong> ${companyName}</li>
        </ul>
      </div>
      
      <p class="text">
        🎯 <strong>Prochaines étapes :</strong><br>
        Un consultant spécialisé vous sera assigné prochainement. Vous recevrez une notification 
        dès qu'un créneau sera disponible pour votre session.
      </p>
      
      <div class="button-container">
        <a href="${dashboardUrl}" class="button">
          📊 Voir le statut de ma demande
        </a>
      </div>
      
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #0284c7;">
          <strong>💡 Conseil :</strong> Préparez vos questions en avance pour optimiser votre session 
          de consulting. Vous pouvez également consulter les ressources disponibles sur votre dashboard.
        </p>
      </div>
      
      <p class="text">
        Notre équipe travaille à vous offrir la meilleure expérience possible. 
        N'hésitez pas à nous contacter si vous avez des questions !
      </p>
    </div>
  `
  
  return baseEmailTemplate(content, appUrl)
}

// Template de demande de consultation refusée
export const consultationRejectedTemplate = ({
  userName,
  consultationTitle,
  companyName,
  adminName,
  rejectionReason,
  dashboardUrl,
  appUrl
}: {
  userName: string
  consultationTitle: string
  companyName: string
  adminName: string
  rejectionReason?: string
  dashboardUrl: string
  appUrl: string
}) => {
  const content = `
    <div class="content">
      <h1 class="title">❌ Demande de consultation refusée</h1>
      
      <p class="text">Bonjour <strong>${userName}</strong>,</p>
      
      <p class="text">
        Nous vous informons que votre demande de consultation n'a pas pu être acceptée 
        par l'administration de <strong>${companyName}</strong>.
      </p>
      
      <div class="info-box">
        <p style="margin: 0; font-weight: 600;">📋 Détails de votre demande :</p>
        <ul style="margin: 10px 0 0 20px; color: #4b5563;">
          <li><strong>Sujet :</strong> ${consultationTitle}</li>
          <li><strong>Décision prise par :</strong> ${adminName}</li>
          <li><strong>Entreprise :</strong> ${companyName}</li>
        </ul>
      </div>
      
      ${rejectionReason ? `
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 600; color: #dc2626;">📝 Motif du refus :</p>
          <p style="margin: 5px 0 0 0; color: #7f1d1d;">${rejectionReason}</p>
        </div>
      ` : ''}
      
      <p class="text">
        🔄 <strong>Que faire maintenant ?</strong><br>
        • Vous pouvez modifier votre demande et la resoumettre<br>
        • Contactez votre responsable pour plus d'informations<br>
        • Explorez les autres ressources disponibles sur votre dashboard
      </p>
      
      <div class="button-container">
        <a href="${dashboardUrl}" class="button">
          📊 Accéder à mon dashboard
        </a>
      </div>
      
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #0284c7;">
          <strong>💡 Alternative :</strong> En attendant, découvrez nos formations disponibles 
          qui pourraient répondre à vos besoins de développement professionnel.
        </p>
      </div>
      
      <p class="text">
        Nous restons à votre disposition pour toute question. 
        N'hésitez pas à contacter notre équipe support !
      </p>
    </div>
  `
  
  return baseEmailTemplate(content, appUrl)
} 