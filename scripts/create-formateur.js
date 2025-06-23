const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createFormateur() {
  try {
    console.log('🚀 Création d\'un nouveau formateur...\n')

    // Données du formateur à créer
    const formateurData = {
      name: 'Dr. Marie Dubois',
      email: 'marie.dubois@formconsult.com',
      password: 'formateur123',
      role: 'FORMATEUR'
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: formateurData.email }
    })

    if (existingUser) {
      console.log(`❌ Un utilisateur avec l'email ${formateurData.email} existe déjà`)
      return
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(formateurData.password, 12)

    // Créer le formateur
    const formateur = await prisma.user.create({
      data: {
        name: formateurData.name,
        email: formateurData.email,
        password: hashedPassword,
        role: formateurData.role,
        emailVerified: new Date() // Marquer comme vérifié
      }
    })

    console.log('✅ Formateur créé avec succès!')
    console.log('📋 Détails du formateur:')
    console.log(`   ID: ${formateur.id}`)
    console.log(`   Nom: ${formateur.name}`)
    console.log(`   Email: ${formateur.email}`)
    console.log(`   Rôle: ${formateur.role}`)
    console.log(`   Créé le: ${formateur.createdAt.toLocaleString('fr-FR')}`)
    
    console.log('\n🔑 Informations de connexion:')
    console.log(`   Email: ${formateurData.email}`)
    console.log(`   Mot de passe: ${formateurData.password}`)

  } catch (error) {
    console.error('❌ Erreur lors de la création du formateur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour créer un formateur personnalisé
async function createCustomFormateur(name, email, password, companyId = null) {
  try {
    console.log(`🚀 Création du formateur: ${name}...\n`)

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(`❌ Un utilisateur avec l'email ${email} existe déjà`)
      return null
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer le formateur
    const formateur = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'FORMATEUR',
        emailVerified: new Date(),
        companyId
      },
      include: {
        company: true
      }
    })

    console.log('✅ Formateur créé avec succès!')
    console.log('📋 Détails du formateur:')
    console.log(`   ID: ${formateur.id}`)
    console.log(`   Nom: ${formateur.name}`)
    console.log(`   Email: ${formateur.email}`)
    console.log(`   Rôle: ${formateur.role}`)
    console.log(`   Entreprise: ${formateur.company?.name || 'Aucune'}`)
    console.log(`   Créé le: ${formateur.createdAt.toLocaleString('fr-FR')}`)
    
    console.log('\n🔑 Informations de connexion:')
    console.log(`   Email: ${email}`)
    console.log(`   Mot de passe: ${password}`)

    return formateur

  } catch (error) {
    console.error('❌ Erreur lors de la création du formateur:', error)
    return null
  }
}

// Fonction pour lister toutes les entreprises disponibles
async function listCompanies() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('\n🏢 Entreprises disponibles:')
    console.log('─'.repeat(60))
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`)
      console.log(`   ID: ${company.id}`)
      console.log(`   Email: ${company.email}`)
      console.log(`   Utilisateurs: ${company._count.users}`)
      console.log('')
    })

    return companies
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des entreprises:', error)
    return []
  }
}

// Fonction pour créer plusieurs formateurs d'exemple
async function createSampleFormateurs() {
  try {
    console.log('🚀 Création de formateurs d\'exemple...\n')

    const sampleFormateurs = [
      {
        name: 'Dr. Marie Dubois',
        email: 'marie.dubois@formconsult.com',
        password: 'formateur123'
      },
      {
        name: 'Prof. Jean Martin',
        email: 'jean.martin@formconsult.com',
        password: 'formateur123'
      },
      {
        name: 'Sophie Leclerc',
        email: 'sophie.leclerc@formconsult.com',
        password: 'formateur123'
      },
      {
        name: 'Pierre Durand',
        email: 'pierre.durand@formconsult.com',
        password: 'formateur123'
      }
    ]

    const createdFormateurs = []

    for (const formateurData of sampleFormateurs) {
      const formateur = await createCustomFormateur(
        formateurData.name,
        formateurData.email,
        formateurData.password
      )
      
      if (formateur) {
        createdFormateurs.push(formateur)
      }
      
      // Petite pause entre les créations
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`\n🎉 ${createdFormateurs.length} formateurs créés avec succès!`)
    
    return createdFormateurs

  } catch (error) {
    console.error('❌ Erreur lors de la création des formateurs d\'exemple:', error)
    return []
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('📚 Script de création de formateurs')
    console.log('═'.repeat(50))
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/create-formateur.js default          # Créer un formateur par défaut')
    console.log('  node scripts/create-formateur.js custom <nom> <email> <password> [companyId]')
    console.log('  node scripts/create-formateur.js samples          # Créer plusieurs formateurs d\'exemple')
    console.log('  node scripts/create-formateur.js list-companies   # Lister les entreprises')
    console.log('')
    console.log('Exemples:')
    console.log('  node scripts/create-formateur.js default')
    console.log('  node scripts/create-formateur.js custom "Alice Dupont" "alice@example.com" "password123"')
    console.log('  node scripts/create-formateur.js samples')
    console.log('')
    return
  }

  const command = args[0]

  switch (command) {
    case 'default':
      await createFormateur()
      break
      
    case 'custom':
      if (args.length < 4) {
        console.log('❌ Usage: node scripts/create-formateur.js custom <nom> <email> <password> [companyId]')
        return
      }
      await createCustomFormateur(args[1], args[2], args[3], args[4] || null)
      break
      
    case 'samples':
      await createSampleFormateurs()
      break
      
    case 'list-companies':
      await listCompanies()
      break
      
    default:
      console.log(`❌ Commande inconnue: ${command}`)
      console.log('Utilisez: default, custom, samples, ou list-companies')
  }
}

// Exécuter le script
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}

module.exports = {
  createFormateur,
  createCustomFormateur,
  listCompanies,
  createSampleFormateurs
} 