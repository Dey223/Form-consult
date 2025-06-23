'use client'

import React, { useState, useEffect } from 'react'
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  ThumbsUp,
  Calendar,
  BarChart3,
  Award,
  Filter,
  Download,
  Clock,
  Heart,
  Target,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface FeedbackData {
  summary: {
    totalFeedbacks: number
    averageRating: number
    satisfactionRating: number
    recommendationRate: number
    totalConsultations: number
    responseRate: number
  }
  ratingDistribution: Record<string, number>
  weeklyRatings: Array<{
    week: string
    rating: number
    count: number
    satisfaction: number
  }>
  recentFeedbacks: Array<{
    id: string
    rating: number
    satisfactionLevel: number
    wouldRecommend: boolean
    comments: string
    improvementAreas: string[]
    createdAt: string
    client: {
      name: string
      company: string
    }
    appointment: {
      id: string
      title: string
      date: string
    }
  }>
  commentAnalysis: {
    positive: number
    negative: number
    neutral: number
    totalComments: number
  }
  topImprovementAreas: Array<{
    area: string
    count: number
  }>
  pendingFeedback: Array<{
    id: string
    title: string
    clientName: string
    companyName: string
    completedAt: string
    daysSinceCompletion: number
  }>
  insights: {
    bestRatedMonth: any
    mostCommonImprovement: string
    avgResponseTime: number
  }
}

