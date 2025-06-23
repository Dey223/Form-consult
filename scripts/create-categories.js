const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createCategories() {
  try {
    console.log('🚀 Création des catégories et niveaux...\n')

    // Créer les niveaux
    const levels = [
      { name: 'Débutant', order: 1, description: 'Pour les personnes qui découvrent le sujet' },
      { name: 'Intermédiaire', order: 2, description: 'Pour ceux qui ont des bases' },
      { name: 'Avancé', order: 3, description: 'Pour les experts' },
      { name: 'Expert', order: 4, description: 'Niveau professionnel' }
    ]

    console.log('📊 Création des niveaux...')
    for (const levelData of levels) {
      const existingLevel = await prisma.level.findUnique({
        where: { name: levelData.name }
      })

      if (!existingLevel) {
        const level = await prisma.level.create({
          data: levelData
        })
        console.log(`✅ Niveau créé: ${level.name}`)
      } else {
        console.log(`⚠️  Niveau déjà existant: ${levelData.name}`)
      }
    }

    // Créer les catégories avec sous-catégories
    const categoriesData = [
      {
        name: 'Développement Web',
        description: 'Formations sur le développement web et les technologies associées',
        subCategories: [
          { name: 'Frontend', description: 'HTML, CSS, JavaScript, React, Vue.js' },
          { name: 'Backend', description: 'Node.js, PHP, Python, Java' },
          { name: 'Full Stack', description: 'Développement complet frontend et backend' },
          { name: 'DevOps', description: 'Déploiement, CI/CD, Docker' }
        ]
      },
      {
        name: 'Design',
        description: 'Formations sur le design graphique et UX/UI',
        subCategories: [
          { name: 'UI/UX Design', description: 'Interface utilisateur et expérience utilisateur' },
          { name: 'Design Graphique', description: 'Photoshop, Illustrator, InDesign' },
          { name: 'Web Design', description: 'Design pour le web' },
          { name: 'Motion Design', description: 'Animation et motion graphics' }
        ]
      },
      {
        name: 'Marketing Digital',
        description: 'Formations sur le marketing en ligne',
        subCategories: [
          { name: 'SEO/SEA', description: 'Référencement naturel et payant' },
          { name: 'Réseaux Sociaux', description: 'Marketing sur les réseaux sociaux' },
          { name: 'Email Marketing', description: 'Campagnes email et automation' },
          { name: 'Analytics', description: 'Analyse de données et performance' }
        ]
      },
      {
        name: 'Gestion de Projet',
        description: 'Méthodologies et outils de gestion de projet',
        subCategories: [
          { name: 'Agile/Scrum', description: 'Méthodologies agiles' },
          { name: 'Management', description: 'Leadership et gestion d\'équipe' },
          { name: 'Outils', description: 'Jira, Trello, Asana' },
          { name: 'Certification', description: 'PMP, Prince2, PSM' }
        ]
      },
      {
        name: 'Data Science',
        description: 'Analyse de données et intelligence artificielle',
        subCategories: [
          { name: 'Python/R', description: 'Langages pour la data science' },
          { name: 'Machine Learning', description: 'Apprentissage automatique' },
          { name: 'Big Data', description: 'Traitement de gros volumes de données' },
          { name: 'Visualisation', description: 'Tableau, Power BI, D3.js' }
        ]
      }
    ]

    console.log('\n📚 Création des catégories...')
    for (const categoryData of categoriesData) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: categoryData.name }
      })

      if (!existingCategory) {
        const category = await prisma.category.create({
          data: {
            name: categoryData.name,
            description: categoryData.description
          }
        })
        console.log(`✅ Catégorie créée: ${category.name}`)

        // Créer les sous-catégories
        for (const subCatData of categoryData.subCategories) {
          const subCategory = await prisma.subCategory.create({
            data: {
              name: subCatData.name,
              description: subCatData.description,
              categoryId: category.id
            }
          })
          console.log(`  ✅ Sous-catégorie créée: ${subCategory.name}`)
        }
      } else {
        console.log(`⚠️  Catégorie déjà existante: ${categoryData.name}`)
      }
    }

    console.log('\n🎉 Toutes les catégories et niveaux ont été créés avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function listCategories() {
  try {
    console.log('📚 Liste des catégories existantes:\n')

    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
        _count: {
          select: { formations: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`)
      console.log(`   ID: ${category.id}`)
      console.log(`   Description: ${category.description || 'Aucune'}`)
      console.log(`   Formations: ${category._count.formations}`)
      console.log(`   Sous-catégories: ${category.subCategories.length}`)
      
      category.subCategories.forEach((sub, subIndex) => {
        console.log(`     ${subIndex + 1}. ${sub.name} (ID: ${sub.id})`)
      })
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function listLevels() {
  try {
    console.log('📊 Liste des niveaux existants:\n')

    const levels = await prisma.level.findMany({
      orderBy: { order: 'asc' }
    })

    levels.forEach((level, index) => {
      console.log(`${index + 1}. ${level.name}`)
      console.log(`   ID: ${level.id}`)
      console.log(`   Ordre: ${level.order}`)
      console.log(`   Description: ${level.description || 'Aucune'}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('📚 Script de gestion des catégories et niveaux')
    console.log('═'.repeat(50))
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/create-categories.js create       # Créer les catégories et niveaux')
    console.log('  node scripts/create-categories.js list-cats    # Lister les catégories')
    console.log('  node scripts/create-categories.js list-levels  # Lister les niveaux')
    console.log('')
    return
  }

  const command = args[0]

  switch (command) {
    case 'create':
      await createCategories()
      break
      
    case 'list-cats':
      await listCategories()
      break
      
    case 'list-levels':
      await listLevels()
      break
      
    default:
      console.log(`❌ Commande inconnue: ${command}`)
      console.log('Utilisez: create, list-cats, ou list-levels')
  }
}

// Exécuter le script
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}

module.exports = {
  createCategories,
  listCategories,
  listLevels
} 