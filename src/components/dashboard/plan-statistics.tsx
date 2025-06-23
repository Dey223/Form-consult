'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Users, 
  BarChart3, 
  AlertCircle, 
  CheckCircle,
  ArrowUpRight,
  RefreshCw,
  Package,
  Zap,
  Shield,
  Star
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PlanStats {
  currentPlan: {
    id: string
    name: string
    price: number
    currency: string
    tier: 'ESSENTIEL' | 'PRO' | 'ENTREPRISE'
    billingCycle: 'monthly' | 'yearly'
    startDate: string
    endDate: string
    status: 'active' | 'canceled' | 'past_due'
  }
  usage: {
    consultations: {
      used: number
      total: number | null
      remaining: number | null
      percentUsed: number
    }
    formations: {
      used: number
      total: number | null
      remaining: number | null
      percentUsed: number
    }
    users: {
      active: number
      total: number | null
      remaining: number | null
      percentUsed: number
    }
    storage: {
      used: number
      total: number | null
      remaining: number | null
      percentUsed: number
    }
  }
  analytics: {
    thisMonth: {
      consultationsCompleted: number
      formationsCompleted: number
      newUsers: number
      totalHours: number
    }
    lastMonth: {
      consultationsCompleted: number
      formationsCompleted: number
      newUsers: number
      totalHours: number
    }
    growth: {
      consultations: number
      formations: number
      users: number
      engagement: number
    }
  }
  features: {
    name: string
    included: boolean
    limit?: number
  }[]
}

interface PlanStatisticsProps {
  companyId?: string
  showUpgrade?: boolean
}

