import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORY_LABEL } from "@/lib/utils";
import { TrendingUp, Target, Calendar, Award } from "lucide-react";
import { ProgressSparkline } from "@/components/progress/ProgressSparkline";

export const dynamic = "force-dynamic";

async function getProgressData() {
  try {
    const [allAnswers, sessions, topics] = await Promise.all([
      prisma.answer.findMany({
        where: { isCorrect: { not: null }, score: { not: null } },
        select: {
          isCorrect: true,
          score: true,
          createdAt: true,
          question: { select: { topicId: true, type: true } },
        },
      }),
      prisma.session.findMany({
        where: { endedAt: { not: null } },
        orderBy: { endedAt: "desc" },
        take: 30,
        select: {
          id: true,
          type: true,
          score: true,
          endedAt: true,
          startedAt: true,
          _count: { select: { answers: true } },
        },
      }),
      prisma.topic.findMany({
        orderBy: { order: "asc" },
        include: {
          questions: {
            select: { id: true, answers: { select: { score: true, isCorrect: true } } },
          },
        },
      }),
    ]);

    // Daily aggregates (last 14 days)
    const byDay = new Map<string, { correct: number; total: number; scoreSum: number }>();
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { correct: 0, total: 0, scoreSum: 0 });
    }
    for (const a of allAnswers) {
      const key = new Date(a.createdAt).toISOString().slice(0, 10);
      const day = byDay.get(key);
      if (!day) continue;
      day.total += 1;
      day.scoreSum += a.score ?? (a.isCorrect ? 1 : 0);
      if (a.isCorrect) day.correct += 1;
    }
    const daily = Array.from(byDay.entries()).map(([day, agg]) => ({
      day,
      avgScore: agg.total > 0 ? agg.scoreSum / agg.total : null,
      count: agg.total,
    }));

    // Topic mastery
    const topicStats = topics.map((t) => {
      const all = t.questions.flatMap((q) => q.answers);
      const scored = all.filter((a) => a.score != null || a.isCorrect != null);
      const avg = scored.length
        ? scored.reduce(
            (acc, a) => acc + (a.score ?? (a.isCorrect ? 1 : 0)),
            0,
          ) / scored.length
        : null;
      return {
        slug: t.slug,
        name: t.name,
        category: t.category,
        iconColor: t.iconColor,
        attempts: scored.length,
        mastery: avg,
      };
    });

    // Totals
    const totalAttempts = allAnswers.length;
    const totalCorrect = allAnswers.filter((a) => a.isCorrect).length;
    const avgScore =
      allAnswers.length > 0
        ? allAnswers.reduce((acc, a) => acc + (a.score ?? (a.isCorrect ? 1 : 0)), 0) /
          allAnswers.length
        : 0;
    const examSessions = sessions.filter((s) => s.type === "EXAM").length;

    // Streak (días consecutivos con actividad)
    let streak = 0;
    for (let i = daily.length - 1; i >= 0; i--) {
      if ((daily[i].count ?? 0) > 0) streak += 1;
      else break;
    }

    return { daily, topicStats, sessions, totalAttempts, totalCorrect, avgScore, examSessions, streak };
  } catch {
    return {
      daily: [],
      topicStats: [],
      sessions: [],
      totalAttempts: 0,
      totalCorrect: 0,
      avgScore: 0,
      examSessions: 0,
      streak: 0,
    };
  }
}

