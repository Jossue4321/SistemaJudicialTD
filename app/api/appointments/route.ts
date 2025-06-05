import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { userId, lawyerId, date, time, consultationType, needsLSP, notes } = await request.json()

    // Validar datos
    if (!userId || !lawyerId || !date || !time || !consultationType) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verificar disponibilidad del abogado
    const { data: lawyer, error: lawyerError } = await supabase
      .from("lawyers")
      .select("available")
      .eq("id", lawyerId)
      .single()

    if (lawyerError || !lawyer) {
      return NextResponse.json({ error: "Abogado no encontrado" }, { status: 404 })
    }

    if (!lawyer.available) {
      return NextResponse.json({ error: "El abogado no está disponible actualmente" }, { status: 400 })
    }

    // Verificar si ya existe una cita en ese horario
    const { data: existingAppointment } = await supabase
      .from("appointments")
      .select("id")
      .eq("lawyer_id", lawyerId)
      .eq("date", date)
      .eq("time", time)
      .not("status", "eq", "cancelled")
      .maybeSingle()

    if (existingAppointment) {
      return NextResponse.json({ error: "El horario seleccionado ya no está disponible" }, { status: 400 })
    }

    // Crear la cita
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        user_id: userId,
        lawyer_id: lawyerId,
        date,
        time,
        consultation_type: consultationType,
        needs_lsp: needsLSP || false,
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single()

    if (appointmentError) {
      return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 })
    }

    // Crear notificación para el usuario
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Cita agendada exitosamente",
      message: `Tu cita ha sido agendada para el ${date} a las ${time}. Recibirás un recordatorio antes de la cita.`,
      type: "appointment",
    })

    // Obtener historial de preguntas del usuario para recomendaciones de abogados
    const { data: userQuestions } = await supabase
      .from("user_questions")
      .select("question, category")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    let recommendedLawyers = []
    if (userQuestions && userQuestions.length > 0) {
      // Construir descripción del caso basada en las preguntas del usuario
      const caseDescription = userQuestions.map((q) => q.question).join(" ")

      // Obtener recomendaciones de abogados usando ML
      recommendedLawyers = await getRecommendedLawyers(caseDescription, {
        preferred_experience: 5,
        preferred_rating: 4.5,
      })
    }

    return NextResponse.json({
      appointment,
      recommendedLawyers: recommendedLawyers.length > 0 ? recommendedLawyers : undefined,
    })
  } catch (error) {
    console.error("Error en citas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Obtener citas del usuario
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        *,
        lawyers:lawyer_id (
          full_name,
          specialty,
          avatar_url
        )
      `)
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) {
      return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 })
    }

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("Error en citas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para ejecutar el script de Python para recomendaciones de abogados
async function getRecommendedLawyers(caseDescription: string, preferences: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      const requestData = JSON.stringify({
        case_description: caseDescription,
        user_preferences: preferences,
      })

      // Ruta al script de Python
      const scriptPath = path.join(process.cwd(), "scripts", "ml_lawyer_recommender.py")

      // Ejecutar el script de Python como proceso hijo
      const pythonProcess = spawn("python", [scriptPath, requestData])

      let result = ""
      let error = ""

      pythonProcess.stdout.on("data", (data) => {
        result += data.toString()
      })

      pythonProcess.stderr.on("data", (data) => {
        error += data.toString()
      })

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`)
          console.error(`Error: ${error}`)
          resolve([]) // Devolver array vacío en caso de error
          return
        }

        try {
          const parsedResult = JSON.parse(result)
          if (parsedResult.status === "success" && Array.isArray(parsedResult.recommendations)) {
            resolve(parsedResult.recommendations)
          } else {
            console.error("Invalid response format from Python script")
            resolve([])
          }
        } catch (parseError) {
          console.error("Error parsing Python script output:", parseError)
          resolve([])
        }
      })
    } catch (err) {
      console.error("Error executing Python script:", err)
      resolve([])
    }
  })
}
