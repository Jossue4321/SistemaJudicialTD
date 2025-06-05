"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, LogIn } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user")
      setIsAuthenticated(!!user)
      setIsLoading(false)
    }

    checkAuth()

    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = async () => {
    try {
      // 1. Cerrar sesión en el backend
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al cerrar sesión')
      }

      // 2. Limpiar el almacenamiento local
      localStorage.removeItem("user")
      localStorage.removeItem("rememberedEmail")

      // 3. Actualizar el estado y redirigir
      setIsAuthenticated(false)
      router.push('/login')
      router.refresh() // Forzar recarga del layout

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cerrar sesión",
        variant: "destructive",
      })
    } finally {
      setIsOpen(false)
    }
  }

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/chatbot", label: "Chatbot" },
    { href: "/video-calls", label: "Videollamadas" },
    { href: "/documents", label: "Documentos" },
  ]

  if (isLoading) {
    return (
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <img 
                  src="/images/SistemaJudicial.png" 
                  alt="Avatar" 
                  className="w-15 h-15"
                />
              </div>
              <span className="font-bold text-xl text-gray-900">JusticiaAccesible</span>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white-600 rounded-lg flex items-center justify-center">
                <img 
                  src="/images/SistemaJudicial.png" 
                  alt="Avatar" 
                  className="w-15 h-15"
                />
              </div>
            <span className="font-bold text-xl text-gray-900">JusticiaAccesible</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-lg font-medium transition-colors hover:text-blue-600 ${
                      pathname === item.href ? "text-blue-600" : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="my-4" />
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 text-lg font-medium text-gray-700 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Perfil</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-lg font-medium text-gray-700 hover:text-blue-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 text-lg font-medium text-gray-700 hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Iniciar Sesión</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}