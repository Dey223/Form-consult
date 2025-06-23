const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding des retours de consultation...')

  try {
    // 1. Récupérer les consultations terminées
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        user: true,
        consultant: true,
        company: true
      }
    })

    if (completedAppointments.length === 0) {
      console.log('❌ Aucune consultation terminée trouvée.')
      console.log('💡 Ajoutons d\'abord quelques consultations terminées...')
      
      // Mettre à jour quelques consultations pour les marquer comme terminées
      const appointmentsToComplete = await prisma.appointment.findMany({
        where: {
          status: { in: ['CONFIRMED', 'ASSIGNED'] }
        },
        take: 10
      })

      for (const apt of appointmentsToComplete) {
        await prisma.appointment.update({
          where: { id: apt.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Complété dans les 30 derniers jours
          }
        })
      }

      console.log(`✅ ${appointmentsToComplete.length} consultations marquées comme terminées`)
      
      // Recharger les consultations terminées
      const updatedAppointments = await prisma.appointment.findMany({
        where: {
          status: 'COMPLETED'
        },
        include: {
          user: true,
          consultant: true,
          company: true
        }
      })
      completedAppointments.push(...updatedAppointments)
    }

    console.log(`📋 ${completedAppointments.length} consultations terminées trouvées`)

    // 2. Domaines d'amélioration possibles
    const improvementAreas = [
      'Gestion du temps',
      'Communication',
      'Écoute active',
      'Exemples pratiques',
      'Suivi post-consultation',
      'Clarté des explications',
      'Outils recommandés',
      'Méthodologie',
      'Disponibilité',
      'Réactivité'
    ]

    // 3. Points forts possibles
    const strengthsOptions = [
      'Expertise technique',
      'Pédagogie',
      'Écoute',
      'Pragmatisme',
      'Adaptabilité',
      'Professionnalisme',
      'Créativité',
      'Leadership',
      'Vision stratégique',
      'Empathie'
    ]

    // 4. Commentaires types positifs
    const positiveComments = [
      'Excellent consultant ! Très professionnel et à l\'écoute. Les conseils sont pertinents et applicables immédiatement.',
      'Session très enrichissante. Les méthodologies proposées sont concrètes et adaptées à notre contexte.',
      'Parfait accompagnement. Le consultant a su identifier nos besoins et proposer des solutions pragmatiques.',
      'Super expérience ! Communication claire et expertise technique impressionnante.',
      'Consultation très productive. Les outils recommandés nous font déjà gagner du temps.',
      'Formidable consultant ! Approche structurée et recommandations pertinentes.',
      'Excellente session de coaching. Vision stratégique et conseils actionnables.',
      'Très satisfait de l\'accompagnement. Expertise pointue et pédagogie remarquable.',
      'Session de qualité exceptionnelle. Le consultant maîtrise parfaitement son domaine.',
      'Parfait ! Écoute active et solutions innovantes adaptées à nos enjeux.'
    ]

    // 5. Commentaires types neutres/mixtes
    const neutralComments = [
      'Consultation intéressante dans l\'ensemble. Quelques points pourraient être approfondis.',
      'Bonne session, mais j\'aurais aimé plus d\'exemples concrets pour notre secteur.',
      'Consultant compétent. La méthodologie présentée nécessite quelques adaptations.',
      'Session correcte. Les recommandations sont globalement pertinentes.',
      'Consultation utile. Quelques améliorations possibles sur la gestion du temps.',
      'Bon accompagnement. Les outils proposés demandent à être personnalisés.'
    ]

    // 6. Générer des retours pour 80% des consultations
    let feedbackCount = 0
    const targetFeedbacks = Math.floor(completedAppointments.length * 0.8)

    for (let i = 0; i < targetFeedbacks; i++) {
      const appointment = completedAppointments[i]
      
      // Vérifier qu'il n'y a pas déjà un retour
      const existingFeedback = await prisma.consultationFeedback.findUnique({
        where: { appointmentId: appointment.id }
      })

      if (existingFeedback) {
        continue // Passer si feedback déjà existant
      }

      // Générer des notes réalistes (distribution biaisée vers le positif)
      const ratingDistribution = [5, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 2] // Plus de 5 et 4
      const rating = ratingDistribution[Math.floor(Math.random() * ratingDistribution.length)]
      
      const satisfactionLevel = Math.max(1, rating + (Math.random() > 0.5 ? 0 : -1))
      const wouldRecommend = rating >= 4 || (rating === 3 && Math.random() > 0.3)

      // Choisir un commentaire selon la note
      let comments = ''
      let selectedImprovementAreas = []
      let selectedStrengths = []

      if (rating >= 4) {
        // Commentaire positif
        comments = positiveComments[Math.floor(Math.random() * positiveComments.length)]
        
        // 2-4 points forts
        const strengthsCount = Math.floor(Math.random() * 3) + 2
        selectedStrengths = strengthsOptions
          .sort(() => 0.5 - Math.random())
          .slice(0, strengthsCount)
          
        // Peu ou pas d'améliorations
        if (Math.random() > 0.7) {
          selectedImprovementAreas = [improvementAreas[Math.floor(Math.random() * improvementAreas.length)]]
        }
      } else {
        // Commentaire neutre/mitigé
        comments = neutralComments[Math.floor(Math.random() * neutralComments.length)]
        
        // 1-2 points forts
        const strengthsCount = Math.floor(Math.random() * 2) + 1
        selectedStrengths = strengthsOptions
          .sort(() => 0.5 - Math.random())
          .slice(0, strengthsCount)
          
        // 1-3 améliorations
        const improvementCount = Math.floor(Math.random() * 3) + 1
        selectedImprovementAreas = improvementAreas
          .sort(() => 0.5 - Math.random())
          .slice(0, improvementCount)
      }

      // Ajouter une variation dans les commentaires
      if (Math.random() > 0.7) {
        const additionalNotes = [
          ' Merci pour cette session !',
          ' À recommander sans hésitation.',
          ' Hâte de mettre en pratique ces conseils.',
          ' Session qui dépasse mes attentes.',
          ' Parfait accompagnement pour notre équipe.'
        ]
        comments += additionalNotes[Math.floor(Math.random() * additionalNotes.length)]
      }

      // Date de création du feedback (1-14 jours après la consultation)
      const feedbackDate = new Date(appointment.completedAt)
      feedbackDate.setDate(feedbackDate.getDate() + Math.floor(Math.random() * 14) + 1)

      try {
        await prisma.consultationFeedback.create({
          data: {
            appointmentId: appointment.id,
            rating,
            satisfactionLevel,
            wouldRecommend,
            comments,
            improvementAreas: selectedImprovementAreas,
            strengths: selectedStrengths,
            createdAt: feedbackDate
          }
        })

        feedbackCount++
      } catch (error) {
        console.error(`Erreur création feedback pour ${appointment.id}:`, error.message)
      }
    }

    // 7. Afficher les statistiques finales
    const totalFeedbacks = await prisma.consultationFeedback.count()
    const avgRating = await prisma.consultationFeedback.aggregate({
      _avg: { rating: true }
    })
    
    const recommendationCount = await prisma.consultationFeedback.count({
      where: { wouldRecommend: true }
    })

    const recommendationRate = totalFeedbacks > 0 
      ? Math.round((recommendationCount / totalFeedbacks) * 100) 
      : 0

    console.log('✅ Seeding des retours terminé avec succès!')
    console.log(`📊 ${feedbackCount} nouveaux retours créés`)
    console.log(`📈 Total retours: ${totalFeedbacks}`)
    console.log(`⭐ Note moyenne: ${avgRating._avg.rating?.toFixed(1) || 0}/5`)
    console.log(`👍 Taux de recommandation: ${recommendationRate}%`)

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 