export function PlanStatistics({ companyId, showUpgrade = true }: PlanStatisticsProps) {
  const [stats, setStats] = useState<PlanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchPlanStats()
  }, [companyId])

  const fetchPlanStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/admin-entreprise/plan-statistics${companyId ? `?companyId=${companyId}` : ''}`)
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        toast.error('Erreur lors du chargement des statistiques du plan')
      }
    } catch (error) {
      toast.error('Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPlanStats()
    setRefreshing(false)
    toast.success('Statistiques mises à jour')
  }

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'ESSENTIEL': return 'from-green-500 to-emerald-600'
      case 'PRO': return 'from-blue-500 to-indigo-600'
      case 'ENTREPRISE': return 'from-purple-500 to-pink-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">En retard</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50'
    if (percentage >= 75) return 'text-orange-600 bg-orange-50'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const formatGrowth = (value: number) => {
    const prefix = value > 0 ? '+' : ''
    return `${prefix}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg p-6 border text-center">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Impossible de charger les statistiques du plan</p>
        <Button onClick={fetchPlanStats} variant="outline" size="sm" className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  const { currentPlan, usage, analytics, features } = stats

  return (
    <div className="space-y-6">
      {/* Header du Plan */}
      <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r ${getPlanColor(currentPlan.tier)} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Crown className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">{currentPlan.name}</h2>
                {getStatusBadge(currentPlan.status)}
              </div>
              <p className="text-sm text-gray-600">
                {currentPlan.price} {currentPlan.currency} / {currentPlan.billingCycle === 'monthly' ? 'mois' : 'an'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Expire le {new Date(currentPlan.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </Button>
            {showUpgrade && currentPlan.tier !== 'ENTREPRISE' && (
              <Button size="sm" className="flex items-center space-x-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>Mettre à niveau</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques d'Usage - Grid Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {/* Consultations */}
        <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-700 text-sm">Consultations</span>
            </div>
            {usage.consultations.total && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(usage.consultations.percentUsed)}`}>
                {usage.consultations.percentUsed.toFixed(0)}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{usage.consultations.used}</span>
              <span className="text-sm text-gray-500">
                {usage.consultations.total ? `/ ${usage.consultations.total}` : '/ Illimité'}
              </span>
            </div>
            
            {usage.consultations.total && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(usage.consultations.percentUsed, 100)}%` }}
                ></div>
              </div>
            )}
            
            <p className="text-xs text-gray-600">
              {usage.consultations.remaining !== null 
                ? `${usage.consultations.remaining} restantes`
                : 'Consultations illimitées'
              }
            </p>
          </div>
        </div>

        {/* Formations */}
        <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <span className="font-medium text-gray-700 text-sm">Formations</span>
            </div>
            {usage.formations.total && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(usage.formations.percentUsed)}`}>
                {usage.formations.percentUsed.toFixed(0)}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{usage.formations.used}</span>
              <span className="text-sm text-gray-500">
                {usage.formations.total ? `/ ${usage.formations.total}` : '/ Illimité'}
              </span>
            </div>
            
            {usage.formations.total && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(usage.formations.percentUsed, 100)}%` }}
                ></div>
              </div>
            )}
            
            <p className="text-xs text-gray-600">
              {usage.formations.remaining !== null 
                ? `${usage.formations.remaining} disponibles`
                : 'Formations illimitées'
              }
            </p>
          </div>
        </div>

        {/* Utilisateurs */}
        <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-gray-700 text-sm">Utilisateurs</span>
            </div>
            {usage.users.total && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(usage.users.percentUsed)}`}>
                {usage.users.percentUsed.toFixed(0)}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{usage.users.active}</span>
              <span className="text-sm text-gray-500">
                {usage.users.total ? `/ ${usage.users.total}` : '/ Illimité'}
              </span>
            </div>
            
            {usage.users.total && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(usage.users.percentUsed, 100)}%` }}
                ></div>
              </div>
            )}
            
            <p className="text-xs text-gray-600">
              {usage.users.remaining !== null 
                ? `${usage.users.remaining} places restantes`
                : 'Utilisateurs illimités'
              }
            </p>
          </div>
        </div>

        {/* Stockage */}
        <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-gray-700 text-sm">Stockage</span>
            </div>
            {usage.storage.total && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(usage.storage.percentUsed)}`}>
                {usage.storage.percentUsed.toFixed(0)}%
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{usage.storage.used.toFixed(1)}</span>
              <span className="text-sm text-gray-500">
                {usage.storage.total ? `/ ${usage.storage.total}GB` : '/ Illimité'}
              </span>
            </div>
            
            {usage.storage.total && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(usage.storage.percentUsed, 100)}%` }}
                ></div>
              </div>
            )}
            
            <p className="text-xs text-gray-600">
              {usage.storage.remaining !== null 
                ? `${usage.storage.remaining.toFixed(1)}GB disponibles`
                : 'Stockage illimité'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Analytics et croissance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité ce mois */}
        <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Activité ce mois</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.thisMonth.consultationsCompleted}</div>
              <div className="text-xs text-blue-600 font-medium">Consultations</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatGrowth(analytics.growth.consultations)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.thisMonth.formationsCompleted}</div>
              <div className="text-xs text-green-600 font-medium">Formations</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatGrowth(analytics.growth.formations)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.thisMonth.newUsers}</div>
              <div className="text-xs text-purple-600 font-medium">Nouveaux utilisateurs</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatGrowth(analytics.growth.users)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analytics.thisMonth.totalHours}h</div>
              <div className="text-xs text-orange-600 font-medium">Heures totales</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatGrowth(analytics.growth.engagement)}
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités du plan */}
        <div className="bg-white rounded-lg p-4 md:p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Fonctionnalités du plan</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {feature.included ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                    {feature.name}
                  </span>
                </div>
                {feature.limit && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Limite: {feature.limit}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {showUpgrade && currentPlan.tier !== 'ENTREPRISE' && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Voir les fonctionnalités premium
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Alertes et notifications */}
      {(usage.consultations.percentUsed > 80 || usage.formations.percentUsed > 80 || usage.users.percentUsed > 80) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800 mb-1">Attention aux limites du plan</h4>
              <p className="text-sm text-yellow-700 mb-2">
                Vous approchez des limites de votre plan actuel. Considérez une mise à niveau pour éviter les interruptions.
              </p>
              {showUpgrade && (
                <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Voir les options d'upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 