// app/api/logout/route.ts
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Cerrar sesión en Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    )
  }
}