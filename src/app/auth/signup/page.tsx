'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { BookOpen, Eye, EyeOff, CheckCircle, Building2, AlertCircle, Sparkles, Rocket, TrendingUp, Users, Award, Shield, Zap, Star } from 'lucide-react'

const plans = [
  {
    id: 'ESSENTIEL',
    name: 'Essentiel',
    price: 4999,
    currency: 'MAD',
    description: 'Parfait pour les petites équipes',
    features: [
      'Jusqu\'à 10 utilisateurs',
      'Accès au catalogue de formations',
      'Suivi de progression basique',
      'Support email standard',
      'Tableau de bord simple'
    ]
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 9999,
    currency: 'MAD',
    description: 'Idéal pour les entreprises en croissance',
    features: [
      'Jusqu\'à 50 utilisateurs',
      'Tout du plan Essentiel',
      'Sessions de consulting (50h/mois)',
      'Analytics avancées et exports',
      'Support prioritaire (24h)',
      'Formations personnalisées'
    ],
    popular: true
  },
  {
    id: 'ENTREPRISE',
    name: 'Entreprise',
    price: 19999,
    currency: 'MAD',
    description: 'Pour les grandes organisations',
    features: [
      'Utilisateurs illimités',
      'Tout du plan Pro',
      'Consulting illimité',
      'Formations sur mesure',
      'Support dédié 24/7',
      'Gestionnaire de compte'
    ]
  }
]

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState('PRO') // Default plan to avoid blocking
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Debug state pour diagnostiquer les problèmes

  // Animation variants - OPTIMISÉES pour performance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const cardVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  // Présélectionner le plan basé sur l'URL
  useEffect(() => {
    const planFromUrl = searchParams.get('plan')
    if (planFromUrl && ['ESSENTIEL', 'PRO', 'ENTREPRISE'].includes(planFromUrl)) {
      setSelectedPlan(planFromUrl)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log(`📝 Changement de champ: ${name} = "${value}"`)
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      console.log('📋 Nouvelles données form:', newData)
      return newData
    })
    
    // Clear errors when user types
    if (error) {
      setError('')
    }
  }

  const handleNext = () => {
    console.log('🚀 Bouton Continuer cliqué! Step actuel:', step)
    console.log('📋 Plan sélectionné:', selectedPlan)
    
    if (step === 1) {
      if (!selectedPlan) {
        setError('Veuillez sélectionner un plan avant de continuer')
        return
      }
      console.log('✅ Passage à l\'étape 2')
      setError('') // Clear any errors
      setStep(2)
    } else {
      console.log('⚠️ Step ne correspond pas à 1, step =', step)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation des champs requis
    if (!formData.companyName.trim()) {
      setError('Le nom de l\'entreprise est requis')
      setIsLoading(false)
      return
    }

    if (!formData.companyEmail.trim()) {
      setError('L\'email de l\'entreprise est requis')
      setIsLoading(false)
      return
    }

    if (!formData.adminName.trim()) {
      setError('Le nom de l\'administrateur est requis')
      setIsLoading(false)
      return
    }

    if (!formData.adminEmail.trim()) {
      setError('L\'email de l\'administrateur est requis')
      setIsLoading(false)
      return
    }

    if (!formData.password.trim()) {
      setError('Le mot de passe est requis')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    try {
      // Étape 1: Créer le compte
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          planType: selectedPlan
        }),
      })

      if (!signupResponse.ok) {
        const data = await signupResponse.json()
        setError(data.message || 'Une erreur est survenue')
        setIsLoading(false)
        return
      }

      const signupData = await signupResponse.json()

      // Étape 2: Gérer le paiement si nécessaire
      if (signupData.requiresPayment) {
        // Plan payant - rediriger vers Stripe Checkout
        const checkoutResponse = await fetch('/api/auth/complete-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: signupData.companyId,
            planType: signupData.planType
          }),
        })

        if (!checkoutResponse.ok) {
          setError('Erreur lors de la création du checkout')
          setIsLoading(false)
          return
        }

        const checkoutData = await checkoutResponse.json()
        
        if (checkoutData.checkoutUrl) {
          // Rediriger vers Stripe Checkout
          window.location.href = checkoutData.checkoutUrl
        } else {
          setError('URL de paiement non générée')
          setIsLoading(false)
        }
        return
      } else {
        // Plan gratuit ou entreprise - rediriger vers le dashboard
        router.push('/dashboard?signup=success')
      }
    } catch (error) {
      console.error('Erreur signup:', error)
      setError('Une erreur est survenue lors de la création du compte')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Particules d'arrière-plan OPTIMISÉES - Réduit de 20 à 6 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 4, // Plus lent = moins de CPU
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          {/* Header avec gradient - ANIMATIONS OPTIMISÉES */}
          <motion.div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <BookOpen className="h-12 w-12 mx-auto" />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Rejoignez FormConsult
            </motion.h1>
            <motion.p 
              className="text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Transformez votre entreprise avec nos solutions de formation et consulting
            </motion.p>

            {/* Badges avec animations subtiles */}
            <motion.div 
              className="flex justify-center space-x-6 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {[
                { icon: Shield, text: "Sécurisé", color: "text-green-400" },
                { icon: Zap, text: "Rapide", color: "text-yellow-400" },
                { icon: Star, text: "Premium", color: "text-purple-400" }
              ].map((badge, index) => {
                const Icon = badge.icon
                return (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ 
                        duration: 4 + index, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 2 
                      }}
                    >
                      <Icon className={`h-5 w-5 ${badge.color}`} />
                    </motion.div>
                    <span className="text-sm font-medium text-blue-100">{badge.text}</span>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Étape 1: Sélection du plan - ANIMATIONS OPTIMISÉES */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                className="p-8"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="space-y-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900 mb-8 text-center"
                    variants={itemVariants}
                  >
                    🚀 Choisissez le plan qui propulsera votre entreprise
                  </motion.h3>

                  {/* Plans Grid */}
                  <motion.div 
                    className="grid md:grid-cols-3 gap-6"
                    variants={containerVariants}
                  >
                    {plans.map((plan, index) => (
                      <motion.div
                        key={plan.id}
                        variants={cardVariants}
                        whileHover={{ 
                          scale: 1.02, 
                          y: -5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                          selectedPlan === plan.id
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.popular && (
                          <motion.div 
                            className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                              ⭐ Populaire
                            </span>
                          </motion.div>
                        )}
                        
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                          <motion.div 
                            className="mb-4"
                            animate={selectedPlan === plan.id ? { 
                              scale: [1, 1.05, 1]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <span className="text-3xl font-bold text-gray-900">
                              {plan.price ? `${plan.price} MAD` : 'Sur devis'}
                            </span>
                            {plan.price && <span className="text-gray-600">/mois</span>}
                          </motion.div>
                          <p className="text-gray-600 mb-6">{plan.description}</p>
                        </div>
                        
                        <ul className="space-y-3">
                          {plan.features.map((feature, featureIndex) => (
                            <motion.li 
                              key={featureIndex} 
                              className="flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: featureIndex * 0.1 }}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Error Display */}
                  {error && (
                    <motion.div 
                      className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700 text-sm font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}

                  <motion.div 
                    className="mt-10 flex justify-center"
                    variants={itemVariants}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={handleNext}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-4 text-lg shadow-lg"
                      >
                        <span className="flex items-center">
                          Continuer vers l'inscription
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="ml-2"
                          >
                            <Rocket className="h-5 w-5" />
                          </motion.div>
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Étape 2: Informations entreprise et admin - ANIMATIONS OPTIMISÉES */}
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.form 
                key="step2"
                onSubmit={handleSubmit} 
                className="p-8"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="space-y-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Progress indicator */}
                  <motion.div 
                    className="flex items-center justify-center mb-8"
                    variants={itemVariants}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <CheckCircle className="h-4 w-4 text-white" />
                      </motion.div>
                      <motion.div 
                        className="w-16 h-1 bg-gradient-to-r from-green-500 to-blue-500"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
                        animate={{ 
                          boxShadow: [
                            "0 0 0 0 rgba(59, 130, 246, 0.4)",
                            "0 0 0 8px rgba(59, 130, 246, 0)",
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-white font-bold text-sm">2</span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Informations de l'entreprise */}
                  <motion.div 
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100"
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.h3 
                      className="text-lg font-medium text-gray-900 mb-6 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                      </motion.div>
                      Informations de l'entreprise
                    </motion.h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom de l'entreprise *
                        </label>
                        <motion.input
                          type="text"
                          id="companyName"
                          name="companyName"
                          required
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Acme Corporation"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Email entreprise *
                        </label>
                        <motion.input
                          type="email"
                          id="companyEmail"
                          name="companyEmail"
                          required
                          value={formData.companyEmail}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="contact@acme.com"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="md:col-span-2">
                        <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <motion.input
                          type="tel"
                          id="companyPhone"
                          name="companyPhone"
                          value={formData.companyPhone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="+212 6 12 34 56 78"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Informations de l'administrateur */}
                  <motion.div 
                    className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100"
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.h3 
                      className="text-lg font-medium text-gray-900 mb-6 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      >
                        <Users className="h-5 w-5 mr-2 text-purple-600" />
                      </motion.div>
                      Administrateur principal
                    </motion.h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet *
                        </label>
                        <motion.input
                          type="text"
                          id="adminName"
                          name="adminName"
                          required
                          value={formData.adminName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Jean Dupont"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Email personnel *
                        </label>
                        <motion.input
                          type="email"
                          id="adminEmail"
                          name="adminEmail"
                          required
                          value={formData.adminEmail}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="jean.dupont@acme.com"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe *
                        </label>
                        <div className="mt-1 relative">
                          <motion.input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                            whileFocus={{ scale: 1.01 }}
                          />
                          <motion.button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmer le mot de passe *
                        </label>
                        <div className="mt-1 relative">
                          <motion.input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
                            whileFocus={{ scale: 1.01 }}
                          />
                          <motion.button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Plan sélectionné */}
                  <motion.div 
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100"
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.h4 
                      className="font-medium text-green-900 mb-4 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                      >
                        <Award className="h-5 w-5 mr-2 text-green-600" />
                      </motion.div>
                      Plan sélectionné
                    </motion.h4>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-green-900 font-medium text-lg">
                          {plans.find(p => p.id === selectedPlan)?.name}
                        </span>
                        <p className="text-sm text-green-700">
                          {plans.find(p => p.id === selectedPlan)?.description}
                        </p>
                        {selectedPlan !== 'ENTREPRISE' && (
                          <p className="text-xs text-green-600 mt-2 flex items-center">
                            📳 <span className="ml-1">Vous serez redirigé vers Stripe pour le paiement sécurisé</span>
                          </p>
                        )}
                      </div>
                      <motion.div 
                        className="text-right"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="text-2xl font-bold text-green-900">
                          {plans.find(p => p.id === selectedPlan)?.price 
                            ? `${plans.find(p => p.id === selectedPlan)?.price} MAD/mois`
                            : 'Sur devis'
                          }
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Conditions d'utilisation */}
                  <motion.div 
                    className="flex items-center"
                    variants={itemVariants}
                  >
                    <motion.input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                      J'accepte les{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                        politique de confidentialité
                      </Link>
                    </label>
                  </motion.div>

                  {/* Error Display */}
                  {error && (
                    <motion.div 
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700 text-sm font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Boutons d'action */}
                  <motion.div 
                    className="flex justify-between"
                    variants={itemVariants}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="border-gray-300 hover:border-gray-400 transition-all duration-200"
                      >
                        <motion.span className="flex items-center">
                          <motion.div
                            animate={{ x: [-1, 0, -1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="mr-2"
                          >
                            ←
                          </motion.div>
                          Retour
                        </motion.span>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 shadow-lg border-0"
                      >
                        <span className="flex items-center">
                          {isLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="mr-2"
                              >
                                <Sparkles className="h-4 w-4" />
                              </motion.div>
                              Création du compte...
                            </>
                          ) : (
                            <>
                              {selectedPlan !== 'ENTREPRISE' ? 'Créer le compte et procéder au paiement' : 'Créer mon compte'}
                              <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="ml-2"
                              >
                                <Rocket className="h-4 w-4" />
                              </motion.div>
                            </>
                          )}
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 