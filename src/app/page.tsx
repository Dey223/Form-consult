'use client'
import React from 'react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PricingCard } from '@/components/pricing/pricing-card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence, useScroll, useTransform, useInView, Variants } from 'framer-motion'
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Calendar,
  Shield,
  Globe,
  Zap,
  Target,
  BarChart3,
  MessageCircle,
  Clock,
  Sparkles,
  Calculator,
  Flame,
  Eye,
  ChevronRight,
  Building2,
  HeartHandshake,
  Rocket,
  Brain,
  Lightbulb,
  TrendingUp as Trending,
  Database,
  Cpu,
  Network
} from 'lucide-react'

const plans = [
  {
    id: 'ESSENTIEL' as const,
    name: 'Essentiel',
    price: 4999,
    originalPrice: 6999,
    currency: 'MAD',
    description: 'Parfait pour les petites équipes',
    highlight: 'Économique',
    features: [
      'Jusqu\'à 10 utilisateurs',
      'Accès au catalogue de formations',
      'Suivi de progression basique',
      'Support email standard',
      'Tableau de bord simple',
      'Rapports mensuels'
    ]
  },
  {
    id: 'PRO' as const,
    name: 'Pro',
    price: 9999,
    originalPrice: 13999,
    currency: 'MAD',
    description: 'Idéal pour les entreprises en croissance',
    highlight: 'Le plus populaire',
    features: [
      'Jusqu\'à 50 utilisateurs',
      'Tout du plan Essentiel',
      'Sessions de consulting (50h/mois)',
      'Analytics avancées et exports',
      'Support prioritaire (24h)',
      'Formations personnalisées',
      'API et intégrations',
      'Rapports en temps réel'
    ],
    popular: true
  },
  {
    id: 'ENTREPRISE' as const,
    name: 'Entreprise',
    price: 19999,
    currency: 'MAD',
    description: 'Pour les grandes organisations',
    highlight: 'Solution complète',
    features: [
      'Utilisateurs illimités',
      'Tout du plan Pro',
      'Consulting illimité',
      'Formations sur mesure',
      'Support dédié 24/7',
      'Gestionnaire de compte',
      'SLA garanti 99.9%',
      'Intégrations personnalisées',
      'Audit de sécurité',
      'Formation des administrateurs'
    ],
    enterprise: true
  }
]

const features = [
  {
    icon: BookOpen,
    title: 'Formations certifiantes',
    description: 'Plus de 50 formations dans différents domaines : management, digital, sécurité...'
  },
  {
    icon: Users,
    title: 'Consulting expert',
    description: 'Accompagnement personnalisé par nos consultants certifiés'
  },
  {
    icon: TrendingUp,
    title: 'Suivi de performance',
    description: 'Tableaux de bord détaillés pour suivre la progression de vos équipes'
  },
  {
    icon: Award,
    title: 'Certifications reconnues',
    description: 'Délivrez des certificats officiels valorisant les compétences acquises'
  }
]

const testimonials = [
  {
    name: 'Jean Dupont',
    position: 'DRH, Acme Corporation',
    avatar: '👨‍💼',
    rating: 5,
    comment: 'FormConsult a transformé notre approche de la formation. Nos équipes sont plus engagées et compétentes.'
  },
  {
    name: 'Marie Martin',
    position: 'CEO, TechStart',
    avatar: '👩‍💼',
    rating: 5,
    comment: 'Le consulting personnalisé nous a permis d\'atteindre nos objectifs en un temps record.'
  },
  {
    name: 'Paul Bernard',
    position: 'Manager, Digital Corp',
    avatar: '👨‍💻',
    rating: 5,
    comment: 'Interface intuitive et formations de qualité. Je recommande vivement FormConsult.'
  }
]

const stats = [
  { value: '500+', label: 'Entreprises clientes', increase: '+23% ce mois' },
  { value: '10K+', label: 'Utilisateurs formés', increase: '+150 cette semaine' },
  { value: '98%', label: 'Taux de satisfaction', increase: '↑ +2% vs dernier mois' },
  { value: '24/7', label: 'Support disponible', increase: 'Temps réponse: 12min' }
]

