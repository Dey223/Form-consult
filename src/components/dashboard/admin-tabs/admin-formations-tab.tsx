'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  Clock, 
  Search,
  Plus,
  Eye,
  Target,
  X,
  MessageSquare,
  Settings,
  Calendar,
  Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ConsultationDetailsModal } from '../modals/consultation-details-modal'

interface Formation {
  id: string
  title: string
  description: string
  duration: number
  level: string
  enrolledCount: number
  completedCount: number
  averageProgress: number
  category?: { name: string } | null
  isAvailable: boolean
  createdAt: string
  isPublished: boolean
  author?: { name: string; email: string } | null
  sections?: Array<{
    id: string
    title: string
    lessons: Array<{
      id: string
      title: string
      duration: number
    }>
  }>
}

interface User {
  id: string
  name: string
  email: string
  role: string
  companyId?: string
  userFormations?: Array<{
    formation: {
      id: string
      title: string
    }
  }>
}

interface ConsultationRequest {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  urgency: 'low' | 'normal' | 'high'
  scheduledAt: string
  user: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

interface AdminFormationsTabProps {
  onUpdate: () => void
}

export function AdminFormationsTab({ onUpdate }: AdminFormationsTabProps) {
  const [formations, setFormations] = useState<Formation[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConsultationDetailsModal, setShowConsultationDetailsModal] = useState(false)
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  
  // Form states pour demande formation
  const [formationRequest, setFormationRequest] = useState({
    subject: '',
    justification: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les formations réelles
      const formationsResponse = await fetch('/api/formations')
      if (formationsResponse.ok) {
        const formationsData = await formationsResponse.json()
        // Transformer les données pour le format attendu
        const transformedFormations = formationsData.map((formation: any) => ({
          id: formation.id,
          title: formation.title,
          description: formation.description,
          duration: formation.duration || 0,
          level: formation.level || 'DEBUTANT',
          enrolledCount: formation.enrolledCount || 0,
          completedCount: formation.completedCount || 0,
          averageProgress: formation.averageProgress || 0,
          category: formation.category,
          isAvailable: formation.isPublished,
          createdAt: formation.createdAt,
          isPublished: formation.isPublished,
          author: formation.author,
          sections: formation.sections
        }))
        setFormations(transformedFormations)
      } else {
        console.error('Erreur lors de la récupération des formations')
        toast.error('Erreur lors du chargement des formations')
      }

      // Récupérer les employés de l'entreprise
      const employeesResponse = await fetch('/api/dashboard/admin-entreprise/employees')
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData)
      } else {
        console.error('Erreur lors de la récupération des employés')
        toast.error('Erreur lors du chargement des employés')
      }

      // Récupérer les demandes de consultation
      const consultationsResponse = await fetch('/api/dashboard/admin-entreprise/consultation-requests')
      if (consultationsResponse.ok) {
        const consultationsData = await consultationsResponse.json()
        setConsultationRequests(consultationsData)
      } else {
        console.error('Erreur lors de la récupération des consultations')
      }

    } catch (error) {
      console.error('Erreur chargement données:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignFormation = async () => {
    if (!selectedFormation || selectedEmployees.length === 0) {
      toast.error('Veuillez sélectionner une formation et au moins un employé')
      return
    }

    setAssignLoading(true)
    try {
      const response = await fetch('/api/users/assign-formation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedEmployees,
          formationId: selectedFormation.id
        }),
      })

