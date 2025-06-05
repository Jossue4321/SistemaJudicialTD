import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase auth error:', error)
      
      // Handle email not confirmed case
      if (error.message.includes('Email not confirmed') || error.code === 'email_not_confirmed') {
        return NextResponse.json(
          { 
            error: "Por favor verifica tu correo electrónico primero. Revisa tu bandeja de entrada o spam.",
            code: "email_not_verified"
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: error.message || "Credenciales inválidas" },
        { status: 401 }
      )
    }

    // Rest of your successful login logic...
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: "Error al obtener perfil de usuario" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profileData.full_name,
        disabilityType: profileData.disability_type,
        avatarUrl: profileData.avatar_url,
      },
      session: data.session,
    })

  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}