const trustSignals = [
  { icon: Shield, text: 'Paiement 100% sécurisé' },
  { icon: CheckCircle, text: 'Certifié ISO 27001' },
  { icon: HeartHandshake, text: 'Garantie satisfaction' },
  { icon: Clock, text: 'Support 24/7 en français' }
]

const clientLogos = [
  { name: 'Acme Corp', logo: '🏢' },
  { name: 'TechStart', logo: '🚀' },
  { name: 'Digital Corp', logo: '💻' },
  { name: 'Innovation Ltd', logo: '💡' },
  { name: 'Future Co', logo: '🔮' },
  { name: 'Success Inc', logo: '📈' }
]

const liveActivity = [
  { action: 'Formation complétée', company: 'TechCorp', time: 'il y a 2 min', type: 'success' },
  { action: 'Nouveau client', company: 'Innovation SA', time: 'il y a 5 min', type: 'new' },
  { action: 'Certification obtenue', company: 'Digital Ltd', time: 'il y a 8 min', type: 'achievement' }
]

export default function HomePage() {
  const { data: session } = useSession()
  const [activeVideo, setActiveVideo] = useState(false)
  const [currentLiveActivity, setCurrentLiveActivity] = useState(0)
  const [roiInputs, setRoiInputs] = useState({ employees: 10, hourlyRate: 50 })
  const [currentHero, setCurrentHero] = useState(0)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  // Animation pour les activités en direct
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLiveActivity(prev => (prev + 1) % liveActivity.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Changement automatique des hero sections
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % 3) // 3 hero sections
    }, 8000) // Change toutes les 8 secondes
    return () => clearInterval(interval)
  }, [])

  // Calculateur ROI
  const calculateROI = () => {
    const { employees, hourlyRate } = roiInputs
    const trainingHours = 20 // Moyenne heures formation
    const productivityIncrease = 0.25 // 25% d'augmentation
    const yearlyGain = employees * hourlyRate * 40 * 52 * productivityIncrease // 40h/semaine, 52 semaines
    const monthlySavings = yearlyGain / 12
    return { yearlyGain: Math.round(yearlyGain), monthlySavings: Math.round(monthlySavings) }
  }

  // Animations variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300
      }
    }
  }

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  // Hero sections data
  const heroSections = [
    {
      id: 'integrated-platform',
      title: "Formation et consulting",
      subtitle: "en une plateforme",
      description: "Première plateforme marocaine intégrant LMS et consulting professionnel avec suivi personnalisé.",
      gradient: "from-purple-600 via-blue-600 to-cyan-600",
      icon: Brain,

      feature: "Intégration Unique"
    },
    {
      id: 'results-driven',
      title: "Résultats garantis",
      subtitle: "ou remboursé",
      description: "25% d'augmentation de productivité en 30 jours ou vous récupérez 100% de votre investissement. Aucun risque.",
      gradient: "from-green-600 via-emerald-600 to-teal-600",
      icon: Target,
      stats: "98% satisfaction client",
      feature: "Garantie Performance"
    },
    {
      id: 'scale-unlimited',
      title: "Scalez sans limites",
      subtitle: "votre croissance",
      description: "De 5 à 5000 employés, notre plateforme s'adapte à votre croissance avec une infrastructure cloud enterprise-grade.",
      gradient: "from-orange-600 via-red-600 to-pink-600",
      icon: Rocket,
      stats: "500+ entreprises",
      feature: "Scalabilité Infinie"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <BookOpen className="h-8 w-8 text-blue-600" />
              </motion.div>
              <motion.span
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                whileHover={{
                  backgroundPosition: ["0%", "100%"],
                  transition: { duration: 0.5 }
                }}
              >
                FormConsult
              </motion.span>

              {/* Live indicator */}
              <motion.div
                className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs text-green-700 font-medium">En ligne</span>
              </motion.div>
            </motion.div>

            {/* Navigation */}
            <motion.nav
              className="hidden md:flex space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { href: "#features", label: "Fonctionnalités", icon: Sparkles },
                { href: "#pricing", label: "Tarifs", icon: Calculator },
                { href: "#testimonials", label: "Témoignages", icon: Star }
              ].map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="group flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 relative"
                  whileHover={{ scale: 1.05, y: -2 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <item.icon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative">
                    {item.label}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"
                    />
                  </span>
                </motion.a>
              ))}
            </motion.nav>

            {/* User Section */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {session ? (
                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-full"
                    whileHover={{
                      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.15)",
                      y: -1
                    }}
                  >
                    <motion.div
                      className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      {session.user.name?.[0]?.toUpperCase()}
                    </motion.div>
                    <span className="text-gray-700 font-medium">Bonjour, {session.user.name}</span>
                  </motion.div>
                  <Link href="/dashboard">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                        <motion.span className="flex items-center">
                          Tableau de bord
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="ml-2"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        </motion.span>
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center space-x-4"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/auth/signin">
                      <Button
                        variant="ghost"
                        className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                      >
                        <motion.span className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          Se connecter
                        </motion.span>
                      </Button>
                    </Link>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/auth/signup">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg border-0">
                        <motion.span className="flex items-center">
                          Nous rejoindre
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="ml-2"
                          >
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                        </motion.span>
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Gradient border bottom */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
      </motion.header>

      {/* Multi-Hero Section avec Framer Motion */}
      <section className="relative overflow-hidden h-screen flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`absolute inset-0 bg-gradient-to-br ${heroSections[currentHero].gradient}`}
          >
            {/* Éléments de fond animés */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              style={{ y: y1 }}
            >
              <motion.div
                className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full filter blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0]
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-full flex items-center">
              {/* Notification d'activité en direct */}
              <motion.div
                className="absolute top-8 left-1/2 transform -translate-x-1/2"
                animate={floatingAnimation}
              >
                <motion.div
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 flex items-center space-x-3 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <Flame className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">
                    🎉 {liveActivity[currentLiveActivity].action} par {liveActivity[currentLiveActivity].company}
                  </span>
                </motion.div>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
                <motion.div
                  className="text-center lg:text-left text-white"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="mb-6"
                    variants={itemVariants}
                  >
                    <motion.span
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 text-white mb-4"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        {React.createElement(heroSections[currentHero].icon, { className: "h-4 w-4 mr-2" })}
                      </motion.div>
                      {heroSections[currentHero].feature}
                    </motion.span>
                  </motion.div>

                  <motion.h1
                    className="text-7xl lg:text-5xl font-bold leading-tight mb-6"
                    variants={itemVariants}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      {heroSections[currentHero].title}
                    </motion.div>
                    <motion.div
                      className="text-yellow-300"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    >
                      {heroSections[currentHero].subtitle}
                    </motion.div>
                  </motion.h1>

                  <motion.p
                    className="text-xl leading-relaxed mb-8 text-white/90"
                    variants={itemVariants}
                  >
                    {heroSections[currentHero].description}
                  </motion.p>

                  {/* Stats Badge */}
                  <motion.div
                    className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/30"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-2">💎 Performance garantie</h3>
                        <p className="text-white/80">Résultats mesurables dès 30 jours</p>
                      </div>
                      <motion.div
                        className="text-right"
                        animate={pulseAnimation}
                      >
                        <p className="text-3xl font-bold text-yellow-300">
                          {heroSections[currentHero].stats}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 mb-8"
                    variants={itemVariants}
                  >
                    <Link href="/auth/signup">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button size="lg" className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 shadow-2xl font-bold px-8 py-4 text-lg">
                          <Rocket className="mr-3 h-6 w-6" />
                          DÉMARRER MAINTENANT
                          <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                      </motion.div>
                    </Link>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                        onClick={() => setActiveVideo(true)}
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Démo interactive
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Trust Signals */}
                  <motion.div
                    className="grid grid-cols-2 gap-4 text-sm text-white/80"
                    variants={containerVariants}
                  >
                    {trustSignals.slice(0, 4).map((signal, index) => {
                      const Icon = signal.icon
                      return (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-2"
                          variants={itemVariants}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Icon className="h-4 w-4 text-green-300" />
                          <span>{signal.text}</span>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </motion.div>

                {/* Right side - Interactive Dashboard */}
                <motion.div
                  className="relative"
                  style={{ y: y2 }}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  {/* 3D Dashboard */}
                  <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
                    whileHover={{
                      scale: 1.02,
                      rotateY: 5,
                      rotateX: 5
                    }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <motion.div className="space-y-6">
                      {/* Header */}
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <h3 className="font-bold text-white text-xl">Performance Analytics</h3>
                        <motion.div
                          className="flex items-center space-x-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-white/80 text-sm">Live Data</span>
                        </motion.div>
                      </motion.div>

                      {/* Animated Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                        >
                          <motion.div
                            className="flex items-center justify-between mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                          >
                            <TrendingUp className="h-6 w-6 text-green-400" />
                            <motion.span
                              className="text-green-400 font-bold"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              +{25 + (currentHero * 10)}%
                            </motion.span>
                          </motion.div>
                          <motion.p
                            className="text-2xl font-bold text-white"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            {87 + (currentHero * 5)}%
                          </motion.p>
                          <p className="text-white/70 text-sm">Productivité</p>
                        </motion.div>

                        <motion.div
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                        >
                          <motion.div
                            className="flex items-center justify-between mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                          >
                            <Users className="h-6 w-6 text-blue-400" />
                            <span className="text-blue-400 font-bold">Active</span>
                          </motion.div>
                          <motion.p
                            className="text-2xl font-bold text-white"
                            animate={{
                              scale: [1, 1.05, 1],
                              color: ["#ffffff", "#60a5fa", "#ffffff"]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            {24 + currentHero}/30
                          </motion.p>
                          <p className="text-white/70 text-sm">Employés</p>
                        </motion.div>
                      </div>

                      {/* Progress bars */}
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                      >
                        {['Formation IA', 'Leadership', 'Digital'].map((course, index) => (
                          <div key={course} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{course}</span>
                              <span className="text-white/80 text-sm">{85 + (index * 5) + currentHero}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${85 + (index * 5) + currentHero}%` }}
                                transition={{ duration: 2, delay: 1.6 + (index * 0.2) }}
                              />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-6 -right-6 bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl"
                    animate={floatingAnimation}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>+{32 + (currentHero * 8)}</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-6 -left-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl"
                    animate={{
                      ...floatingAnimation,
                      transition: {
                        ...floatingAnimation.transition,
                        delay: 1
                      }
                    }}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>Expert Certifié</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Hero Navigation Dots */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              {heroSections.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentHero ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  onClick={() => setCurrentHero(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </motion.div>

            {/* Client Logos Ticker */}
            <motion.div
              className="absolute bottom-20 left-0 right-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <motion.div
                className="flex space-x-8 justify-center items-center text-white/60"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[...clientLogos, ...clientLogos].map((client, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-2 text-lg whitespace-nowrap"
                    whileHover={{ scale: 1.1, color: "rgba(255,255,255,0.9)" }}
                  >
                    <span>{client.logo}</span>
                    <span className="font-medium">{client.name}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Section Hero Interactive Parallax */}
      <motion.section
        className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
        style={{ y: y1 }}
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center">
          <motion.div
            className="w-full text-center text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* Floating Badge */}
            <motion.div
              className="inline-block mb-8"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                  </motion.div>
                  <span className="text-lg font-bold">Innovation Continue</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            </motion.div>

            <motion.h2
              className="text-6xl lg:text-8xl font-black mb-8"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.span
                className="inline-block"
                whileHover={{
                  scale: 1.1,
                  color: "#fbbf24",
                  textShadow: "0 0 20px rgba(251, 191, 36, 0.5)"
                }}
              >
                Transformez
              </motion.span>
              <br />
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
                whileHover={{
                  scale: 1.1,
                  background: "linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6)"
                }}
              >
                L'Excellence
              </motion.span>
            </motion.h2>

            <motion.p
              className="text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-white/90"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Révolutionnez votre approche de la formation avec une plateforme
              <motion.span
                className="text-yellow-300 font-bold"
                whileHover={{ scale: 1.05 }}
              >
                {" "}alimentée par l'IA{" "}
              </motion.span>
              qui s'adapte à chaque employé pour des résultats exceptionnels.
            </motion.p>

            {/* Interactive Stats Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.6 }}
              viewport={{ once: true }}
            >
              {[
                {
                  icon: TrendingUp,
                  value: "340%",
                  label: "Croissance",
                  color: "from-green-400 to-emerald-400",
                  delay: 0.1
                },
                {
                  icon: Users,
                  value: "10K+",
                  label: "Employés Formés",
                  color: "from-blue-400 to-cyan-400",
                  delay: 0.2
                },
                {
                  icon: Award,
                  value: "98%",
                  label: "Satisfaction",
                  color: "from-purple-400 to-pink-400",
                  delay: 0.3
                }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    className="relative group"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: stat.delay }}
                    whileHover={{
                      scale: 1.05,
                      rotateY: 10
                    }}
                    viewport={{ once: true }}
                  >
                    <div className={`bg-gradient-to-br ${stat.color} p-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 h-full`}>
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Icon className="h-12 w-12 text-white mb-4 mx-auto" />
                      </motion.div>

                      <motion.div
                        className="text-4xl font-black text-white mb-2"
                        animate={{
                          scale: [1, 1.05, 1],
                          textShadow: [
                            "0 0 0px rgba(255,255,255,0)",
                            "0 0 10px rgba(255,255,255,0.3)",
                            "0 0 0px rgba(255,255,255,0)"
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                      >
                        {stat.value}
                      </motion.div>

                      <p className="text-white/90 font-medium">
                        {stat.label}
                      </p>

                      {/* Hover Effect */}
                      <motion.div
                        className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{
                          background: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)"
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Animated CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <Link href="/auth/signup">
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden"
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-12 py-6 text-xl shadow-2xl border-0"
                  >
                    <motion.div
                      animate={{ x: [-2, 2, -2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Rocket className="mr-3 h-6 w-6" />
                    </motion.div>
                    COMMENCER L'AVENTURE
                    <motion.div
                      animate={{ x: [2, -2, 2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </motion.div>
                  </Button>

                  {/* Animated Border */}
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-cyan-400"
                    animate={{
                      borderColor: ["#06b6d4", "#3b82f6", "#8b5cf6", "#06b6d4"],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
              </Link>

              <motion.div
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 15px 30px rgba(255,255,255,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-12 py-6 text-xl font-bold backdrop-blur-sm"
                  onClick={() => setActiveVideo(true)}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="mr-3 h-6 w-6" />
                  </motion.div>
                  DÉCOUVRIR EN VIDÉO
                </Button>
              </motion.div>
            </motion.div>

            {/* Floating Achievement Badges */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute top-20 right-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-xl font-bold shadow-xl"
                animate={{
                  y: [-10, 10, -10],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                🏆 Leader du marché
              </motion.div>

              <motion.div
                className="absolute bottom-32 left-10 bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-xl"
                animate={{
                  y: [10, -10, 10],
                  rotate: [0, -3, 3, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                ⚡ Formation en temps record
              </motion.div>

              <motion.div
                className="absolute top-1/2 right-20 bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 rounded-xl font-bold shadow-xl"
                animate={{
                  y: [-15, 15, -15],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                🚀 IA Dernière Génération
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-white/60 text-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronRight className="h-6 w-6 mx-auto transform rotate-90" />
            </motion.div>
            <p className="text-sm mt-2">Découvrez plus</p>
          </div>
        </motion.div>
      </motion.section>

      {/* ROI Calculator Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">

            <p className="text-xl text-gray-600">
              Découvrez combien FormConsult peut vous faire économiser
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Vos paramètres</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre d'employés à former
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="500"
                      value={roiInputs.employees}
                      onChange={(e) => setRoiInputs({ ...roiInputs, employees: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>5</span>
                      <span className="font-bold text-blue-600">{roiInputs.employees} employés</span>
                      <span>500</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coût horaire moyen (MAD)
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="200"
                      value={roiInputs.hourlyRate}
                      onChange={(e) => setRoiInputs({ ...roiInputs, hourlyRate: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>30 MAD</span>
                      <span className="font-bold text-blue-600">{roiInputs.hourlyRate} MAD/h</span>
                      <span>200 MAD</span>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Vos économies</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Économies mensuelles</span>
                      <span className="text-2xl font-bold text-green-600">
                        {calculateROI().monthlySavings.toLocaleString()} MAD
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Économies annuelles</span>
                      <span className="text-3xl font-bold text-green-600">
                        {calculateROI().yearlyGain.toLocaleString()} MAD
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-4 mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">ROI sur 12 mois</span>
                        <span className="text-lg font-bold text-purple-600">340%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div className="text-center mt-6">
                      <Link href="/auth/signup">
                        <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                          <Calculator className="mr-2 h-5 w-5" />
                          Commencer et économiser
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Améliorée */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-3 group hover:scale-105 transition-transform duration-200">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-900 font-medium">{stat.label}</div>
                <div className="text-sm text-green-600 font-medium">{stat.increase}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour former vos équipes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète qui combine formations en ligne, consulting personnalisé
              et suivi de performance pour maximiser le développement de vos collaborateurs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Des tarifs adaptés à votre entreprise
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan qui correspond à vos besoins et à la taille de votre équipe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Besoin d'un devis personnalisé ? Contactez notre équipe commerciale
            </p>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Planifier une démo
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-8">
              🚀 Rejoignez les leaders de l'innovation
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-white/90">Entreprises transformées</div>
                <div className="text-sm text-white/70 mt-2">+23% ce mois</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-white/90">Recommandent FormConsult</div>
                <div className="text-sm text-white/70 mt-2">Score NPS: 87</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">25%</div>
                <div className="text-white/90">Gain de productivité moyen</div>
                <div className="text-sm text-white/70 mt-2">En moins de 30 jours</div>
              </div>
            </div>

            {/* Live testimonial ticker */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">
                  💬 "Incroyable ! +30% de productivité en 3 semaines" - Sarah, DRH chez TechCorp
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section Améliorée */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🏆 Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Des résultats concrets, des témoignages authentiques
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                {/* Rating */}
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">5.0</span>
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                  "{testimonial.comment}"
                </blockquote>

                {/* Results highlight */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Résultat obtenu</span>
                    <span className="text-lg font-bold text-green-600">
                      {index === 0 ? '+40% efficacité' : index === 1 ? '+60% ROI' : '+35% engagement'}
                    </span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.position}</div>
                    <div className="text-xs text-gray-500">Client depuis {index + 1} an{index > 0 ? 's' : ''}</div>
                  </div>
                </div>

                {/* Verified badge */}
                <div className="flex items-center mt-4 text-xs text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Témoignage vérifié</span>
                </div>
              </div>
            ))}
          </div>

          {/* More testimonials CTA */}
          <div className="text-center mt-12">
            <Button variant="outline" className="group">
              <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Voir tous les témoignages
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section Amélioré */}
      <section className="relative py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {/* Urgency badge */}
          <div className="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
            <Flame className="h-4 w-4 mr-2" />
            🔥 Offre limitée : -30% jusqu'à la fin du mois
          </div>

          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Transformez votre entreprise
            <span className="text-yellow-300">aujourd'hui</span>
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Rejoignez les <strong className="text-white">500+ entreprises leaders</strong> qui ont boosté leur productivité de 25%
            en moyenne avec FormConsult. <strong className="text-yellow-300">Résultats garantis en 30 jours</strong>.
          </p>

          {/* Social proof ticker */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 max-w-2xl mx-auto border border-white/20">
            <div className="flex items-center justify-center space-x-6 text-sm text-white">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>12 entreprises se sont inscrites aujourd'hui</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-white/30"></div>
              <div className="hidden md:flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Sarah vient de terminer sa formation</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-bold">
                <Rocket className="mr-3 h-6 w-6" />
                DÉMARRER MAINTENANT
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-lg px-8 py-4 text-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Démo gratuite (2 min)
            </Button>
          </div>

          {/* Garantees */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm">Garantie satisfait ou remboursé</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm">Installation en 5 minutes</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <Clock className="h-5 w-5 text-green-400" />
              <span className="text-sm">Support 24/7 inclus</span>
            </div>
          </div>

          {/* Countdown timer simulation */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-lg mx-auto border border-white/20">
            <div className="text-white text-sm mb-2">⏰ Offre spéciale expire dans :</div>
            <div className="flex justify-center space-x-4 text-white font-mono text-lg">
              <div className="bg-white/20 rounded px-3 py-1">23h</div>
              <div className="bg-white/20 rounded px-3 py-1">45m</div>
              <div className="bg-white/20 rounded px-3 py-1">12s</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">FormConsult</span>
              </div>
              <p className="text-gray-400">
                La plateforme de formation continue pour les entreprises modernes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Formations</a></li>
                <li><a href="#" className="hover:text-white">Consulting</a></li>
                <li><a href="#" className="hover:text-white">Analytics</a></li>
                <li><a href="#" className="hover:text-white">Intégrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Presse</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Statut</a></li>
                <li><a href="#" className="hover:text-white">Sécurité</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 FormConsult. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <Shield className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
