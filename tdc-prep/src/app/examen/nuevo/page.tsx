import { prisma } from "@/lib/db";
import { OpenRunner } from "@/components/questions/OpenRunner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewExamPage({
  searchParams,
}: {
  searchParams: Promise<{ count?: string; famous?: string }>;
}) {
  const { count, famous } = await searchParams;
  const take = Math.min(10, Math.max(1, parseInt(count ?? "5", 10) || 5));

  const where = {
    type: "OPEN" as const,
    ...(famous === "1" ? { isFamous: true } : {}),
  };

  const all = await prisma.question.findMany({
    where,
    include: { topic: true },
  });
  const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, take);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <Link
          href="/examen"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-6 transition-colors"
        >
          <ChevronLeft className="size-4" />
          Volver
        </Link>

        <header className="mb-8 pb-6 border-b border-bg-border">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-red mb-3">
            simulacro · {take} preguntas
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Tu examen
          </h1>
          <p className="text-fg-muted">
            Una pregunta por vez. Escribís, pedís corrección, y al terminar ves el promedio.
          </p>
        </header>

        {shuffled.length === 0 ? (
          <div className="rounded-lg border border-dashed border-bg-border bg-bg-subtle p-12 text-center text-fg-muted">
            No hay preguntas para iniciar el examen. Corré el seed primero.
          </div>
        ) : (
          <OpenRunner
            mode="exam"
            questions={shuffled.map((q) => ({
              id: q.id,
              prompt: q.prompt,
              topicName: q.topic.name,
              topicColor: q.topic.iconColor,
              difficulty: q.difficulty,
              isFamous: q.isFamous,
            }))}
          />
        )}
      </div>
    </div>
  );
}
