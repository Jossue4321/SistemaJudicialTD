import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json(
        { error: "Se requiere user_id" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Consulta para obtener las preguntas más frecuentes del usuario sin agrupar
    const { data: frequentQuestions, error } = await supabase
      .from("user_questions")
      .select("question, category")
      .eq("user_id", userId)

    if (error) {
      throw error
    }

    // Definir el tipo del acumulador explícitamente
    interface GroupedQuestion {
      question: string;
      category: string;
      count: number;
    }

    const groupedQuestions = frequentQuestions.reduce<{ [key: string]: GroupedQuestion }>((acc, { question, category }) => {
      const key = `${question}|${category}`;
      if (acc[key]) {
        acc[key].count += 1;
      } else {
        acc[key] = { question, category, count: 1 };
      }
      return acc;
    }, {});

    // Convertimos el objeto agrupado en un array y lo ordenamos por count
    const sortedRecommendations = Object.values(groupedQuestions)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Limitamos a los 5 primeros

    return NextResponse.json({ recommendations: sortedRecommendations })
  } catch (error) {
    console.error("Error al obtener recomendaciones:", error)
    return NextResponse.json(
      { error: "Error al obtener recomendaciones" },
      { status: 500 }
    )
  }
}