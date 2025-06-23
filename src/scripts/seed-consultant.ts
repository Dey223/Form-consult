import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedConsultant() {
  try {
    console.log('🌱 Création du consultant de test...')

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('123456789', 12)

    // Créer ou mettre à jour le consultant
    const consultant = await prisma.user.upsert({
      where: { email: 'consultant@example.com' },
      update: {
        password: hashedPassword,
        role: 'CONSULTANT'
      },
      create: {
        name: 'Consultant Test',
        email: 'consultant@example.com',
        password: hashedPassword,
        role: 'CONSULTANT',
        emailVerified: new Date() // Email vérifié
      }
    })

    console.log('✅ Consultant créé avec succès:')
    console.log(`📧 Email: ${consultant.email}`)
    console.log(`🔑 Mot de passe: 123456789`)
    console.log(`👤 Rôle: ${consultant.role}`)
    console.log(`🆔 ID: ${consultant.id}`)

    // Créer quelques créneaux de consultation d'exemple
    console.log('\n📅 Création de créneaux de consultation...')
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0) // 10h00 demain

    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(14, 0, 0, 0) // 14h00 après-demain

    // Créer une entreprise fictive pour les rendez-vous
    const company = await prisma.company.upsert({
      where: { email: 'test-company@example.com' },
      update: {},
      create: {
        name: 'Entreprise Test',
        email: 'test-company@example.com',
        phone: '01.23.45.67.89',
        address: '123 Rue du Test, Paris'
      }
    })

    // Créer un employé test pour les rendez-vous
    const employee = await prisma.user.upsert({
      where: { email: 'employe@example.com' },
      update: {},
      create: {
        name: 'Employé Test',
        email: 'employe@example.com',
        password: hashedPassword,
        role: 'EMPLOYE',
        companyId: company.id,
        emailVerified: new Date()
      }
    })

    await prisma.appointment.createMany({
      data: [
        {
          title: 'Consultation carrière - Développement professionnel',
          description: 'Session de conseil pour orientation de carrière dans le tech',
          scheduledAt: tomorrow,
          duration: 60, // 1h
          consultantId: consultant.id,
          companyId: company.id,
          userId: employee.id,
          status: 'PENDING'
        },
        {
          title: 'Coaching technique - Architecture logicielle',
          description: 'Session de conseil sur les bonnes pratiques d\'architecture',
          scheduledAt: dayAfter,
          duration: 90, // 1h30
          consultantId: consultant.id,
          companyId: company.id,
          userId: employee.id,
          status: 'PENDING'
        }
      ]
    })

    console.log('✅ 2 créneaux de consultation créés')

  } catch (error) {
    console.error('❌ Erreur lors de la création du consultant:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  seedConsultant()
    .then(() => {
      console.log('\n🎉 Script terminé avec succès!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error)
      process.exit(1)
    })
}

export default seedConsultant 