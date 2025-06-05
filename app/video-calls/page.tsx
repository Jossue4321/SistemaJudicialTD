"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, Users, Languages, CheckCircle, Star } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"

interface Lawyer {
  id: string
  full_name: string
  specialty: string
  experience_years: number
  rating: number
  available: boolean
  avatar_url: string | null
}

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  consultation_type: string
  needs_lsp: boolean
  lawyers: {
    full_name: string
    specialty: string
    avatar_url: string | null
  }
}

export default function VideoCallsPage() {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedLawyer, setSelectedLawyer] = useState("")
  const [needsLSP, setNeedsLSP] = useState(false)
  const [consultationType, setConsultationType] = useState("")
  const [notes, setNotes] = useState("")
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScheduling, setIsScheduling] = useState(false)
  const { toast } = useToast()

  const availableTimes = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]

  // Cargar usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Cargar abogados disponibles
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await fetch("/api/lawyers")
        if (response.ok) {
          const data = await response.json()
          setLawyers(data.lawyers || [])
        }
      } catch (error) {
        console.error("Error cargando abogados:", error)
      }
    }

    fetchLawyers()
  }, [])

  // Cargar citas del usuario
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/appointments?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments || [])
        }
      } catch (error) {
        console.error("Error cargando citas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchAppointments()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const handleScheduleCall = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agendar una cita",
        variant: "destructive",
      })
      return
    }

    if (!selectedLawyer || !selectedDate || !selectedTime || !consultationType) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setIsScheduling(true)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          lawyerId: selectedLawyer,
          date: selectedDate,
          time: selectedTime,
          consultationType,
          needsLSP,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al agendar la cita")
      }

      toast({
        title: "Cita agendada exitosamente",
        description: `Tu cita ha sido agendada para el ${selectedDate} a las ${selectedTime}`,
      })

      // Limpiar formulario
      setSelectedDate("")
      setSelectedTime("")
      setSelectedLawyer("")
      setConsultationType("")
      setNeedsLSP(false)
      setNotes("")

      // Recargar citas
      const appointmentsResponse = await fetch(`/api/appointments?userId=${user.id}`)
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData.appointments || [])
      }
    } catch (error) {
      console.error("Error agendando cita:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agendar la cita",
        variant: "destructive",
      })
    } finally {
      setIsScheduling(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmada", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800" },
      completed: { label: "Completada", className: "bg-blue-100 text-blue-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return <Badge className={config.className}>{config.label}</Badge>
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
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Videollamadas con LSP</h1>
            <p className="text-xl text-gray-600">
              Conecta con abogados especializados e intérpretes de lengua de señas
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Scheduling Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Agendar Consulta</span>
                  </CardTitle>
                  <CardDescription>Selecciona abogado, fecha, hora y tipo de consulta que necesitas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="lawyer">Abogado Especializado</Label>
                    <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar abogado" />
                      </SelectTrigger>
                      <SelectContent>
                        {lawyers.map((lawyer) => (
                          <SelectItem key={lawyer.id} value={lawyer.id} disabled={!lawyer.available}>
                            <div className="flex items-center space-x-2">
                              <span>{lawyer.full_name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {lawyer.experience_years} años
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{lawyer.rating}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimes.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultation-type">Tipo de Consulta</Label>
                    <Select value={consultationType} onValueChange={setConsultationType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de consulta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disability-rights">Derechos de Discapacidad</SelectItem>
                        <SelectItem value="labor-law">Derecho Laboral</SelectItem>
                        <SelectItem value="inheritance">Herencias y Testamentos</SelectItem>
                        <SelectItem value="accessibility">Accesibilidad</SelectItem>
                        <SelectItem value="social-benefits">Beneficios Sociales</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Descripción de la Consulta</Label>
                    <Textarea
                      id="notes"
                      placeholder="Describe brevemente tu consulta legal..."
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lsp"
                      checked={needsLSP}
                      onCheckedChange={(checked) => setNeedsLSP(checked as boolean)}
                    />
                    <Label htmlFor="lsp" className="flex items-center space-x-2">
                      <Languages className="h-4 w-4" />
                      <span>Necesito intérprete de lengua de señas (LSP)</span>
                    </Label>
                  </div>

                  <Button
                    onClick={handleScheduleCall}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    size="lg"
                    disabled={!selectedLawyer || !selectedDate || !selectedTime || !consultationType || isScheduling}
                  >
                    {isScheduling ? "Agendando..." : "Agendar Cita"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Available Lawyers */}
            <div className="space-y-6">
              {/* Available Lawyers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Abogados Disponibles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lawyers.slice(0, 3).map((lawyer) => (
                    <motion.div
                      key={lawyer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        lawyer.available ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{lawyer.full_name}</h3>
                        {lawyer.available ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Disponible
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No disponible</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{lawyer.specialty}</p>
                      <p className="text-sm text-gray-500 mb-2">{lawyer.experience_years} años de experiencia</p>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{lawyer.rating}</span>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* User's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Mis Citas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm text-gray-900">{appointment.lawyers.full_name}</h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{appointment.consultation_type}</p>
                          <p className="text-xs text-gray-500">
                            {appointment.date} a las {appointment.time}
                          </p>
                          {appointment.needs_lsp && (
                            <Badge variant="secondary" className="text-xs mt-2">
                              <Languages className="h-3 w-3 mr-1" />
                              Con LSP
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No tienes citas programadas</p>
                      <p className="text-sm">Agenda tu primera consulta</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
