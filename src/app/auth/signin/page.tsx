'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { BookOpen, Eye, EyeOff, AlertCircle, Sparkles, Shield, Zap, TrendingUp, Users, Award } from 'lucide-react'
import { ForgotPasswordModal } from '@/components/auth/forgot-password-modal'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()

  // Animation variants
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Left side - Form */}
      <motion.div 
        className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div 
          className="max-w-md w-full space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center justify-center space-x-2 mb-8 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <BookOpen className="h-8 w-8 text-blue-600" />
              </motion.div>
              <motion.span 
                className="text-2xl font-bold text-gray-900"
                whileHover={{ scale: 1.05 }}
              >
                FormConsult
              </motion.span>
            </Link>
            
            <motion.h2 
              className="text-center text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Connectez-vous à votre compte
            </motion.h2>
            
            <motion.p 
              className="mt-2 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Ou{' '}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                créez un nouveau compte
              </Link>
            </motion.p>
          </motion.div>

          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            variants={itemVariants}
          >
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="rounded-md bg-red-50 p-4"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </motion.div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Erreur de connexion
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="space-y-4"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="mt-1">
                  <motion.input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Entrez votre email"
                    whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="mt-1 relative">
                  <motion.input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Entrez votre mot de passe"
                    whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      animate={{ rotate: showPassword ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex items-center justify-between"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <motion.input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  whileHover={{ scale: 1.1 }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
                >
                  <motion.span
                    animate={isLoading ? { opacity: [1, 0.5, 1] } : {}}
                    transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                  >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>

      {/* Right side - Animated Branding */}
      <motion.div 
        className="hidden lg:block relative w-0 flex-1"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-32 h-32 bg-white/5 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <motion.div 
            className="text-center text-white p-8 relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              animate={floatingAnimation}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <BookOpen className="h-16 w-16 mx-auto mb-8 text-blue-200" />
              </motion.div>
            </motion.div>
            
            <motion.h3 
              className="text-4xl font-bold mb-4"
              variants={itemVariants}
            >
              Bienvenue sur FormConsult
            </motion.h3>
            
            <motion.p 
              className="text-xl text-blue-100 max-w-md mx-auto mb-8"
              variants={itemVariants}
            >
              Développez les compétences de votre équipe avec notre plateforme de formation et de consultation personnalisée
              <motion.span 
                className="text-yellow-300 font-bold"
                whileHover={{ scale: 1.05 }}
              >
                {" "} totalement sur mesure
              </motion.span>
            </motion.p>

            {/* Animated Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 mb-8"
              variants={containerVariants}
            >
              {[
                { icon: TrendingUp, value: "340%", label: "ROI" },
                { icon: Users, value: "10K+", label: "Utilisateurs" },
                { icon: Award, value: "98%", label: "Satisfaction" }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    className="text-center"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                    </motion.div>
                    <motion.div 
                      className="text-2xl font-bold text-white"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        color: ["#ffffff", "#fbbf24", "#ffffff"]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.3 
                      }}
                    >
                      {stat.value}
                    </motion.div>
                    <p className="text-blue-200 text-sm">{stat.label}</p>
                  </motion.div>
                )
              })}
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 gap-4 text-left max-w-sm mx-auto"
              variants={containerVariants}
            >
              {[
                { icon: Shield, text: "Formations certifiantes", color: "text-green-300" },
                { icon: Zap, text: "Consulting personnalisé", color: "text-yellow-300" },
                { icon: Sparkles, text: "Suivi de performance ", color: "text-purple-300" }
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    variants={itemVariants}
                    whileHover={{ x: 10, scale: 1.02 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                    >
                      <Icon className={`h-5 w-5 ${feature.color}`} />
                    </motion.div>
                    <span className="text-blue-100">{feature.text}</span>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Floating Achievement Badge */}
            <motion.div
              className="absolute top-10 right-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-xl font-bold shadow-xl"
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🏆 #1 Plateforme Formation
            </motion.div>

            <motion.div
              className="absolute bottom-10 left-10 bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-xl"
              animate={{
                y: [10, -10, 10],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
            >
              ⚡ Connexion sécurisée
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal mot de passe oublié */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  )
} 