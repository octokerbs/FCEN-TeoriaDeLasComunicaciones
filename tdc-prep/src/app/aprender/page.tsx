import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORY_LABEL } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getTopics() {
  try {
    return await prisma.topic.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { sections: true, questions: true } } },
    });
  } catch {
    return [];
  }
}

export default async function LearnIndex() {
  const topics = await getTopics();

  const groups = new Map<string, typeof topics>();
  for (const t of topics) {
    const arr = groups.get(t.category) ?? [];
    arr.push(t);
    groups.set(t.category, arr);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-16">
        <header className="mb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle mb-5">
            02 / aprender
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-4 leading-[1.1]">
            Lecturas por capa
          </h1>
          <p className="font-serif text-[19px] leading-reading text-fg-muted max-w-[60ch]">
            Cada tema empieza con la intuición, sigue con la formalización y termina con
            errores frecuentes. Los diagramas son los mismos que vas a tener que dibujar en
            el examen.
          </p>
        </header>

        {topics.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-12">
            {Array.from(groups.entries()).map(([cat, ts]) => (
              <section key={cat}>
                <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-fg-subtle mb-4">
                  {CATEGORY_LABEL[cat] ?? cat}
                </h2>
                <div className="space-y-1.5">
                  {ts.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/aprender/${t.slug}`}
                      className="group flex items-center justify-between gap-4 rounded-md border border-bg-border bg-bg-subtle px-5 py-4 hover:bg-bg-surface hover:border-fg-subtle transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-display text-[17px] font-semibold text-fg group-hover:text-accent-blue transition-colors tracking-tight mb-1">
                          {t.name}
                        </div>
                        <p className="font-serif text-[15px] leading-[1.55] text-fg-muted line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-mono text-[10px] text-fg-faint text-right">
                          {t._count.questions} preg
                        </span>
                        <ArrowRight className="size-4 text-fg-subtle group-hover:text-fg group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-md border border-dashed border-bg-border bg-bg-subtle p-12 text-center">
      <div className="font-serif text-fg-muted">
        Todavía no hay temas cargados.{" "}
        <code className="font-mono text-accent-green">npm run db:seed</code> para empezar.
      </div>
    </div>
  );
}
