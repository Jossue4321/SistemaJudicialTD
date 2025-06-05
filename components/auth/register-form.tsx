"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Accessibility } from "lucide-react"
// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Disability types to maintain consistency with backend
const DISABILITY_TYPES = [
  { value: "motriz", label: "Motriz" },
  { value: "visual", label: "Visual" },
  { value: "auditiva", label: "Auditiva" },
  { value: "intelectual", label: "Intelectual" },
  { value: "multiple", label: "Múltiple" },
  { value: "otra", label: "Otra" },
  { value: "ninguna", label: "Ninguna" },
] as const

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "", // Changed to match backend field name
    disability_type: "", // Changed to match backend field name
  })
  
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, disability_type: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!formData.email || !formData.password || !formData.full_name) {
      toast({
        title: "Error de validación",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario")
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada correctamente",
      })

      // Optional: Redirect to login with success state
      router.push("/login?registered=true")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error de registro",
        description: error instanceof Error 
          ? error.message 
          : "Ocurrió un error durante el registro",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-2xl border-0 w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <User className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription>
          Regístrate para acceder a asesoría legal especializada
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="full_name"
                name="full_name"
                placeholder="Tu nombre completo"
                value={formData.full_name}
                onChange={handleChange}
                className="pl-10"
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
          </div>

          {/* Disability Type Field */}
          <div className="space-y-2">
            <Label htmlFor="disability_type">Tipo de Discapacidad</Label>
            <div className="relative">
              <Accessibility className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
              <Select 
                value={formData.disability_type} 
                onValueChange={handleSelectChange}
                name="disability_type"
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Seleccionar tipo de discapacidad" />
                </SelectTrigger>
                <SelectContent>
                  {DISABILITY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            size="lg" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </span>
            ) : "Registrarse"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link 
              href="/login" 
              className="text-blue-600 hover:underline font-medium"
              aria-label="Ir a la página de inicio de sesión"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 pt-4 border-t">
          <Accessibility className="h-4 w-4" />
          <span>Plataforma accesible WCAG 2.1 AA</span>
        </div>
      </CardContent>
    </Card>
  )
}