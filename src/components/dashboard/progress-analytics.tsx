'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  BookOpen,
  Trophy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface ProgressData {
  summary: {
    totalFormations: number
    completedFormations: number
    inProgressFormations: number
    totalTimeSpent: number
    averageSessionTime: number
    consistencyRate: number
    activeDays: number
    totalActivities: number
  }
  weeklyProgress: Array<{
    week: string
    hours: number
    activities: number
  }>
  formationProgress: Array<{
    formationId: string
    formationTitle: string
    level: string
    progress: number
    timeSpent: number
    activitiesCount: number
    lastActivity: string
  }>
  skillsProgress: Array<{
    skill: string
    level: number
    completedFormations: number
    totalFormations: number
  }>
  recentActivities: Array<{
    id: string
    type: string
    formationId: string
    timeSpent: number
    createdAt: string
  }>
  sessionsAttended: Array<{
    sessionId: string
    formationTitle: string
    sessionDate: string
    isConfirmed: boolean
  }>
  insights: {
    mostActiveFormation: any
    preferredLearningTime: string
    streakDays: number
  }
}

export default function ProgressAnalytics() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'formations' | 'skills' | 'activity'>('overview')

  useEffect(() => {
    fetchProgressData()
  }, [period])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/employe/progress?period=${period}`)
      
      if (response.ok) {
        const progressData = await response.json()
        setData(progressData)
      }
    } catch (error) {
      console.error('Erreur chargement progrès:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeLabel = (time: string) => {
    switch (time) {
      case 'morning': return 'Matin (6h-12h)'
      case 'afternoon': return 'Après-midi (12h-18h)'
      case 'evening': return 'Soir (18h-24h)'
      default: return 'Matin'
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`
    }
    return `${hours.toFixed(1)}h`
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
              <BarChart3 className="h-5 w-5" />
              Analytics de Progression
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

      {/* Navigation onglets */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4 border-b">
            {[
              { key: 'overview', label: 'Vue d\'ensemble', icon: PieChart },
              { key: 'formations', label: 'Formations', icon: BookOpen },
              { key: 'skills', label: 'Compétences', icon: Target },
              { key: 'activity', label: 'Activité', icon: Activity }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                  ${activeTab === key 
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

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Statistiques principales */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Formations Totales</p>
                  <p className="text-2xl font-bold">{data.summary.totalFormations}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Temps Total</p>
                  <p className="text-2xl font-bold">{formatDuration(data.summary.totalTimeSpent)}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Régularité</p>
                  <p className="text-2xl font-bold">{data.summary.consistencyRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Série Actuelle</p>
                  <p className="text-2xl font-bold">{data.insights.streakDays} jours</p>
                </div>
                <Flame className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Graphique progression hebdomadaire */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Progression Hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.weeklyProgress.map((week, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{week.week}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{formatDuration(week.hours)}</span>
                        <span>{week.activities} activités</span>
                      </div>
                      <Progress 
                        value={Math.min(week.hours * 10, 100)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Insights Personnalisés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Formation Favorite</h4>
                <p className="text-sm text-blue-700">
                  {data.insights.mostActiveFormation?.formationTitle || 'Aucune activité'}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Meilleur Moment</h4>
                <p className="text-sm text-green-700">
                  {getTimeLabel(data.insights.preferredLearningTime)}
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-1">Session Moyenne</h4>
                <p className="text-sm text-orange-700">
                  {data.summary.averageSessionTime} minutes par session
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activités récentes */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activités Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.timeSpent}min
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'formations' && (
        <div className="space-y-6">
          {data.formationProgress.map((formation) => (
            <Card key={formation.formationId}>
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{formation.formationTitle}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{formation.level}</Badge>
                      <span className="text-sm text-gray-500">
                        {formation.activitiesCount} activités • {formatDuration(formation.timeSpent)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formation.progress}%</div>
                    <div className="text-sm text-gray-500">progression</div>
                  </div>
                </div>
                
                <Progress value={formation.progress} className="h-3 mb-2" />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Dernière activité: {new Date(formation.lastActivity).toLocaleDateString('fr-FR')}</span>
                  {formation.progress === 100 && (
                    <Badge className="bg-green-500">
                      <Award className="h-3 w-3 mr-1" />
                      Terminée
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.skillsProgress.map((skill, index) => (
            <Card key={index}>
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{skill.skill}</h3>
                  <div className="text-right">
                    <div className="text-xl font-bold">{skill.level}%</div>
                    <div className="text-sm text-gray-500">maîtrise</div>
                  </div>
                </div>
                
                <Progress value={skill.level} className="h-3 mb-3" />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{skill.completedFormations}/{skill.totalFormations} formations</span>
                  {skill.level === 100 && (
                    <Badge className="bg-yellow-500">
                      <Trophy className="h-3 w-3 mr-1" />
                      Expert
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Sessions assistées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sessions de Formation Assistées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.sessionsAttended.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucune session assistée sur cette période
                  </p>
                ) : (
                  data.sessionsAttended.map((session, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium">{session.formationTitle}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.sessionDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                      <Badge 
                        variant={session.isConfirmed ? 'default' : 'outline'}
                        className={session.isConfirmed ? 'bg-green-500' : ''}
                      >
                        {session.isConfirmed ? 'Confirmé' : 'En attente'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Historique détaillé */}
          <Card>
            <CardHeader>
              <CardTitle>Historique Détaillé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {activity.timeSpent}min
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 