import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { gradeOpenAnswer, type RubricCriterion } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { questionId?: string; answer?: string };
    const { questionId, answer } = body;
    if (!questionId || typeof answer !== "string") {
      return NextResponse.json(
        { error: "questionId y answer son requeridos" },
        { status: 400 },
      );
    }
    if (answer.trim().length < 5) {
      return NextResponse.json(
        { error: "Tu respuesta es demasiado corta para corregir" },
        { status: 400 },
      );
    }

    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (!q || q.type !== "OPEN") {
      return NextResponse.json({ error: "Pregunta no válida" }, { status: 404 });
    }
    if (!q.modelAnswer || !q.rubric) {
      return NextResponse.json(
        { error: "La pregunta no tiene rubric / respuesta modelo configurados" },
        { status: 422 },
      );
    }

    const result = await gradeOpenAnswer({
      prompt: q.prompt,
      modelAnswer: q.modelAnswer,
      rubric: q.rubric as unknown as RubricCriterion[],
      studentAnswer: answer,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[grade] error", e);
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
