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

    // Obtener preguntas del usuario
    const { data: questions, error } = await supabase
      .from("user_questions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error al obtener preguntas" }, { status: 500 })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error en preguntas de usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}