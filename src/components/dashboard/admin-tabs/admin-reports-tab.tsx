'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar, 
  Users, 
  BookOpen,
  Clock,
  TrendingUp,
  Filter,
  RefreshCw,
  Target,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

interface ReportData {
  formations: {
    total: number
    completed: number
    inProgress: number
    averageCompletion: number
  }
  users: {
    total: number
    active: number
    inactive: number
  }
  consultations: {
    total: number
    completed: number
    pending: number
    averageDuration: number
  }
  timeframe: string
  monthlyData: Array<{
    month: string
    formations: number
    consultations: number
    activeUsers: number
    completionRate: number
  }>
  topPerformers: Array<{
    id: string
    name: string
    email: string
    completedFormations: number
    avgProgress: number
    appointmentsCount: number
    score: number
  }>
  detailedStats: {
    formationsByLevel: Record<string, number>
    appointmentsByStatus: Record<string, number>
    engagementRate: number
  }
}

interface AdminReportsTabProps {
  onUpdate: () => void
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export function AdminReportsTab({ onUpdate }: AdminReportsTabProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [activeChart, setActiveChart] = useState<'monthly' | 'levels' | 'status'>('monthly')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/admin-entreprise/reports?period=${selectedPeriod}`)
      
      if (!response.ok) {
        toast.error('Erreur lors du chargement des données')
        return
      }
      
      const data = await response.json()
      console.log('📊 Données reçues:', data) // Debug log
      setReportData(data) // L'API retourne directement les données, pas data.reportData
    } catch (error) {
      console.error('❌ Erreur fetch reports:', error)
      toast.error('Erreur lors du chargement des données rapport')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: string) => {
    try {
      setGenerating(type)
      
      const response = await fetch('/api/dashboard/admin-entreprise/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          period: selectedPeriod,
          format: selectedFormat
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapport-${type}-${selectedPeriod}-${new Date().toLocaleDateString('fr-FR')}.${selectedFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(`Rapport ${type} généré avec succès`)
      } else {
        toast.error('Erreur lors de la génération du rapport')
      }
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport')
    } finally {
      setGenerating(null)
    }
  }

  const refreshData = () => {
    fetchReportData()
    onUpdate()
    toast.success('Données actualisées')
  }

  // Préparation des données pour les graphiques
  const formationsByLevelData = reportData?.detailedStats?.formationsByLevel ? 
    Object.entries(reportData.detailedStats.formationsByLevel).map(([level, count]) => ({
      name: level,
      value: count,
      percentage: reportData.formations.total > 0 ? Math.round((count / reportData.formations.total) * 100) : 0
    })) : []

  const appointmentsByStatusData = reportData?.detailedStats?.appointmentsByStatus ?
    Object.entries(reportData.detailedStats.appointmentsByStatus).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: reportData.consultations.total > 0 ? Math.round((count / reportData.consultations.total) * 100) : 0
    })) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement des rapports...</span>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-4 text-gray-300" />
        <p>Aucune donnée disponible pour cette période</p>
        <Button onClick={fetchReportData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Rapports et Analyses</span>
              </CardTitle>
              <CardDescription>
                Données en temps réel pour {reportData.timeframe.toLowerCase()}
              </CardDescription>
            </div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Période:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Format:</span>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Graphique:</span>
              <select
                value={activeChart}
                onChange={(e) => setActiveChart(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Évolution mensuelle</option>
                <option value="levels">Formations par niveau</option>
                <option value="status">Consultations par statut</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Formations</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.formations.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {reportData.formations.completed} terminées
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.users.active}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1 text-blue-500" />
              {reportData.detailedStats.engagementRate}% d'engagement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.consultations.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 text-purple-500" />
              {reportData.consultations.averageDuration}min en moyenne
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.formations.averageCompletion}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Moyenne des progressions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique principal */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeChart === 'monthly' && 'Évolution Mensuelle'}
              {activeChart === 'levels' && 'Formations par Niveau'}
              {activeChart === 'status' && 'Consultations par Statut'}
            </CardTitle>
            <CardDescription>
              {activeChart === 'monthly' && 'Activité sur les 3 derniers mois'}
              {activeChart === 'levels' && 'Répartition des niveaux de formation'}
              {activeChart === 'status' && 'État des consultations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'monthly' && reportData.monthlyData.length > 0 ? (
                  <AreaChart data={reportData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="formations" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                      name="Formations"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="consultations" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Consultations"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stackId="1"
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.6}
                      name="Utilisateurs actifs"
                    />
                  </AreaChart>
                ) : activeChart === 'levels' && formationsByLevelData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={formationsByLevelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formationsByLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : activeChart === 'status' && appointmentsByStatusData.length > 0 ? (
                  <BarChart data={appointmentsByStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8B5CF6" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Employés les plus performants ({reportData.topPerformers.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={performer.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">
                      {performer.completedFormations} formations • {performer.avgProgress}% • Score: {performer.score}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      performer.score >= 80 ? 'bg-green-100 text-green-800' :
                      performer.score >= 60 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {performer.score >= 80 ? 'Excellent' :
                       performer.score >= 60 ? 'Très bon' : 'Bon'}
                    </div>
                  </div>
                </div>
              ))}
              {reportData.topPerformers.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucun utilisateur avec activité</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Types de rapports disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports Téléchargeables</CardTitle>
          <CardDescription>
            Générez et téléchargez des rapports détaillés pour {reportData.timeframe.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                type: 'formations',
                title: 'Rapport Formations',
                description: 'Détail des formations et progressions',
                icon: BookOpen,
                color: 'green'
              },
              {
                type: 'users',
                title: 'Rapport Utilisateurs',
                description: 'Activité et engagement des employés',
                icon: Users,
                color: 'blue'
              },
              {
                type: 'consultations',
                title: 'Rapport Consultations',
                description: 'Sessions et rendez-vous',
                icon: Calendar,
                color: 'purple'
              },
              {
                type: 'complete',
                title: 'Rapport Complet',
                description: 'Toutes les données consolidées',
                icon: BarChart3,
                color: 'orange'
              },
              {
                type: 'trends',
                title: 'Analyse Tendances',
                description: 'Évolution et insights',
                icon: TrendingUp,
                color: 'indigo'
              },
              {
                type: 'custom',
                title: 'Rapport Personnalisé',
                description: 'Métriques sur mesure',
                icon: FileText,
                color: 'gray'
              }
            ].map((report) => {
              const Icon = report.icon
              return (
                <div key={report.type} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 bg-${report.color}-100 rounded-lg`}>
                      <Icon className={`h-5 w-5 text-${report.color}-600`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-500">{report.description}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => generateReport(report.type)}
                    disabled={generating === report.type}
                    size="sm" 
                    className="w-full"
                    variant={report.type === 'custom' ? 'outline' : 'default'}
                  >
                    {generating === report.type ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        Télécharger {selectedFormat.toUpperCase()}
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informations et aide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Guide d'utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Formats disponibles:</h4>
              <ul className="space-y-1">
                <li>• <strong>PDF:</strong> Rapport formaté avec graphiques</li>
                <li>• <strong>Excel:</strong> Données tabulaires pour analyse</li>
                <li>• <strong>CSV:</strong> Export brut pour traitement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fréquence de mise à jour:</h4>
              <ul className="space-y-1">
                <li>• Les données sont mises à jour en temps réel</li>
                <li>• Actualisation automatique toutes les 5 minutes</li>
                <li>• Utilisez le bouton "Actualiser" pour forcer</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}