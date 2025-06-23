"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  X, 
  Check, 
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  Video,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
      // Bloquer le scroll du body
      document.body.style.overflow = 'hidden'
    } else {
      // Restaurer le scroll du body
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        toast.error('Erreur lors du chargement des notifications')
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        toast.success('Notification marquée comme lue')
      } else {
        toast.error('Erreur lors du marquage')
      }
    } catch (error) {
      console.error('Erreur marquage lecture:', error)
      toast.error('Erreur de connexion')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        )
        setUnreadCount(0)
        toast.success('Toutes les notifications marquées comme lues')
      } else {
        toast.error('Erreur lors du marquage global')
      }
    } catch (error) {
      console.error('Erreur marquage global:', error)
      toast.error('Erreur de connexion')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        )
        // Mettre à jour le count si la notification était non lue
        const deletedNotif = notifications.find(n => n.id === notificationId)
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        toast.success('Notification supprimée')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression notification:', error)
      toast.error('Erreur de connexion')
    }
  }

  const deleteAllNotifications = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      return
    }

    try {
      const response = await fetch('/api/notifications?all=true', {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications([])
        setUnreadCount(0)
        toast.success('Toutes les notifications supprimées')
      } else {
        toast.error('Erreur lors de la suppression globale')
      }
    } catch (error) {
      console.error('Erreur suppression globale:', error)
      toast.error('Erreur de connexion')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'consultation_assigned':
        return <User className="h-4 w-4 text-blue-500" />
      case 'consultation_confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'consultation_rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'consultation_completed':
        return <Check className="h-4 w-4 text-purple-500" />
      case 'consultation_canceled':
        return <X className="h-4 w-4 text-gray-500" />
      
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
    return date.toLocaleDateString('fr-FR')
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lue si pas encore lu
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    // Gérer les actions spécifiques selon le type
    if (notification.data) {
      try {
        const data = JSON.parse(notification.data)
        
        if (data.appointmentId) {
          // Rediriger vers la consultation
          const currentPath = window.location.pathname
          if (currentPath.includes('/dashboard')) {
            // Si on est déjà sur le dashboard, juste changer d'onglet
            window.location.hash = `#consultations&appointment=${data.appointmentId}`
            onClose()
          } else {
            // Sinon rediriger vers le dashboard
            window.location.href = `/dashboard?tab=consultations&appointment=${data.appointmentId}`
          }
        }
        
        if (data.meetingUrl) {
          // Proposer d'ouvrir le lien de meeting
          if (confirm('Voulez-vous ouvrir le lien de visioconférence ?')) {
            window.open(data.meetingUrl, '_blank')
          }
        }
      } catch (e) {
        console.error('Erreur parsing data notification:', e)
      }
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !mounted) return null

  const panelContent = (
    <div 
      className="fixed inset-0 z-[9999] flex justify-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop avec opacité réduite */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* Panel */}
      <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-md font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteAllNotifications}
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Tout supprimer
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-blue-600 hover:text-blue-700 text-xs"
                  >
                    Tout marquer lu
                  </Button>
                )}
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Chargement...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-center">Aucune notification</p>
              <p className="text-sm text-center mt-2">Vous serez notifié des mises à jour importantes ici</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Supprimer cette notification"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 pr-2">
                        {notification.message}
                      </p>
                      
                      {notification.data && (() => {
                        try {
                          const data = JSON.parse(notification.data)
                          return (
                            <div className="mt-2 space-y-2">
                              {/* Tags informatifs */}
                              <div className="flex flex-wrap gap-2">
                                {data.appointmentId && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Consultation
                                  </span>
                                )}
                                {data.meetingUrl && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                    <Video className="h-3 w-3 mr-1" />
                                    Lien meeting disponible
                                  </span>
                                )}
                                {data.scheduledAt && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(data.scheduledAt).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                              
                              {/* Bouton d'action pour rejoindre la consultation */}
                              {data.meetingUrl && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      window.open(data.meetingUrl, '_blank')
                                      // Marquer comme lu automatiquement
                                      if (!notification.isRead) {
                                        markAsRead(notification.id)
                                      }
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
                                  >
                                    <Video className="h-3 w-3 mr-1" />
                                    Rejoindre la consultation
                                    <ExternalLink className="h-2 w-2 ml-1" />
                                  </button>
                                  
                                  {data.appointmentId && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Rediriger vers la consultation
                                        const currentPath = window.location.pathname
                                        if (currentPath.includes('/dashboard')) {
                                          window.location.hash = `#consultations&appointment=${data.appointmentId}`
                                        } else {
                                          window.location.href = `/dashboard?tab=consultations&appointment=${data.appointmentId}`
                                        }
                                        onClose()
                                      }}
                                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                                    >
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Voir détails
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        } catch (e) {
                          return null
                        }
                      })()}
                      
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Les notifications se mettent à jour automatiquement
          </p>
        </div>
      </div>
    </div>
  )

  // Utiliser un portail pour éviter les problèmes de z-index
  return createPortal(panelContent, document.body)
} 