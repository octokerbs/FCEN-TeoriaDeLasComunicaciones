import Link from "next/link";
import { prisma } from "@/lib/db";
import { FileQuestion, Sparkles, Clock, Star } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [famous, all, recent] = await Promise.all([
      prisma.question.count({ where: { type: "OPEN", isFamous: true } }),
      prisma.question.count({ where: { type: "OPEN" } }),
      prisma.session.findMany({
        where: { type: "EXAM", endedAt: { not: null } },
        orderBy: { endedAt: "desc" },
        take: 5,
        select: { id: true, score: true, endedAt: true },
      }),
    ]);
    return { famous, all, recent };
  } catch {
    return { famous: 0, all: 0, recent: [] };
  }
}

export default async function ExamIndex() {
  const { famous, all, recent } = await getStats();

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-12">
        <header className="mb-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-red mb-3">
            04 / examen
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
            Simulacro de final
          </h1>
          <p className="text-fg-muted max-w-2xl">
            El docente suele tomar 5 preguntas a desarrollar de las más famosas. Acá tenés
            la misma estructura: 5 preguntas al azar de las clásicas, sin tiempo. Al final
            Gemini te corrige cada una con su rubric.
          </p>
        </header>

        {/* Start card */}
        <div className="rounded-lg border border-accent-red/30 bg-bg-subtle p-6 mb-10">
          <div className="flex items-start gap-4 mb-5">
            <FileQuestion className="size-8 text-accent-red shrink-0" />
            <div>
              <div className="font-display text-xl font-semibold mb-1">
                5 preguntas clásicas
              </div>
              <div className="text-sm text-fg-muted">
                Random entre las {famous} preguntas que el docente elige más seguido.
                Desarrollás cada una, después Gemini te puntúa.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <Stat icon={Star} label="Clásicas" value={`${famous}`} />
            <Stat icon={FileQuestion} label="Pool total" value={`${all}`} />
            <Stat icon={Clock} label="Tiempo" value="sin límite" />
          </div>

          <div className="flex gap-3">
            <Link
              href="/examen/nuevo?count=5&famous=1"
              className="inline-flex items-center gap-2 rounded-md bg-accent-red text-white px-4 py-2.5 text-sm font-semibold hover:bg-accent-red/90 transition-colors"
            >
              <Sparkles className="size-4" />
              Empezar simulacro
            </Link>
            <Link
              href="/examen/nuevo?count=3&famous=0"
              className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-subtle px-4 py-2.5 text-sm font-medium hover:border-fg-subtle transition-colors"
            >
              Examen corto (3 preg.)
            </Link>
          </div>
        </div>

        {/* Recent exams */}
        {recent.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold mb-3">
              Tus últimos intentos
            </h2>
            <div className="space-y-2">
              {recent.map((s) => (
                <Link
                  key={s.id}
                  href={`/examen/${s.id}`}
                  className="block rounded-lg border border-bg-border bg-bg-subtle p-4 hover:border-fg-subtle transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-fg-muted">
                        {s.endedAt?.toLocaleString("es-AR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                    <div
                      className={`font-display text-2xl font-bold ${
                        (s.score ?? 0) >= 0.8
                          ? "text-accent-green"
                          : (s.score ?? 0) >= 0.5
                          ? "text-accent-yellow"
                          : "text-accent-red"
                      }`}
                    >
                      {s.score == null ? "—" : `${Math.round(s.score * 100)}%`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-bg-surface border border-bg-border p-3">
      <div className="flex items-center gap-1.5 text-fg-subtle font-mono text-[10px] uppercase tracking-wider mb-1">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-fg">{value}</div>
    </div>
  );
}
