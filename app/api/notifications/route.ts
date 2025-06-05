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

    // Obtener notificaciones del usuario
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error al obtener notificaciones" }, { status: 500 })
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error en notificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId, read } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: "ID de notificación requerido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Actualizar estado de lectura
    const { error } = await supabase.from("notifications").update({ read }).eq("id", notificationId)

    if (error) {
      return NextResponse.json({ error: "Error al actualizar notificación" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en notificaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
