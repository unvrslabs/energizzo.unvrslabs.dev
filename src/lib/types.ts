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
  whatsapp: string | null;
  telefono: string | null;
  podcast_status?: string | null;
  podcast_confirmed_at?: string | null;
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
  event_type:
    | "status_change"
    | "email_updated"
    | "note_added"
    | "podcast_guest_added"
    | "podcast_invite_sent"
    | "podcast_invite_confirmed"
    | "podcast_status_change"
    | "report_link_sent"
    | "report_completed"
    | (string & Record<never, never>);
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

import type {
  GuestStatus,
  GuestTier,
  GuestCategory,
  QuestionTheme,
  QuestionPhase,
  HotTopicIntensity,
  GlossaryCategory,
} from "./podcast-config";

export type PodcastGuest = {
  id: string;
  lead_id: string | null;
  external_name: string | null;
  external_company: string | null;
  external_role: string | null;
  external_email: string | null;
  external_linkedin: string | null;
  tier: GuestTier | null;
  category: GuestCategory | null;
  status: GuestStatus;
  invited_at: string | null;
  recorded_at: string | null;
  published_at: string | null;
  episode_url: string | null;
  episode_title: string | null;
  notes: string | null;
  invite_token: string | null;
  selected_episode_slug: string | null;
  response_name: string | null;
  response_whatsapp: string | null;
  response_availability: string | null;
  response_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  lead?: Pick<Lead, "ragione_sociale" | "piva" | "email" | "telefoni" | "provincia"> | null;
};

export type PodcastQuestion = {
  id: string;
  theme: QuestionTheme;
  phase: QuestionPhase;
  body: string;
  order_idx: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type PodcastGuestQuestion = {
  guest_id: string;
  question_id: string;
  asked: boolean;
  order_idx: number;
  question?: PodcastQuestion;
};

export type PodcastHotTopic = {
  id: string;
  title: string;
  body: string | null;
  intensity: HotTopicIntensity;
  suggested_questions: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PodcastGlossaryTerm = {
  id: string;
  term: string;
  category: GlossaryCategory;
  definition: string;
  created_at: string;
  updated_at: string;
};

export type PodcastSessionNotes = {
  id: string;
  guest_id: string;
  duration_min: number | null;
  key_insights: string | null;
  new_terms: string[];
  new_hot_topics: string[];
  referrals: string | null;
  quote_highlight: string | null;
  energizzo_opportunity: string | null;
  created_at: string;
  updated_at: string;
};
