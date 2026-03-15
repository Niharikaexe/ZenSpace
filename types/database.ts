export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'client' | 'therapist' | 'admin'
export type SubscriptionStatus = 'pending' | 'active' | 'paused' | 'cancelled' | 'expired'
export type SubscriptionPlan = 'weekly' | 'monthly'
export type MatchStatus = 'pending' | 'active' | 'ended'
export type SessionType = 'chat' | 'video'
export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
export type MessageType = 'text' | 'file'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          avatar_url: string | null
          phone: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          timezone?: string | null
        }
        Update: {
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
      }
      client_profiles: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          gender: string | null
          primary_concern: string | null
          therapy_goals: string | null
          previous_therapy: boolean
          preferred_therapist_gender: string | null
          preferred_session_type: SessionType
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          date_of_birth?: string | null
          gender?: string | null
          primary_concern?: string | null
          therapy_goals?: string | null
          previous_therapy?: boolean
          preferred_therapist_gender?: string | null
          preferred_session_type?: SessionType
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['client_profiles']['Insert'], 'user_id'>>
      }
      therapist_profiles: {
        Row: {
          id: string
          user_id: string
          license_number: string
          license_state: string | null
          specializations: string[]
          bio: string | null
          years_experience: number
          education: string | null
          approach: string | null
          languages: string[]
          accepts_new_clients: boolean
          is_verified: boolean
          weekly_capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          license_number: string
          license_state?: string | null
          specializations?: string[]
          bio?: string | null
          years_experience?: number
          education?: string | null
          approach?: string | null
          languages?: string[]
          accepts_new_clients?: boolean
          weekly_capacity?: number
        }
        Update: Partial<Omit<Database['public']['Tables']['therapist_profiles']['Insert'], 'user_id'>>
      }
      subscriptions: {
        Row: {
          id: string
          client_id: string
          plan: SubscriptionPlan
          status: SubscriptionStatus
          razorpay_subscription_id: string | null
          razorpay_plan_id: string | null
          razorpay_customer_id: string | null
          amount: number
          currency: string
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          plan: SubscriptionPlan
          status?: SubscriptionStatus
          razorpay_subscription_id?: string | null
          razorpay_plan_id?: string | null
          razorpay_customer_id?: string | null
          amount: number
          currency?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['subscriptions']['Insert'], 'client_id'>>
      }
      matches: {
        Row: {
          id: string
          client_id: string
          therapist_id: string
          status: MatchStatus
          matched_by: string | null
          notes: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          therapist_id: string
          status?: MatchStatus
          matched_by?: string | null
          notes?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['matches']['Insert'], 'client_id' | 'therapist_id'>>
      }
      sessions: {
        Row: {
          id: string
          match_id: string
          session_type: SessionType
          status: SessionStatus
          scheduled_at: string
          started_at: string | null
          ended_at: string | null
          duration_minutes: number | null
          daily_room_url: string | null
          daily_room_name: string | null
          therapist_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          match_id: string
          session_type?: SessionType
          status?: SessionStatus
          scheduled_at: string
          daily_room_url?: string | null
          daily_room_name?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['sessions']['Insert'], 'match_id'>>
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          message_type: MessageType
          file_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          match_id: string
          sender_id: string
          content: string
          message_type?: MessageType
          file_url?: string | null
        }
        Update: {
          is_read?: boolean
        }
      }
      questionnaire_responses: {
        Row: {
          id: string
          client_id: string
          responses: Json
          submitted_at: string
        }
        Insert: {
          client_id: string
          responses: Json
        }
        Update: never
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
    Enums: {
      user_role: UserRole
      subscription_status: SubscriptionStatus
      subscription_plan: SubscriptionPlan
      match_status: MatchStatus
      session_type: SessionType
      session_status: SessionStatus
      message_type: MessageType
    }
  }
}
