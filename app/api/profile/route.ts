import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Obtener perfil del usuario
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error en perfil GET:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, fullName, disabilityType, avatarUrl } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      )
    }
    
    const supabase = createServerSupabaseClient()
    
    // Actualizar perfil
    const { data: profile, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        disability_type: disabilityType,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Error al actualizar perfil" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error en perfil PATCH:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}