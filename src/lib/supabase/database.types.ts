export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          author_id: string | null
          created_at: string
          event_type: string
          from_value: string | null
          id: string
          lead_id: string
          to_value: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          event_type: string
          from_value?: string | null
          id?: string
          lead_id: string
          to_value?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string
          event_type?: string
          from_value?: string | null
          id?: string
          lead_id?: string
          to_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_members: {
        Row: {
          created_at: string
          id: string
          last_login_at: string | null
          nome: string
          notes: string | null
          phone: string
          revoked_at: string | null
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_login_at?: string | null
          nome: string
          notes?: string | null
          phone: string
          revoked_at?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_login_at?: string | null
          nome?: string
          notes?: string | null
          phone?: string
          revoked_at?: string | null
          role?: string
        }
        Relationships: []
      }
      admin_otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          ip: string | null
          phone: string
          user_agent: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          ip?: string | null
          phone: string
          user_agent?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip?: string | null
          phone?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          ip: string | null
          member_id: string
          revoked_at: string | null
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          ip?: string | null
          member_id: string
          revoked_at?: string | null
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          ip?: string | null
          member_id?: string
          revoked_at?: string | null
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "admin_members"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delibere_cache: {
        Row: {
          ai_bullets: Json | null
          ai_categoria_impatto: string | null
          ai_error: string | null
          ai_generated_at: string | null
          ai_generating_at: string | null
          ai_importanza: string | null
          ai_model: string | null
          ai_scadenze: Json | null
          ai_sectors: Json | null
          ai_source: string | null
          ai_summary: string | null
          api_created_at: string | null
          api_updated_at: string | null
          autore: Json | null
          created_at: string | null
          data_delibera: string | null
          data_pubblicazione: string | null
          data_scadenza: string | null
          descrizione: string | null
          documenti_urls: Json | null
          documento_url: string | null
          fonte: string | null
          id: number
          note: string | null
          numero: string
          numero_suffix: string | null
          scraped_at: string | null
          scraped_data_pubblicazione: string | null
          settore: string | null
          stato: string | null
          synced_at: string | null
          tipo: string | null
          titolo: string
          updated_at: string | null
          url_riferimento: string | null
        }
        Insert: {
          ai_bullets?: Json | null
          ai_categoria_impatto?: string | null
          ai_error?: string | null
          ai_generated_at?: string | null
          ai_generating_at?: string | null
          ai_importanza?: string | null
          ai_model?: string | null
          ai_scadenze?: Json | null
          ai_sectors?: Json | null
          ai_source?: string | null
          ai_summary?: string | null
          api_created_at?: string | null
          api_updated_at?: string | null
          autore?: Json | null
          created_at?: string | null
          data_delibera?: string | null
          data_pubblicazione?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          documenti_urls?: Json | null
          documento_url?: string | null
          fonte?: string | null
          id: number
          note?: string | null
          numero: string
          numero_suffix?: string | null
          scraped_at?: string | null
          scraped_data_pubblicazione?: string | null
          settore?: string | null
          stato?: string | null
          synced_at?: string | null
          tipo?: string | null
          titolo: string
          updated_at?: string | null
          url_riferimento?: string | null
        }
        Update: {
          ai_bullets?: Json | null
          ai_categoria_impatto?: string | null
          ai_error?: string | null
          ai_generated_at?: string | null
          ai_generating_at?: string | null
          ai_importanza?: string | null
          ai_model?: string | null
          ai_scadenze?: Json | null
          ai_sectors?: Json | null
          ai_source?: string | null
          ai_summary?: string | null
          api_created_at?: string | null
          api_updated_at?: string | null
          autore?: Json | null
          created_at?: string | null
          data_delibera?: string | null
          data_pubblicazione?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          documenti_urls?: Json | null
          documento_url?: string | null
          fonte?: string | null
          id?: number
          note?: string | null
          numero?: string
          numero_suffix?: string | null
          scraped_at?: string | null
          scraped_data_pubblicazione?: string | null
          settore?: string | null
          stato?: string | null
          synced_at?: string | null
          tipo?: string | null
          titolo?: string
          updated_at?: string | null
          url_riferimento?: string | null
        }
        Relationships: []
      }
      lead_contacts: {
        Row: {
          birth_date: string | null
          birth_place: string | null
          created_at: string
          full_name: string
          gender: string | null
          id: string
          is_legal_rep: boolean | null
          lead_id: string
          linkedin_url: string | null
          percent_share: number | null
          raw: Json | null
          role: string | null
          role_code: string | null
          role_start: string | null
          source: string
          tax_code: string | null
        }
        Insert: {
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string
          full_name: string
          gender?: string | null
          id?: string
          is_legal_rep?: boolean | null
          lead_id: string
          linkedin_url?: string | null
          percent_share?: number | null
          raw?: Json | null
          role?: string | null
          role_code?: string | null
          role_start?: string | null
          source?: string
          tax_code?: string | null
        }
        Update: {
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string
          full_name?: string
          gender?: string | null
          id?: string
          is_legal_rep?: boolean | null
          lead_id?: string
          linkedin_url?: string | null
          percent_share?: number | null
          raw?: Json | null
          role?: string | null
          role_code?: string | null
          role_start?: string | null
          source?: string
          tax_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          lead_id: string
          mime_type: string | null
          tag: string | null
          uploaded_by: string | null
          uploaded_by_name: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          lead_id: string
          mime_type?: string | null
          tag?: string | null
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          lead_id?: string
          mime_type?: string | null
          tag?: string | null
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admin_members"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          categoria: string | null
          commodity: string | null
          completezza_contatti: number | null
          comune: string | null
          contacts_enriched_at: string | null
          contacts_error: string | null
          created_at: string
          dominio: string | null
          email: string | null
          email_commerciale: string | null
          email_info: string | null
          gruppo: string | null
          id: string
          id_arera: string | null
          in_gruppo: boolean | null
          indirizzo: string | null
          invite_number: number | null
          latitude: number | null
          longitude: number | null
          macroarea: string | null
          natura_giuridica: string | null
          owner_id: string | null
          piva: string
          provincia: string | null
          ragione_sociale: string
          servizio_tutela: boolean | null
          settori: string | null
          sito_web: string | null
          status: Database["public"]["Enums"]["pipeline_status"]
          survey_completed_at: string | null
          survey_last_step_at: string | null
          survey_sent_at: string | null
          survey_status: string | null
          survey_token: string | null
          telefoni: string | null
          telefono: string | null
          tipo_servizio: Database["public"]["Enums"]["tipo_servizio"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          categoria?: string | null
          commodity?: string | null
          completezza_contatti?: number | null
          comune?: string | null
          contacts_enriched_at?: string | null
          contacts_error?: string | null
          created_at?: string
          dominio?: string | null
          email?: string | null
          email_commerciale?: string | null
          email_info?: string | null
          gruppo?: string | null
          id?: string
          id_arera?: string | null
          in_gruppo?: boolean | null
          indirizzo?: string | null
          invite_number?: number | null
          latitude?: number | null
          longitude?: number | null
          macroarea?: string | null
          natura_giuridica?: string | null
          owner_id?: string | null
          piva: string
          provincia?: string | null
          ragione_sociale: string
          servizio_tutela?: boolean | null
          settori?: string | null
          sito_web?: string | null
          status?: Database["public"]["Enums"]["pipeline_status"]
          survey_completed_at?: string | null
          survey_last_step_at?: string | null
          survey_sent_at?: string | null
          survey_status?: string | null
          survey_token?: string | null
          telefoni?: string | null
          telefono?: string | null
          tipo_servizio: Database["public"]["Enums"]["tipo_servizio"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          categoria?: string | null
          commodity?: string | null
          completezza_contatti?: number | null
          comune?: string | null
          contacts_enriched_at?: string | null
          contacts_error?: string | null
          created_at?: string
          dominio?: string | null
          email?: string | null
          email_commerciale?: string | null
          email_info?: string | null
          gruppo?: string | null
          id?: string
          id_arera?: string | null
          in_gruppo?: boolean | null
          indirizzo?: string | null
          invite_number?: number | null
          latitude?: number | null
          longitude?: number | null
          macroarea?: string | null
          natura_giuridica?: string | null
          owner_id?: string | null
          piva?: string
          provincia?: string | null
          ragione_sociale?: string
          servizio_tutela?: boolean | null
          settori?: string | null
          sito_web?: string | null
          status?: Database["public"]["Enums"]["pipeline_status"]
          survey_completed_at?: string | null
          survey_last_step_at?: string | null
          survey_sent_at?: string | null
          survey_status?: string | null
          survey_token?: string | null
          telefoni?: string | null
          telefono?: string | null
          tipo_servizio?: Database["public"]["Enums"]["tipo_servizio"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      market_entsoe: {
        Row: {
          created_at: string
          id: number
          metric_type: string
          payload: Json
          reference_day: string
          source: string
          synced_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          metric_type: string
          payload?: Json
          reference_day: string
          source?: string
          synced_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          metric_type?: string
          payload?: Json
          reference_day?: string
          source?: string
          synced_at?: string
        }
        Relationships: []
      }
      market_gas_storage: {
        Row: {
          company: string | null
          consumption_full_pct: number | null
          consumption_gwh: number | null
          country: string
          created_at: string | null
          full_pct: number | null
          gas_day: string
          gas_in_storage_twh: number | null
          id: number
          injection_capacity_gwh: number | null
          injection_gwh: number | null
          net_withdrawal_gwh: number | null
          raw_updated_at: string | null
          source: string
          status: string | null
          synced_at: string | null
          trend_pct: number | null
          withdrawal_capacity_gwh: number | null
          withdrawal_gwh: number | null
          working_gas_volume_twh: number | null
        }
        Insert: {
          company?: string | null
          consumption_full_pct?: number | null
          consumption_gwh?: number | null
          country?: string
          created_at?: string | null
          full_pct?: number | null
          gas_day: string
          gas_in_storage_twh?: number | null
          id?: number
          injection_capacity_gwh?: number | null
          injection_gwh?: number | null
          net_withdrawal_gwh?: number | null
          raw_updated_at?: string | null
          source?: string
          status?: string | null
          synced_at?: string | null
          trend_pct?: number | null
          withdrawal_capacity_gwh?: number | null
          withdrawal_gwh?: number | null
          working_gas_volume_twh?: number | null
        }
        Update: {
          company?: string | null
          consumption_full_pct?: number | null
          consumption_gwh?: number | null
          country?: string
          created_at?: string | null
          full_pct?: number | null
          gas_day?: string
          gas_in_storage_twh?: number | null
          id?: number
          injection_capacity_gwh?: number | null
          injection_gwh?: number | null
          net_withdrawal_gwh?: number | null
          raw_updated_at?: string | null
          source?: string
          status?: string | null
          synced_at?: string | null
          trend_pct?: number | null
          withdrawal_capacity_gwh?: number | null
          withdrawal_gwh?: number | null
          working_gas_volume_twh?: number | null
        }
        Relationships: []
      }
      market_power_pun: {
        Row: {
          created_at: string
          id: number
          method: string
          price_day: string
          price_eur_mwh: number
          source: string
          synced_at: string
          zones: Json
        }
        Insert: {
          created_at?: string
          id?: never
          method?: string
          price_day: string
          price_eur_mwh: number
          source?: string
          synced_at?: string
          zones?: Json
        }
        Update: {
          created_at?: string
          id?: never
          method?: string
          price_day?: string
          price_eur_mwh?: number
          source?: string
          synced_at?: string
          zones?: Json
        }
        Relationships: []
      }
      network_join_requests: {
        Row: {
          created_at: string | null
          id: string
          ip: unknown
          note: string | null
          piva: string
          ragione_sociale: string
          referente: string
          source: string | null
          status: string | null
          user_agent: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip?: unknown
          note?: string | null
          piva: string
          ragione_sociale: string
          referente: string
          source?: string | null
          status?: string | null
          user_agent?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip?: unknown
          note?: string | null
          piva?: string
          ragione_sociale?: string
          referente?: string
          source?: string | null
          status?: string | null
          user_agent?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      network_members: {
        Row: {
          approved_at: string
          approved_by: string | null
          created_at: string
          id: string
          join_request_id: string | null
          last_login_at: string | null
          notes: string | null
          phone: string
          piva: string
          ragione_sociale: string
          referente: string
          revoked_at: string | null
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          id?: string
          join_request_id?: string | null
          last_login_at?: string | null
          notes?: string | null
          phone: string
          piva: string
          ragione_sociale: string
          referente: string
          revoked_at?: string | null
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          id?: string
          join_request_id?: string | null
          last_login_at?: string | null
          notes?: string | null
          phone?: string
          piva?: string
          ragione_sociale?: string
          referente?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_members_join_request_id_fkey"
            columns: ["join_request_id"]
            isOneToOne: false
            referencedRelation: "network_join_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      network_otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          ip: string | null
          phone: string
          user_agent: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          ip?: string | null
          phone: string
          user_agent?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip?: string | null
          phone?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      network_sessions: {
        Row: {
          created_at: string
          expires_at: string
          ip: string | null
          member_id: string
          revoked_at: string | null
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          ip?: string | null
          member_id: string
          revoked_at?: string | null
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          ip?: string | null
          member_id?: string
          revoked_at?: string | null
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "network_members"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      oneri_tariffe_cache: {
        Row: {
          commodity: string
          created_at: string | null
          data: Json
          fallback_period: boolean | null
          id: number
          periodo_a: string
          periodo_da: string
          periodo_key: string
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          commodity: string
          created_at?: string | null
          data?: Json
          fallback_period?: boolean | null
          id?: number
          periodo_a: string
          periodo_da: string
          periodo_key: string
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          commodity?: string
          created_at?: string | null
          data?: Json
          fallback_period?: boolean | null
          id?: number
          periodo_a?: string
          periodo_da?: string
          periodo_key?: string
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      podcast_glossary: {
        Row: {
          category: string
          created_at: string
          definition: string
          id: string
          term: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          definition: string
          id?: string
          term: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          definition?: string
          id?: string
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      podcast_guest_questions: {
        Row: {
          asked: boolean
          guest_id: string
          order_idx: number
          question_id: string
        }
        Insert: {
          asked?: boolean
          guest_id: string
          order_idx?: number
          question_id: string
        }
        Update: {
          asked?: boolean
          guest_id?: string
          order_idx?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_guest_questions_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "podcast_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_guest_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "podcast_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_guests: {
        Row: {
          category: string | null
          created_at: string
          episode_title: string | null
          episode_url: string | null
          external_company: string | null
          external_email: string | null
          external_linkedin: string | null
          external_name: string | null
          external_role: string | null
          id: string
          invite_token: string | null
          invited_at: string | null
          lead_id: string | null
          notes: string | null
          published_at: string | null
          recorded_at: string | null
          response_availability: string | null
          response_confirmed_at: string | null
          response_name: string | null
          response_whatsapp: string | null
          selected_episode_slug: string | null
          status: string
          tier: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          episode_title?: string | null
          episode_url?: string | null
          external_company?: string | null
          external_email?: string | null
          external_linkedin?: string | null
          external_name?: string | null
          external_role?: string | null
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          lead_id?: string | null
          notes?: string | null
          published_at?: string | null
          recorded_at?: string | null
          response_availability?: string | null
          response_confirmed_at?: string | null
          response_name?: string | null
          response_whatsapp?: string | null
          selected_episode_slug?: string | null
          status?: string
          tier?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          episode_title?: string | null
          episode_url?: string | null
          external_company?: string | null
          external_email?: string | null
          external_linkedin?: string | null
          external_name?: string | null
          external_role?: string | null
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          lead_id?: string | null
          notes?: string | null
          published_at?: string | null
          recorded_at?: string | null
          response_availability?: string | null
          response_confirmed_at?: string | null
          response_name?: string | null
          response_whatsapp?: string | null
          selected_episode_slug?: string | null
          status?: string
          tier?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_guests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_hot_topics: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          id: string
          intensity: string
          suggested_questions: string[]
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          id?: string
          intensity?: string
          suggested_questions?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          id?: string
          intensity?: string
          suggested_questions?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      podcast_questions: {
        Row: {
          archived: boolean
          body: string
          created_at: string
          id: string
          order_idx: number
          phase: string
          theme: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          body: string
          created_at?: string
          id?: string
          order_idx?: number
          phase: string
          theme: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          body?: string
          created_at?: string
          id?: string
          order_idx?: number
          phase?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      podcast_session_notes: {
        Row: {
          created_at: string
          duration_min: number | null
          energizzo_opportunity: string | null
          guest_id: string
          id: string
          key_insights: string | null
          new_hot_topics: string[]
          new_terms: string[]
          quote_highlight: string | null
          referrals: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_min?: number | null
          energizzo_opportunity?: string | null
          guest_id: string
          id?: string
          key_insights?: string | null
          new_hot_topics?: string[]
          new_terms?: string[]
          quote_highlight?: string | null
          referrals?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_min?: number | null
          energizzo_opportunity?: string | null
          guest_id?: string
          id?: string
          key_insights?: string | null
          new_hot_topics?: string[]
          new_terms?: string[]
          quote_highlight?: string | null
          referrals?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_session_notes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: true
            referencedRelation: "podcast_guests"
            referencedColumns: ["id"]
          },
        ]
      }
      remo_reports: {
        Row: {
          category: string
          created_at: string | null
          id: string
          month: string
          pdf_url: string | null
          published_at: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          month: string
          pdf_url?: string | null
          published_at?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          month?: string
          pdf_url?: string | null
          published_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      remo_sections: {
        Row: {
          columns: Json | null
          created_at: string | null
          description: string | null
          footnote: string | null
          group_label: string
          group_slug: string
          id: string
          order_index: number
          report_id: string
          rows: Json | null
          slug: string
          subtitle: string | null
          title: string
          type: string
        }
        Insert: {
          columns?: Json | null
          created_at?: string | null
          description?: string | null
          footnote?: string | null
          group_label: string
          group_slug: string
          id?: string
          order_index: number
          report_id: string
          rows?: Json | null
          slug: string
          subtitle?: string | null
          title: string
          type: string
        }
        Update: {
          columns?: Json | null
          created_at?: string | null
          description?: string | null
          footnote?: string | null
          group_label?: string
          group_slug?: string
          id?: string
          order_index?: number
          report_id?: string
          rows?: Json | null
          slug?: string
          subtitle?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "remo_sections_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "remo_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_invite_requests: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          notified_at: string | null
          piva: string
          ragione_sociale: string
          referente: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          notified_at?: string | null
          piva: string
          ragione_sociale: string
          referente?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          notified_at?: string | null
          piva?: string
          ragione_sociale?: string
          referente?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          ai_model: string | null
          ai_prompt_version: string | null
          copy_linkedin: string
          copy_x: string
          created_at: string
          fonte_id: string | null
          fonte_kind: string | null
          fonte_meta: Json
          generated_by: string
          hashtags: string[]
          hook: string | null
          id: string
          image_ai_prompt: string | null
          image_data: Json
          image_strategy: Json
          image_template: string | null
          image_url: string | null
          notes: string | null
          published_linkedin_at: string | null
          published_x_at: string | null
          scheduled_at: string | null
          scheduled_lane: string
          status: Database["public"]["Enums"]["social_post_status"]
          tipo: Database["public"]["Enums"]["social_post_tipo"]
          updated_at: string
        }
        Insert: {
          ai_model?: string | null
          ai_prompt_version?: string | null
          copy_linkedin?: string
          copy_x?: string
          created_at?: string
          fonte_id?: string | null
          fonte_kind?: string | null
          fonte_meta?: Json
          generated_by?: string
          hashtags?: string[]
          hook?: string | null
          id?: string
          image_ai_prompt?: string | null
          image_data?: Json
          image_strategy?: Json
          image_template?: string | null
          image_url?: string | null
          notes?: string | null
          published_linkedin_at?: string | null
          published_x_at?: string | null
          scheduled_at?: string | null
          scheduled_lane?: string
          status?: Database["public"]["Enums"]["social_post_status"]
          tipo: Database["public"]["Enums"]["social_post_tipo"]
          updated_at?: string
        }
        Update: {
          ai_model?: string | null
          ai_prompt_version?: string | null
          copy_linkedin?: string
          copy_x?: string
          created_at?: string
          fonte_id?: string | null
          fonte_kind?: string | null
          fonte_meta?: Json
          generated_by?: string
          hashtags?: string[]
          hook?: string | null
          id?: string
          image_ai_prompt?: string | null
          image_data?: Json
          image_strategy?: Json
          image_template?: string | null
          image_url?: string | null
          notes?: string | null
          published_linkedin_at?: string | null
          published_x_at?: string | null
          scheduled_at?: string | null
          scheduled_lane?: string
          status?: Database["public"]["Enums"]["social_post_status"]
          tipo?: Database["public"]["Enums"]["social_post_tipo"]
          updated_at?: string
        }
        Relationships: []
      }
      strategy_tactics: {
        Row: {
          id: string
          notes: string | null
          owner_id: string | null
          status: Database["public"]["Enums"]["tactic_status"]
          updated_at: string
        }
        Insert: {
          id: string
          notes?: string | null
          owner_id?: string | null
          status?: Database["public"]["Enums"]["tactic_status"]
          updated_at?: string
        }
        Update: {
          id?: string
          notes?: string | null
          owner_id?: string | null
          status?: Database["public"]["Enums"]["tactic_status"]
          updated_at?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          answers: Json
          completed: boolean
          completed_at: string | null
          current_step: number
          id: string
          ip_hash: string | null
          lead_id: string
          started_at: string
          token: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          answers?: Json
          completed?: boolean
          completed_at?: string | null
          current_step?: number
          id?: string
          ip_hash?: string | null
          lead_id: string
          started_at?: string
          token: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          answers?: Json
          completed?: boolean
          completed_at?: string | null
          current_step?: number
          id?: string
          ip_hash?: string | null
          lead_id?: string
          started_at?: string
          token?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      testi_integrati_cache: {
        Row: {
          ai_bullets: Json | null
          ai_error: string | null
          ai_generated_at: string | null
          ai_generating_at: string | null
          ai_model: string | null
          ai_source: string | null
          ai_summary: string | null
          api_created_at: string | null
          api_updated_at: string | null
          autore: Json | null
          codice: string
          codice_suffix: string | null
          created_at: string | null
          data_entrata_vigore: string | null
          data_scadenza: string | null
          delibera_riferimento: string | null
          descrizione: string | null
          documenti_urls: Json | null
          documento_url: string | null
          id: number
          note: string | null
          scraped_at: string | null
          scraped_data_pubblicazione: string | null
          settore: string | null
          stato: string | null
          synced_at: string | null
          titolo: string
          updated_at: string | null
          url_riferimento: string | null
        }
        Insert: {
          ai_bullets?: Json | null
          ai_error?: string | null
          ai_generated_at?: string | null
          ai_generating_at?: string | null
          ai_model?: string | null
          ai_source?: string | null
          ai_summary?: string | null
          api_created_at?: string | null
          api_updated_at?: string | null
          autore?: Json | null
          codice: string
          codice_suffix?: string | null
          created_at?: string | null
          data_entrata_vigore?: string | null
          data_scadenza?: string | null
          delibera_riferimento?: string | null
          descrizione?: string | null
          documenti_urls?: Json | null
          documento_url?: string | null
          id: number
          note?: string | null
          scraped_at?: string | null
          scraped_data_pubblicazione?: string | null
          settore?: string | null
          stato?: string | null
          synced_at?: string | null
          titolo: string
          updated_at?: string | null
          url_riferimento?: string | null
        }
        Update: {
          ai_bullets?: Json | null
          ai_error?: string | null
          ai_generated_at?: string | null
          ai_generating_at?: string | null
          ai_model?: string | null
          ai_source?: string | null
          ai_summary?: string | null
          api_created_at?: string | null
          api_updated_at?: string | null
          autore?: Json | null
          codice?: string
          codice_suffix?: string | null
          created_at?: string | null
          data_entrata_vigore?: string | null
          data_scadenza?: string | null
          delibera_riferimento?: string | null
          descrizione?: string | null
          documenti_urls?: Json | null
          documento_url?: string | null
          id?: number
          note?: string | null
          scraped_at?: string | null
          scraped_data_pubblicazione?: string | null
          settore?: string | null
          stato?: string | null
          synced_at?: string | null
          titolo?: string
          updated_at?: string | null
          url_riferimento?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      agent_exec_sql: { Args: { p_query: string }; Returns: Json }
      complete_survey: {
        Args: { p_answers: Json; p_token: string }
        Returns: undefined
      }
      confirm_podcast_invite: {
        Args: {
          p_availability: string
          p_name: string
          p_token: string
          p_whatsapp: string
        }
        Returns: Json
      }
      fetch_podcast_invite: { Args: { p_token: string }; Returns: Json }
      get_lead_for_survey: {
        Args: { p_token: string }
        Returns: {
          id: string
          invite_number: number
          piva: string
          provincia: string
          ragione_sociale: string
          survey_completed: boolean
          tipo_servizio: string
        }[]
      }
      list_scadenze_future: {
        Args: never
        Returns: {
          date: string
          delibera_id: number
          delibera_numero: string
          delibera_titolo: string
          label: string
          tipo: string
        }[]
      }
      mark_survey_sent: { Args: { p_lead_id: string }; Returns: undefined }
      request_report_invite: {
        Args: {
          p_piva: string
          p_ragione: string
          p_referente?: string
          p_whatsapp: string
        }
        Returns: Json
      }
      save_survey_progress: {
        Args: { p_answers: Json; p_step: number; p_token: string }
        Returns: undefined
      }
    }
    Enums: {
      pipeline_status:
        | "da_contattare"
        | "primo_contatto"
        | "qualificato"
        | "call_fissata"
        | "call_effettuata"
        | "demo_fissata"
        | "demo_effettuata"
        | "proposta_inviata"
        | "negoziazione"
        | "chiuso_vinto"
        | "chiuso_perso"
        | "non_interessato"
      social_post_status:
        | "bozza"
        | "approvato"
        | "schedulato"
        | "pubblicato"
        | "skip"
      social_post_tipo:
        | "delibera"
        | "market"
        | "scadenza"
        | "digest"
        | "educational"
        | "podcast"
        | "libero"
      tactic_status: "da_fare" | "in_corso" | "fatto" | "archiviato"
      tipo_servizio: "Dual (Ele+Gas)" | "Solo Elettrico" | "Solo Gas"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      pipeline_status: [
        "da_contattare",
        "primo_contatto",
        "qualificato",
        "call_fissata",
        "call_effettuata",
        "demo_fissata",
        "demo_effettuata",
        "proposta_inviata",
        "negoziazione",
        "chiuso_vinto",
        "chiuso_perso",
        "non_interessato",
      ],
      social_post_status: [
        "bozza",
        "approvato",
        "schedulato",
        "pubblicato",
        "skip",
      ],
      social_post_tipo: [
        "delibera",
        "market",
        "scadenza",
        "digest",
        "educational",
        "podcast",
        "libero",
      ],
      tactic_status: ["da_fare", "in_corso", "fatto", "archiviato"],
      tipo_servizio: ["Dual (Ele+Gas)", "Solo Elettrico", "Solo Gas"],
    },
  },
} as const

