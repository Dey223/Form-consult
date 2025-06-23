const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding des sessions de formation...')

  try {
    // 1. Récupérer les formations existantes
    const formations = await prisma.formation.findMany({
      take: 5,
      include: {
        author: true
      }
    })

    if (formations.length === 0) {
      console.log('❌ Aucune formation trouvée. Veuillez d\'abord créer des formations.')
      return
    }

    // 2. Récupérer les utilisateurs EMPLOYE
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYE' },
      take: 10
    })

    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé. Veuillez d\'abord créer des employés.')
      return
    }

    // 3. Créer des sessions de formation pour les 30 prochains jours
    const sessions = []
    const startDate = new Date()
    
    for (let i = 0; i < 30; i++) {
      const sessionDate = new Date(startDate)
      sessionDate.setDate(startDate.getDate() + i)
      
      // Éviter les weekends
      if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) {
        continue
      }

      // Créer 1-3 sessions par jour
      const sessionsPerDay = Math.floor(Math.random() * 3) + 1
      
      for (let j = 0; j < sessionsPerDay; j++) {
        const formation = formations[Math.floor(Math.random() * formations.length)]
        
        // Heures possibles: 9h, 14h, 16h
        const hours = [9, 14, 16]
        const hour = hours[j % hours.length]
        
        const sessionStart = new Date(sessionDate)
        sessionStart.setHours(hour, 0, 0, 0)
        
        const sessionEnd = new Date(sessionStart)
        sessionEnd.setHours(hour + 2, 0, 0, 0) // 2h de formation
        
        sessions.push({
          formationId: formation.id,
          title: `Session: ${formation.title}`,
          description: `Session de formation en ligne pour ${formation.title}. Découvrez les concepts clés et mettez en pratique vos nouvelles compétences.`,
          startDate: sessionStart,
          endDate: sessionEnd,
          location: Math.random() > 0.3 ? 'En ligne' : `Salle ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
          maxAttendees: Math.floor(Math.random() * 15) + 10, // 10-25 participants
          instructorId: formation.authorId,
          meetingUrl: 'https://meet.example.com/session-' + Date.now() + Math.random()
        })
      }
    }

    console.log(`📅 Création de ${sessions.length} sessions...`)
    
    // Créer toutes les sessions
    for (const sessionData of sessions) {
      await prisma.formationSession.create({
        data: sessionData
      })
    }

    // 4. Inscrire aléatoirement des employés aux sessions
    console.log('👥 Inscription des employés aux sessions...')
    
    const createdSessions = await prisma.formationSession.findMany()
    let registrationsCount = 0

    for (const session of createdSessions) {
      // Inscrire 30-80% de la capacité
      const registrationCount = Math.floor(session.maxAttendees * (0.3 + Math.random() * 0.5))
      const selectedEmployees = employees.sort(() => 0.5 - Math.random()).slice(0, registrationCount)
      
      for (const employee of selectedEmployees) {
        try {
          // Vérifier que l'employé a accès à cette formation
          const userFormation = await prisma.userFormation.findFirst({
            where: {
              userId: employee.id,
              formationId: session.formationId
            }
          })

          if (userFormation) {
            await prisma.sessionAttendance.create({
              data: {
                sessionId: session.id,
                userId: employee.id,
                isConfirmed: Math.random() > 0.2, // 80% confirmés
                registeredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Inscrit dans les 7 derniers jours
              }
            })
            registrationsCount++
          }
        } catch (error) {
          // Ignore les doublons
          continue
        }
      }
    }

    // 5. Créer des activités d'apprentissage passées
    console.log('📊 Création des activités d\'apprentissage...')
    
    const activityTypes = [
      'lesson_start',
      'lesson_complete', 
      'lesson_progress',
      'quiz_attempt',
      'quiz_complete',
      'session_join',
      'session_complete',
      'formation_start',
      'formation_progress'
    ]

    let activitiesCount = 0

    for (const employee of employees) {
      // Récupérer les formations de l'employé
      const userFormations = await prisma.userFormation.findMany({
        where: { userId: employee.id },
        include: { formation: true }
      })

      for (const userFormation of userFormations) {
        // Créer 5-20 activités par formation
        const activityCount = Math.floor(Math.random() * 16) + 5
        
        for (let i = 0; i < activityCount; i++) {
          const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)]
          const timeSpent = Math.floor(Math.random() * 3600) + 300 // 5min - 1h
          
          // Date aléatoire dans les 30 derniers jours
          const activityDate = new Date()
          activityDate.setDate(activityDate.getDate() - Math.floor(Math.random() * 30))
          
          await prisma.learningActivity.create({
            data: {
              userId: employee.id,
              formationId: userFormation.formationId,
              activityType,
              timeSpent,
              createdAt: activityDate,
              data: {
                sessionDuration: timeSpent,
                completionRate: Math.floor(Math.random() * 100),
                score: activityType.includes('quiz') ? Math.floor(Math.random() * 100) : null
              }
            }
          })
          activitiesCount++
        }
      }
    }

    console.log('✅ Seeding terminé avec succès!')
    console.log(`📅 ${sessions.length} sessions de formation créées`)
    console.log(`👥 ${registrationsCount} inscriptions créées`)
    console.log(`📊 ${activitiesCount} activités d'apprentissage créées`)

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