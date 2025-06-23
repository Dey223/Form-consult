'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  User,
  Building2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userName?: string
  companyName?: string
}

export function CreateConsultationModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  userName,
  companyName
}: CreateConsultationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    urgency: 'normal' as 'low' | 'normal' | 'high'
  })

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      // Combiner date et heure
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`)
      
      // Vérifier que la date n'est pas dans le passé
      if (scheduledAt <= new Date()) {
        toast.error('La date doit être dans le futur')
        setLoading(false)
        return
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          scheduledAt: scheduledAt.toISOString(),
          duration: formData.duration,
          urgency: formData.urgency
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Demande de consultation envoyée avec succès !')
        onSuccess()
        onClose()
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          scheduledDate: '',
          scheduledTime: '',
          duration: 60,
          urgency: 'normal'
        })
      } else {
        toast.error(data.error || 'Erreur lors de la création de la demande')
      }
    } catch (error) {
      toast.error('Erreur de connexion. Veuillez réessayer.')
      console.error('Erreur création consultation:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obtenir la date minimale (demain)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Obtenir l'heure minimale si c'est aujourd'hui
  const getMinTime = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    return formData.scheduledDate === new Date().toISOString().split('T')[0] ? currentTime : '08:00'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Demander une consultation</span>
          </DialogTitle>
          <DialogDescription>
            Planifiez une session personnalisée avec nos experts pour vous accompagner dans vos défis professionnels.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations utilisateur */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Informations de la demande
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Demandeur :</strong> {userName || 'Utilisateur'}</p>
              <p><strong>Entreprise :</strong> {companyName || 'Non spécifiée'}</p>
            </div>
          </div>

          {/* Sujet de la consultation */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Sujet de la consultation *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Gestion d'équipe, Leadership, Gestion de projet..."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Description détaillée */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description détaillée *
            </Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre situation, vos défis et ce que vous aimeriez accomplir lors de cette consultation..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Plus votre description est détaillée, mieux nous pourrons vous assigner l'expert le plus adapté.
            </p>
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Date souhaitée *
              </Label>
              <Input
                id="date"
                type="date"
                min={getMinDate()}
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Heure souhaitée *
              </Label>
              <Input
                id="time"
                type="time"
                min={getMinTime()}
                max="18:00"
                value={formData.scheduledTime}
                onChange={(e) => handleChange('scheduledTime', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Durée */}
          <div className="space-y-2">
            <Label htmlFor="duration">Durée estimée</Label>
            <select 
              id="duration"
              value={formData.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes - Question rapide</option>
              <option value={60}>1 heure - Consultation standard</option>
              <option value={90}>1h30 - Session approfondie</option>
              <option value={120}>2 heures - Workshop complet</option>
            </select>
          </div>

          {/* Niveau d'urgence */}
          <div className="space-y-2">
            <Label>Niveau d'urgence</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: '🟢 Normal', desc: 'Planification standard' },
                { value: 'normal', label: '🟡 Important', desc: 'Traitement prioritaire' },
                { value: 'high', label: '🔴 Urgent', desc: 'Nécessite une réponse rapide' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('urgency', option.value)}
                  className={`p-3 text-sm border rounded-lg text-left transition-colors ${
                    formData.urgency === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Informations importantes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-yellow-800 mb-1">À savoir</h4>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Un expert sera assigné dans les 24h ouvrées</li>
                  <li>• Vous recevrez une confirmation par email</li>
                  <li>• La session se déroulera en visioconférence</li>
                  <li>• Un rapport de session vous sera transmis</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Envoyer la demande
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 