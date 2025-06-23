'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Video, Link, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AcceptConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  appointmentTitle: string
  onAcceptSuccess: () => void
}

export function AcceptConsultationModal({ 
  isOpen, 
  onClose, 
  appointmentId, 
  appointmentTitle,
  onAcceptSuccess 
}: AcceptConsultationModalProps) {
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/new')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    if (!meetingUrl || !meetingUrl.startsWith('http')) {
      toast.error('Veuillez fournir un lien valide (commençant par http)')
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'accept',
          meetingUrl: meetingUrl.trim(),
          notes: notes.trim()
        })
      })

      if (response.ok) {
        toast.success('Consultation acceptée et lien de meeting ajouté !')
        onAcceptSuccess()
        onClose()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de l\'acceptation')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Accepter la consultation</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Détails de la consultation */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Consultation à accepter</h3>
            <p className="text-blue-700">{appointmentTitle}</p>
          </div>

          {/* Lien de meeting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Video className="h-4 w-4 inline mr-1" />
              Lien de visioconférence
            </label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/xyz-abc-def"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Le client recevra ce lien par notification
            </p>
          </div>

          {/* Options de liens rapides */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMeetingUrl('https://meet.google.com/new')}
              className="text-xs"
            >
              Google Meet
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMeetingUrl('https://zoom.us/j/')}
              className="text-xs"
            >
              Zoom
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMeetingUrl('https://teams.microsoft.com/l/meetup-join/')}
              className="text-xs"
            >
              Teams
            </Button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions ou préparatifs pour le client..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Information */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-green-800 font-medium">Confirmation automatique</p>
                <p className="text-green-700">
                  Le client et l'admin de l'entreprise seront automatiquement notifiés 
                  avec le lien de meeting.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAccept}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isLoading || !meetingUrl}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Acceptation...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepter et Confirmer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 