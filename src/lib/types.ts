import type { Status, TipoServizio } from "./status-config";
import type { SurveyStatus } from "./survey-questions";

export type Lead = {
  id: string;
  ragione_sociale: string;
  piva: string;
  id_arera: string | null;
  tipo_servizio: TipoServizio;
  comune: string | null;
  provincia: string | null;
  indirizzo: string | null;
  dominio: string | null;
  sito_web: string | null;
  email_info: string | null;
  email_commerciale: string | null;
  telefoni: string | null;
  gruppo: string | null;
  natura_giuridica: string | null;
  settori: string | null;
  latitude: number | null;
  longitude: number | null;
  email: string | null;
  status: Status;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
  contacts_enriched_at: string | null;
  contacts_error: string | null;
  notes_count?: number;
  contacts_count?: number;
  survey_token: string;
  survey_status: SurveyStatus;
  survey_sent_at: string | null;
  survey_completed_at: string | null;
  survey_last_step_at: string | null;
};

export type SurveyResponse = {
  id: string;
  lead_id: string;
  token: string;
  answers: Record<string, string | string[] | null>;
  current_step: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
};

export type LeadContact = {
  id: string;
  lead_id: string;
  full_name: string;
  role: string | null;
  role_code: string | null;
  role_start: string | null;
  birth_date: string | null;
  birth_place: string | null;
  tax_code: string | null;
  is_legal_rep: boolean;
  gender: string | null;
  percent_share: number | null;
  linkedin_url: string | null;
  source: string;
  created_at: string;
};

export type Note = {
  id: string;
  lead_id: string;
  body: string;
  author_id: string | null;
  created_at: string;
  author_email?: string | null;
};

export type ActivityEvent = {
  id: string;
  lead_id: string;
  event_type: "status_change" | "email_updated" | "note_added";
  from_value: string | null;
  to_value: string | null;
  author_id: string | null;
  created_at: string;
};

export type Filters = {
  q?: string;
  status?: Status[];
  provincia?: string[];
  tipo_servizio?: TipoServizio[];
};