export function FeedbackTab() {
  const [data, setData] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [activeView, setActiveView] = useState<'overview' | 'details' | 'analysis'>('overview')

  useEffect(() => {
    fetchFeedbackData()
  }, [period])

  const fetchFeedbackData = async () => {
    try {
      setLoading(true)
      
      // Appel API réel
      const response = await fetch(`/api/consultant/feedback-simple?period=${period}`)
      
      if (response.ok) {
        const apiData = await response.json()
        setData(apiData)
        console.log('✅ Retours consultant chargés:', apiData)
      } else {
        console.error('❌ Erreur API feedback consultant:', response.status, response.statusText)
        
        // Gestion des erreurs spécifiques
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter')
        } else if (response.status === 403) {
          toast.error('Accès non autorisé')
        } else if (response.status === 404) {
          toast.error('API de retours non disponible')
        } else {
          toast.error('Erreur lors du chargement des retours')
        }
        
        // Pas de données de fallback - structure vide
        setData({
          summary: {
            totalFeedbacks: 0,
            averageRating: 0,
            satisfactionRating: 0,
            recommendationRate: 0,
            totalConsultations: 0,
            responseRate: 0
          },
          ratingDistribution: {},
          weeklyRatings: [],
          recentFeedbacks: [],
          commentAnalysis: {
            positive: 0,
            negative: 0,
            neutral: 0,
            totalComments: 0
          },
          topImprovementAreas: [],
          pendingFeedback: [],
          insights: {
            bestRatedMonth: null,
            mostCommonImprovement: '',
            avgResponseTime: 0
          }
        })
      }
    } catch (error) {
      console.error('Erreur chargement retours consultant:', error)
      toast.error('Erreur de connexion au serveur')
      
      // Structure vide en cas d'erreur de connexion
      setData({
        summary: {
          totalFeedbacks: 0,
          averageRating: 0,
          satisfactionRating: 0,
          recommendationRate: 0,
          totalConsultations: 0,
          responseRate: 0
        },
        ratingDistribution: {},
        weeklyRatings: [],
        recentFeedbacks: [],
        commentAnalysis: {
          positive: 0,
          negative: 0,
          neutral: 0,
          totalComments: 0
        },
        topImprovementAreas: [],
        pendingFeedback: [],
        insights: {
          bestRatedMonth: null,
          mostCommonImprovement: '',
          avgResponseTime: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="h-32 bg-gray-100"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de période */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Centre de Retours Client
            </CardTitle>
            
            <div className="flex gap-2">
              {[
                { value: '7d', label: '7 jours' },
                { value: '30d', label: '30 jours' },
                { value: '90d', label: '3 mois' },
                { value: '1y', label: '1 an' }
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  variant={period === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation sous-onglets */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4 border-b">
            {[
              { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { key: 'details', label: 'Détails', icon: MessageSquare },
              { key: 'analysis', label: 'Analyse', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                  ${activeView === key 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenu selon la vue active */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Note Moyenne</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-2xl font-bold ${getRatingColor(data.summary.averageRating)}`}>
                        {data.summary.averageRating}
                      </p>
                      <div className="flex">
                        {getStars(data.summary.averageRating)}
                      </div>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux de Recommandation</p>
                    <p className="text-2xl font-bold text-green-600">{data.summary.recommendationRate}%</p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux de Réponse</p>
                    <p className="text-2xl font-bold text-blue-600">{data.summary.responseRate}%</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Retours</p>
                    <p className="text-2xl font-bold text-purple-600">{data.summary.totalFeedbacks}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution des notes */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = data.ratingDistribution[rating.toString()] || 0
                  const percentage = data.summary.totalFeedbacks > 0 
                    ? (count / data.summary.totalFeedbacks) * 100 
                    : 0
                  
                  return (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-3" />
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Évolution hebdomadaire */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.weeklyRatings.map((week, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{week.week}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Note: {week.rating}/5</span>
                        <span>{week.count} retours</span>
                      </div>
                      <Progress value={week.rating * 20} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <Award className="h-8 w-8 text-yellow-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Meilleure Période</h3>
                    <p className="text-sm text-gray-600">
                      {data.insights.bestRatedMonth?.week} avec {data.insights.bestRatedMonth?.rating}/5
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <Target className="h-8 w-8 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Point d'Amélioration</h3>
                    <p className="text-sm text-gray-600">
                      {data.insights.mostCommonImprovement || 'Aucun'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-8 w-8 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Temps de Réponse</h3>
                    <p className="text-sm text-gray-600">
                      {data.insights.avgResponseTime} jours en moyenne
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeView === 'details' && (
        <div className="space-y-6">
          {/* Retours récents */}
          <Card>
            <CardHeader>
              <CardTitle>Retours Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentFeedbacks.length > 0 ? (
                  data.recentFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{feedback.client.name}</h4>
                          <p className="text-sm text-gray-600">{feedback.client.company}</p>
                          <p className="text-xs text-gray-500 mt-1">{feedback.appointment.title}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            {getStars(feedback.rating)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      
                      {feedback.comments && (
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-sm text-gray-700">{feedback.comments}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={feedback.wouldRecommend ? 'default' : 'secondary'}>
                            {feedback.wouldRecommend ? '👍 Recommande' : '👎 Ne recommande pas'}
                          </Badge>
                        </div>
                        
                        {feedback.improvementAreas && feedback.improvementAreas.length > 0 && (
                          <div className="flex gap-1">
                            {feedback.improvementAreas.map((area, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun retour pour le moment</h3>
                    <p className="text-sm text-gray-600">
                      Les retours clients apparaîtront ici après vos consultations terminées.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* En attente de retour */}
          {data.pendingFeedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  En Attente de Retour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.pendingFeedback.map((pending) => (
                    <div key={pending.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{pending.title}</h4>
                        <p className="text-sm text-gray-600">{pending.clientName} - {pending.companyName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-orange-600 font-medium">
                          {pending.daysSinceCompletion} jour(s)
                        </p>
                        <p className="text-xs text-gray-500">depuis la fin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeView === 'analysis' && (
        <div className="space-y-6">
          {/* Analyse des commentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Analyse des Commentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{data.commentAnalysis.positive}</p>
                  <p className="text-sm text-gray-600">Positifs</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-600">{data.commentAnalysis.neutral}</p>
                  <p className="text-sm text-gray-600">Neutres</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{data.commentAnalysis.negative}</p>
                  <p className="text-sm text-gray-600">Négatifs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domaines d'amélioration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Domaines d'Amélioration Suggérés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topImprovementAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-900">{area.area}</span>
                    <Badge variant="outline" className="bg-white">
                      {area.count} mention(s)
                    </Badge>
                  </div>
                ))}
                
                {data.topImprovementAreas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun domaine d'amélioration identifié</p>
                    <p className="text-sm">Excellent travail !</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 