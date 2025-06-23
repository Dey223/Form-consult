const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupCompleteData() {
  try {
    console.log('🚀 Configuration complète des données...');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // 1. Créer un utilisateur formateur
    const formateur = await prisma.user.upsert({
      where: { email: 'formateur@test.com' },
      update: {},
      create: {
        email: 'formateur@test.com',
        name: 'Formateur Test',
        password: hashedPassword,
        role: 'FORMATEUR',
      },
    });

    console.log('✅ Utilisateur formateur créé');

    // 2. Créer les niveaux
    const niveaux = await Promise.all([
      prisma.level.upsert({
        where: { name: 'Débutant' },
        update: {},
        create: {
          name: 'Débutant',
          description: 'Pour les débutants',
          order: 1,
        },
      }),
      prisma.level.upsert({
        where: { name: 'Intermédiaire' },
        update: {},
        create: {
          name: 'Intermédiaire',
          description: 'Pour ceux qui ont des bases',
          order: 2,
        },
      }),
      prisma.level.upsert({
        where: { name: 'Avancé' },
        update: {},
        create: {
          name: 'Avancé',
          description: 'Pour les experts',
          order: 3,
        },
      }),
    ]);

    console.log('✅ Niveaux créés');

    // 3. Créer les catégories et sous-catégories
    const webCategory = await prisma.category.upsert({
      where: { name: 'Développement Web' },
      update: {},
      create: {
        name: 'Développement Web',
        description: 'Créer des sites web et applications',
      },
    });

    const designCategory = await prisma.category.upsert({
      where: { name: 'Design & UX' },
      update: {},
      create: {
        name: 'Design & UX',
        description: 'Design d\'interface et UX',
      },
    });

    const marketingCategory = await prisma.category.upsert({
      where: { name: 'Marketing Digital' },
      update: {},
      create: {
        name: 'Marketing Digital',
        description: 'Stratégies marketing en ligne',
      },
    });

    // Sous-catégories Web
    const frontendSub = await prisma.subCategory.upsert({
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

    const backendSub = await prisma.subCategory.upsert({
      where: { 
        categoryId_name: { 
          categoryId: webCategory.id, 
          name: 'Backend' 
        } 
      },
      update: {},
      create: {
        name: 'Backend',
        description: 'Node.js, Python, PHP',
        categoryId: webCategory.id,
      },
    });

    // Sous-catégories Design
    const uiSub = await prisma.subCategory.upsert({
      where: { 
        categoryId_name: { 
          categoryId: designCategory.id, 
          name: 'UI Design' 
        } 
      },
      update: {},
      create: {
        name: 'UI Design',
        description: 'Design d\'interfaces',
        categoryId: designCategory.id,
      },
    });

    // Sous-catégories Marketing
    const seoSub = await prisma.subCategory.upsert({
      where: { 
        categoryId_name: { 
          categoryId: marketingCategory.id, 
          name: 'SEO' 
        } 
      },
      update: {},
      create: {
        name: 'SEO',
        description: 'Référencement naturel',
        categoryId: marketingCategory.id,
      },
    });

    console.log('✅ Catégories et sous-catégories créées');

    // 4. Créer une formation d'exemple
    const formation = await prisma.formation.create({
      data: {
        title: 'Formation React Complète',
        description: 'Apprenez React depuis les bases jusqu\'aux concepts avancés avec cette formation complète.',
        overview: 'Cette formation vous permettra de maîtriser React et de créer des applications web modernes.',
        price: 99.99,
        level: 'DEBUTANT',
        isActive: true,
        isPublished: false,
        categoryId: webCategory.id,
        subCategoryId: frontendSub.id,
        levelId: niveaux[0].id,
        authorId: formateur.id,
      },
    });

    console.log('✅ Formation d\'exemple créée');

    // 5. Créer des sections d'exemple
    const section1 = await prisma.section.create({
      data: {
        title: 'Introduction à React',
        description: 'Découvrez les bases de React',
        orderIndex: 1,
        isPublished: true,
        isFree: true,
        formationId: formation.id,
      },
    });

    const section2 = await prisma.section.create({
      data: {
        title: 'Composants et Props',
        description: 'Apprenez à créer et utiliser des composants',
        orderIndex: 2,
        isPublished: true,
        isFree: false,
        formationId: formation.id,
      },
    });

    console.log('✅ Sections d\'exemple créées');

    // 6. Créer des leçons d'exemple
    await prisma.lesson.createMany({
      data: [
        {
          title: 'Qu\'est-ce que React ?',
          description: 'Introduction aux concepts de base',
          orderIndex: 1,
          duration: 480, // 8 minutes
          type: 'VIDEO',
          isPublished: true,
          isFree: true,
          sectionId: section1.id,
        },
        {
          title: 'Installation et configuration',
          description: 'Mise en place de l\'environnement',
          orderIndex: 2,
          duration: 600, // 10 minutes
          type: 'VIDEO',
          isPublished: true,
          isFree: true,
          sectionId: section1.id,
        },
        {
          title: 'Votre premier composant',
          description: 'Création d\'un composant React',
          orderIndex: 1,
          duration: 720, // 12 minutes
          type: 'VIDEO',
          isPublished: true,
          isFree: false,
          sectionId: section2.id,
        },
      ],
    });

    console.log('✅ Leçons d\'exemple créées');

    console.log('\n🎉 Configuration terminée avec succès !');
    console.log('\n📋 Récapitulatif :');
    console.log('- 3 niveaux de difficulté');
    console.log('- 3 catégories avec sous-catégories');
    console.log('- 1 utilisateur formateur');
    console.log('- 1 formation d\'exemple');
    console.log('- 2 sections avec 3 leçons');
    console.log('\n🔑 Compte de test :');
    console.log('Email: formateur@test.com');
    console.log('Mot de passe: password123');
    console.log('\n🌐 Accès: http://localhost:3000/dashboard/formateur');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompleteData(); 