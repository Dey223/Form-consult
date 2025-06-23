const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugFormations() {
  try {
    console.log('🔍 Diagnostic des formations et leurs relations...\n')

    // Récupérer toutes les formations
    const formations = await prisma.formation.findMany({
      include: {
        category: true,
        subCategory: true,
        levelRelation: true,
        author: {
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

    if (formations.length === 0) {
      console.log('❌ Aucune formation trouvée dans la base de données')
      return
    }

    console.log(`📚 ${formations.length} formation(s) trouvée(s):\n`)

    formations.forEach((formation, index) => {
      console.log(`${index + 1}. ${formation.title}`)
      console.log(`   ID: ${formation.id}`)
      console.log(`   Auteur: ${formation.author?.name || 'Inconnu'} (${formation.author?.email || 'N/A'})`)
      console.log(`   Publié: ${formation.isPublished ? 'Oui' : 'Non'}`)
      console.log(`   Niveau: ${formation.level}`)
      
      // Vérifier les relations
      console.log(`   Catégorie ID: ${formation.categoryId || 'Non défini'}`)
      if (formation.categoryId) {
        if (formation.category) {
          console.log(`   ✅ Catégorie: ${formation.category.name}`)
        } else {
          console.log(`   ❌ Catégorie MANQUANTE (ID: ${formation.categoryId})`)
        }
      }
      
      console.log(`   Sous-catégorie ID: ${formation.subCategoryId || 'Non défini'}`)
      if (formation.subCategoryId) {
        if (formation.subCategory) {
          console.log(`   ✅ Sous-catégorie: ${formation.subCategory.name}`)
        } else {
          console.log(`   ❌ Sous-catégorie MANQUANTE (ID: ${formation.subCategoryId})`)
        }
      }
      
      console.log(`   Niveau ID: ${formation.levelId || 'Non défini'}`)
      if (formation.levelId) {
        if (formation.levelRelation) {
          console.log(`   ✅ Niveau: ${formation.levelRelation.name}`)
        } else {
          console.log(`   ❌ Niveau MANQUANT (ID: ${formation.levelId})`)
        }
      }
      
      console.log(`   Créé le: ${formation.createdAt.toLocaleString('fr-FR')}`)
      console.log('')
    })

    // Vérifier les relations cassées
    console.log('🔍 Vérification des relations cassées...\n')
    
    const brokenRelations = formations.filter(f => 
      (f.categoryId && !f.category) ||
      (f.subCategoryId && !f.subCategory) ||
      (f.levelId && !f.levelRelation)
    )

    if (brokenRelations.length > 0) {
      console.log(`❌ ${brokenRelations.length} formation(s) avec des relations cassées:`)
      brokenRelations.forEach(formation => {
        console.log(`- ${formation.title} (ID: ${formation.id})`)
        if (formation.categoryId && !formation.category) {
          console.log(`  ❌ Catégorie manquante: ${formation.categoryId}`)
        }
        if (formation.subCategoryId && !formation.subCategory) {
          console.log(`  ❌ Sous-catégorie manquante: ${formation.subCategoryId}`)
        }
        if (formation.levelId && !formation.levelRelation) {
          console.log(`  ❌ Niveau manquant: ${formation.levelId}`)
        }
      })
    } else {
      console.log('✅ Toutes les relations sont correctes')
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function fixBrokenRelations() {
  try {
    console.log('🔧 Réparation des relations cassées...\n')

    // Récupérer les formations avec des relations cassées
    const formations = await prisma.formation.findMany({
      include: {
        category: true,
        subCategory: true,
        levelRelation: true
      }
    })

    const brokenFormations = formations.filter(f => 
      (f.categoryId && !f.category) ||
      (f.subCategoryId && !f.subCategory) ||
      (f.levelId && !f.levelRelation)
    )

    if (brokenFormations.length === 0) {
      console.log('✅ Aucune relation cassée trouvée')
      return
    }

    console.log(`🔧 Réparation de ${brokenFormations.length} formation(s)...\n`)

    for (const formation of brokenFormations) {
      console.log(`Réparation de: ${formation.title}`)
      
      const updateData = {}
      
      // Réparer la catégorie cassée
      if (formation.categoryId && !formation.category) {
        console.log(`  ❌ Suppression de la catégorie cassée: ${formation.categoryId}`)
        updateData.categoryId = null
      }
      
      // Réparer la sous-catégorie cassée
      if (formation.subCategoryId && !formation.subCategory) {
        console.log(`  ❌ Suppression de la sous-catégorie cassée: ${formation.subCategoryId}`)
        updateData.subCategoryId = null
      }
      
      // Réparer le niveau cassé
      if (formation.levelId && !formation.levelRelation) {
        console.log(`  ❌ Suppression du niveau cassé: ${formation.levelId}`)
        updateData.levelId = null
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.formation.update({
          where: { id: formation.id },
          data: updateData
        })
        console.log(`  ✅ Formation réparée`)
      }
      console.log('')
    }

    console.log('🎉 Toutes les relations cassées ont été réparées!')

  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🔍 Script de diagnostic des formations')
    console.log('═'.repeat(50))
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/debug-formations.js debug      # Diagnostiquer les formations')
    console.log('  node scripts/debug-formations.js fix        # Réparer les relations cassées')
    console.log('')
    return
  }

  const command = args[0]

  switch (command) {
    case 'debug':
      await debugFormations()
      break
      
    case 'fix':
      await fixBrokenRelations()
      break
      
    default:
      console.log(`❌ Commande inconnue: ${command}`)
      console.log('Utilisez: debug ou fix')
  }
}

// Exécuter le script
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}

module.exports = {
  debugFormations,
  fixBrokenRelations
} 