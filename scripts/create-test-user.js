const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Créer un utilisateur formateur de test
    const user = await prisma.user.upsert({
      where: { email: 'formateur@test.com' },
      update: {},
      create: {
        email: 'formateur@test.com',
        name: 'Formateur Test',
        password: hashedPassword,
        role: 'FORMATEUR',
      },
    });

    console.log('✅ Utilisateur créé avec succès:', user);
    
    // Créer quelques catégories de base si elles n'existent pas
    const webCategory = await prisma.category.upsert({
      where: { name: 'Développement Web' },
      update: {},
      create: {
        name: 'Développement Web',
        description: 'Créer des sites web et applications',
      },
    });

    const frontendSubCategory = await prisma.subCategory.upsert({
      where: { 
        categoryId_name: { 
          categoryId: webCategory.id, 
          name: 'Frontend' 
        } 
      },
      update: {},
      create: {
        name: 'Frontend',
        description: 'React, Vue, Angular',
        categoryId: webCategory.id,
      },
    });

    const level = await prisma.level.upsert({
      where: { name: 'Débutant' },
      update: {},
      create: {
        name: 'Débutant',
        description: 'Pour les débutants',
        order: 1,
      },
    });

    console.log('✅ Données de base créées');
    console.log('📧 Email: formateur@test.com');
    console.log('🔑 Mot de passe: password123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 