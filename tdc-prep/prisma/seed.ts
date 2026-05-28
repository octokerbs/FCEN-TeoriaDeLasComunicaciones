import { PrismaClient } from "@prisma/client";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { topics } from "./seed-topics";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const CONTENT_DIR = resolve(__dirname, "..", "content");

type ParsedSection = {
  slug: string;
  title: string;
  content: string;
  diagram: string | null;
};

function parseFrontmatter(md: string): { meta: Record<string, string>; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: md };
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: m[2] };
}

function splitSections(body: string): ParsedSection[] {
  // Split by H2 (##), but keep H1 (#) as intro
  const parts = body.split(/^##\s+(.+)$/m);
  // parts[0] is content before any ##, parts[1] = first heading title, parts[2] = its content, ...
  const sections: ParsedSection[] = [];
  if (parts[0]?.trim()) {
    sections.push({
      slug: "intro",
      title: "Resumen",
      content: parts[0].trim(),
      diagram: null,
    });
  }
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim();
    const rawContent = (parts[i + 1] ?? "").trim();
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `seccion-${i}`;
    // detect first {{diagram: X}} reference for this section
    const dmatch = rawContent.match(/\{\{\s*diagram\s*:\s*([A-Za-z0-9_]+)\s*\}\}/);
    const diagram = dmatch ? dmatch[1] : null;
    sections.push({
      slug,
      title,
      content: rawContent,
      diagram,
    });
  }
  return sections;
}

async function seedTopics() {
  console.log(`→ Seeding ${topics.length} topics...`);
  for (const t of topics) {
    await prisma.topic.upsert({
      where: { slug: t.slug },
      create: t,
      update: {
        name: t.name,
        description: t.description,
        order: t.order,
        category: t.category,
        iconColor: t.iconColor,
      },
    });
  }
}

async function seedSections() {
  if (!existsSync(CONTENT_DIR)) {
    console.warn(`! Content dir not found: ${CONTENT_DIR}, skipping sections.`);
    return;
  }
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  console.log(`→ Reading ${files.length} content files...`);
  let totalSections = 0;
  for (const f of files) {
    const raw = readFileSync(join(CONTENT_DIR, f), "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    const slug = meta.slug ?? f.replace(/\.md$/, "");
    const topic = await prisma.topic.findUnique({ where: { slug } });
    if (!topic) {
      console.warn(`  ⚠ topic not found for ${slug}, skipping`);
      continue;
    }
    // Wipe existing sections to keep idempotent
    await prisma.learningSection.deleteMany({ where: { topicId: topic.id } });
    const sections = splitSections(body);
    const seenSlugs = new Map<string, number>();
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      // Guarantee per-topic unique slug even if two H2 normalize to the same.
      const baseSlug = s.slug || `seccion-${i}`;
      const count = seenSlugs.get(baseSlug) ?? 0;
      seenSlugs.set(baseSlug, count + 1);
      const finalSlug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
      await prisma.learningSection.create({
        data: {
          topicId: topic.id,
          slug: finalSlug,
          title: s.title,
          content: s.content,
          diagram: s.diagram,
          order: i,
        },
      });
    }
    totalSections += sections.length;
    console.log(`  ✓ ${slug}: ${sections.length} sections`);
  }
  console.log(`→ Total sections: ${totalSections}`);
}

async function seedQuestions() {
  const seedFile = resolve(__dirname, "seed-questions.ts");
  if (!existsSync(seedFile)) {
    console.warn(`! seed-questions.ts not found, skipping.`);
    return;
  }
  // Dynamic import
  const mod = (await import(`file://${seedFile}`)) as {
    questions: Array<{
      topicSlug: string;
      type: "MCQ" | "OPEN";
      prompt: string;
      difficulty: number;
      isFamous: boolean;
      tags?: string[];
      modelAnswer?: string;
      rubric?: unknown;
      options?: Array<{ text: string; isCorrect: boolean; explanation?: string }>;
    }>;
  };
  console.log(`→ Seeding ${mod.questions.length} questions...`);

  // Wipe existing questions for clean re-seed
  await prisma.answerOption.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();

  let mcq = 0;
  let open = 0;
  for (const q of mod.questions) {
    const topic = await prisma.topic.findUnique({ where: { slug: q.topicSlug } });
    if (!topic) {
      console.warn(`  ⚠ topic not found: ${q.topicSlug}`);
      continue;
    }
    await prisma.question.create({
      data: {
        topicId: topic.id,
        type: q.type,
        prompt: q.prompt,
        difficulty: q.difficulty,
        isFamous: q.isFamous,
        tags: q.tags ?? [],
        modelAnswer: q.modelAnswer,
        rubric: q.rubric as object | undefined,
        options:
          q.options && q.options.length
            ? {
                create: q.options.map((o, i) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                  explanation: o.explanation,
                  order: i,
                })),
              }
            : undefined,
      },
    });
    if (q.type === "MCQ") mcq++;
    else open++;
  }
  console.log(`→ Created ${mcq} MCQ + ${open} OPEN questions`);
}

async function main() {
  console.log("== TdC seed ==");
  await seedTopics();
  await seedSections();
  await seedQuestions();
  console.log("✓ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
