'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  BookOpen,
  Calendar,
  Target,
  Eye,
  Download
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
  Area,
  AreaChart
} from 'recharts'

interface EmployeePerformance {
  id: string
  name: string
  email: string
  formationsCompleted: number
  formationsInProgress: number
  consultationsCount: number
  averageScore: number
  totalHoursLearning: number
  lastActivity: string
  progressData: {
    labels: string[]
    completed: number[]
    inProgress: number[]
  }
}

interface PerformanceStats {
  totalEmployees: number
  activeEmployees: number
  avgCompletionRate: number
  totalFormationsCompleted: number
  totalConsultationsRequested: number
  topPerformers: EmployeePerformance[]
  monthlyProgress: {
    month: string
    formations: number
    consultations: number
  }[]
}

// Couleurs pour les graphiques
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export function AdminPerformanceTab() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [employees, setEmployees] = useState<EmployeePerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('3months')

  useEffect(() => {
    fetchPerformanceData()
  }, [selectedPeriod])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/admin-entreprise/performance?period=${selectedPeriod}`)
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setEmployees(data.employees)
      } else {
        console.error('Erreur API performance:', response.status)
        toast.error('Impossible de charger les données de performance')
        
        // Initialiser avec des données vides au lieu de mock data
        setStats({
          totalEmployees: 0,
          activeEmployees: 0,
          avgCompletionRate: 0,
          totalFormationsCompleted: 0,
          totalConsultationsRequested: 0,
          topPerformers: [],
          monthlyProgress: []
        })
        
        setEmployees([])
      }
    } catch (error) {
      console.error('Erreur chargement performance:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    if (!stats || employees.length === 0) {
      toast.error('Aucune donnée à exporter')
      return
    }

    const csvContent = [
      ['Nom', 'Email', 'Formations Complétées', 'Consultations', 'Score Moyen', 'Heures Apprentissage'].join(','),
      ...employees.map(emp => [
        emp.name,
        emp.email,
        emp.formationsCompleted,
        emp.consultationsCount,
        emp.averageScore,
        emp.totalHoursLearning
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-employes-${selectedPeriod}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Export réussi !')
  }

  // Données pour le graphique de répartition des scores
  const scoreDistribution = employees.reduce((acc, emp) => {
    const scoreRange = emp.averageScore >= 80 ? 'Excellent (80-100%)' :
                     emp.averageScore >= 60 ? 'Bon (60-79%)' :
                     emp.averageScore >= 40 ? 'Moyen (40-59%)' : 'À améliorer (<40%)'
    
    acc[scoreRange] = (acc[scoreRange] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const scoreChartData = Object.entries(scoreDistribution).map(([range, count]) => ({
    name: range,
    value: count,
    percentage: Math.round((count / employees.length) * 100)
  }))

  // Calculer le taux d'engagement
  const engagementRate = stats ? Math.round((stats.activeEmployees / Math.max(stats.totalEmployees, 1)) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement des performances...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance des Employés</h2>
          <p className="text-gray-600">Analyse des formations et consultations</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1month">Dernier mois</option>
            <option value="3months">3 derniers mois</option>
            <option value="6months">6 derniers mois</option>
            <option value="1year">Dernière année</option>
          </select>
          
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeEmployees || 0} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgCompletionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Moyenne globale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations Terminées</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFormationsCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ce trimestre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConsultationsRequested || 0}</div>
            <p className="text-xs text-muted-foreground">
              Demandes total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              Taux d'activité
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution Mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution Mensuelle</CardTitle>
            <CardDescription>
              Formations complétées et consultations demandées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats?.monthlyProgress && stats.monthlyProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="formations" fill="#3B82F6" name="Formations" />
                    <Bar dataKey="consultations" fill="#10B981" name="Consultations" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Répartition des Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Performances</CardTitle>
            <CardDescription>
              Distribution des scores moyens des employés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {scoreChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scoreChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune donnée de performance</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des employés avec performances */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par Employé</CardTitle>
          <CardDescription>
            Performance individuelle et progression ({employees.length} employés)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{employee.name}</h4>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                      <p className="text-xs text-gray-500">
                        Dernière activité: {new Date(employee.lastActivity).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{employee.formationsCompleted}</p>
                      <p className="text-gray-600">Formations</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{employee.consultationsCount}</p>
                      <p className="text-gray-600">Consultations</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-medium ${
                        employee.averageScore >= 80 ? 'text-green-600' :
                        employee.averageScore >= 60 ? 'text-blue-600' :
                        employee.averageScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {employee.averageScore}%
                      </p>
                      <p className="text-gray-600">Score moyen</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{employee.totalHoursLearning}h</p>
                      <p className="text-gray-600">Temps total</p>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun employé trouvé pour cette période</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Top Performers</span>
            </CardTitle>
            <CardDescription>
              Employés les plus performants cette période
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees
                .sort((a, b) => (b.averageScore * 0.6 + b.formationsCompleted * 10) - (a.averageScore * 0.6 + a.formationsCompleted * 10))
                .slice(0, 3)
                .map((employee, index) => (
                <div key={employee.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-600">
                      {employee.formationsCompleted} formations • Score: {employee.averageScore}% • {employee.totalHoursLearning}h
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">
                      {index === 0 ? 'Or' : index === 1 ? 'Argent' : 'Bronze'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 