import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { SessionType } from "@prisma/client";

export const runtime = "nodejs";

type Incoming = {
  type: SessionType;
  mode?: string;
  topicIds?: string[];
  startedAt: number;
  endedAt: number;
  answers: Array<{
    questionId: string;
    selectedOptionIds?: string[];
    textResponse?: string;
    isCorrect?: boolean;
    score?: number;
    feedback?: string;
    rubricResults?: unknown;
    timeSpentMs?: number;
  }>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Incoming;
    if (!body.type || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: "payload inválido" }, { status: 400 });
    }

    const scores = body.answers.map((a) => a.score ?? (a.isCorrect ? 1 : 0));
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    const session = await prisma.session.create({
      data: {
        type: body.type,
        mode: body.mode,
        topicIds: body.topicIds ?? [],
        startedAt: new Date(body.startedAt),
        endedAt: new Date(body.endedAt),
        score: avg,
        answers: {
          create: body.answers.map((a) => ({
            questionId: a.questionId,
            textResponse: a.textResponse,
            isCorrect: a.isCorrect,
            score: a.score,
            feedback: a.feedback,
            rubricResults: a.rubricResults as object | undefined,
            timeSpentMs: a.timeSpentMs,
            selectedOptions:
              a.selectedOptionIds && a.selectedOptionIds.length
                ? {
                    create: a.selectedOptionIds.map((optionId) => ({ optionId })),
                  }
                : undefined,
          })),
        },
      },
      select: { id: true, score: true },
    });

    return NextResponse.json(session);
  } catch (e) {
    console.error("[sessions] error", e);
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const sessions = await prisma.session.findMany({
    where: { endedAt: { not: null } },
    orderBy: { endedAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      mode: true,
      score: true,
      startedAt: true,
      endedAt: true,
      _count: { select: { answers: true } },
    },
  });
  return NextResponse.json(sessions);
}
