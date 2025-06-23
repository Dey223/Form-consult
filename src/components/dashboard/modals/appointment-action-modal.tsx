'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Calendar,
  Clock,
  User,
  Building2,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Appointment {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  duration: number
  status: string
  user: { name: string; email: string }
  consultant: { name: string; email: string } | null
  company: { name: string }
}

interface Consultant {
  id: string
  name: string
  email: string
}

interface AppointmentActionModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  action: 'accept' | 'cancel' | 'assign' | null
  onSuccess: () => void
}

export function AppointmentActionModal({ 
  isOpen, 
  onClose, 
  appointment, 
  action,
  onSuccess 
}: AppointmentActionModalProps) {
  const [loading, setLoading] = useState(false)
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedConsultantId, setSelectedConsultantId] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [loadingConsultants, setLoadingConsultants] = useState(false)

  useEffect(() => {
    if (action === 'assign' && isOpen) {
      console.log("🔧 Modal ouvert pour assignation")
      fetchConsultants()
    }
  }, [action, isOpen])

  const fetchConsultants = async () => {
    try {
      setLoadingConsultants(true)
      console.log("🔍 Récupération des consultants...")
      const response = await fetch('/api/consultants')
      console.log("📡 Réponse API:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Données reçues:", data)
        console.log("📊 Nombre de consultants:", data.consultants?.length || 0)
        setConsultants(data.consultants || [])
      } else {
        const errorText = await response.text()
        console.error("❌ Erreur API:", errorText)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des consultants:', error)
    } finally {
      setLoadingConsultants(false)
    }
  }

  const handleAction = async () => {
    if (!appointment) return

    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          consultantId: action === 'assign' ? selectedConsultantId : undefined,
          meetingUrl: (action === 'accept' || action === 'assign') ? meetingUrl : undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(getSuccessMessage())
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Erreur lors de l\'action')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getSuccessMessage = () => {
    switch (action) {
      case 'accept':
        return 'Consultation confirmée avec succès'
      case 'cancel':
        return 'Consultation annulée avec succès'
      case 'assign':
        return 'Consultant assigné avec succès'
      default:
        return 'Action effectuée avec succès'
    }
  }

  const getActionText = () => {
    switch (action) {
      case 'accept':
        return 'Confirmer la consultation'
      case 'cancel':
        return 'Annuler la consultation'
      case 'assign':
        return 'Assigner un consultant'
      default:
        return 'Action'
    }
  }

  const getActionIcon = () => {
    switch (action) {
      case 'accept':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancel':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'assign':
        return <UserCheck className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getActionDescription = () => {
    switch (action) {
      case 'accept':
        return 'Confirmer ce rendez-vous et notifier le client ?'
      case 'cancel':
        return 'Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.'
      case 'assign':
        return 'Sélectionnez un consultant pour ce rendez-vous :'
      default:
        return ''
    }
  }

  if (!appointment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getActionIcon()}
            <span>{getActionText()}</span>
          </DialogTitle>
          <DialogDescription>
            {getActionDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Détails du rendez-vous */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Détails du rendez-vous</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{appointment.title}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  {new Date(appointment.scheduledAt).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} ({appointment.duration} min)
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{appointment.user.name} ({appointment.user.email})</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>{appointment.company.name}</span>
              </div>
              
              {appointment.consultant && (
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-gray-500" />
                  <span>Consultant: {appointment.consultant.name}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Badge className={
                  appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  appointment.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                  appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  appointment.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                  appointment.status === 'CANCELED' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {appointment.status === 'PENDING' ? 'En attente' :
                   appointment.status === 'ASSIGNED' ? 'Assignée' :
                   appointment.status === 'CONFIRMED' ? 'Confirmée' :
                   appointment.status === 'REJECTED' ? 'Refusée' :
                   appointment.status === 'COMPLETED' ? 'Terminée' :
                   appointment.status === 'CANCELED' ? 'Annulée' :
                   appointment.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Sélecteur de consultant pour l'assignation */}
          {action === 'assign' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultant à assigner
              </label>
              <select
                value={selectedConsultantId}
                onChange={(e) => setSelectedConsultantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  {consultants.length === 0 ? "Aucun consultant disponible" : "Sélectionner un consultant"}
                </option>
                {consultants.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.name} ({consultant.email})
                  </option>
                ))}
              </select>
              {consultants.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Vérifiez la console pour les logs de chargement des consultants.
                </p>
              )}
            </div>
          )}

          {/* Champ URL de meeting pour acceptation et assignation */}
          {(action === 'accept' || action === 'assign') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien de visioconférence
              </label>
              <Input
                type="url"
                placeholder="https://meet.google.com/... ou https://zoom.us/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ce lien sera communiqué au client et au consultant pour le rendez-vous.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleAction}
            disabled={loading || (action === 'assign' && !selectedConsultantId)}
            className={
              action === 'accept' ? 'bg-green-600 hover:bg-green-700' :
              action === 'cancel' ? 'bg-red-600 hover:bg-red-700' :
              'bg-blue-600 hover:bg-blue-700'
            }
          >
            {loading ? 'En cours...' : 
             action === 'accept' ? 'Accepter' :
             action === 'cancel' ? 'Annuler le RDV' :
             'Assigner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 