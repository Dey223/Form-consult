'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  LogOut, 
  User, 
  Settings, 
  ChevronDown, 
  Menu,
  X,
  Search,
  Plus,
  Calendar,
  Users,
  Bell,
  Home,
  ChevronRight,
  Zap,
  Activity
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { NotificationButton } from './layout/notification-button'
import Link from 'next/link'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showNotifications?: boolean
  showSearch?: boolean
  showQuickActions?: boolean
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  showNotifications = true,
  showSearch = true,
  showQuickActions = true,
  breadcrumbs = []
}: DashboardHeaderProps) {
  const { data: session } = useSession()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userStats, setUserStats] = useState<{
    unreadNotifications: number
    todayTasks: number
    onlineStatus: boolean
  }>({
    unreadNotifications: 0,
    todayTasks: 0,
    onlineStatus: true
  })
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // Fermer les menus quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch user stats periodically
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Simuler des données - remplacer par vraie API
        setUserStats({
          unreadNotifications: Math.floor(Math.random() * 5),
          todayTasks: Math.floor(Math.random() * 10) + 1,
          onlineStatus: true
        })
      } catch (error) {
        console.error('Erreur lors du chargement des stats utilisateur:', error)
      }
    }

    fetchUserStats()
    const interval = setInterval(fetchUserStats, 30000) // Refresh every 30s
    
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Logique de recherche à implémenter
      console.log('Recherche:', searchQuery)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const UserAvatar = ({ className = "" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-semibold text-sm ${className}`}>
      {session?.user.name?.charAt(0)?.toUpperCase() || 'U'}
      {/* Indicateur de statut en ligne */}
      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
        userStats.onlineStatus ? 'bg-green-500' : 'bg-gray-400'
      }`}></div>
    </div>
  )

  const QuickActions = () => (
    <div className="flex items-center space-x-2">
      
      <Button variant="ghost" size="sm" className="hidden lg:flex items-center space-x-1 text-gray-600 hover:text-gray-900">
        <Plus className="h-4 w-4" />
        <span>Nouveau</span>
      </Button>
      <Button variant="ghost" size="sm" className="hidden lg:flex items-center space-x-1 text-gray-600 hover:text-gray-900">
        <Calendar className="h-4 w-4" />
        <span>Planning</span>
      </Button>
      { session?.user.role === 'ADMIN_ENTREPRISE' && (
      <Button variant="ghost" size="sm" className="hidden lg:flex items-center space-x-1 text-gray-600 hover:text-gray-900">
        <Users className="h-4 w-4" />
        <span>Équipe</span>
      </Button>
      )}
    </div>
  )

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            {/* Logo et navigation */}
            <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    FormConsult
                  </span>
                </div>
          </div>
          
              {/* Breadcrumbs */}
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-gray-400" />
                  {breadcrumbs.length > 0 ? (
                    breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        {crumb.href ? (
                          <Link href={crumb.href} className="text-gray-600 hover:text-gray-900 transition-colors">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-gray-900 font-medium">{crumb.label}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{title}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Barre de recherche et actions */}
            <div className="flex items-center space-x-4">
              {/* Barre de recherche */}
              {showSearch && (
                <div className="relative hidden md:block" ref={searchRef}>
                  {!isSearchOpen ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSearchOpen(true)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  ) : (
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 px-3 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      {searchQuery && (
            <Button
                          type="button"
                          variant="ghost"
              size="sm"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-1 top-1 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </form>
                  )}
                </div>
              )}

              {/* Actions rapides */}
              {showQuickActions && <QuickActions />}

              {/* Notifications */}
              {showNotifications && <NotificationButton />}

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3 hover:bg-gray-100 transition-colors duration-200 px-3 py-2 rounded-lg"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <UserAvatar />
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                      {session?.user.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize flex items-center space-x-1">
                      <span>{session?.user.role}</span>
                      {userStats.onlineStatus && (
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>En ligne</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
                
                {/* Dropdown du menu utilisateur */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <UserAvatar />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{session?.user.name}</p>
                          <p className="text-xs text-gray-500">{session?.user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              userStats.onlineStatus 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <Activity className="w-3 h-3 mr-1" />
                              {userStats.onlineStatus ? 'En ligne' : 'Hors ligne'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats rapides */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{userStats.todayTasks}</p>
                          <p className="text-xs text-gray-500">Tâches du jour</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{userStats.unreadNotifications}</p>
                          <p className="text-xs text-gray-500">Non lues</p>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <User className="mr-3 h-4 w-4" />
                      <span>Mon Profil</span>
                    </button>
                    
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Paramètres</span>
                    </button>

                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <Zap className="mr-3 h-4 w-4" />
                      <span>Raccourcis clavier</span>
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button 
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleSignOut}
            >
                        <LogOut className="mr-3 h-4 w-4" />
              <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu className="h-6 w-6" />
            </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Title */}
        <div className="md:hidden px-4 pb-3">
          <h1 className="text-lg font-semibold text-gray-700">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
      </div>
      
        {/* Subtitle */}
      {subtitle && (
          <div className="hidden md:block bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex flex-col space-y-4 p-4">
              <div className="flex items-center space-x-3 pb-4 border-b">
                <UserAvatar className="w-12 h-12" />
                <div>
                  <div className="font-medium text-gray-900">
                    {session?.user.name}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {session?.user.role}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${userStats.onlineStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {userStats.onlineStatus ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Search */}
              {showSearch && (
                <div className="pb-4 border-b">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </form>
                </div>
              )}

              {/* Mobile Quick Actions */}
              <div className="space-y-2 pb-4 border-b">
                <Button variant="ghost" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Planning
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Équipe
                </Button>
              </div>
              
              <Button variant="ghost" className="justify-start">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Button>
              
              <Button variant="ghost" className="justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
              
              {showNotifications && (
                <div className="flex justify-start">
                  <NotificationButton />
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 