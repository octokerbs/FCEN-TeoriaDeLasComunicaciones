import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const primaryModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
// Fallback chain when the primary model is overloaded (HTTP 503 / 429).
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-flash-latest",
];

function isOverload(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("overloaded")
  );
}

function isNotFound(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("404") || msg.includes("NOT_FOUND");
}

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

let cached: GoogleGenAI | null = null;
export function getGemini() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en .env.local");
  }
  cached ??= new GoogleGenAI({ apiKey });
  return cached;
}

export type RubricCriterion = {
  id: string;
  label: string;
  weight: number;
  mustInclude?: string[];
};

export type GradeResult = {
  overallScore: number; // 0–1
  level: "excelente" | "bueno" | "regular" | "insuficiente";
  shortSummary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  rubricScores: { id: string; score: number; comment: string }[];
};

const SYSTEM_INSTRUCTION = `Sos un profesor de Teoría de las Comunicaciones de la Universidad de Buenos Aires (FCEN-UBA). Tu rol es corregir respuestas a desarrollar de estudiantes preparando el examen final.

Sé EXIGENTE pero JUSTO:
- Valorá precisión técnica, uso correcto de terminología y conexiones conceptuales.
- Penalizá omisiones importantes y confusiones conceptuales (no errores menores de redacción).
- Tu objetivo es que el estudiante APRENDA, no aprobarle todo. Si la respuesta es flojita, decilo claro y explicá qué falta.
- Devolvé feedback constructivo y específico. Nada de palmaditas vacías.

Calificá con un score 0-1 por criterio del rubric y un score global 0-1. Niveles:
- excelente: 0.90-1.00 (respuesta de manual, conexiones inteligentes)
- bueno: 0.70-0.89 (correcta, completa, alguna imprecisión menor)
- regular: 0.45-0.69 (lo central está pero faltan piezas o hay errores)
- insuficiente: 0.00-0.44 (falla en lo central, requiere reaprender)

Respondé EXCLUSIVAMENTE con JSON válido siguiendo el schema dado. No agregues texto antes ni después del JSON.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: ["overallScore", "level", "shortSummary", "strengths", "gaps", "suggestions", "rubricScores"],
  properties: {
    overallScore: { type: Type.NUMBER },
    level: { type: Type.STRING, enum: ["excelente", "bueno", "regular", "insuficiente"] },
    shortSummary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    rubricScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["id", "score", "comment"],
        properties: {
          id: { type: Type.STRING },
          score: { type: Type.NUMBER },
          comment: { type: Type.STRING },
        },
      },
    },
  },
};

export async function gradeOpenAnswer(args: {
  prompt: string;
  modelAnswer: string;
  rubric: RubricCriterion[];
  studentAnswer: string;
}): Promise<GradeResult> {
  const ai = getGemini();
  const userPrompt = `## Pregunta
${args.prompt}

## Respuesta modelo (referencia interna del docente)
${args.modelAnswer}

## Rubric (criterios y pesos)
${args.rubric.map((c) => `- [${c.id}] (peso ${c.weight}) ${c.label}${c.mustInclude?.length ? ` — términos esperados: ${c.mustInclude.join(", ")}` : ""}`).join("\n")}

## Respuesta del estudiante
${args.studentAnswer.trim() || "(vacía)"}

Devolvé el JSON de corrección.`;

  // Build ordered list of models to try (primary first, then fallbacks).
  const modelsToTry = [
    primaryModel,
    ...FALLBACK_MODELS.filter((m) => m !== primaryModel),
  ];

  let lastError: unknown;
  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null =
    null;
  let usedModel = primaryModel;

  outer: for (const m of modelsToTry) {
    // Retry each model up to 2 times with backoff before falling back.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // Gemini 2.5 consumes output tokens on internal "thinking".
        // Disable it so the whole budget goes to JSON output.
        const config = {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 4096,
        } as unknown as Parameters<typeof ai.models.generateContent>[0]["config"];

        response = await ai.models.generateContent({
          model: m,
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          config: config!,
        });
        usedModel = m;
        break outer;
      } catch (err) {
        lastError = err;
        if (isNotFound(err)) {
          // Model unavailable in this region/API version → skip immediately.
          console.warn(`[gemini] modelo ${m} no disponible, salteando...`);
          break;
        }
        if (!isOverload(err)) throw err; // Non-recoverable error.
        const wait = 800 * (attempt + 1);
        console.warn(
          `[gemini] modelo ${m} sobrecargado (intento ${attempt + 1}), espero ${wait}ms`,
        );
        await sleep(wait);
      }
    }
  }

  if (!response) throw lastError ?? new Error("Todos los modelos fallaron");
  if (usedModel !== primaryModel) {
    console.warn(`[gemini] usando fallback: ${usedModel}`);
  }

  const text = response.text ?? "{}";
  try {
    return JSON.parse(text) as GradeResult;
  } catch {
    // Try to recover by stripping markdown fences and extracting the first JSON object.
    const stripped = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(stripped.slice(start, end + 1)) as GradeResult;
      } catch {
        /* fallthrough */
      }
    }
    console.error("[gemini] no pude parsear respuesta. Texto crudo:", text.slice(0, 500));
    return {
      overallScore: 0,
      level: "insuficiente",
      shortSummary: "No pude parsear la respuesta del corrector. Intentá de nuevo.",
      strengths: [],
      gaps: [],
      suggestions: [],
      rubricScores: args.rubric.map((c) => ({ id: c.id, score: 0, comment: "(sin evaluar)" })),
    };
  }
}
