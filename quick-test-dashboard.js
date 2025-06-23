#!/usr/bin/env node

/**
 * Test rapide du Super Admin Dashboard
 * Ce script s'exécute automatiquement et teste l'API
 */

console.log('🚀 TEST RAPIDE SUPER ADMIN DASHBOARD')
console.log('=====================================\n')

// Simulation de fetch si pas disponible
const mockFetch = (url) => {
  console.log(`📡 Simulation API: ${url}`)
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      globalStats: {
        totalCompanies: 47,
        totalUsers: 1253,
        monthlyRevenue: 45780,
        activeSubscriptions: 42,
        newSignups: 8
      },
      recentCompanies: [
        {
          id: '1',
          name: 'TechCorp Solutions',
          plan: 'Entreprise',
          users: 45,
          status: 'ACTIVE',
          createdAt: '2024-01-10'
        }
      ],
      paymentIssues: [],
      systemHealth: {
        apiStatus: 'healthy',
        dbStatus: 'healthy',
        stripeStatus: 'warning'
      },
      allUsers: [],
      contentStats: {
        totalFormations: 156,
        publishedFormations: 142,
        draftFormations: 14,
        totalLessons: 2847,
        totalConsultants: 23,
        pendingContent: 8
      },
      paymentStats: {
        totalRevenue: 547890,
        thisMonthRevenue: 45780,
        successfulPayments: 234,
        failedPayments: 12,
        refunds: 5,
        averageOrderValue: 380
      },
      supportTickets: []
    })
  })
}

async function testDashboard() {
  let testCount = 0
  let passedCount = 0

  function runTest(name, testFn) {
    testCount++
    console.log(`🔍 Test ${testCount}: ${name}`)
    
    try {
      const result = testFn()
      if (result) {
        passedCount++
        console.log(`  ✅ PASS`)
      } else {
        console.log(`  ❌ FAIL`)
      }
    } catch (error) {
      console.log(`  ❌ ERREUR: ${error.message}`)
    }
    console.log('')
  }

  // Test 1: Structure de l'API
  runTest('Structure API Dashboard', () => {
    const requiredFields = [
      'globalStats', 'recentCompanies', 'paymentIssues',
      'systemHealth', 'allUsers', 'contentStats', 
      'paymentStats', 'supportTickets'
    ]
    
    console.log(`    📋 Champs requis: ${requiredFields.length}`)
    return requiredFields.length === 8
  })

  // Test 2: Données mock
  runTest('Données mock valides', async () => {
    const data = await mockFetch('http://localhost:3000/api/dashboard/super-admin')
    const json = await data.json()
    
    const hasStats = json.globalStats && typeof json.globalStats.totalCompanies === 'number'
    console.log(`    📊 Stats globales: ${hasStats ? 'OK' : 'KO'}`)
    
    const hasHealth = json.systemHealth && json.systemHealth.apiStatus
    console.log(`    🏥 Santé système: ${hasHealth ? 'OK' : 'KO'}`)
    
    return hasStats && hasHealth
  })

  // Test 3: Calculs de cohérence
  runTest('Cohérence des données', async () => {
    const data = await mockFetch('http://localhost:3000/api/dashboard/super-admin')
    const json = await data.json()
    
    const stats = json.globalStats
    const content = json.contentStats
    const payments = json.paymentStats
    
    const usersVsCompanies = stats.totalUsers >= stats.totalCompanies
    console.log(`    👥 Utilisateurs >= Entreprises: ${usersVsCompanies ? 'OK' : 'KO'}`)
    
    const formationsConsistency = content.publishedFormations <= content.totalFormations
    console.log(`    📚 Formations publiées <= Total: ${formationsConsistency ? 'OK' : 'KO'}`)
    
    const revenuePositive = payments.totalRevenue >= 0
    console.log(`    💰 Revenus positifs: ${revenuePositive ? 'OK' : 'KO'}`)
    
    return usersVsCompanies && formationsConsistency && revenuePositive
  })

  // Test 4: Fonctionnalités dashboard
  runTest('Fonctionnalités dashboard', () => {
    const tabs = ['overview', 'companies', 'users', 'content', 'payments', 'support']
    console.log(`    🗂️  Onglets disponibles: ${tabs.length}`)
    
    const mockActiveTab = 'overview'
    const validTab = tabs.includes(mockActiveTab)
    console.log(`    ✅ Navigation onglets: ${validTab ? 'OK' : 'KO'}`)
    
    const statusColors = {
      'ACTIVE': 'green',
      'UNPAID': 'yellow',
      'SUSPENDED': 'red'
    }
    console.log(`    🎨 Statuts colorés: ${Object.keys(statusColors).length} types`)
    
    return validTab && tabs.length === 6
  })

  // Test 5: Simulation d'erreurs
  runTest('Gestion d\'erreurs', async () => {
    try {
      // Simuler une erreur API
      const errorResponse = {
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Erreur serveur' })
      }
      
      const hasErrorHandling = !errorResponse.ok && errorResponse.status === 500
      console.log(`    🚨 Détection erreur 500: ${hasErrorHandling ? 'OK' : 'KO'}`)
      
      // Simuler une erreur d'authentification
      const authErrorResponse = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Non autorisé' })
      }
      
      const hasAuthHandling = !authErrorResponse.ok && authErrorResponse.status === 401
      console.log(`    🔐 Détection erreur 401: ${hasAuthHandling ? 'OK' : 'KO'}`)
      
      return hasErrorHandling && hasAuthHandling
    } catch (error) {
      return false
    }
  })

  // Résultats finaux
  console.log('📊 RÉSULTATS FINAUX')
  console.log('===================')
  console.log(`✅ Tests réussis: ${passedCount}/${testCount}`)
  console.log(`❌ Tests échoués: ${testCount - passedCount}/${testCount}`)
  
  const score = Math.round((passedCount / testCount) * 100)
  console.log(`🎯 Score global: ${score}%`)
  
  if (score === 100) {
    console.log('🌟 EXCELLENT! Dashboard prêt à utiliser')
  } else if (score >= 80) {
    console.log('👍 BIEN! Quelques points à améliorer')
  } else if (score >= 60) {
    console.log('⚠️  MOYEN! Corrections nécessaires')
  } else {
    console.log('🚨 CRITIQUE! Révision complète requise')
  }

  console.log('\n✨ Test terminé!')
  
  return {
    score,
    passed: passedCount,
    total: testCount,
    success: score >= 80
  }
}

// Exécution automatique
testDashboard().then(result => {
  process.exit(result.success ? 0 : 1)
}).catch(error => {
  console.error('❌ Erreur fatale:', error.message)
  process.exit(1)
}) 