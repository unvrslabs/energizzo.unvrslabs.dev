"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  fetchLeadForSurvey,
  fetchSurveyProgress,
  type LeadForSurvey,
} from "@/lib/survey/survey-client";
import type { Answers } from "@/lib/survey/survey-config";
import { SurveyRunner } from "./survey-runner";
import { SurveyWelcome } from "./survey-welcome";

export function SurveyPage({ token }: { token: string }) {
  const [state, setState] = useState<
    | { phase: "loading" }
    | { phase: "invalid" }
    | {
        phase: "welcome" | "runner";
        lead: LeadForSurvey;
        answers: Answers;
        step: number;
        completed: boolean;
      }
  >({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [lead, progress] = await Promise.all([
        fetchLeadForSurvey(token),
        fetchSurveyProgress(token),
      ]);
      if (cancelled) return;
      if (!lead) {
        setState({ phase: "invalid" });
        return;
      }
      const answers = (progress?.answers as Answers) ?? {};
      const step = progress?.current_step ?? 0;
      const completed = progress?.completed ?? lead.survey_completed ?? false;
      const hasProgress =
        completed || step > 0 || Object.keys(answers).length > 0;
      setState({
        phase: hasProgress ? "runner" : "welcome",
        lead,
        answers,
        step,
        completed,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.phase === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (state.phase === "invalid") {
    return (
      <div className="fixed inset-0 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-5 animate-fade-in-up">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Link non valido</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questo link non risulta più attivo. Se pensi sia un errore, scrivi a{" "}
            <a href="mailto:emanuele@unvrslabs.dev" className="text-primary hover:underline font-medium">
              emanuele@unvrslabs.dev
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  if (state.phase === "welcome") {
    return (
      <SurveyWelcome
        lead={state.lead}
        onStart={() =>
          // Skip the runner's built-in welcome screen (index 0) because we
          // already showed our custom hero.
          setState({
            ...state,
            phase: "runner",
            step: Math.max(state.step, 1),
          })
        }
      />
    );
  }

  return (
    <SurveyRunner
      token={token}
      initialAnswers={state.answers}
      initialStep={state.step}
      alreadyCompleted={state.completed}
    />
  );
}
