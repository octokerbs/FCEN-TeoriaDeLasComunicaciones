"use client";

import { useState } from "react";
import { Check, X, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string | null;
};

type Question = {
  id: string;
  prompt: string;
  topicName: string;
  topicColor: string;
  difficulty: number;
  options: Option[];
};

type Answer = {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  timeSpentMs: number;
};

export function MCQRunner({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const current = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;

  function commitAnswer() {
    if (selected == null) return;
    const correct = current.options.find((o) => o.id === selected)?.isCorrect ?? false;
    setAnswers((prev) => [
      ...prev,
      {
        questionId: current.id,
        selectedOptionId: selected,
        correct,
        timeSpentMs: Date.now() - questionStartedAt,
      },
    ]);
  }

  function next() {
    if (!isLast) {
      setIndex((i) => i + 1);
      setSelected(null);
      setQuestionStartedAt(Date.now());
    } else {
      setFinished(true);
    }
  }

  async function submitSession() {
    if (submitted) return;
    setSubmitting(true);
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "PRACTICE",
          mode: "mcq",
          startedAt,
          endedAt: Date.now(),
          answers: answers.map((a) => ({
            questionId: a.questionId,
            selectedOptionIds: [a.selectedOptionId],
            isCorrect: a.correct,
            score: a.correct ? 1 : 0,
            timeSpentMs: a.timeSpentMs,
          })),
        }),
      });
      setSubmitted(true);
    } catch {
      // swallow — local UI works regardless
    } finally {
      setSubmitting(false);
    }
  }

  if (finished) {
    const correct = answers.filter((a) => a.correct).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <ResultScreen
        questions={questions}
        answers={answers}
        correct={correct}
        total={total}
        pct={pct}
        submitting={submitting}
        submitted={submitted}
        onSubmit={submitSession}
      />
    );
  }

  const showFeedback = answers.length > index;
  const lastAnswer = showFeedback ? answers[index] : null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: current.topicColor }}
          />
          <span className="text-xs text-fg-muted">{current.topicName}</span>
          <span className="text-xs text-fg-subtle">·</span>
          <span className="text-xs text-fg-subtle">
            dificultad {"●".repeat(current.difficulty) + "○".repeat(3 - current.difficulty)}
          </span>
        </div>
        <div className="font-mono text-xs text-fg-subtle">
          {index + 1} / {total}
        </div>
      </div>

      <div className="h-1 rounded-full bg-bg-surface overflow-hidden">
        <div
          className="h-full bg-accent-cyan transition-all"
          style={{ width: `${((index + (showFeedback ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {/* Prompt */}
      <h2 className="font-display text-xl font-semibold leading-snug">
        {current.prompt}
      </h2>

      {/* Options */}
      <div className="space-y-2">
        {current.options.map((opt, i) => {
          const isSelected = selected === opt.id;
          const isAnswered = showFeedback;
          const isCorrectOpt = opt.isCorrect;
          const isWrongSelection = isAnswered && isSelected && !isCorrectOpt;
          const showAsCorrect = isAnswered && isCorrectOpt;

          return (
            <button
              key={opt.id}
              disabled={isAnswered}
              onClick={() => setSelected(opt.id)}
              className={cn(
                "w-full text-left rounded-lg border px-4 py-3 transition-all flex items-start gap-3",
                !isAnswered &&
                  (isSelected
                    ? "border-accent-cyan bg-accent-cyan/5"
                    : "border-bg-border bg-bg-subtle hover:border-fg-subtle"),
                showAsCorrect && "border-accent-green bg-accent-green/10",
                isWrongSelection && "border-accent-red bg-accent-red/10",
                isAnswered && !showAsCorrect && !isWrongSelection && "border-bg-border bg-bg-subtle opacity-50",
              )}
            >
              <span
                className={cn(
                  "font-mono text-xs size-5 rounded shrink-0 mt-0.5 flex items-center justify-center border",
                  !isAnswered &&
                    (isSelected
                      ? "border-accent-cyan text-accent-cyan"
                      : "border-bg-border text-fg-subtle"),
                  showAsCorrect && "border-accent-green text-accent-green bg-accent-green/10",
                  isWrongSelection && "border-accent-red text-accent-red bg-accent-red/10",
                )}
              >
                {showAsCorrect ? (
                  <Check className="size-3" />
                ) : isWrongSelection ? (
                  <X className="size-3" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <div className="flex-1">
                <div className="text-sm">{opt.text}</div>
                {isAnswered && opt.explanation && (isWrongSelection || showAsCorrect) && (
                  <div className="mt-2 text-xs text-fg-muted leading-relaxed">
                    {opt.explanation}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom action */}
      <div className="flex justify-between items-center pt-4">
        <div className="font-mono text-xs text-fg-subtle">
          {showFeedback && lastAnswer && (
            <span className={lastAnswer.correct ? "text-accent-green" : "text-accent-red"}>
              {lastAnswer.correct ? "✓ correcta" : "✗ incorrecta"}
            </span>
          )}
        </div>
        {!showFeedback ? (
          <button
            onClick={commitAnswer}
            disabled={selected == null}
            className="inline-flex items-center gap-2 rounded-md bg-accent-cyan text-bg px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-cyan/90 transition-colors"
          >
            Responder
          </button>
        ) : (
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-subtle px-4 py-2 text-sm font-medium hover:border-fg-subtle transition-colors"
          >
            {isLast ? "Ver resultados" : "Siguiente"} <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function ResultScreen({
  questions,
  answers,
  correct,
  total,
  pct,
  submitting,
  submitted,
  onSubmit,
}: {
  questions: Question[];
  answers: Answer[];
  correct: number;
  total: number;
  pct: number;
  submitting: boolean;
  submitted: boolean;
  onSubmit: () => void;
}) {
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
          {correct} de {total} correctas
        </div>
      </div>

      <div className="space-y-2">
        {questions.map((q, i) => {
          const ans = answers[i];
          return (
            <div
              key={q.id}
              className={cn(
                "rounded-lg border px-4 py-3 flex items-start gap-3",
                ans?.correct
                  ? "border-accent-green/30 bg-accent-green/5"
                  : "border-accent-red/30 bg-accent-red/5",
              )}
            >
              <div
                className={cn(
                  "size-5 rounded shrink-0 mt-0.5 flex items-center justify-center",
                  ans?.correct ? "text-accent-green" : "text-accent-red",
                )}
              >
                {ans?.correct ? <Check className="size-4" /> : <X className="size-4" />}
              </div>
              <div className="text-sm text-fg-muted flex-1">{q.prompt}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => location.reload()}
          className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-subtle px-4 py-2 text-sm font-medium hover:border-fg-subtle transition-colors"
        >
          <RotateCcw className="size-4" />
          Otra ronda
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || submitted}
          className="inline-flex items-center gap-2 rounded-md bg-accent-cyan text-bg px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-accent-cyan/90 transition-colors"
        >
          {submitted ? "Guardado ✓" : submitting ? "Guardando..." : "Guardar progreso"}
        </button>
      </div>
    </div>
  );
}
