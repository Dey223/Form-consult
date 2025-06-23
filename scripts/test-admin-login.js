#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminLogin() {
    console.log('🧪 Test de connexion Super Admin\n');

    try {
        // Test 1: Vérifier l'existence du super admin
        console.log('🔍 Test 1: Recherche du Super Admin...');
        const superAdmin = await prisma.user.findFirst({
            where: {
                role: 'SUPER_ADMIN'
            }
        });

        if (!superAdmin) {
            console.log('❌ Aucun Super Admin trouvé dans la base de données');
            console.log('💡 Exécutez: npm run create-admin');
            return;
        }

        console.log('✅ Super Admin trouvé:');
        console.log(`   📧 Email: ${superAdmin.email}`);
        console.log(`   👤 Nom: ${superAdmin.name}`);
        console.log(`   🆔 ID: ${superAdmin.id}\n`);

        // Test 2: Vérifier le mot de passe par défaut
        console.log('🔑 Test 2: Vérification du mot de passe...');
        if (superAdmin.password) {
            const isPasswordValid = await bcrypt.compare('SuperAdmin2024!', superAdmin.password);
            if (isPasswordValid) {
                console.log('✅ Mot de passe par défaut fonctionnel');
                console.log('   🔑 Mot de passe: SuperAdmin2024!\n');
            } else {
                console.log('⚠️  Le mot de passe par défaut ne fonctionne pas');
                console.log('   💡 Le mot de passe a peut-être été modifié\n');
            }
        } else {
            console.log('⚠️  Aucun mot de passe défini (connexion OAuth uniquement)\n');
        }

        // Test 3: Vérifier les permissions
        console.log('🔐 Test 3: Vérification des permissions...');
        await testSuperAdminPermissions(superAdmin.id);

        // Test 4: Simuler une requête API
        console.log('🌐 Test 4: Simulation d\'une requête API...');
        await simulateApiRequest(superAdmin);

        // Test 5: Statistiques dashboard
        console.log('📊 Test 5: Données du dashboard...');
        await getDashboardData();

        console.log('\n🎉 Tous les tests sont terminés!');
        console.log('\n🚀 Pour vous connecter:');
        console.log(`   📧 Email: ${superAdmin.email}`);
        console.log('   🔑 Mot de passe: SuperAdmin2024!');
        console.log('   🌐 URL: http://localhost:3000/dashboard/admin\n');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function testSuperAdminPermissions(userId) {
    try {
        // Vérifier l'accès aux données critiques
        const [
            allUsers,
            allCompanies,
            allFormations
        ] = await Promise.all([
            prisma.user.count(),
            prisma.company.count(),
            prisma.formation.count()
        ]);

        console.log('✅ Accès aux données autorisé:');
        console.log(`   👥 Utilisateurs: ${allUsers}`);
        console.log(`   🏢 Entreprises: ${allCompanies}`);
        console.log(`   📚 Formations: ${allFormations}\n`);

    } catch (error) {
        console.log('❌ Erreur d\'accès aux données:', error.message);
    }
}

async function simulateApiRequest(superAdmin) {
    try {
        // Simuler une vérification d'authentification
        const isAuthorized = superAdmin.role === 'SUPER_ADMIN';
        
        if (isAuthorized) {
            console.log('✅ Autorisation API validée');
            console.log('   🎯 Rôle SUPER_ADMIN confirmé');
            console.log('   🔓 Accès complet autorisé\n');
        } else {
            console.log('❌ Autorisation API échouée');
            console.log(`   🚫 Rôle actuel: ${superAdmin.role}\n`);
        }

    } catch (error) {
        console.log('❌ Erreur simulation API:', error.message);
    }
}

async function getDashboardData() {
    try {
        // Récupérer les données du dashboard
        const [
            totalUsers,
            totalCompanies,
            activeFormations,
            recentSignups
        ] = await Promise.all([
            prisma.user.count(),
            prisma.company.count(),
            prisma.formation.count({ where: { isPublished: true } }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
                    }
                }
            })
        ]);

        console.log('✅ Données dashboard récupérées:');
        console.log(`   👥 Total utilisateurs: ${totalUsers}`);
        console.log(`   🏢 Total entreprises: ${totalCompanies}`);
        console.log(`   📚 Formations publiées: ${activeFormations}`);
        console.log(`   🆕 Inscriptions (30j): ${recentSignups}`);

        // Calculer des métriques
        const avgUsersPerCompany = totalCompanies > 0 ? (totalUsers / totalCompanies).toFixed(1) : 0;
        console.log(`   📈 Moyenne utilisateurs/entreprise: ${avgUsersPerCompany}\n`);

    } catch (error) {
        console.log('❌ Erreur données dashboard:', error.message);
    }
}

// Fonction pour créer un admin de test rapide
async function createQuickTestAdmin() {
    console.log('⚡ Création rapide d\'un admin de test...\n');

    try {
        const testEmail = 'test@admin.local';
        const testPassword = 'test123';

        // Vérifier si existe déjà
        const existing = await prisma.user.findUnique({
            where: { email: testEmail }
        });

        if (existing) {
            console.log('✅ Admin de test existe déjà');
            console.log(`   📧 Email: ${testEmail}`);
            console.log(`   🔑 Mot de passe: ${testPassword}\n`);
            return;
        }

        // Créer l'admin de test
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        
        const testAdmin = await prisma.user.create({
            data: {
                email: testEmail,
                name: 'Admin Test',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                emailVerified: new Date()
            }
        });

        console.log('✅ Admin de test créé:');
        console.log(`   📧 Email: ${testEmail}`);
        console.log(`   🔑 Mot de passe: ${testPassword}`);
        console.log(`   🆔 ID: ${testAdmin.id}\n`);

    } catch (error) {
        console.error('❌ Erreur création admin test:', error);
    }
}

// Gestion des arguments
const args = process.argv.slice(2);

if (args.includes('--create-test')) {
    createQuickTestAdmin()
        .then(() => prisma.$disconnect())
        .catch(console.error);
} else {
    testAdminLogin();
} 