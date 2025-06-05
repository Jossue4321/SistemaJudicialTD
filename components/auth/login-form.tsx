"use client"

import type React from "react"

import { useState, useEffect } from "react" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Accessibility } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión")
      }

      // Guardar datos de sesión
      localStorage.setItem("user", JSON.stringify(data.user))

      // Si se seleccionó "recordarme", guardar el email
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${data.user.fullName}`,
      })

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      toast({
        title: "Error de inicio de sesión",
        description: error instanceof Error ? error.message : "Credenciales incorrectas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar email recordado al montar el componente
  useEffect(() => {
    const rememberedEmail = typeof window !== "undefined" ? localStorage.getItem("rememberedEmail") : null
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, []) 

  return (
    <Card className="shadow-2xl border-0 w-full max-w-md">
      <CardHeader className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>Accede a tu cuenta para obtener asesoría legal personalizada</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Recordarme
              </Label>
            </div>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Regístrate aquí
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