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
      carpool_passengers: {
        Row: {
          carpool_id: string
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          carpool_id: string
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          carpool_id?: string
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carpool_passengers_carpool_id_fkey"
            columns: ["carpool_id"]
            isOneToOne: false
            referencedRelation: "carpools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpool_passengers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpool_passengers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carpools: {
        Row: {
          created_at: string
          depart_at: string | null
          departure_location: string | null
          description: string | null
          driver_id: string
          event_id: string
          id: string
          seat_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          depart_at?: string | null
          departure_location?: string | null
          description?: string | null
          driver_id: string
          event_id: string
          id?: string
          seat_count: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          depart_at?: string | null
          departure_location?: string | null
          description?: string | null
          driver_id?: string
          event_id?: string
          id?: string
          seat_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carpools_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpools_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_members: {
        Row: {
          event_id: string
          id: string
          joined_at: string
          role: string
          rsvp_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string
          role?: string
          rsvp_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string
          role?: string
          rsvp_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          location: string | null
          owner_id: string
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          owner_id: string
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          owner_id?: string
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_tokens: {
        Row: {
          created_at: string
          event_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          token: string
        }
        Insert: {
          created_at?: string
          event_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          token: string
        }
        Update: {
          created_at?: string
          event_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          notice_id: string
          recipient_user_id: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          notice_id: string
          recipient_user_id: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          notice_id?: string
          recipient_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_email_logs_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notice_email_logs_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          author_id: string
          body: string
          created_at: string
          event_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          event_id: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          event_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      settlement_snapshot_members: {
        Row: {
          display_name: string
          id: string
          settlement_id: string
          user_id: string
        }
        Insert: {
          display_name: string
          id?: string
          settlement_id: string
          user_id: string
        }
        Update: {
          display_name?: string
          id?: string
          settlement_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_snapshot_members_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_snapshot_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_id: string
          id: string
          per_person_amount: number
          snapshot_member_count: number
          title: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_id: string
          id?: string
          per_person_amount: number
          snapshot_member_count: number
          title: string
          total_amount: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_id?: string
          id?: string
          per_person_amount?: number
          snapshot_member_count?: number
          title?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "settlements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_event_member: { Args: { p_event_id: string }; Returns: boolean }
      is_event_owner: { Args: { p_event_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

// ============================================================
// Db-prefix 단축키 export
// lib/dummy-data.ts의 Event, Member 등 타입과 명칭 충돌 방지
// ============================================================

// profiles
export type DbProfile = Database['public']['Tables']['profiles']['Row']

// events
export type DbEvent       = Database['public']['Tables']['events']['Row']
export type DbEventInsert = Database['public']['Tables']['events']['Insert']
export type DbEventUpdate = Database['public']['Tables']['events']['Update']

// event_members
export type DbEventMember       = Database['public']['Tables']['event_members']['Row']
export type DbEventMemberInsert = Database['public']['Tables']['event_members']['Insert']
export type DbEventMemberUpdate = Database['public']['Tables']['event_members']['Update']

// invite_tokens
export type DbInviteToken       = Database['public']['Tables']['invite_tokens']['Row']
export type DbInviteTokenInsert = Database['public']['Tables']['invite_tokens']['Insert']

// notices
export type DbNotice       = Database['public']['Tables']['notices']['Row']
export type DbNoticeInsert = Database['public']['Tables']['notices']['Insert']
export type DbNoticeUpdate = Database['public']['Tables']['notices']['Update']

// notice_email_logs
export type DbNoticeEmailLog       = Database['public']['Tables']['notice_email_logs']['Row']
export type DbNoticeEmailLogInsert = Database['public']['Tables']['notice_email_logs']['Insert']

// settlements
export type DbSettlement       = Database['public']['Tables']['settlements']['Row']
export type DbSettlementInsert = Database['public']['Tables']['settlements']['Insert']

// settlement_snapshot_members
export type DbSettlementSnapshotMember       = Database['public']['Tables']['settlement_snapshot_members']['Row']
export type DbSettlementSnapshotMemberInsert = Database['public']['Tables']['settlement_snapshot_members']['Insert']

// carpools
export type DbCarpool       = Database['public']['Tables']['carpools']['Row']
export type DbCarpoolInsert = Database['public']['Tables']['carpools']['Insert']
export type DbCarpoolUpdate = Database['public']['Tables']['carpools']['Update']

// carpool_passengers
export type DbCarpoolPassenger       = Database['public']['Tables']['carpool_passengers']['Row']
export type DbCarpoolPassengerInsert = Database['public']['Tables']['carpool_passengers']['Insert']
