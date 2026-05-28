import { prisma } from "@/lib/db";
import { OpenRunner } from "@/components/questions/OpenRunner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OpenPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; count?: string; famous?: string }>;
}) {
  const { topic, count, famous } = await searchParams;
  const take = Math.min(10, Math.max(1, parseInt(count ?? "1", 10) || 1));

  type Where = { type: "OPEN"; topicId?: string; isFamous?: boolean };
  const where: Where = { type: "OPEN" };
  let topicName: string | null = null;
  if (topic) {
    const t = await prisma.topic.findUnique({ where: { slug: topic } });
    if (t) {
      where.topicId = t.id;
      topicName = t.name;
    }
  }
  if (famous === "1") where.isFamous = true;

  const all = await prisma.question.findMany({
    where,
    include: { topic: true },
  });
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
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-red mb-3">
            preguntas a desarrollar {topicName && `· ${topicName}`}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Practicá la escritura
          </h1>
          <p className="text-fg-muted">
            Escribís en prosa lo que sabés, Gemini te lo corrige con el rubric del docente.
          </p>
        </header>

        {shuffled.length === 0 ? (
          <div className="rounded-lg border border-dashed border-bg-border bg-bg-subtle p-12 text-center text-fg-muted">
            No hay preguntas a desarrollar para este filtro.
          </div>
        ) : (
          <OpenRunner
            mode="practice"
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
