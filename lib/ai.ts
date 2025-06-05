import { GoogleGenerativeAI } from "@google/generative-ai";

// Cliente de Google Generative AI para el chatbot de asesoría legal
let genAIClient: GoogleGenerativeAI | null = null;

export const getGenAIClient = () => {
  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  }
  return genAIClient;
};

export const LEGAL_ASSISTANT_PROMPT = `
Eres un asistente legal especializado en derechos de personas con discapacidad motriz del Perú.
Tu objetivo es proporcionar información precisa y útil sobre temas legales relacionados con discapacidad.

Áreas de especialización:
- Derechos laborales y adaptaciones en el trabajo
- Pensiones por discapacidad y seguridad social
- Herencias, testamentos y protección patrimonial
- Accesibilidad y eliminación de barreras
- Certificación de discapacidad y trámites administrativos

Normas peruanas relevantes:
- Ley N° 29973 - Ley General de la Persona con Discapacidad
- Ley N° 30367 - Ley de Trabajo para Personas con Discapacidad
- Decreto Supremo N° 002-2020-MIMP - Reglamento de la Ley General

Responde de manera clara, concisa y empática. Cita leyes y normativas relevantes cuando sea apropiado.
Si no conoces la respuesta a una pregunta específica, indícalo claramente y sugiere consultar con un abogado especializado.

Recuerda que tu objetivo es informar y orientar, pero no reemplazar el asesoramiento legal profesional personalizado.

Formato de respuesta:
- Usa párrafos concisos separados por un solo salto de línea.
- Las listas deben comenzar inmediatamente después del párrafo anterior.
- No incluyas saltos de línea extras entre párrafos o listas.
- Usa negritas (**texto**) para leyes y normas importantes.
`;

async function getCleanResponse(model: any, prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    // Limpiar saltos de línea múltiples y espacios extras
    return result.response.text()
      .replace(/\n{3,}/g, '\n')  // Reemplazar 3+ saltos con solo 2
      .trim();
  } catch (error) {
    console.error("Error generating content:", error);
    return "";
  }
}

export async function classifyLegalQuery(query: string): Promise<string> {
  const genAI = getGenAIClient();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 20,
    }
  });

  const prompt = `Clasifica la siguiente consulta legal en una de estas categorías:
  - laboral
  - pensiones
  - herencias
  - accesibilidad
  - certificacion
  - judicial
  - tributario
  - ayudas
  - transporte
  - patrimonio
  - general (si no encaja en ninguna categoría específica)
  
  Responde ÚNICAMENTE con el nombre de la categoría, sin explicaciones adicionales.
  
  Consulta: ${query}`;

  const response = await getCleanResponse(model, prompt);
  const category = response.toLowerCase().trim();
  
  // Validación de categoría
  const validCategories = ["laboral", "pensiones", "herencias", "accesibilidad", 
                         "certificacion", "judicial", "tributario", "ayudas", 
                         "transporte", "patrimonio"];
  
  return validCategories.includes(category) ? category : "general";
}

export async function generateLegalResponse(query: string): Promise<{
  response: string;
  topic: string;
  confidence: number;
  suggestions: string[];
  recommendations?: any[];
}> {
  const genAI = getGenAIClient();
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
    }
  });

  // Clasificar la consulta
  const topic = await classifyLegalQuery(query);

  // Generar respuesta principal
  const mainResponse = await model.generateContent({
    contents: [{
      role: "user",
      parts: [{
        text: `${LEGAL_ASSISTANT_PROMPT}\nContexto: La consulta es sobre ${topic}\nConsulta: ${query}\nPor favor, proporciona una respuesta bien formateada sin saltos de línea innecesarios.`
      }]
    }]
  });
  
  // Limpiar la respuesta antes de devolverla
  const responseText = mainResponse.response.text()
    .replace(/\n{3,}/g, '\n')  // Limpiar saltos múltiples
    .replace(/\n\s+\n/g, '\n'); // Limpiar espacios entre saltos

  // Generar sugerencias
  let suggestions: string[] = [];
  try {
    const suggestionsPrompt = {
      contents: [{
        role: "user",
        parts: [{
          text: `Genera exactamente 3 preguntas de seguimiento sobre ${topic} relacionadas con: "${query}".
          Devuelve SOLAMENTE un JSON válido con este formato:
          {"suggestions": ["pregunta1", "pregunta2", "pregunta3"]}
          No incluyas ningún otro texto o explicación.`
        }]
      }]
    };

    const suggestionsResult = await model.generateContent(suggestionsPrompt);
    const rawText = suggestionsResult.response.text();
    
    // Extraer JSON de la respuesta
    const jsonMatch = rawText.match(/\{.*\}/s);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions.slice(0, 3);
      }
    }
  } catch (error) {
    console.error("Error generating suggestions:", error);
    suggestions = [
      "¿Necesitas más información sobre este tema específico?",
      "¿Quieres que profundice en algún aspecto en particular?",
      "¿Te gustaría conocer los trámites necesarios para este caso?"
    ];
  }

  // Calcular confianza
  const confidence = calculateConfidence(responseText, topic);

  return {
    response: responseText,
    topic,
    confidence,
    suggestions,
  };
}

function calculateConfidence(responseText: string, topic: string): number {
  const baseConfidence = 0.5;
  const lengthFactor = Math.min(responseText.length / 1000, 0.3);
  const specificityBonus = topic !== "general" ? 0.2 : 0;
  return Math.min(baseConfidence + lengthFactor + specificityBonus, 0.95);
}