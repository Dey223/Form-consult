import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding...')

  // Nettoyer les données existantes
  await prisma.userFormation.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.muxData.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.section.deleteMany()
  await prisma.formation.deleteMany()
  await prisma.subCategory.deleteMany()
  await prisma.category.deleteMany()
  await prisma.level.deleteMany()
  await prisma.user.deleteMany()

  // 1. Créer les niveaux
  const levels = await Promise.all([
    prisma.level.create({
      data: {
        name: 'Débutant',
        description: 'Pour ceux qui découvrent le domaine',
        order: 1,
      },
    }),
    prisma.level.create({
      data: {
        name: 'Intermédiaire',
        description: 'Pour ceux qui ont quelques bases',
        order: 2,
      },
    }),
    prisma.level.create({
      data: {
        name: 'Avancé',
        description: 'Pour les experts qui veulent se perfectionner',
        order: 3,
      },
    }),
  ])

  // 2. Créer les catégories et sous-catégories
  const webDev = await prisma.category.create({
    data: {
      name: 'Développement Web',
      description: 'Création de sites web et applications',
      subCategories: {
        create: [
          { name: 'Frontend', description: 'React, Vue, Angular, etc.' },
          { name: 'Backend', description: 'Node.js, Python, PHP, etc.' },
          { name: 'Fullstack', description: 'Développement complet' },
        ],
      },
    },
    include: { subCategories: true },
  })

  const design = await prisma.category.create({
    data: {
      name: 'Design & UX',
      description: 'Design d\'interface et expérience utilisateur',
      subCategories: {
        create: [
          { name: 'UI Design', description: 'Design d\'interfaces' },
          { name: 'UX Design', description: 'Expérience utilisateur' },
          { name: 'Outils Design', description: 'Figma, Sketch, Adobe, etc.' },
        ],
      },
    },
    include: { subCategories: true },
  })

  const marketing = await prisma.category.create({
    data: {
      name: 'Marketing Digital',
      description: 'Stratégies marketing en ligne',
      subCategories: {
        create: [
          { name: 'SEO', description: 'Référencement naturel' },
          { name: 'Réseaux Sociaux', description: 'Marketing sur les réseaux' },
          { name: 'Publicité', description: 'Google Ads, Facebook Ads, etc.' },
        ],
      },
    },
    include: { subCategories: true },
  })

  // 3. Créer des utilisateurs de test
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const formateur1 = await prisma.user.create({
    data: {
      email: 'formateur1@test.com',
      name: 'Marie Dubois',
      password: hashedPassword,
      role: 'FORMATEUR',
    },
  })

  const formateur2 = await prisma.user.create({
    data: {
      email: 'formateur2@test.com',
      name: 'Pierre Martin',
      password: hashedPassword,
      role: 'FORMATEUR',
    },
  })

  const student1 = await prisma.user.create({
    data: {
      email: 'etudiant1@test.com',
      name: 'Sophie Laurent',
      password: hashedPassword,
      role: 'EMPLOYE',
    },
  })

  const student2 = await prisma.user.create({
    data: {
      email: 'etudiant2@test.com',
      name: 'Thomas Durand',
      password: hashedPassword,
      role: 'EMPLOYE',
    },
  })

  // 4. Créer des formations d'exemple
  const formation1 = await prisma.formation.create({
    data: {
      title: 'React pour Débutants - Guide Complet',
      description: 'Apprenez React depuis zéro avec ce guide complet. Maîtrisez les composants, hooks, et l\'écosystème React moderne.',
      overview: 'Cette formation vous permettra de créer vos premières applications React. Nous couvrirons les concepts fondamentaux, les bonnes pratiques, et vous construirez plusieurs projets pratiques.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
      price: 99.99,
      level: 'DEBUTANT',
      isActive: true,
      categoryId: webDev.id,
      subCategoryId: webDev.subCategories[0].id, // Frontend
      levelId: levels[0].id, // Débutant
      authorId: formateur1.id,
    },
  })

  const formation2 = await prisma.formation.create({
    data: {
      title: 'Design System avec Figma',
      description: 'Créez des design systems professionnels avec Figma. Composants, tokens, et workflow collaboratif.',
      overview: 'Maîtrisez la création de design systems cohérents et scalables. Cette formation couvre les composants, la gestion des tokens de design, et les workflow d\'équipe.',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
      price: 149.99,
      level: 'INTERMEDIAIRE',
      isActive: true,
      categoryId: design.id,
      subCategoryId: design.subCategories[2].id, // Outils Design
      levelId: levels[1].id, // Intermédiaire
      authorId: formateur2.id,
    },
  })

  const formation3 = await prisma.formation.create({
    data: {
      title: 'SEO Avancé - Techniques 2024',
      description: 'Techniques SEO avancées pour dominer les SERPs. Core Web Vitals, E-A-T, et stratégies modernes.',
      overview: 'Formation complète sur le SEO moderne. Apprenez les dernières techniques, l\'analyse de données, et les stratégies qui fonctionnent vraiment en 2024.',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
      price: 199.99,
      level: 'AVANCE',
      isActive: true,
      categoryId: marketing.id,
      subCategoryId: marketing.subCategories[0].id, // SEO
      levelId: levels[2].id, // Avancé
      authorId: formateur1.id,
    },
  })

  // 5. Créer des sections pour la formation React
  const section1 = await prisma.section.create({
    data: {
      title: 'Introduction à React',
      description: 'Les bases de React et son écosystème',
      orderIndex: 1,
      isPublished: true,
      isFree: true,
      formationId: formation1.id,
    },
  })

  const section2 = await prisma.section.create({
    data: {
      title: 'Composants et Props',
      description: 'Création et utilisation des composants React',
      orderIndex: 2,
      isPublished: true,
      isFree: false,
      formationId: formation1.id,
    },
  })

  const section3 = await prisma.section.create({
    data: {
      title: 'State et Hooks',
      description: 'Gestion d\'état avec useState et useEffect',
      orderIndex: 3,
      isPublished: true,
      isFree: false,
      formationId: formation1.id,
    },
  })

  // 6. Créer des leçons
  await prisma.lesson.createMany({
    data: [
      // Section 1 - Introduction
      {
        title: 'Qu\'est-ce que React ?',
        description: 'Introduction aux concepts de base de React',
        type: 'VIDEO',
        duration: 480, // 8 minutes
        orderIndex: 1,
        isPublished: true,
        isFree: true,
        sectionId: section1.id,
      },
      {
        title: 'Installation et configuration',
        description: 'Mise en place de l\'environnement de développement',
        type: 'VIDEO',
        duration: 720, // 12 minutes
        orderIndex: 2,
        isPublished: true,
        isFree: true,
        sectionId: section1.id,
      },
      {
        title: 'Premier composant React',
        description: 'Création de votre premier composant',
        type: 'VIDEO',
        duration: 900, // 15 minutes
        orderIndex: 3,
        isPublished: true,
        isFree: false,
        sectionId: section1.id,
      },
      // Section 2 - Composants
      {
        title: 'Anatomie d\'un composant',
        description: 'Structure et syntaxe des composants React',
        type: 'VIDEO',
        duration: 600, // 10 minutes
        orderIndex: 1,
        isPublished: true,
        isFree: false,
        sectionId: section2.id,
      },
      {
        title: 'Passage de props',
        description: 'Communication entre composants avec les props',
        type: 'VIDEO',
        duration: 840, // 14 minutes
        orderIndex: 2,
        isPublished: true,
        isFree: false,
        sectionId: section2.id,
      },
      // Section 3 - State et Hooks
      {
        title: 'Introduction au state',
        description: 'Comprendre la gestion d\'état dans React',
        type: 'VIDEO',
        duration: 720, // 12 minutes
        orderIndex: 1,
        isPublished: true,
        isFree: false,
        sectionId: section3.id,
      },
      {
        title: 'Hook useState',
        description: 'Utilisation du hook useState pour l\'état local',
        type: 'VIDEO',
        duration: 960, // 16 minutes
        orderIndex: 2,
        isPublished: true,
        isFree: false,
        sectionId: section3.id,
      },
      {
        title: 'Hook useEffect',
        description: 'Effets de bord et cycle de vie avec useEffect',
        type: 'VIDEO',
        duration: 1200, // 20 minutes
        orderIndex: 3,
        isPublished: true,
        isFree: false,
        sectionId: section3.id,
      },
    ],
  })

  // 7. Créer des ressources
  await prisma.resource.createMany({
    data: [
      {
        name: 'Guide PDF React Basics',
        description: 'Guide complet au format PDF sur les bases de React',
        fileUrl: 'https://example.com/react-basics.pdf',
        fileSize: 2048000,
        fileType: 'application/pdf',
        formationId: formation1.id,
      },
      {
        name: 'Code source des exercices',
        description: 'Fichier ZIP contenant tous les exercices du cours',
        fileUrl: 'https://example.com/react-exercises.zip',
        fileSize: 5120000,
        fileType: 'application/zip',
        formationId: formation1.id,
      },
      {
        name: 'Template Figma Design System',
        description: 'Template Figma pour créer votre design system',
        fileUrl: 'https://example.com/design-system-template.fig',
        fileSize: 1024000,
        fileType: 'application/figma',
        formationId: formation2.id,
      },
    ],
  })

  // 8. Créer des inscriptions d'étudiants
  await prisma.userFormation.createMany({
    data: [
      {
        userId: student1.id,
        formationId: formation1.id,
        progress: 45,
        completedAt: null,
      },
      {
        userId: student2.id,
        formationId: formation1.id,
        progress: 100,
        completedAt: new Date('2024-01-15'),
      },
      {
        userId: student1.id,
        formationId: formation2.id,
        progress: 20,
        completedAt: null,
      },
    ],
  })

  console.log('✅ Seeding terminé avec succès !')
  console.log('📊 Données créées :')
  console.log('- 3 niveaux')
  console.log('- 3 catégories avec sous-catégories')
  console.log('- 4 utilisateurs (2 formateurs, 2 étudiants)')
  console.log('- 3 formations')
  console.log('- 3 sections')
  console.log('- 8 leçons')
  console.log('- 3 ressources')
  console.log('- 3 inscriptions d\'étudiants')
  console.log('')
  console.log('🔑 Comptes de test :')
  console.log('Formateur 1: formateur1@test.com / password123')
  console.log('Formateur 2: formateur2@test.com / password123')
  console.log('Étudiant 1: etudiant1@test.com / password123')
  console.log('Étudiant 2: etudiant2@test.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 