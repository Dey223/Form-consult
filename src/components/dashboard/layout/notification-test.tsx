"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, TestTube } from 'lucide-react'
import toast from 'react-hot-toast'

export function NotificationTest() {
  const [loading, setLoading] = useState(false)

  const testNotifications = async () => {
    setLoading(true)
    try {
      // Créer une notification de test
      const createResponse = await fetch('/api/test-notifications', {
        method: 'POST'
      })
      
      if (createResponse.ok) {
        const createData = await createResponse.json()
        console.log('✅ Notification créée:', createData)
        toast.success('Notification de test créée!')
        
        // Vérifier les notifications
        const getResponse = await fetch('/api/test-notifications')
        if (getResponse.ok) {
          const getData = await getResponse.json()
          console.log('📊 État des notifications:', getData)
          
          // Vérifier l'API notifications
          const notifResponse = await fetch('/api/notifications')
          if (notifResponse.ok) {
            const notifData = await notifResponse.json()
            console.log('🔔 API notifications:', notifData)
            toast.success(`Trouvé ${notifData.notifications?.length || 0} notifications`)
          } else {
            console.error('❌ Erreur API notifications:', await notifResponse.text())
            toast.error('Erreur API notifications')
          }
        } else {
          console.error('❌ Erreur test GET:', await getResponse.text())
        }
      } else {
        const errorData = await createResponse.json()
        console.error('❌ Erreur création notification:', errorData)
        toast.error('Erreur: ' + errorData.error)
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={testNotifications}
        disabled={loading}
        variant="outline"
        size="sm"
        className="border-orange-200 text-orange-600 hover:bg-orange-50"
      >
        <TestTube className="h-4 w-4 mr-1" />
        {loading ? 'Test...' : 'Test Notifications'}
      </Button>
    </div>
  )
} 