import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { generateLegalResponse } from "@/lib/ai";
import { spawn } from "child_process";
import path from "path";
import { marked } from "marked";  // Asegúrate de que la librería esté importada correctamente

interface Recommendation {
  id: number;
  question: string;
  category: string;
  count: number;
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    // Generar respuesta usando el modelo de IA real
    const aiResponse = await generateLegalResponse(message);

    // Convertir las sugerencias a Markdown (unirlas en un solo string)
    const [htmlResponse, htmlSuggestions] = await Promise.all([
      marked(aiResponse.response),
      marked(aiResponse.suggestions?.join("\n\n") || '')
    ]);

    // Puedes formatear y/o sanitizar el HTML después
    const formattedHtmlResponse = formatHtmlContent(htmlResponse);
    const formattedHtmlSuggestions = formatHtmlContent(htmlSuggestions);

    const supabase = createServerSupabaseClient();
    let responseData = { ...aiResponse, suggestions: formattedHtmlSuggestions, response: formattedHtmlResponse, recommendations: [] };

    // Si hay un usuario autenticado, guardar la interacción
    if (userId) {
      // Guardar pregunta y respuesta en la base de datos
      await supabase.from("user_questions").insert({
        user_id: userId,
        question: message,
        answer: aiResponse.response,
        category: aiResponse.topic || "general",
      });

      // Incrementar frecuencia de preguntas similares
      if (aiResponse.topic) {
        const { data: similarQuestions } = await supabase
          .from("legal_questions")
          .select("id, frequency")
          .ilike("category", aiResponse.topic)
          .limit(1);

        if (similarQuestions && similarQuestions.length > 0) {
          await supabase
            .from("legal_questions")
            .update({ frequency: similarQuestions[0].frequency + 1 })
            .eq("id", similarQuestions[0].id);
        }
      }

      // Obtener historial de preguntas del usuario para recomendaciones
      const { data: userHistory } = await supabase
        .from("user_questions")
        .select("question, category, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

        const responseData = {
          recommendations: [] as Recommendation[]  // Definir el tipo como Recommendation[]
        }

      if (userHistory && userHistory.length > 0) {
        // Ejecutar el modelo de ML para recomendaciones
        const mlRecommendations = await getRecommendedQuestions(userHistory);
          
        // Combinar con recomendaciones del sistema
        const systemRecommendations = await getSystemRecommendations(supabase, aiResponse.topic);
        
        responseData.recommendations = [
          ...mlRecommendations,
          ...systemRecommendations
        ].slice(0, 5); // Limitar a 5 recomendaciones
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error en chatbot:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

async function getSystemRecommendations(supabase: any, topic: string | null) {
  if (!topic) return [];
  
  try {
    const { data } = await supabase
      .from("legal_questions")
      .select("question, category")
      .ilike("category", `%${topic}%`)
      .order("frequency", { ascending: false })
      .limit(3);

    return data?.map((item: any) => ({
      id: `sys-${Math.random().toString(36).substr(2, 9)}`,
      question: item.question,
      category: item.category
    })) || [];
  } catch (error) {
    console.error("Error getting system recommendations:", error);
    return [];
  }
}

// Función para ejecutar el script de Python para recomendaciones
async function getRecommendedQuestions(userHistory: any[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      // Preparar los datos para Python en el formato correcto
      const historyForML = userHistory.map(item => ({
        question: item.question,
        category: item.category || 'general' // Asegurar que siempre haya categoría
      }));

      const requestData = JSON.stringify({
        user_history: historyForML  // Ahora coincide con lo que Python espera
      });

      const scriptPath = path.join(process.cwd(), "scripts", "ml_question_recommender.py");
      const pythonProcess = spawn("python3", [scriptPath, requestData]);

      let result = "";
      pythonProcess.stdout.on("data", (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          resolve([]);
          return;
        }

        try {
          const parsed = JSON.parse(result);
          if (parsed.status === "success") {
            // Mapear a la estructura que espera tu frontend
            const recommendations = parsed.recommendations.map((rec: any, idx: number) => ({
              id: idx + 1,
              question: rec.question,
              category: rec.category,
              count: Math.round(rec.similarity * 100) // Convertir similitud a porcentaje
            }));
            resolve(recommendations);
          } else {
            console.error("Python script returned error:", parsed.message);
            resolve([]);
          }
        } catch (e) {
          console.error("Error parsing Python output:", e);
          resolve([]);
        }
      });
    } catch (err) {
      console.error("Error executing Python script:", err);
      resolve([]);
    }
  });
}

// Función para mejorar el formato del contenido HTML (aplicar clases de Tailwind)
function formatHtmlContent(html: string): string {
  // Primero normalizar saltos de línea en el HTML
  let normalizedHtml = html
    .replace(/(<\/?(ul|ol|li|p|h[1-6])[^>]*>)\s+/g, '$1')  // Eliminar espacios después de tags
    .replace(/\s+(<\/?(ul|ol|li|p|h[1-6])[^>]*>)/g, '$1'); // Eliminar espacios antes de tags

  // Aplicar clases de Tailwind con espaciado aumentado (2.0 = my-8)
  return normalizedHtml
    .replace(/<h1>/g, '<h1 class="text-2xl font-bold text-gray-900 my-8">')      // my-8 (2rem)
    .replace(/<h2>/g, '<h2 class="text-xl font-semibold text-gray-800 my-8">')    // my-8
    .replace(/<h3>/g, '<h3 class="text-lg font-medium text-gray-700 my-6">')      // my-6 (1.5rem)
    .replace(/<ul>/g, '<ul class="list-disc pl-5 my-6">')                         // my-6
    .replace(/<ol>/g, '<ol class="list-decimal pl-5 my-6">')                      // my-6
    .replace(/<li>/g, '<li class="my-3">')                                        // my-3 (0.75rem)
    .replace(/<p>/g, '<p class="my-4">')                                         // my-4 (1rem)
    .replace(/<strong>/g, '<strong class="font-semibold">')
    .replace(/<em>/g, '<em class="italic">')
    // Añadir margen adicional después de bloques importantes
    .replace(/<\/h1>/g, '</h1><div class="my-2"></div>')
    .replace(/<\/h2>/g, '</h2><div class="my-2"></div>')
    .replace(/<\/h3>/g, '</h3><div class="my-1"></div>')
    .replace(/<\/ul>/g, '</ul><div class="my-2"></div>')
    .replace(/<\/ol>/g, '</ol><div class="my-2"></div>');
}