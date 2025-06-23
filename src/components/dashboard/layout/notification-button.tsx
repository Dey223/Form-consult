"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { NotificationsPanel } from './notifications-panel'

export function NotificationButton() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchUnreadCount = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?unread=true')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Charger initialement
    fetchUnreadCount()
    
    // Actualiser toutes les 15 secondes pour les notifications en temps réel
    const interval = setInterval(fetchUnreadCount, 15000)
    
    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    setShowPanel(true)
  }

  const handleClosePanel = () => {
    setShowPanel(false)
    // Rafraîchir le count après fermeture du panel
    fetchUnreadCount()
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="relative p-2 hover:bg-gray-100"
        disabled={loading}
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-500'}`} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-500 text-white text-xs min-w-[1.2rem] h-5 rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      <NotificationsPanel 
        isOpen={showPanel} 
        onClose={handleClosePanel}
      />
    </>
  )
} 