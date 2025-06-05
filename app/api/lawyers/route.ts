import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener todos los abogados
    const { data: lawyers, error } = await supabase
      .from("lawyers")
      .select("*")
      .order("rating", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error al obtener abogados" }, { status: 500 })
    }

    return NextResponse.json({ lawyers })
  } catch (error) {
    console.error("Error en abogados:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}