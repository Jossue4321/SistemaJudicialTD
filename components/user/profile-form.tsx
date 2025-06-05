"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { User } from "lucide-react"

interface ProfileFormProps {
  userId: string
}

export function ProfileForm({ userId }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    disabilityType: "",
    avatarUrl: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/profile?userId=${userId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar perfil")
        }

        setProfile({
          fullName: data.profile.full_name || "",
          email: data.profile.email || "",
          disabilityType: data.profile.disability_type || "",
          avatarUrl: data.profile.avatar_url || "",
        })
      } catch (error) {
        console.error("Error al cargar perfil:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del perfil",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setProfile((prev) => ({ ...prev, disabilityType: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          fullName: profile.fullName,
          disabilityType: profile.disabilityType,
          avatarUrl: profile.avatarUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar perfil")
      }

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      })

      // Actualizar datos de usuario en localStorage
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        user.fullName = profile.fullName
        user.disabilityType = profile.disabilityType
        user.avatarUrl = profile.avatarUrl
        localStorage.setItem("user", JSON.stringify(user))
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del perfil",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando perfil...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="rounded-full bg-gray-200 h-24 w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Mi perfil</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                placeholder="Ingresa tu nombre completo"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Ingresa tu correo electrónico"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="disabilityType">Tipo de discapacidad</Label>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger id="disabilityType">
                  <SelectValue placeholder="Selecciona tu tipo de discapacidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditiva">Auditiva</SelectItem>
                  <SelectItem value="motriz">Motriz</SelectItem>
                  <SelectItem value="intelectual">Intelectual</SelectItem>
                  <SelectItem value="otra">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="avatarUrl">URL de avatar</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                value={profile.avatarUrl}
                onChange={handleChange}
                placeholder="Ingresa la URL de tu avatar"
              />
            </div>
            <div className="flex justify-center">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
