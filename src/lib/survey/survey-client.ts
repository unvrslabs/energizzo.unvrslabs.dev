"use client";

import { createClient } from "@/lib/supabase/client";

export type LeadForSurvey = {
  id: string;
  ragione_sociale: string;
  piva: string;
  tipo_servizio: string;
  provincia: string | null;
  survey_completed: boolean;
};

export async function fetchLeadForSurvey(
  token: string,
): Promise<LeadForSurvey | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_lead_for_survey", {
    p_token: token,
  });
  if (error) {
    console.error("get_lead_for_survey error", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return (row as LeadForSurvey | null) ?? null;
}

export async function fetchSurveyProgress(token: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("survey_responses")
    .select("answers, current_step, completed")
    .eq("token", token)
    .maybeSingle();
  if (error) return null;
  return data as {
    answers: Record<string, string | string[] | null>;
    current_step: number;
    completed: boolean;
  } | null;
}

export async function saveSurveyProgress(
  token: string,
  step: number,
  answers: Record<string, string | string[] | null>,
) {
  const supabase = createClient();
  return supabase.rpc("save_survey_progress", {
    p_token: token,
    p_step: step,
    p_answers: answers,
  });
}

export async function completeSurveyResponse(
  token: string,
  answers: Record<string, string | string[] | null>,
) {
  const supabase = createClient();
  return supabase.rpc("complete_survey", {
    p_token: token,
    p_answers: answers,
  });
}
