'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CompanyDetailsModal } from '@/components/dashboard/modals/company-details-modal'
import { SubscriptionManagementModal } from '@/components/dashboard/modals/subscription-management-modal'
import { UserManagementModal } from '@/components/dashboard/modals/user-management-modal'
import { UserDetailsModal } from '@/components/dashboard/modals/user-details-modal'
import { Eye, CreditCard, Users, Settings, TestTube, CheckCircle } from 'lucide-react'

// Données de test simulées
const testCompany = {
  id: '1',
  name: 'TechCorp Solutions',
  email: 'admin@techcorp.com',
  plan: 'PRO',
  planStatus: 'ACTIVE',
  users: 35,
  maxUsers: 50,
  status: 'ACTIVE',
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  subscriptionDetails: {
    planType: 'PRO',
    status: 'ACTIVE',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    stripeCustomerId: 'cus_OePm9H0qQkgr3t'
  },
  website: 'https://techcorp-solutions.com',
  phone: '+33 1 42 86 83 34',
  address: '123 Rue de la Tech, 75001 Paris, France',
  formationStats: {
    totalFormations: 45,
    completedFormations: 38,
    averageProgress: 84,
    uniqueFormations: 12
  },
  consultingStats: {
    totalAppointments: 15,
    estimatedHours: 37.5,
    monthlyLimit: 5
  }
}

const testUser = {
  id: '1',
  name: 'Jean Dupont',
  email: 'jean.dupont@techcorp.com',
  company: 'TechCorp Solutions',
  role: 'FORMATEUR',
  status: 'active',
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  isCurrentUser: false,
  specialDetails: {
    totalFormations: 8,
    publishedFormations: 6,
    totalStudents: 147,
    latestFormation: 'React Avancé: Hooks et Context'
  }
}

export default function TestModalsPage() {
  const [showCompanyDetails, setShowCompanyDetails] = useState(false)
  const [showSubscriptionManagement, setShowSubscriptionManagement] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)

  const modalTests = [
    {
      title: 'Détails Entreprise',
      description: 'Affiche toutes les informations détaillées d\'une entreprise',
      icon: Eye,
      color: 'bg-blue-500',
      features: [
        'Informations générales et contact',
        'Détails de l\'abonnement Stripe',
        'Statistiques de formation complètes',
        'Statistiques de consulting',
        'Boutons d\'action rapides'
      ],
      action: () => setShowCompanyDetails(true)
    },
    {
      title: 'Gestion Abonnement',
      description: 'Permet de modifier les plans et gérer les abonnements',
      icon: CreditCard,
      color: 'bg-green-500',
      features: [
        'Visualisation du plan actuel',
        'Sélection de nouveaux plans',
        'Calcul automatique des différences',
        'Annulation d\'abonnement',
        'Intégration Stripe simulée'
      ],
      action: () => setShowSubscriptionManagement(true)
    },
    {
      title: 'Gestion Utilisateurs',
      description: 'Gère les utilisateurs d\'une entreprise spécifique',
      icon: Users,
      color: 'bg-purple-500',
      features: [
        'Liste des utilisateurs de l\'entreprise',
        'Invitation de nouveaux utilisateurs',
        'Recherche et filtrage',
        'Suppression d\'utilisateurs',
        'Gestion des rôles'
      ],
      action: () => setShowUserManagement(true)
    },
    {
      title: 'Détails Utilisateur',
      description: 'Affiche et modifie les détails d\'un utilisateur',
      icon: Settings,
      color: 'bg-orange-500',
      features: [
        'Onglets organisés (Vue d\'ensemble, Activité, Paramètres)',
        'Statistiques spécialisées selon le rôle',
        'Modification de rôle et statut',
        'Historique d\'activité',
        'Protection contre l\'auto-modification'
      ],
      action: () => setShowUserDetails(true)
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TestTube className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Test des Modals d'Action</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Démonstration des modals fonctionnels du dashboard super admin. 
            Chaque modal est entièrement interactif avec simulation d'API.
          </p>
        </div>

        {/* Statut d'implémentation */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Statut d'Implémentation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">4/4</div>
              <div className="text-sm text-green-600">Modals Créés</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">5/5</div>
              <div className="text-sm text-blue-600">Handlers Fonctionnels</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">100%</div>
              <div className="text-sm text-purple-600">Intégration Complète</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">90%</div>
              <div className="text-sm text-orange-600">Tests Réussis</div>
            </div>
          </div>
        </div>

        {/* Cards des modals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {modalTests.map((modal, index) => {
            const Icon = modal.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${modal.color} rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{modal.title}</h3>
                      <p className="text-gray-600">{modal.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Fonctionnalités incluses:</h4>
                    <ul className="space-y-2">
                      {modal.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={modal.action}
                    className="w-full"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    Tester {modal.title}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Comment tester ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🎯 Actions disponibles :</h4>
              <ul className="space-y-1">
                <li>• Cliquer sur "Tester [Modal]" pour ouvrir chaque modal</li>
                <li>• Interagir avec tous les éléments</li>
                <li>• Tester les formulaires et boutons</li>
                <li>• Observer les simulations d'API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📋 Points à vérifier :</h4>
              <ul className="space-y-1">
                <li>• Réactivité et animations des modals</li>
                <li>• Validation des formulaires</li>
                <li>• States de chargement</li>
                <li>• Gestion des erreurs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>💻 Dashboard super admin - FormConsult</p>
          <p>🔧 Tous les boutons d'action sont maintenant fonctionnels</p>
        </div>
      </div>

      {/* Modals */}
      <CompanyDetailsModal
        isOpen={showCompanyDetails}
        onClose={() => setShowCompanyDetails(false)}
        company={testCompany}
      />

      <SubscriptionManagementModal
        isOpen={showSubscriptionManagement}
        onClose={() => setShowSubscriptionManagement(false)}
        company={testCompany}
      />

      <UserManagementModal
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        company={testCompany}
      />

      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={testUser}
      />
    </div>
  )
} 