import { prisma } from "@/lib/db";
import { MCQRunner } from "@/components/questions/MCQRunner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MCQPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; count?: string }>;
}) {
  const { topic, count } = await searchParams;
  const take = Math.min(20, Math.max(5, parseInt(count ?? "10", 10) || 10));

  let topicFilter = {};
  let topicName: string | null = null;
  if (topic) {
    const t = await prisma.topic.findUnique({ where: { slug: topic } });
    if (t) {
      topicFilter = { topicId: t.id };
      topicName = t.name;
    }
  }

  const all = await prisma.question.findMany({
    where: { type: "MCQ", ...topicFilter },
    include: { options: { orderBy: { order: "asc" } }, topic: true },
  });

  // shuffle & take
  const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, take);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <Link
          href="/practicar"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-6 transition-colors"
        >
          <ChevronLeft className="size-4" />
          Volver
        </Link>

        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-yellow mb-3">
            multiple choice {topicName && `· ${topicName}`}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Sesión de {shuffled.length} preguntas
          </h1>
          <p className="text-fg-muted">
            Respondé, mirá la explicación y al final ves tu score.
          </p>
        </header>

        {shuffled.length === 0 ? (
          <div className="rounded-lg border border-dashed border-bg-border bg-bg-subtle p-12 text-center text-fg-muted">
            No hay preguntas MCQ para este filtro.
          </div>
        ) : (
          <MCQRunner
            questions={shuffled.map((q) => ({
              id: q.id,
              prompt: q.prompt,
              topicName: q.topic.name,
              topicColor: q.topic.iconColor,
              difficulty: q.difficulty,
              options: q.options.map((o) => ({
                id: o.id,
                text: o.text,
                isCorrect: o.isCorrect,
                explanation: o.explanation,
              })),
            }))}
          />
        )}
      </div>
    </div>
  );
}
