"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Video, FileText, Users, Accessibility, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ChatbotWidget } from "@/components/chatbot-widget"

export default function HomePage() {
  const [showChatbot, setShowChatbot] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticación al cargar y cambios en localStorage
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user")
      setIsAuthenticated(!!user)
      setIsLoading(false)
    }

    // Verificar inmediatamente
    checkAuth()

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const features = [
    {
      icon: MessageCircle,
      title: "Chatbot accesible",
      description: "Obtén asesoramiento legal en tiempo real con IA especializada",
      href: "/chatbot",
      color: "bg-blue-500",
    },
    {
      icon: Video,
      title: "Videollamadas con LSP",
      description: "Conecta con intérpretes de lengua de señas profesionales",
      href: "/video-calls",
      color: "bg-green-500",
    },
    {
      icon: FileText,
      title: "Documentos automatizados",
      description: "Genera documentos legales personalizados automáticamente",
      href: "/documents",
      color: "bg-purple-500",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-2 text-blue-600"
                >
                  <Accessibility className="h-6 w-6" />
                  <span className="font-medium">Plataforma Judicial Accesible</span>
                </motion.div>

                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Accede a asesoría <span className="text-blue-600">legal gratuita</span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Para personas con discapacidad motriz. Obtén ayuda legal especializada con tecnología de inteligencia
                  artificial y servicios de interpretación.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
                  onClick={() => setShowChatbot(true)}
                >
                  Comenzar
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>

                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
                    asChild
                  >
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Accesibilidad certificada</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>+1,000 usuarios atendidos</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Panel de Control</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className={`w-8 h-8 ${feature.color} rounded-lg flex items-center justify-center mb-2`}>
                          <feature.icon className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Servicios Especializados</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas diseñadas específicamente para garantizar el acceso a la justicia para personas con
              discapacidad motriz
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base mb-6">{feature.description}</CardDescription>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={feature.href}>
                        Acceder
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Banner */}
      <section className="py-12 bg-green-50 border-y border-green-200">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-center justify-center space-x-4 text-green-800"
          >
            <Accessibility className="h-8 w-8" />
            <span className="text-lg font-semibold">Plataforma certificada para accesibilidad WCAG 2.1 AA</span>
          </motion.div>
        </div>
      </section>

      {/* Chatbot Widget */}
      <ChatbotWidget isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  )
}