export default async function ProgressPage() {
  const data = await getProgressData();

  // Group topics by category for mastery view
  const byCat = new Map<string, typeof data.topicStats>();
  for (const t of data.topicStats) {
    const arr = byCat.get(t.category) ?? [];
    arr.push(t);
    byCat.set(t.category, arr);
  }

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <header className="mb-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-magenta mb-3">
            05 / progreso
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
            Cómo venís
          </h1>
          <p className="text-fg-muted max-w-2xl">
            Tu evolución día a día y el dominio por tema. Los temas en rojo necesitan atención.
          </p>
        </header>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Metric
            icon={Target}
            label="Promedio"
            value={`${Math.round(data.avgScore * 100)}%`}
            accent={data.avgScore >= 0.7 ? "green" : data.avgScore >= 0.5 ? "yellow" : "red"}
          />
          <Metric
            icon={Calendar}
            label="Racha"
            value={`${data.streak}d`}
            accent="cyan"
          />
          <Metric
            icon={Award}
            label="Simulacros"
            value={`${data.examSessions}`}
            accent="magenta"
          />
          <Metric
            icon={TrendingUp}
            label="Respuestas"
            value={`${data.totalAttempts}`}
            accent="blue"
          />
        </div>

        {/* Daily evolution */}
        <section className="mb-10">
          <h2 className="font-display text-lg font-semibold mb-3">
            Últimos 14 días
          </h2>
          <div className="rounded-lg border border-bg-border bg-bg-subtle p-5">
            <ProgressSparkline data={data.daily} />
          </div>
        </section>

        {/* Topic mastery */}
        <section className="mb-10">
          <h2 className="font-display text-lg font-semibold mb-3">
            Dominio por tema
          </h2>
          {data.topicStats.length === 0 ? (
            <div className="rounded-lg border border-dashed border-bg-border bg-bg-subtle p-8 text-center text-fg-muted text-sm">
              Practicá un poco y te aparecen las métricas acá.
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(byCat.entries()).map(([cat, items]) => (
                <div key={cat}>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle mb-2">
                    {CATEGORY_LABEL[cat] ?? cat}
                  </div>
                  <div className="space-y-1.5">
                    {items.map((t) => {
                      const pct = t.mastery == null ? 0 : Math.round(t.mastery * 100);
                      return (
                        <Link
                          key={t.slug}
                          href={`/aprender/${t.slug}`}
                          className="block rounded-md border border-bg-border bg-bg-subtle px-3 py-2.5 hover:border-fg-subtle transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: t.iconColor }}
                            />
                            <span className="text-sm flex-1 truncate">{t.name}</span>
                            <span className="font-mono text-xs text-fg-subtle w-16 text-right">
                              {t.attempts > 0 ? `${t.attempts} resp.` : "—"}
                            </span>
                            <div className="h-1.5 w-24 rounded-full bg-bg-surface overflow-hidden">
                              {t.mastery != null && (
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: t.iconColor,
                                  }}
                                />
                              )}
                            </div>
                            <span
                              className={`font-mono text-xs w-10 text-right ${
                                t.mastery == null
                                  ? "text-fg-subtle"
                                  : pct >= 70
                                  ? "text-accent-green"
                                  : pct >= 40
                                  ? "text-accent-yellow"
                                  : "text-accent-red"
                              }`}
                            >
                              {t.mastery == null ? "—" : `${pct}%`}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent sessions */}
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">
            Sesiones recientes
          </h2>
          {data.sessions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-bg-border bg-bg-subtle p-8 text-center text-fg-muted text-sm">
              Nada todavía.
            </div>
          ) : (
            <div className="space-y-2">
              {data.sessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-bg-border bg-bg-subtle p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm">
                      <span className="font-mono text-xs text-fg-subtle uppercase tracking-wider">
                        {s.type}
                      </span>{" "}
                      <span className="text-fg-muted">·</span>{" "}
                      <span className="text-fg-muted">
                        {s._count.answers} preguntas
                      </span>
                    </div>
                    <div className="text-xs text-fg-subtle mt-0.5">
                      {s.endedAt?.toLocaleString("es-AR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <div
                    className={`font-display text-xl font-bold ${
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
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "cyan" | "green" | "yellow" | "magenta" | "red" | "blue";
}) {
  const color = {
    cyan: "text-accent-cyan",
    green: "text-accent-green",
    yellow: "text-accent-yellow",
    magenta: "text-accent-magenta",
    red: "text-accent-red",
    blue: "text-accent-blue",
  }[accent];
  return (
    <div className="rounded-lg border border-bg-border bg-bg-subtle p-4">
      <div className="flex items-center gap-1.5 text-fg-subtle font-mono text-[10px] uppercase tracking-wider mb-2">
        <Icon className="size-3" />
        {label}
      </div>
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
