'use client'

import { 
  RevenueChart, 
  PaymentStatusChart, 
  SubscriptionTrendsChart, 
  PlanDistributionChart, 
  PaymentMethodsChart 
} from '@/components/ui/charts'
import { 
  MixedRevenueChart, 
  RadialPerformanceChart, 
  DonutChart, 
  MetricCard 
} from '@/components/ui/advanced-charts'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, TrendingUp, DollarSign } from 'lucide-react'

export default function TestChartsPage() {
  // Données de test
  const revenueData = [
    { month: 'Jan', revenue: 8500, subscriptions: 12 },
    { month: 'Fév', revenue: 12300, subscriptions: 18 },
    { month: 'Mar', revenue: 15600, subscriptions: 25 },
    { month: 'Avr', revenue: 18900, subscriptions: 31 },
    { month: 'Mai', revenue: 22400, subscriptions: 38 },
    { month: 'Juin', revenue: 26700, subscriptions: 45 },
    { month: 'Juil', revenue: 29800, subscriptions: 52 },
    { month: 'Août', revenue: 32100, subscriptions: 58 },
  ]

  const paymentStatusData = [
    { name: 'Réussis', value: 234, color: '#10b981' },
    { name: 'Échoués', value: 12, color: '#ef4444' },
    { name: 'En attente', value: 8, color: '#f59e0b' },
    { name: 'Remboursés', value: 3, color: '#6b7280' },
  ]

  const subscriptionTrendsData = [
    { week: 'S1', new: 8, canceled: 2, active: 45 },
    { week: 'S2', new: 12, canceled: 1, active: 56 },
    { week: 'S3', new: 15, canceled: 3, active: 68 },
    { week: 'S4', new: 9, canceled: 4, active: 73 },
    { week: 'S5', new: 18, canceled: 2, active: 89 },
    { week: 'S6', new: 14, canceled: 5, active: 98 },
  ]

  const planDistributionData = [
    { plan: 'ESSENTIEL', count: 28, revenue: 1372 },
    { plan: 'PRO', count: 35, revenue: 3465 },
    { plan: 'ENTREPRISE', count: 12, revenue: 2388 },
  ]

  const paymentMethodsData = [
    { method: 'Carte de crédit', count: 156, percentage: 78 },
    { method: 'Virement bancaire', count: 32, percentage: 16 },
    { method: 'PayPal', count: 12, percentage: 6 },
  ]

  const mixedRevenueData = [
    { month: 'Jan', revenue: 8500, target: 10000, growth: 5 },
    { month: 'Fév', revenue: 12300, target: 12000, growth: 8 },
    { month: 'Mar', revenue: 15600, target: 14000, growth: 12 },
    { month: 'Avr', revenue: 18900, target: 16000, growth: 15 },
    { month: 'Mai', revenue: 22400, target: 20000, growth: 18 },
    { month: 'Juin', revenue: 26700, target: 24000, growth: 22 },
  ]

  const radialPerformanceData = [
    { name: 'Ventes', value: 85, target: 100, fill: '#6366f1' },
    { name: 'Marketing', value: 72, target: 100, fill: '#a855f7' },
    { name: 'Support', value: 94, target: 100, fill: '#ec4899' },
    { name: 'Produit', value: 67, target: 100, fill: '#22c55e' },
  ]

  const donutFinancialData = [
    { name: 'Abonnements', value: 65, amount: 156780 },
    { name: 'Formations', value: 25, amount: 60200 },
    { name: 'Consulting', value: 10, amount: 24100 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Test des Graphiques" 
        subtitle="Démonstration des composants de graphiques avec ShadCN UI et Recharts"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards avec MetricCard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Revenus totaux"
            value="195,200€"
            change={{ value: 24.5, isPositive: true }}
            icon={<DollarSign className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Croissance"
            value="+24.5%"
            change={{ value: 12.3, isPositive: true }}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Abonnements"
            value="257"
            change={{ value: 8.7, isPositive: true }}
            icon={<BarChart3 className="h-6 w-6" />}
            color="purple"
          />
          <MetricCard
            title="Conversion"
            value="4.2%"
            change={{ value: -2.1, isPositive: false }}
            icon={<Download className="h-6 w-6" />}
            color="orange"
          />
        </div>

        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">🚀 Dashboard Financier Moderne</h2>
          <p className="text-blue-100 mb-4">
            Visualisez vos données financières avec des graphiques interactifs et élégants. 
            Intégration parfaite de ShadCN UI avec Recharts pour une expérience utilisateur optimale.
          </p>
          <div className="flex space-x-4">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <BarChart3 className="h-4 w-4 mr-2" />
              Voir les métriques
            </Button>
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Download className="h-4 w-4 mr-2" />
              Exporter les données
            </Button>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="space-y-8">
          {/* Première ligne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={revenueData} />
            <PaymentStatusChart data={paymentStatusData} />
          </div>

          {/* Deuxième ligne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubscriptionTrendsChart data={subscriptionTrendsData} />
            <PlanDistributionChart data={planDistributionData} />
          </div>

          {/* Troisième ligne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentMethodsChart data={paymentMethodsData} />
            
            {/* Informations techniques */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">📊 Caractéristiques techniques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Bibliothèque</span>
                  <span className="text-blue-600 font-semibold">Recharts</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">UI Framework</span>
                  <span className="text-green-600 font-semibold">ShadCN UI</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Animations</span>
                  <span className="text-purple-600 font-semibold">Natives</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Responsive</span>
                  <span className="text-orange-600 font-semibold">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques avancés */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MixedRevenueChart data={mixedRevenueData} />
            <RadialPerformanceChart data={radialPerformanceData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonutChart data={donutFinancialData} />
            
            {/* Section d'aperçu */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">✨ Fonctionnalités des graphiques</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Interactifs</h4>
                    <p className="text-sm text-gray-600">Tooltips et animations fluides</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Temps réel</h4>
                    <p className="text-sm text-gray-600">Données mises à jour automatiquement</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Download className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Exportables</h4>
                    <p className="text-sm text-gray-600">Export PDF et images disponible</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">6</div>
                      <div className="text-sm text-gray-600">Types de graphiques</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">100%</div>
                      <div className="text-sm text-gray-600">Responsive design</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 