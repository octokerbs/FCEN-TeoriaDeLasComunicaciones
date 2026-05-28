import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ChevronLeft, Brain, PenLine } from "lucide-react";
import { MarkdownContent } from "@/components/learning/MarkdownContent";
import { CATEGORY_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      sections: { orderBy: { order: "asc" } },
      _count: { select: { questions: true } },
    },
  });
  if (!topic) notFound();

  const allContent = topic.sections
    .map(
      (s) =>
        `\n\n## ${s.title}\n\n${s.content}${
          s.diagram ? `\n\n{{diagram: ${s.diagram}}}\n` : ""
        }`,
    )
    .join("");

  return (
    <div className="min-h-screen">
      <div className="max-w-[820px] mx-auto px-8 py-12">
        <Link
          href="/aprender"
          className="inline-flex items-center gap-1.5 text-[13px] text-fg-subtle hover:text-fg mb-10 transition-colors font-display"
        >
          <ChevronLeft className="size-4" />
          <span>Volver a temas</span>
        </Link>

        {/* Editorial header */}
        <header className="mb-12 pb-10 border-b border-bg-border">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle mb-5">
            {CATEGORY_LABEL[topic.category] ?? topic.category}
          </div>
          <h1 className="font-display text-[44px] font-bold tracking-tight text-fg mb-5 leading-[1.08]">
            {topic.name}
          </h1>
          <p className="font-serif text-[20px] leading-reading text-fg-muted">
            {topic.description}
          </p>

          <div className="flex gap-2 mt-8">
            <Link
              href={`/practicar/mcq?topic=${topic.slug}`}
              className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-subtle px-4 py-2 text-[13px] text-fg-muted hover:text-accent-blue hover:border-accent-blue/40 transition-colors font-display"
            >
              <Brain className="size-3.5" />
              Practicar MCQ
            </Link>
            <Link
              href={`/practicar/desarrollar?topic=${topic.slug}`}
              className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-subtle px-4 py-2 text-[13px] text-fg-muted hover:text-accent-red hover:border-accent-red/40 transition-colors font-display"
            >
              <PenLine className="size-3.5" />
              Desarrollar
            </Link>
          </div>
        </header>

        <MarkdownContent content={allContent} />

        <footer className="mt-20 pt-8 border-t border-bg-border">
          <div className="font-mono text-[11px] text-fg-faint">
            {topic._count.questions} preguntas · {topic.sections.length} secciones
          </div>
        </footer>
      </div>
    </div>
  );
}
