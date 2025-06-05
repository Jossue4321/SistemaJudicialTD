export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string
          disability_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string | null
          disability_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          disability_type?: string | null
          updated_at?: string
        }
      }
      legal_questions: {
        Row: {
          id: string
          question: string
          answer: string
          category: string
          frequency: number
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category: string
          frequency?: number
          created_at?: string
        }
        Update: {
          question?: string
          answer?: string
          category?: string
          frequency?: number
        }
      }
      user_questions: {
        Row: {
          id: string
          user_id: string
          question: string
          answer: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question: string
          answer: string
          category: string
          created_at?: string
        }
        Update: {
          user_id?: string
          question?: string
          answer?: string
          category?: string
        }
      }
      lawyers: {
        Row: {
          id: string
          full_name: string
          specialty: string
          experience_years: number
          rating: number
          available: boolean
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          specialty: string
          experience_years: number
          rating?: number
          available?: boolean
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          full_name?: string
          specialty?: string
          experience_years?: number
          rating?: number
          available?: boolean
          avatar_url?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          lawyer_id: string
          date: string
          time: string
          status: "pending" | "confirmed" | "cancelled" | "completed"
          consultation_type: string
          needs_lsp: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lawyer_id: string
          date: string
          time: string
          status?: "pending" | "confirmed" | "cancelled" | "completed"
          consultation_type: string
          needs_lsp?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          lawyer_id?: string
          date?: string
          time?: string
          status?: "pending" | "confirmed" | "cancelled" | "completed"
          consultation_type?: string
          needs_lsp?: boolean
          notes?: string | null
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "appointment" | "system" | "chat"
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: "appointment" | "system" | "chat"
          read?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          title?: string
          message?: string
          type?: "appointment" | "system" | "chat"
          read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}