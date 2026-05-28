import Link from "next/link";
import { prisma } from "@/lib/db";
import { Brain, PenLine } from "lucide-react";

export const dynamic = "force-dynamic";

async function getCounts() {
  try {
    const [mcq, open, topics] = await Promise.all([
      prisma.question.count({ where: { type: "MCQ" } }),
      prisma.question.count({ where: { type: "OPEN" } }),
      prisma.topic.findMany({
        orderBy: { order: "asc" },
        include: { _count: { select: { questions: true } } },
      }),
    ]);
    return { mcq, open, topics };
  } catch {
    return { mcq: 0, open: 0, topics: [] };
  }
}

export default async function PracticeIndex() {
  const { mcq, open, topics } = await getCounts();
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <header className="mb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle mb-5">
            03 / practicar
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-4 leading-[1.1]">
            Repaso diario
          </h1>
          <p className="font-serif text-[19px] leading-reading text-fg-muted max-w-[60ch]">
            Practicá en sesiones cortas. Los multiple choice te dan feedback inmediato y
            las preguntas a desarrollar te las corrige Gemini con el rubric del docente.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-3 mb-14">
          <Link
            href="/practicar/mcq"
            className="group rounded-md border border-bg-border bg-bg-subtle p-6 hover:border-accent-blue/50 hover:bg-bg-surface transition-all"
          >
            <Brain className="size-6 text-accent-blue mb-4" />
            <div className="font-display text-xl font-bold mb-1.5 tracking-tight">
              Multiple Choice
            </div>
            <div className="font-serif text-[15px] leading-[1.55] text-fg-muted mb-4">
              Preguntas rápidas, feedback inmediato con explicación.
            </div>
            <div className="font-mono text-[11px] text-fg-faint">{mcq} disponibles</div>
          </Link>
          <Link
            href="/practicar/desarrollar"
            className="group rounded-md border border-bg-border bg-bg-subtle p-6 hover:border-accent-red/50 hover:bg-bg-surface transition-all"
          >
            <PenLine className="size-6 text-accent-red mb-4" />
            <div className="font-display text-xl font-bold mb-1.5 tracking-tight">
              A desarrollar
            </div>
            <div className="font-serif text-[15px] leading-[1.55] text-fg-muted mb-4">
              Escribís en prosa, Gemini corrige con un rubric explícito.
            </div>
            <div className="font-mono text-[11px] text-fg-faint">{open} disponibles</div>
          </Link>
        </div>

        <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-fg-subtle mb-4">
          Por tema
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {topics.map((t) => (
            <div
              key={t.slug}
              className="rounded-md border border-bg-border bg-bg-subtle p-4"
            >
              <div className="font-display text-[15px] font-semibold mb-2 tracking-tight">
                {t.name}
              </div>
              <div className="font-mono text-[10px] text-fg-faint mb-3">
                {t._count.questions} preguntas
              </div>
              <div className="flex gap-3 font-display text-[13px]">
                <Link
                  href={`/practicar/mcq?topic=${t.slug}`}
                  className="text-accent-blue hover:underline"
                >
                  MCQ
                </Link>
                <span className="text-fg-faint">·</span>
                <Link
                  href={`/practicar/desarrollar?topic=${t.slug}`}
                  className="text-accent-red hover:underline"
                >
                  Desarrollar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
