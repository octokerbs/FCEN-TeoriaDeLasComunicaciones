import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ChevronLeft } from "lucide-react";
import type { GradeResult } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export default async function ExamReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      answers: {
        include: { question: { include: { topic: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!session) notFound();

  const pct = session.score == null ? null : Math.round(session.score * 100);

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
            examen · {session.endedAt?.toLocaleDateString("es-AR")}
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Resultado del simulacro
            </h1>
            <div
              className={`font-display text-5xl font-bold ${
                (pct ?? 0) >= 80
                  ? "text-accent-green"
                  : (pct ?? 0) >= 50
                  ? "text-accent-yellow"
                  : "text-accent-red"
              }`}
            >
              {pct == null ? "—" : `${pct}%`}
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {session.answers.map((a, i) => {
            const rubric = a.rubricResults as unknown as GradeResult | null;
            return (
              <article
                key={a.id}
                className="rounded-lg border border-bg-border bg-bg-subtle p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: a.question.topic.iconColor }}
                  />
                  <span className="text-xs text-fg-muted">{a.question.topic.name}</span>
                  <span className="text-xs text-fg-subtle">· pregunta {i + 1}</span>
                </div>
                <div className="font-medium mb-3">{a.question.prompt}</div>

                {rubric && (
                  <div className="text-sm text-fg-muted leading-relaxed mb-3 p-3 rounded bg-bg-surface border border-bg-border">
                    <span className="font-mono text-xs text-accent-cyan">
                      [{rubric.level}]
                    </span>{" "}
                    {rubric.shortSummary}
                  </div>
                )}

                {a.textResponse && (
                  <details>
                    <summary className="text-xs text-fg-subtle cursor-pointer hover:text-fg-muted">
                      ver mi respuesta
                    </summary>
                    <div className="mt-2 p-3 rounded bg-bg-surface border border-bg-border text-sm whitespace-pre-wrap text-fg-muted">
                      {a.textResponse}
                    </div>
                  </details>
                )}

                <div className="mt-3 flex justify-end font-mono text-xs">
                  <span
                    className={
                      (a.score ?? 0) >= 0.8
                        ? "text-accent-green"
                        : (a.score ?? 0) >= 0.5
                        ? "text-accent-yellow"
                        : "text-accent-red"
                    }
                  >
                    {a.score == null ? "—" : `${Math.round(a.score * 100)}%`}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
