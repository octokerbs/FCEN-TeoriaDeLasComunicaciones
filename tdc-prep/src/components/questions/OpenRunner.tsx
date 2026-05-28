"use client";

import { useState } from "react";
import { ArrowRight, Loader2, RotateCcw, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GradeResult } from "@/lib/gemini";

type Question = {
  id: string;
  prompt: string;
  topicName: string;
  topicColor: string;
  difficulty: number;
  isFamous: boolean;
};

type GradedAnswer = {
  questionId: string;
  text: string;
  result: GradeResult;
  timeSpentMs: number;
};

export function OpenRunner({
  questions,
  mode,
}: {
  questions: Question[];
  mode: "practice" | "exam";
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graded, setGraded] = useState<GradedAnswer[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [startedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  const current = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const lastGraded = graded.find((g) => g.questionId === current.id);
  const showFeedback = !!lastGraded;

  async function submitForGrading() {
    if (!text.trim() || grading) return;
    setError(null);
    setGrading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: current.id, answer: text.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const result = (await res.json()) as GradeResult;
      setGraded((prev) => [
        ...prev,
        {
          questionId: current.id,
          text: text.trim(),
          result,
          timeSpentMs: Date.now() - questionStartedAt,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falló la corrección. Probá de nuevo.");
    } finally {
      setGrading(false);
    }
  }

  function next() {
    if (isLast) {
      setFinished(true);
      void saveSession();
    } else {
      setIndex((i) => i + 1);
      setText("");
      setQuestionStartedAt(Date.now());
    }
  }

  async function saveSession() {
    if (sessionSaved) return;
    setSavingSession(true);
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: mode === "exam" ? "EXAM" : "PRACTICE",
          mode: "open",
          startedAt,
          endedAt: Date.now(),
          answers: graded.map((g) => ({
            questionId: g.questionId,
            textResponse: g.text,
            isCorrect: g.result.overallScore >= 0.7,
            score: g.result.overallScore,
            feedback: g.result.shortSummary,
            rubricResults: g.result,
            timeSpentMs: g.timeSpentMs,
          })),
        }),
      });
      setSessionSaved(true);
    } catch {
      // Local UI continues regardless
    } finally {
      setSavingSession(false);
    }
  }

  if (finished) {
    const avg =
      graded.length > 0
        ? graded.reduce((acc, g) => acc + g.result.overallScore, 0) / graded.length
        : 0;
    const pct = Math.round(avg * 100);
    return (
      <div className="space-y-8">
        <div className="text-center py-8 rounded-lg border border-bg-border bg-bg-subtle">
          <div className="font-mono text-[11px] text-fg-subtle uppercase tracking-wider mb-2">
            score final
          </div>
          <div
            className={cn(
              "font-display text-6xl font-bold mb-2",
              pct >= 80 ? "text-accent-green" : pct >= 50 ? "text-accent-yellow" : "text-accent-red",
            )}
          >
            {pct}%
          </div>
          <div className="text-fg-muted">
            promedio de {graded.length} respuestas
          </div>
          {savingSession && (
            <div className="font-mono text-xs text-fg-subtle mt-3">guardando...</div>
          )}
          {sessionSaved && (
            <div className="font-mono text-xs text-accent-green mt-3">guardado ✓</div>
          )}
        </div>

        {graded.map((g, i) => (
          <div key={i} className="rounded-lg border border-bg-border bg-bg-subtle p-5">
            <div className="text-sm text-fg-muted mb-1">
              pregunta {i + 1}
            </div>
            <div className="font-medium mb-3">{questions[i]?.prompt}</div>
            <Feedback result={g.result} />
            <details className="mt-4">
              <summary className="text-xs text-fg-subtle cursor-pointer hover:text-fg-muted">
                ver mi respuesta
              </summary>
              <div className="mt-2 p-3 rounded bg-bg-surface border border-bg-border text-sm text-fg-muted whitespace-pre-wrap">
                {g.text}
              </div>
            </details>
          </div>
        ))}

        <button
          onClick={() => location.reload()}
          className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-subtle px-4 py-2 text-sm font-medium hover:border-fg-subtle transition-colors"
        >
          <RotateCcw className="size-4" />
          Otra ronda
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: current.topicColor }}
          />
          <span className="text-xs text-fg-muted">{current.topicName}</span>
          {current.isFamous && (
            <span className="inline-flex items-center gap-1 text-xs text-accent-yellow">
              <Star className="size-3 fill-accent-yellow" /> clásica
            </span>
          )}
        </div>
        <div className="font-mono text-xs text-fg-subtle">
          {index + 1} / {total}
        </div>
      </div>

      <div className="h-1 rounded-full bg-bg-surface overflow-hidden">
        <div
          className="h-full bg-accent-red transition-all"
          style={{ width: `${((index + (showFeedback ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <h2 className="font-display text-xl font-semibold leading-snug">
        {current.prompt}
      </h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={showFeedback}
        rows={10}
        placeholder="Desarrollá tu respuesta en prosa. Sé preciso, mencioná los términos técnicos y las relaciones causa-efecto."
        className="w-full rounded-lg border border-bg-border bg-bg-subtle p-4 text-sm font-sans leading-relaxed focus:border-accent-cyan focus:outline-none disabled:opacity-60 resize-y"
      />

      <div className="flex items-center justify-between font-mono text-xs text-fg-subtle">
        <span>{text.split(/\s+/).filter(Boolean).length} palabras</span>
        {error && <span className="text-accent-red">{error}</span>}
      </div>

      {showFeedback ? (
        <>
          <Feedback result={lastGraded.result} />
          <div className="flex justify-end pt-2">
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-subtle px-4 py-2 text-sm font-medium hover:border-fg-subtle transition-colors"
            >
              {isLast ? "Terminar" : "Siguiente"} <ArrowRight className="size-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-end pt-2">
          <button
            onClick={submitForGrading}
            disabled={!text.trim() || grading}
            className="inline-flex items-center gap-2 rounded-md bg-accent-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-red/90 transition-colors"
          >
            {grading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Gemini corrige...
              </>
            ) : (
              <>Pedir corrección</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Feedback({ result }: { result: GradeResult }) {
  const pct = Math.round(result.overallScore * 100);
  const levelColor = {
    excelente: "text-accent-green border-accent-green/30 bg-accent-green/5",
    bueno: "text-accent-cyan border-accent-cyan/30 bg-accent-cyan/5",
    regular: "text-accent-yellow border-accent-yellow/30 bg-accent-yellow/5",
    insuficiente: "text-accent-red border-accent-red/30 bg-accent-red/5",
  }[result.level];

  return (
    <div className="space-y-4">
      <div className={cn("rounded-lg border p-4 flex items-start gap-4", levelColor)}>
        <div className="font-display text-4xl font-bold leading-none">{pct}%</div>
        <div>
          <div className="text-xs uppercase tracking-wider opacity-70 font-mono">
            {result.level}
          </div>
          <div className="text-sm mt-1 text-fg">{result.shortSummary}</div>
        </div>
      </div>

      {result.rubricScores.length > 0 && (
        <div className="rounded-lg border border-bg-border bg-bg-subtle p-4">
          <div className="text-xs uppercase tracking-wider text-fg-subtle font-mono mb-3">
            rubric
          </div>
          <div className="space-y-2">
            {result.rubricScores.map((r) => (
              <div key={r.id} className="text-sm">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-fg-muted">{r.id}</span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      r.score >= 0.7
                        ? "text-accent-green"
                        : r.score >= 0.4
                        ? "text-accent-yellow"
                        : "text-accent-red",
                    )}
                  >
                    {Math.round(r.score * 100)}%
                  </span>
                </div>
                <div className="text-xs text-fg-muted">{r.comment}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {result.strengths.length > 0 && (
          <div className="rounded-lg border border-accent-green/20 bg-accent-green/5 p-3">
            <div className="text-xs uppercase tracking-wider text-accent-green font-mono mb-2">
              fuertes
            </div>
            <ul className="space-y-1 text-xs text-fg-muted list-disc list-inside">
              {result.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {result.gaps.length > 0 && (
          <div className="rounded-lg border border-accent-red/20 bg-accent-red/5 p-3">
            <div className="text-xs uppercase tracking-wider text-accent-red font-mono mb-2">
              te faltó
            </div>
            <ul className="space-y-1 text-xs text-fg-muted list-disc list-inside">
              {result.gaps.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {result.suggestions.length > 0 && (
        <div className="rounded-lg border border-bg-border bg-bg-subtle p-3">
          <div className="text-xs uppercase tracking-wider text-fg-subtle font-mono mb-2">
            sugerencias
          </div>
          <ul className="space-y-1 text-xs text-fg-muted list-disc list-inside">
            {result.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
