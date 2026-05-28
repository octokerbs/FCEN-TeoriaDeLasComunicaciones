import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowRight, BookOpen, Brain, FileQuestion, LineChart } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [topics, questions, sessions, lastSession] = await Promise.all([
      prisma.topic.count(),
      prisma.question.count(),
      prisma.session.count({ where: { endedAt: { not: null } } }),
      prisma.session.findFirst({
        where: { endedAt: { not: null } },
        orderBy: { endedAt: "desc" },
        select: { score: true, endedAt: true, type: true },
      }),
    ]);

    const since = new Date();
    since.setDate(since.getDate() - 7);
    const recent = await prisma.answer.findMany({
      where: { createdAt: { gte: since }, isCorrect: { not: null } },
      select: { isCorrect: true },
    });
    const totalRecent = recent.length;
    const correctRecent = recent.filter((a) => a.isCorrect).length;

    return {
      topics,
      questions,
      sessions,
      lastSession,
      accuracy7d: totalRecent > 0 ? correctRecent / totalRecent : null,
      totalRecent,
    };
  } catch {
    return {
      topics: 0,
      questions: 0,
      sessions: 0,
      lastSession: null,
      accuracy7d: null,
      totalRecent: 0,
    };
  }
}

async function getTopicCoverage() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { order: "asc" },
      include: {
        questions: { include: { answers: { select: { isCorrect: true, score: true } } } },
      },
    });
    return topics.map((t) => {
      const all = t.questions.flatMap((q) => q.answers);
      const scored = all.filter((a) => a.score != null || a.isCorrect != null);
      const avg = scored.length
        ? scored.reduce((acc, a) => acc + (a.score ?? (a.isCorrect ? 1 : 0)), 0) / scored.length
        : null;
      return {
        slug: t.slug,
        name: t.name,
        category: t.category,
        questionCount: t.questions.length,
        attempts: scored.length,
        mastery: avg,
      };
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stats = await getStats();
  const topics = await getTopicCoverage();

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-16">
        {/* Hero — editorial */}
        <header className="mb-14 animate-fade-in">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle mb-5">
            01 / inicio
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight text-fg leading-[1.05] mb-5">
            Aprender los temas{" "}
            <span className="text-accent-blue">al pie de la letra</span>
            <span className="text-accent-red">.</span>
          </h1>
          <p className="font-serif text-[19px] leading-reading text-fg-muted max-w-[60ch]">
            Centro de estudio para el final de Teoría de las Comunicaciones. Lectura por
            capa, multiple choice diario, simulacro de examen y corrección de preguntas a
            desarrollar con Gemini.
          </p>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          <StatCard label="Temas" value={stats.topics.toString()} />
          <StatCard label="Preguntas" value={stats.questions.toString()} />
          <StatCard label="Exámenes" value={stats.sessions.toString()} />
          <StatCard
            label="Aciertos · 7d"
            value={stats.accuracy7d == null ? "—" : `${(stats.accuracy7d * 100).toFixed(0)}%`}
            sub={stats.totalRecent > 0 ? `sobre ${stats.totalRecent}` : "sin actividad"}
          />
        </div>

        {/* Quick actions */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold mb-5 text-fg tracking-tight">
            Qué hacer hoy
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <ActionCard
              href="/aprender"
              icon={BookOpen}
              title="Aprender"
              desc="Lecturas por capa con diagramas, fórmulas y errores frecuentes."
              accent="green"
            />
            <ActionCard
              href="/practicar"
              icon={Brain}
              title="Practicar"
              desc="Multiple choice por tema. Bien para repasar antes de dormir."
              accent="blue"
            />
            <ActionCard
              href="/examen"
              icon={FileQuestion}
              title="Simulacro"
              desc="5 preguntas a desarrollar. Corrige Gemini con un rubric."
              accent="red"
            />
            <ActionCard
              href="/progreso"
              icon={LineChart}
              title="Progreso"
              desc="Cómo evoluciona tu dominio por tema día a día."
              accent="white"
            />
          </div>
        </section>

        {/* Topics overview */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <h2 className="font-display text-2xl font-bold text-fg tracking-tight">
              Mapa de temas
            </h2>
            <span className="font-mono text-[11px] text-fg-subtle">
              {topics.length} secciones
            </span>
          </div>

          {topics.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid md:grid-cols-2 gap-2.5">
              {topics.map((t) => (
                <TopicCard key={t.slug} topic={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-bg-border bg-bg-subtle p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle mb-2">
        {label}
      </div>
      <div className="font-display text-2xl font-bold text-fg leading-none">{value}</div>
      {sub && <div className="font-mono text-[10px] text-fg-faint mt-2">{sub}</div>}
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  desc,
  accent,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  accent: "green" | "blue" | "red" | "white";
}) {
  const color = {
    green: "text-accent-green",
    blue: "text-accent-blue",
    red: "text-accent-red",
    white: "text-fg",
  }[accent];
  const border = {
    green: "hover:border-accent-green/60",
    blue: "hover:border-accent-blue/60",
    red: "hover:border-accent-red/60",
    white: "hover:border-fg/40",
  }[accent];
  return (
    <Link
      href={href}
      className={`group rounded-md border border-bg-border bg-bg-subtle p-5 transition-all hover:bg-bg-surface ${border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className={`size-5 ${color}`} />
        <ArrowRight className="size-4 text-fg-subtle group-hover:text-fg group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="font-display text-lg font-semibold text-fg mb-1 tracking-tight">
        {title}
      </div>
      <div className="font-serif text-[15px] leading-[1.55] text-fg-muted">{desc}</div>
    </Link>
  );
}

function TopicCard({
  topic,
}: {
  topic: {
    slug: string;
    name: string;
    category: string;
    questionCount: number;
    attempts: number;
    mastery: number | null;
  };
}) {
  const masteryPct = topic.mastery == null ? null : Math.round(topic.mastery * 100);
  const barColor =
    masteryPct == null
      ? "bg-fg-faint"
      : masteryPct >= 70
      ? "bg-accent-green"
      : masteryPct >= 40
      ? "bg-accent-blue"
      : "bg-accent-red";
  return (
    <Link
      href={`/aprender/${topic.slug}`}
      className="group rounded-md border border-bg-border bg-bg-subtle p-4 hover:bg-bg-surface hover:border-fg-subtle transition-colors block"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle">
          {CATEGORY_LABEL[topic.category] ?? topic.category}
        </span>
        <span className="font-mono text-[10px] text-fg-faint">
          {topic.questionCount} preg
        </span>
      </div>
      <div className="font-display text-[15px] font-semibold text-fg group-hover:text-accent-blue transition-colors mb-3 tracking-tight">
        {topic.name}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 rounded-full bg-bg-surface overflow-hidden">
          {masteryPct != null && (
            <div
              className={`h-full rounded-full ${barColor} transition-all`}
              style={{ width: `${masteryPct}%` }}
            />
          )}
        </div>
        <span className="font-mono text-[10px] text-fg-subtle w-9 text-right">
          {masteryPct == null ? "—" : `${masteryPct}%`}
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-bg-border bg-bg-subtle p-12 text-center">
      <div className="font-mono text-sm text-fg-subtle mb-3">$ npm run db:seed</div>
      <div className="font-serif text-fg-muted">
        Todavía no hay temas cargados. Corré <code className="font-mono text-accent-green">npm run db:up</code> y{" "}
        <code className="font-mono text-accent-green">npm run db:seed</code> para empezar.
      </div>
    </div>
  );
}
