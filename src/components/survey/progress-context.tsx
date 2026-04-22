"use client";

import { createContext, useContext } from "react";

type SurveyProgressState = { current: number; total: number };

export const SurveyProgressContext = createContext<SurveyProgressState>({
  current: 0,
  total: 0,
});

export function useSurveyProgress(): SurveyProgressState {
  return useContext(SurveyProgressContext);
}
