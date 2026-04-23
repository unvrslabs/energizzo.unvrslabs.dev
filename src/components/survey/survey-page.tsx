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
      <div className="se-root se-state">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "hsl(var(--se-accent))" }} />
      </div>
    );
  }

  if (state.phase === "invalid") {
    return (
      <div className="se-root se-state">
        <div className="se-state-inner animate-fade-in-up">
          <div className="se-state-icon se-state-icon--danger">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="se-state-title">Link non valido</h2>
          <p className="se-state-body">
            Questo invito non risulta più attivo. Se pensi sia un errore, scrivi a{" "}
            <a href="mailto:emanuele@maccari.io">emanuele@maccari.io</a>.
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
