const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function listAllUsers() {
  try {
    console.log('👥 Liste de tous les utilisateurs')
    console.log('═'.repeat(80))
    console.log('')

    const users = await prisma.user.findMany({
      include: {
        company: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            authoredFormations: true,
            userFormations: true,
            appointments: true,
            consultantAppointments: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données')
      return
    }

    // Grouper par rôle
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = []
      }
      acc[user.role].push(user)
      return acc
    }, {})

    // Afficher les statistiques globales
    console.log('📊 Statistiques globales:')
    console.log(`   Total utilisateurs: ${users.length}`)
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`   ${role}: ${roleUsers.length}`)
    })
    console.log('')

    // Afficher par rôle
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`🏷️  ${role} (${roleUsers.length})`)
      console.log('─'.repeat(60))
      
      roleUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Nom non défini'}`)
        console.log(`   📧 Email: ${user.email}`)
        console.log(`   🆔 ID: ${user.id}`)
        console.log(`   🏢 Entreprise: ${user.company?.name || 'Aucune'}`)
        console.log(`   ✅ Vérifié: ${user.emailVerified ? 'Oui' : 'Non'}`)
        console.log(`   📅 Créé le: ${user.createdAt.toLocaleString('fr-FR')}`)
        
        // Statistiques spécifiques au rôle
        if (user.role === 'FORMATEUR') {
          console.log(`   📚 Formations créées: ${user._count.authoredFormations}`)
        }
        if (user.role === 'EMPLOYE') {
          console.log(`   🎓 Formations suivies: ${user._count.userFormations}`)
        }
        if (user.role === 'CONSULTANT') {
          console.log(`   💼 Consultations données: ${user._count.consultantAppointments}`)
        }
        console.log(`   📞 Rendez-vous pris: ${user._count.appointments}`)
        console.log('')
      })
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function listUsersByRole(role) {
  try {
    console.log(`👥 Utilisateurs avec le rôle: ${role}`)
    console.log('═'.repeat(60))
    console.log('')

    const users = await prisma.user.findMany({
      where: {
        role: role.toUpperCase()
      },
      include: {
        company: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log(`❌ Aucun utilisateur trouvé avec le rôle ${role}`)
      return
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Nom non défini'}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   🏢 Entreprise: ${user.company?.name || 'Aucune'}`)
      console.log(`   ✅ Vérifié: ${user.emailVerified ? 'Oui' : 'Non'}`)
      console.log(`   📅 Créé le: ${user.createdAt.toLocaleString('fr-FR')}`)
      console.log('')
    })

    console.log(`📊 Total: ${users.length} utilisateur(s) avec le rôle ${role}`)

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function listUsersByCompany(companyId) {
  try {
    console.log(`🏢 Utilisateurs de l'entreprise: ${companyId}`)
    console.log('═'.repeat(60))
    console.log('')

    // D'abord récupérer les infos de l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        email: true
      }
    })

    if (!company) {
      console.log(`❌ Entreprise avec l'ID ${companyId} introuvable`)
      return
    }

    console.log(`🏢 Entreprise: ${company.name} (${company.email})`)
    console.log('')

    const users = await prisma.user.findMany({
      where: {
        companyId: companyId
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    if (users.length === 0) {
      console.log(`❌ Aucun utilisateur trouvé pour cette entreprise`)
      return
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Nom non défini'}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🏷️  Rôle: ${user.role}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   ✅ Vérifié: ${user.emailVerified ? 'Oui' : 'Non'}`)
      console.log(`   📅 Créé le: ${user.createdAt.toLocaleString('fr-FR')}`)
      console.log('')
    })

    console.log(`📊 Total: ${users.length} utilisateur(s) dans cette entreprise`)

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('👥 Script de listage des utilisateurs')
    console.log('═'.repeat(50))
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/list-users.js all                    # Lister tous les utilisateurs')
    console.log('  node scripts/list-users.js role <role>            # Lister par rôle')
    console.log('  node scripts/list-users.js company <companyId>    # Lister par entreprise')
    console.log('')
    console.log('Rôles disponibles:')
    console.log('  SUPER_ADMIN, ADMIN_ENTREPRISE, EMPLOYE, CONSULTANT, FORMATEUR')
    console.log('')
    console.log('Exemples:')
    console.log('  node scripts/list-users.js all')
    console.log('  node scripts/list-users.js role FORMATEUR')
    console.log('  node scripts/list-users.js company cmbxxw1ki000uuc80yt2mgwzr')
    console.log('')
    return
  }

  const command = args[0]

  switch (command) {
    case 'all':
      await listAllUsers()
      break
      
    case 'role':
      if (args.length < 2) {
        console.log('❌ Usage: node scripts/list-users.js role <role>')
        return
      }
      await listUsersByRole(args[1])
      break
      
    case 'company':
      if (args.length < 2) {
        console.log('❌ Usage: node scripts/list-users.js company <companyId>')
        return
      }
      await listUsersByCompany(args[1])
      break
      
    default:
      console.log(`❌ Commande inconnue: ${command}`)
      console.log('Utilisez: all, role, ou company')
  }
}

// Exécuter le script
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}

module.exports = {
  listAllUsers,
  listUsersByRole,
  listUsersByCompany
} 