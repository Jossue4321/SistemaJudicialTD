"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ProfileForm } from "@/components/user/profile-form"
import { MessageCircle, Video, FileText, Calendar, Bell, User, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalQuestions: number
  totalAppointments: number
  unreadNotifications: number
  completedAppointments: number
}

interface RecentActivity {
  id: string
  type: "question" | "appointment" | "notification"
  title: string
  description: string
  date: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    totalAppointments: 0,
    unreadNotifications: 0,
    completedAppointments: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return

      try {
        // Obtener estadísticas del usuario
        const [questionsRes, appointmentsRes, notificationsRes] = await Promise.all([
          fetch(`/api/user-questions?userId=${user.id}`),
          fetch(`/api/appointments?userId=${user.id}`),
          fetch(`/api/notifications?userId=${user.id}`),
        ])

        const [questionsData, appointmentsData, notificationsData] = await Promise.all([
          questionsRes.json(),
          appointmentsRes.json(),
          notificationsRes.json(),
        ])

        // Calcular estadísticas
        const totalQuestions = questionsData.questions?.length || 0
        const appointments = appointmentsData.appointments || []
        const notifications = notificationsData.notifications || []

        setStats({
          totalQuestions,
          totalAppointments: appointments.length,
          unreadNotifications: notifications.filter((n: any) => !n.read).length,
          completedAppointments: appointments.filter((a: any) => a.status === "completed").length,
        })

        // Generar actividad reciente
        const activity: RecentActivity[] = []

        // Agregar preguntas recientes
        if (questionsData.questions) {
          questionsData.questions.slice(0, 3).forEach((q: any) => {
            activity.push({
              id: q.id,
              type: "question",
              title: "Consulta realizada",
              description: q.question.substring(0, 100) + "...",
              date: q.created_at,
            })
          })
        }

        // Agregar citas recientes
        appointments.slice(0, 2).forEach((a: any) => {
          activity.push({
            id: a.id,
            type: "appointment",
            title: "Cita agendada",
            description: `Con ${a.lawyers.full_name} - ${a.consultation_type}`,
            date: a.created_at,
          })
        })

        // Agregar notificaciones recientes
        notifications.slice(0, 2).forEach((n: any) => {
          activity.push({
            id: n.id,
            type: "notification",
            title: n.title,
            description: n.message,
            date: n.created_at,
          })
        })

        // Ordenar por fecha
        activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setRecentActivity(activity.slice(0, 5))
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "question":
        return <MessageCircle className="h-4 w-4" />
      case "appointment":
        return <Video className="h-4 w-4" />
      case "notification":
        return <Bell className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bienvenido, {user?.fullName || "Usuario"}
            </h1>
            <p className="text-xl text-gray-600">
              Panel de control de tu asesoría legal especializada
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">
                  Total de preguntas al chatbot
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas Agendadas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Videollamadas programadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
                <p className="text-xs text-muted-foreground">
                  Mensajes sin leer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas Completadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Consultas finalizadas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>
                    Accede rápidamente a los servicios más utilizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button asChild className="h-20 flex-col space-y-2">
                      <Link href="/chatbot">
                        <MessageCircle className="h-6 w-6" />
                        <span>Chatbot IA</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                      <Link href="/video-calls">
                        <Video className="h-6 w-6" />
                        <span>Videollamadas</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                      <Link href="/documents">
                        <FileText className="h-6 w-6" />
                        <span>Documentos</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Actividad Reciente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay actividad reciente</p>
                      <p className="text-sm">Comienza usando nuestros servicios</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Section */}
            <div>
              <ProfileForm userId={user?.id} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}