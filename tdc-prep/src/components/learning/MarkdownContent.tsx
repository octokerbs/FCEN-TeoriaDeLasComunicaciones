"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { DiagramSlot } from "./DiagramSlot";

// Splits markdown by {{diagram: NAME}} markers so we can render React diagrams
// between markdown chunks.
function parseChunks(md: string) {
  const re = /\{\{\s*diagram\s*:\s*([A-Za-z0-9_]+)\s*\}\}/g;
  const chunks: Array<{ type: "md"; text: string } | { type: "diagram"; name: string }> = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(md)) !== null) {
    if (match.index > last) {
      chunks.push({ type: "md", text: md.slice(last, match.index) });
    }
    chunks.push({ type: "diagram", name: match[1] });
    last = match.index + match[0].length;
  }
  if (last < md.length) chunks.push({ type: "md", text: md.slice(last) });
  return chunks;
}

export function MarkdownContent({ content }: { content: string }) {
  const chunks = parseChunks(content);
  return (
    <article className="prose-tdc">
      {chunks.map((c, i) =>
        c.type === "md" ? (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {c.text}
          </ReactMarkdown>
        ) : (
          <DiagramSlot key={i} name={c.name} />
        ),
      )}
    </article>
  );
}