      if (response.ok) {
        toast.success(`Formation assignée à ${selectedEmployees.length} employé(s)`)
        setShowAssignModal(false)
        setSelectedFormation(null)
        setSelectedEmployees([])
        fetchData()
        onUpdate()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de l\'assignation')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRequestFormation = async () => {
    if (!formationRequest.subject || !formationRequest.justification) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    try {
      const response = await fetch('/api/dashboard/admin-entreprise/formation-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formationRequest)
      })

      if (response.ok) {
        toast.success('Demande de formation envoyée')
        setShowRequestModal(false)
        setFormationRequest({ subject: '', justification: '' })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleViewFormation = (formation: Formation) => {
    setSelectedFormation(formation)
    setShowDetailsModal(true)
  }

  const handleConsultationAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/dashboard/admin-entreprise/consultation-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast.success(`Demande ${action === 'approve' ? 'approuvée' : 'rejetée'}`)
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de l\'action')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleViewConsultationDetails = (consultationId: string) => {
    setSelectedConsultationId(consultationId)
    setShowConsultationDetailsModal(true)
  }

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'DEBUTANT': return 'bg-green-100 text-green-800'
      case 'INTERMEDIAIRE': return 'bg-blue-100 text-blue-800'
      case 'AVANCE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-blue-600'
    if (rate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (formation.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = !filterLevel || formation.level === filterLevel
    const matchesStatus = !filterStatus || 
      (filterStatus === 'available' && formation.isAvailable) ||
      (filterStatus === 'popular' && formation.enrolledCount > 10)
    
    return matchesSearch && matchesLevel && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestion des Formations</h2>
              <p className="text-sm text-gray-600">{formations.length} formations disponibles</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowRequestModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Demander une formation
              </Button>
            </div>
          </div>
        
        {/* Barre de recherche */}
              <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Formations</p>
              <p className="text-2xl font-bold text-gray-900">{formations.length}</p>
            </div>
                      </div>
                    </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Participants Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formations.reduce((sum, f) => sum + f.enrolledCount, 0)}
              </p>
                      </div>
                      </div>
                    </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completions</p>
              <p className="text-2xl font-bold text-gray-900">
                {formations.reduce((sum, f) => sum + f.completedCount, 0)}
              </p>
                      </div>
                      </div>
                    </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Taux Moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {formations.length > 0 ? 
                  Math.round(formations.reduce((sum, f) => sum + f.averageProgress, 0) / formations.length) 
                  : 0}%
              </p>
            </div>
            </div>
            </div>
          </div>

      {/* Liste des formations */}
      {filteredFormations.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {searchTerm ? 'Aucune formation trouvée' : 'Aucune formation disponible'}
          </p>
          <p className="text-gray-400 text-sm">
            {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Les formations de votre entreprise apparaîtront ici'}
          </p>
              </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormations.map((formation) => (
            <Card key={formation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={formation.isPublished ? "default" : "secondary"}>
                    {formation.isPublished ? 'Publiée' : 'Brouillon'}
                  </Badge>
                  <Badge variant="outline">{formation.level}</Badge>
                </div>
                <CardTitle className="line-clamp-2">{formation.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {formation.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Statistiques de la formation */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{formation.enrolledCount} inscrits</span>
              </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>{formation.completedCount} terminés</span>
            </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-orange-500" />
                      <span>{formation.duration}h</span>
                </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-purple-500" />
                      <span>{formation.averageProgress}%</span>
                        </div>
                      </div>

                  {/* Barre de progression */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression moyenne</span>
                      <span>{formation.averageProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${formation.averageProgress}%` }}
                      ></div>
            </div>
          </div>

                  {/* Informations supplémentaires */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {formation.category?.name || 'Sans catégorie'}
                    </span>
                    <span>
                      {new Date(formation.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                        </div>
                        
                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                      className="flex-1"
                      onClick={() => handleViewFormation(formation)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                              <Button 
                                size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedFormation(formation)
                        setShowAssignModal(true)
                      }}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Assigner
                              </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

      {/* Modal de demande de formation */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Demander une formation</DialogTitle>
            <DialogDescription>
              Décrivez la formation dont votre entreprise a besoin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-sm font-medium">
                Sujet de la formation *
              </Label>
              <Input
                id="subject"
                placeholder="Ex: Formation en cybersécurité"
                value={formationRequest.subject}
                onChange={(e) => setFormationRequest({
                  ...formationRequest,
                  subject: e.target.value
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="justification" className="text-sm font-medium">
                Justification et détails *
              </Label>
              <Textarea
                id="justification"
                placeholder="Expliquez pourquoi cette formation est nécessaire, les objectifs attendus, le nombre d'employés concernés, etc."
                value={formationRequest.justification}
                onChange={(e) => setFormationRequest({
                  ...formationRequest,
                  justification: e.target.value
                })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note :</strong> Votre demande sera envoyée aux administrateurs de la plateforme qui évalueront la possibilité de créer cette formation.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestModal(false)
                setFormationRequest({ subject: '', justification: '' })
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleRequestFormation}
              disabled={!formationRequest.subject || !formationRequest.justification}
            >
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'assignation de formation */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assigner une formation</DialogTitle>
            <DialogDescription>
              Sélectionnez les employés à qui assigner la formation "{selectedFormation?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informations de la formation sélectionnée */}
            {selectedFormation && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">{selectedFormation.title}</h4>
                <p className="text-sm text-blue-700 mb-2">{selectedFormation.description}</p>
                <div className="flex items-center space-x-4 text-sm text-blue-600">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedFormation.duration}h
                  </span>
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    {selectedFormation.level}
                  </span>
                </div>
              </div>
            )}

            {/* Liste des employés */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Sélectionner les employés ({employees.length} disponibles)
              </Label>
              
              {employees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucun employé trouvé dans votre entreprise</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {employees.map((employee) => {
                    const isAlreadyAssigned = employee.userFormations?.some(
                      uf => uf.formation.id === selectedFormation?.id
                    )
                    
                    return (
                      <div
                        key={employee.id}
                        className={`flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                          isAlreadyAssigned ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`employee-${employee.id}`}
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, employee.id])
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id))
                            }
                          }}
                          disabled={isAlreadyAssigned}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`employee-${employee.id}`}
                            className={`block text-sm font-medium cursor-pointer ${
                              isAlreadyAssigned ? 'text-gray-500' : 'text-gray-900'
                            }`}
                          >
                            {employee.name || 'Nom non défini'}
                          </label>
                          <p className={`text-xs ${isAlreadyAssigned ? 'text-gray-400' : 'text-gray-600'}`}>
                            {employee.email}
                          </p>
                          {isAlreadyAssigned && (
                            <p className="text-xs text-yellow-600 mt-1">
                              ✓ Déjà assigné à cette formation
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Actions de sélection rapide */}
            {employees.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const availableEmployees = employees.filter(emp => 
                      !emp.userFormations?.some(uf => uf.formation.id === selectedFormation?.id)
                    )
                    setSelectedEmployees(availableEmployees.map(emp => emp.id))
                  }}
                >
                  Sélectionner tous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmployees([])}
                >
                  Désélectionner tous
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignModal(false)
                setSelectedFormation(null)
                setSelectedEmployees([])
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssignFormation}
              disabled={assignLoading || selectedEmployees.length === 0}
            >
              {assignLoading ? 'Assignation...' : `Assigner à ${selectedEmployees.length} employé(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de détails de consultation */}
      <ConsultationDetailsModal
        isOpen={showConsultationDetailsModal}
        onClose={() => setShowConsultationDetailsModal(false)}
        consultationId={selectedConsultationId}
      />
    </div>
  )
} 