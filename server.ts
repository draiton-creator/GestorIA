import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function generateContentWithFallback(ai: GoogleGenAI, params: any) {
  const primaryModel = params.model || "gemini-3.5-flash";
  const fallbackModel = "gemini-3.1-flash-lite";

  try {
    return await ai.models.generateContent({
      ...params,
      model: primaryModel,
    });
  } catch (err: any) {
    const errText = String(err.message || "");
    const isServiceUnavailable = 
      errText.includes("503") || 
      errText.includes("UNAVAILABLE") || 
      errText.includes("high demand") || 
      errText.includes("ResourceExhausted") ||
      errText.includes("429") ||
      err.status === 503 ||
      err.code === 503 ||
      err.status === 429 ||
      err.code === 429;

    if (isServiceUnavailable && primaryModel !== fallbackModel) {
      console.warn(`[Gemini Fallback] El modelo ${primaryModel} no está disponible. Probando con ${fallbackModel} como respaldo contundente...`);
      try {
        return await ai.models.generateContent({
          ...params,
          model: fallbackModel,
        });
      } catch (fallbackErr: any) {
        console.error("[Gemini Fallback] Falló también el modelo de respaldo:", fallbackErr);
        throw fallbackErr;
      }
    }
    throw err;
  }
}

function parseJSONSafely(text: string): any {
  if (!text) return {};
  let cleanText = text.trim();
  
  // Remove markdown codeblock wrapper if it exists (e.g. ```json ... ```)
  if (cleanText.startsWith("```")) {
    const lines = cleanText.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines.length > 0 && lines[lines.length - 1].startsWith("```")) {
      lines.pop();
    }
    cleanText = lines.join("\n").trim();
  }

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    // If standard JSON.parse fails, extract content between first occurrence of { or [ and last } or ]
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    const firstBracket = cleanText.indexOf("[");
    const lastBracket = cleanText.lastIndexOf("]");

    let startIndex = -1;
    let endIndex = -1;

    if (firstBrace !== -1 && lastBrace !== -1) {
      if (firstBracket !== -1 && firstBracket < firstBrace && lastBracket > lastBrace) {
        startIndex = firstBracket;
        endIndex = lastBracket;
      } else {
        startIndex = firstBrace;
        endIndex = lastBrace;
      }
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      startIndex = firstBracket;
      endIndex = lastBracket;
    }

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const extracted = cleanText.substring(startIndex, endIndex + 1);
      try {
        return JSON.parse(extracted);
      } catch (innerErr) {
        console.error("Fallback parsing failed for extraction:", innerErr);
      }
    }
    throw err;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Configuración de Express para JSON
  app.use(express.json({ limit: "20mb" }));

  // Instanciar el cliente de Gemini API (MANDATORIO: User-Agent headers)
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      })
    : null;

  // Endpoint API para peticiones de Inteligencia Artificial (Modo Integrado)
  app.post("/api/gemini", async (req, res) => {
    const { action, payload } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: "La API Key de Gemini (GEMINI_API_KEY) no está disponible en el servidor. Configúrela en Settings > Secrets.",
      });
    }

    try {
      if (action === "financial-prediction") {
        const { historicalData, monthCount } = payload;
        // Generar predicción basada en los datos históricos de ingresos y gastos
        const basePrompt = `Eres el asesor financiero IA de GestorIA. Analiza los siguientes datos financieros históricos (ingresos y gastos) de la empresa y proyecta la evolución para los próximos ${monthCount} meses de manera realista (pueden ser incrementales, decrecientes o con estacionalidad, basándote en la tendencia).

Datos históricos proporcionados (últimos meses):
${JSON.stringify(historicalData, null, 2)}

Genera una respuesta en formato JSON estructurado que contenga las estimaciones mes a mes. El formato de respuesta JSON debe ser:
{
  "projections": [
    {
      "month": "nombre del mes proyectado (ej. Julio, Agosto)",
      "predictedRevenue": número,
      "predictedExpense": número,
      "confidenceScore": número de 0 a 100,
      "aiObservation": "breve explicación del porqué de esta previsión en español"
    }
  ],
  "strategicAdvisory": "conclusión estratégica global de un párrafo en español recomendando reducción de gastos o aumento de inversión según tendencias"
}`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: basePrompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Eres un analista financiero sénior para pequeñas empresas y autónomos en España. Tu objetivo es predecir de manera conservadora y proveer insights estratégicos valientes en español de España.",
          }
        });
        return res.json({ result: parseJSONSafely(response.text || "{}") });
      }

      if (action === "analyze-ticket") {
        const { fileBase64, mimeType } = payload;
        // Procesar la imagen del ticket
        const promptText = `Analiza esta imagen de un ticket, recibo o factura de gastos en España. Extrae la información relevante en el formato JSON estructurado especificado a continuación. Identifica el proveedor, la fecha de la factura/ticket (en formato YYYY-MM-DD), el concepto descriptivo, el importe total, calcula el IVA estimado (normalmente 21%, 10% o 4% en España), categoriza el gasto en uno de los siguientes: 'Suministros', 'Alquiler', 'Personal', 'Marketing', 'Software', 'Transporte', 'Otros'. Añade cualquier nota de interés fiscal.

Esquema de respuesta JSON:
{
  "provider": "Nombre del emisor o comercio",
  "date": "YYYY-MM-DD",
  "concept": "Concepto principal comprado o pagado",
  "amount": importe total con decimales (número),
  "ivaAmount": importe de IVA (número),
  "category": "Una de las categorías especificadas",
  "notes": "Detalles adicionales como el porcentaje de deducibilidad fiscal en España"
}`;

        const imagePart = {
          inlineData: {
            mimeType,
            data: fileBase64,
          },
        };

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: { parts: [imagePart, { text: promptText }] },
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Eres un digitalizador inteligente de facturas y tickets homologado en España.",
          }
        });
        return res.json({ result: parseJSONSafely(response.text || "{}") });
      }

      if (action === "tax-advice") {
        const { prompt, currentFinances } = payload;
        // Proporcionar consejos sobre impuestos (Form 303, 130, deducibilidad, etc.)
        const contextPrompt = `Pregunta del usuario: "${prompt}"

Contexto financiero actual de la empresa:
${JSON.stringify(currentFinances, null, 2)}

Genera una respuesta como un asesor fiscal experto de Hacienda en España. Ofrece recomendaciones muy claras, referencias a los modelos oficiales de Hacienda (Modelo 303 IVA, Modelo 130 IRPF, etc.) y guías prácticas en un tono profesional, empático y cercano.`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: contextPrompt,
          config: {
            systemInstruction: "Eres un asesor fiscal experto con sede en Madrid, especializado en autónomos, PYMEs y la ley del IVA e IRPF de España. Tu respuesta debe estar estructurada en markdown, usando negritas para destacar conceptos clave e instrucciones paso a paso.",
          }
        });
        return res.json({ text: response.text });
      }

      if (action === "operations-advisor") {
        const { projects, tasks } = payload;
        const basePrompt = `Revisa la lista de proyectos y tareas activas actuales en nuestra empresa para auditar el rendimiento y sugerir mejoras operativas.

Proyectos actuales:
${JSON.stringify(projects, null, 2)}

Tareas actuales de la organización:
${JSON.stringify(tasks, null, 2)}

Actúa como supervisor inteligente. Determina cuellos de botella y genera:
1. Una evaluación del progreso general de la empresa.
2. Una lista de exactamente 3 a 5 tareas proactivas recomendadas que la IA sugiere crear automáticamente para evitar retrasos o balancear presupuestos. Cada tarea sugerida debe indicar el título, la descripción rica y detallada, el id del proyecto asociado, y el por qué es necesaria.

Envía el resultado en el siguiente formato JSON:
{
  "progressAssessment": "Auditoría de progreso en un par de párrafos en español.",
  "suggestedTasks": [
    {
      "title": "Nombre corto de la tarea recomendada",
      "description": "Explicación detallada de qué hacer y el impacto en el proyecto",
      "projectId": "ID del proyecto al que se asocia (debería coincidir con uno de los IDs de proyecto suministrados, o estar vacío si es general)",
      "reason": "Por qué es prioritaria según el análisis de IA"
    }
  ]
}`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: basePrompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Eres un director de operaciones y metodologías ágiles experto en eficiencia de equipos. Respondes en español de España.",
          }
        });
        return res.json({ result: parseJSONSafely(response.text || "{}") });
      }

      if (action === "strategic-insight") {
        const { finances, expenses } = payload;
        const basePrompt = `Analiza detalladamente las finanzas y gastos de la empresa para detectar anomalías, desajustes presupuestarios, o partidas de gasto que se estén disparando de forma descontrolada.

Resumen Financiero:
${JSON.stringify(finances, null, 2)}

Desglose de Gastos:
${JSON.stringify(expenses, null, 2)}

Genera un reporte analítico de anomalías en formato JSON estructurado:
{
  "totalGastado": número,
  "detectedAnomalies": [
    "Descripción detallada del aumento anómalo de gasto o ineficiencia detectada, p.ej. Suministros o Software se han duplicado"
  ],
  "savingsRecommendations": [
    "Recomendación estratégica para recortar este gasto específico u optimizar deducciones (deducibilidad de IVA/IRPF)"
  ],
  "efficiencyScore": número de 1 a 100 indicando la salud presupuestaria
}`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: basePrompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Eres GestorIA Perspectivas de Negocio, un algoritmo de auditoría financiera automática de primer nivel en España.",
          }
        });
        return res.json({ result: parseJSONSafely(response.text || "{}") });
      }

      if (action === "marketing-ideas") {
        const { companyProfile, campaignTheme } = payload;
        const basePrompt = `Crea una estrategia de marketing digital personalizada para la siguiente empresa:
Nombre y Perfil: ${JSON.stringify(companyProfile)}
Objetivo o Tema de Campaña: ${campaignTheme || "Promoción general de servicios y captación de clientes de proximidad"}

Genera una estrategia de contenidos en formato JSON que contenga:
{
  "targetAudience": "Descripción detallada del público objetivo óptimo en España",
  "channels": ["Lista de canales ideales, e.g. LinkedIn, Instagram, Google Ads"],
  "socialPostIdea": "Copia completo redactado y listo para publicar en redes sociales (con hashtags y tono comercial)",
  "emailCampaignNewsletter": "Copia persuasivo para una campaña de email completo (Asunto, Cuerpo y Llamada a la Acción)",
  "blogOutline": "Esquema de un artículo de blog corporativo SEO-optimized para atraer tráfico calificado",
  "seoKeywords": ["Lista de 5 palabras clave de alta intención de búsqueda en Google"]
}`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: basePrompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Eres un Copywriter publicitario sénior experto en inbound marketing y SEO local para empresas españolas.",
          }
        });
        return res.json({ result: parseJSONSafely(response.text || "{}") });
      }

      if (action === "website-seo") {
        const { url } = payload;
        const basePrompt = `Audita el rendimiento y optimización de la página web corporativa: ${url}.
Analiza y estima problemas comunes de velocidad, diseño responsive (mobile-friendly), accesibilidad y el SEO on-page tradicional (meta tags, títulos, velocidad de carga, estructuración de cabeceras).

Genera un reporte auditado detallado en formato JSON:
{
  "url": "${url}",
  "score": número (de 10 a 100 simulando la velocidad y optimización SEO real),
  "mobileFriendly": true o false (si está optimizado para dispositivos móviles),
  "loadTimeSeconds": número de segundos estimados de carga de la web (ej. 1.8),
  "seoAudit": [
    "Descripción corta del problema SEO detectado (ej. Falta de etiquetas alt en imágenes, títuto demasiado largo, etc.)"
  ],
  "usabilityAudit": [
    "Problema de diseño o experiencia (ej. Menú poco intuitivo en móvil, contraste escaso en botones, etc.)"
  ],
  "aiRecommendations": [
    "Acción correctiva concreta explicada paso a paso para mejorar la conversión y posicionamiento en Google España"
  ]
}`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: basePrompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Eres un auditor Web técnico experto en SEO y W3C, con más de 10 años optimizando e-commerce y webs corporativas.",
          }
        });
        return res.json({ result: parseJSONSafely(response.text || "{}") });
      }

      if (action === "asistente-general") {
        const { messages, userProfile } = payload;
        // Chat general con GestorIA
        const chatHistory = messages.map((m: any) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

        const contextQuery = `Pregunta del usuario. Por favor ayúdale amablemente y con rigurosidad:
Actualizar al usuario en base a su información de empresa: ${JSON.stringify(userProfile)}

Además de resolver dudas de contabilidad, fiscalidad (IVA, IRPF, Sociedades) y administración española, incorpórale ideas de programas de ayudas oficial en España si pregunta, por ejemplo el Kit Digital (hasta 12.000€ para digitalización), préstamos ENISA para emprendedores, subvenciones autonómicas de empleo, bonificaciones a la seguridad social de autónomos, etc. Responde en español peninsular, con elegancia y carisma, utilizando un formato markdown legible con listas y negritas.`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: [
            ...chatHistory.slice(-8), // Enviar últimos 8 mensajes para mantener historial pero ahorrar tokens
            { role: "user", parts: [{ text: contextQuery }] }
          ],
          config: {
            systemInstruction: "Eres GestorIA, el mejor asistente virtual inteligente de gestión empresarial, contabilidad y fiscalidad para autónomos y PYMEs en España. Eres sumamente preciso, siempre estás al día con el BOE, la Agencia Tributaria española (AEAT). Ofreces consejos claros, informas sobre subvenciones (Kit Digital, ENISA, etc.) y eres sumamente educado y resolutivo.",
          }
        });
        return res.json({ text: response.text });
      }

      if (action === "analyze-gmail") {
        const { emails } = payload;
        const basePrompt = `Analiza los siguientes correos electrónicos recibidos en la bandeja de entrada para determinar su prioridad de importancia, categoría adecuada y una recomendación rápida de acción que el usuario debe acometer.

Correos recibidos:
${JSON.stringify(emails, null, 2)}

Genera una respuesta en formato JSON estructurado que asocie el ID de cada email con su correspondiente análisis. El formato de respuesta JSON debe ser exactamente:
{
  "analyses": [
    {
      "id": "ID del email analizado o correo coincidente",
      "priority": "Alta",
      "category": "Comercial",
      "summary": "Resumen brevísimo de una frase en español de lo que trata",
      "actionItem": "Instrucción clara de qué acción debe tomar el usuario"
    }
  ]
}
Nota: las opciones para priority son 'Alta', 'Media' o 'Baja'. Las opciones para category son 'Comercial', 'Fiscal', 'Urgente', 'Cliente', 'Proveedor', 'Informativo' o 'Soporte'.`;

        const response = await generateContentWithFallback(ai, {
          model: "gemini-3.5-flash",
          contents: basePrompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "Eres un clasificador inteligente de bandejas de entrada para empresas y autónomos en España, con foco en productividad fiscal y comercial. Respondes con JSON puro."
          }
        });
        return res.json({ result: parseJSONSafely(response.text || "{}") });
      }

      return res.status(400).json({ error: "Acción no reconocida por GestorIA" });
    } catch (error: any) {
      console.error("Error en API GestorIA Gemini:", error);
      return res.status(500).json({
        error: "Ocurrió un error al procesar la petición con la Inteligencia Artificial: " + error.message,
      });
    }
  });

  // Middleware Vite o archivos estáticos en Producción
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor de GestorIA ejecutándose con éxito en el puerto ${PORT}`);
  });
}

startServer();
