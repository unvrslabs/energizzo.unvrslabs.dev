"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SURVEY_SCREENS,
  getProgressScreens,
  type Answers,
  type AnswerValue,
  type Screen,
} from "@/lib/survey/survey-config";
import {
  saveSurveyProgress,
  completeSurveyResponse,
} from "@/lib/survey/survey-client";
import { ProgressBar } from "./progress-bar";
import { SurveyProgressContext } from "./progress-context";
import { WelcomeScreen } from "./screens/welcome-screen";
import { StatementScreen } from "./screens/statement-screen";
import { ShortTextScreen } from "./screens/short-text-screen";
import { LongTextScreen } from "./screens/long-text-screen";
import { SingleChoiceScreen } from "./screens/single-choice-screen";
import { MultiChoiceScreen } from "./screens/multi-choice-screen";
import { RankingScreen } from "./screens/ranking-screen";
import { ThanksScreen } from "./screens/thanks-screen";

type Props = {
  token: string;
  initialAnswers: Answers;
  initialStep: number;
  alreadyCompleted: boolean;
};

export function SurveyRunner({
  token,
  initialAnswers,
  initialStep,
  alreadyCompleted,
}: Props) {
  const [answers, setAnswers] = useState<Answers>(() => ({ ...initialAnswers }));

  const visible = useMemo(() => SURVEY_SCREENS.filter((s) => !s.skipIf?.(answers)), [answers]);

  const [index, setIndex] = useState(() => {
    if (alreadyCompleted) return visible.findIndex((s) => s.type === "thanks");
    return Math.min(Math.max(initialStep, 0), visible.length - 1);
  });

  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const current = visible[index];
  const progressList = useMemo(() => getProgressScreens(answers), [answers]);
  const progressIndex = Math.max(
    0,
    progressList.findIndex((s) => s.id === current?.id),
  );
  const progress =
    current?.type === "thanks"
      ? 1
      : current?.type === "welcome"
        ? 0
        : progressList.length === 0
          ? 0
          : (progressIndex + 1) / progressList.length;

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    const next = { ...answersRef.current, [id]: value };
    answersRef.current = next;
    setAnswers(next);
    setError(null);
  }, []);

  const persistProgress = useCallback(
    async (stepIndex: number, currentAnswers: Answers) => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
      pendingRef.current = setTimeout(async () => {
        setSaving(true);
        await saveSurveyProgress(token, stepIndex, currentAnswers);
        setSaving(false);
      }, 200);
    },
    [token],
  );

  const goNext = useCallback(async () => {
    if (!current) return;
    const currentAnswers = answersRef.current;
    const err = validateScreen(current, currentAnswers);
    if (err) {
      setError(err);
      return;
    }

    const newIndex = Math.min(index + 1, visible.length - 1);
    const nextScreen = visible[newIndex];

    setDirection("forward");
    setIndex(newIndex);
    setError(null);

    if (nextScreen && nextScreen.type === "thanks") {
      setSaving(true);
      await completeSurveyResponse(token, currentAnswers);
      const whatsapp = currentAnswers["Q25_whatsapp"];
      const referente = currentAnswers["Q24_nome"];
      if (typeof whatsapp === "string" && whatsapp.trim()) {
        try {
          const res = await fetch("/api/network/activate-invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              whatsapp: whatsapp.trim(),
              referente: typeof referente === "string" ? referente.trim() : undefined,
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            const msg =
              data?.error ??
              "Attivazione accesso non riuscita. Contatta l'admin per essere aggiunto al network.";
            setError(msg);
          }
        } catch (err) {
          console.error("activate-invite failed", err);
          setError(
            "Attivazione accesso non riuscita (connessione). Contatta l'admin.",
          );
        }
      }
      setSaving(false);
    } else {
      persistProgress(newIndex, currentAnswers);
    }
  }, [current, index, visible, token, persistProgress]);

  const goBack = useCallback(() => {
    if (index <= 0) return;
    setDirection("back");
    setIndex(index - 1);
    setError(null);
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target;
      if (t instanceof HTMLTextAreaElement && !(e.metaKey || e.ctrlKey)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext]);

  if (!current) return null;

  const progressCounter =
    current.type === "welcome" || current.type === "thanks"
      ? { current: 0, total: 0 }
      : {
          current: progressIndex + 1,
          total: progressList.length,
        };

  return (
    <SurveyProgressContext.Provider value={progressCounter}>
    <div className="se-root fixed inset-0 overflow-hidden">
      <ProgressBar value={progress} />

      <div className="h-full w-full flex items-center justify-center overflow-y-auto px-4 sm:px-6 py-10 sm:py-14 md:py-20 relative z-10">
        <div
          key={current.id}
          className={cn(
            "w-full max-w-2xl mx-auto",
            direction === "forward" ? "animate-slide-up" : "animate-slide-down",
          )}
        >
          <ScreenView
            screen={current}
            answer={answers[current.id] ?? null}
            setAnswer={(v) => setAnswer(current.id, v)}
            onNext={goNext}
            error={error}
          />
        </div>
      </div>

      {current.type !== "welcome" && current.type !== "thanks" && (
        <div className="se-bottom-nav">
          <span className="hidden sm:inline se-bottom-counter tabular-nums">
            {String(progressIndex + 1).padStart(2, "0")} / {String(progressList.length).padStart(2, "0")}
          </span>
          {saving && <span className="hidden sm:inline se-bottom-saving">salvando</span>}
          <button
            onClick={goBack}
            disabled={index === 0}
            className="se-nav-btn"
            aria-label="Precedente"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button onClick={goNext} className="se-nav-btn" aria-label="Successivo">
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
    </SurveyProgressContext.Provider>
  );
}

function ScreenView({
  screen,
  answer,
  setAnswer,
  onNext,
  error,
}: {
  screen: Screen;
  answer: AnswerValue;
  setAnswer: (v: AnswerValue) => void;
  onNext: () => void;
  error: string | null;
}) {
  switch (screen.type) {
    case "welcome":
      return <WelcomeScreen screen={screen} onNext={onNext} />;
    case "statement":
      return <StatementScreen screen={screen} onNext={onNext} />;
    case "short_text":
      return (
        <ShortTextScreen
          screen={screen}
          value={(answer as string | null) ?? ""}
          onChange={(v) => setAnswer(v)}
          onNext={onNext}
          error={error}
        />
      );
    case "long_text":
      return (
        <LongTextScreen
          screen={screen}
          value={(answer as string | null) ?? ""}
          onChange={(v) => setAnswer(v)}
          onNext={onNext}
          error={error}
        />
      );
    case "single_choice":
      return (
        <SingleChoiceScreen
          screen={screen}
          value={(answer as string | null) ?? null}
          onChange={(v) => {
            setAnswer(v);
            setTimeout(onNext, 280);
          }}
          error={error}
        />
      );
    case "multi_choice":
      return (
        <MultiChoiceScreen
          screen={screen}
          value={(answer as string[] | null) ?? []}
          onChange={(v) => setAnswer(v)}
          onNext={onNext}
          error={error}
        />
      );
    case "ranking":
      return (
        <RankingScreen
          screen={screen}
          value={(answer as string[] | null) ?? screen.options}
          onChange={(v) => setAnswer(v)}
          onNext={onNext}
          error={error}
        />
      );
    case "thanks":
      return <ThanksScreen screen={screen} />;
  }
}

function validateScreen(screen: Screen, answers: Answers): string | null {
  if (screen.type === "welcome" || screen.type === "statement" || screen.type === "thanks") return null;
  const value = answers[screen.id];

  if (screen.type === "short_text") {
    const s = (value as string | null) ?? "";
    if (screen.required && !s.trim()) return "Campo obbligatorio.";
    if (s && screen.pattern && !screen.pattern.test(s.trim())) {
      return screen.patternMessage ?? "Formato non valido.";
    }
    return null;
  }
  if (screen.type === "long_text") {
    const s = (value as string | null) ?? "";
    if (screen.required && !s.trim()) return "Campo obbligatorio.";
    if (screen.maxLength && s.length > screen.maxLength) return `Massimo ${screen.maxLength} caratteri.`;
    return null;
  }
  if (screen.type === "single_choice") {
    if (screen.required && !value) return "Seleziona un'opzione.";
    return null;
  }
  if (screen.type === "multi_choice") {
    const arr = (value as string[] | null) ?? [];
    if (screen.required && arr.length === 0) return "Seleziona almeno un'opzione.";
    if (screen.maxSelections && arr.length > screen.maxSelections) {
      return `Massimo ${screen.maxSelections} selezioni.`;
    }
    return null;
  }
  if (screen.type === "ranking") {
    const arr = (value as string[] | null) ?? [];
    if (screen.required && arr.length !== screen.options.length) {
      return "Ordina tutte le opzioni.";
    }
    return null;
  }
  return null;
}
