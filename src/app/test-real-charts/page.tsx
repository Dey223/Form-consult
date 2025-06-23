'use client'

import { useEffect, useState } from 'react'
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
import { BarChart3, Download, TrendingUp, DollarSign, RefreshCcw, AlertTriangle } from 'lucide-react'

interface ChartData {
  revenueData: Array<{
    month: string
    revenue: number
    subscriptions: number
    activeSubscriptions: number
    target: number
    growth: number
  }>
  paymentStatusData: Array<{
    name: string
    value: number
    color: string
  }>
  subscriptionTrendsData: Array<{
    week: string
    new: number
    canceled: number
    active: number
  }>
  planDistributionData: Array<{
    plan: string
    count: number
    revenue: number
  }>
  paymentMethodsData: Array<{
    method: string
    count: number
    percentage: number
  }>
  radialPerformanceData: Array<{
    name: string
    value: number
    target: number
    fill: string
  }>
  donutFinancialData: Array<{
    name: string
    value: number
    amount: number
  }>
}

interface PaymentStats {
  totalRevenue: number
  thisMonthRevenue: number
  successfulPayments: number
  failedPayments: number
  refunds: number
  averageOrderValue: number
}

export default function TestRealChartsPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/dashboard/super-admin')
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      const data = await response.json()
      setChartData(data.chartData)
      setPaymentStats(data.paymentStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      console.error('Erreur lors du chargement des données:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          title="Test Graphiques Réels" 
          subtitle="Chargement des données..."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          title="Test Graphiques Réels" 
          subtitle="Erreur de chargement"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={fetchData} className="inline-flex items-center">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentMonth = chartData?.revenueData?.[chartData.revenueData.length - 1]
  const previousMonth = chartData?.revenueData?.[chartData.revenueData.length - 2]
  const growthRate = currentMonth && previousMonth ? 
    Math.round(((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="📊 Test Graphiques avec Données Réelles" 
        subtitle="Visualisation des vraies données de la base de données"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* En-tête avec bouton de rafraîchissement */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Financier en Temps Réel</h2>
            <p className="text-gray-600 mt-1">Données extraites directement de votre base de données</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="inline-flex items-center">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Stats Cards avec vraies données */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Revenus totaux"
            value={`${paymentStats?.totalRevenue.toLocaleString() || 0}€`}
            change={{ value: growthRate, isPositive: growthRate > 0 }}
            icon={<DollarSign className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Ce mois"
            value={`${paymentStats?.thisMonthRevenue.toLocaleString() || 0}€`}
            change={{ value: Math.abs(growthRate), isPositive: growthRate > 0 }}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Paiements réussis"
            value={paymentStats?.successfulPayments || 0}
            icon={<BarChart3 className="h-6 w-6" />}
            color="purple"
          />
          <MetricCard
            title="Panier moyen"
            value={`${paymentStats?.averageOrderValue || 0}€`}
            icon={<Download className="h-6 w-6" />}
            color="orange"
          />
        </div>

        {/* Informations sur les données */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-2">🔥 Données en Temps Réel</h2>
          <p className="text-indigo-100 mb-4">
            Ces graphiques utilisent les vraies données de votre base de données PostgreSQL.
            Chaque métrique est calculée en temps réel depuis vos abonnements, utilisateurs et transactions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">📈 Revenus mensuels</div>
              <div className="text-indigo-100">Calculés depuis les abonnements actifs</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">👥 Tendances utilisateurs</div>
              <div className="text-indigo-100">Basées sur les inscriptions récentes</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">💳 Statuts paiements</div>
              <div className="text-indigo-100">États réels des abonnements</div>
            </div>
          </div>
        </div>

        {/* Graphiques avec données réelles */}
        <div className="space-y-8">
          {/* Première ligne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartData?.revenueData && (
              <RevenueChart data={chartData.revenueData} />
            )}
            {chartData?.paymentStatusData && (
              <PaymentStatusChart data={chartData.paymentStatusData} />
            )}
          </div>

          {/* Deuxième ligne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartData?.subscriptionTrendsData && (
              <SubscriptionTrendsChart data={chartData.subscriptionTrendsData} />
            )}
            {chartData?.planDistributionData && (
              <PlanDistributionChart data={chartData.planDistributionData} />
            )}
          </div>

          {/* Troisième ligne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartData?.paymentMethodsData && (
              <PaymentMethodsChart data={chartData.paymentMethodsData} />
            )}
            {chartData?.radialPerformanceData && (
              <RadialPerformanceChart data={chartData.radialPerformanceData} />
            )}
          </div>

          {/* Quatrième ligne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartData?.revenueData && (
              <MixedRevenueChart data={chartData.revenueData} />
            )}
            {chartData?.donutFinancialData && (
              <DonutChart data={chartData.donutFinancialData} />
            )}
          </div>

          {/* Résumé technique */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">🔧 Détails Techniques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {chartData?.revenueData?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Mois de données</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {chartData?.paymentStatusData?.reduce((acc, item) => acc + item.value, 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total transactions</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {chartData?.planDistributionData?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Types de plans</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {new Date().toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-600">Dernière mise à jour</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 