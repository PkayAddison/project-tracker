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
      audit_log: {
        Row: {
          created_at: string
          entity: string
          entity_id: string
          id: string
          message: string
          project_id: string
        }
        Insert: {
          created_at?: string
          entity?: string
          entity_id?: string
          id: string
          message?: string
          project_id?: string
        }
        Update: {
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          message?: string
          project_id?: string
        }
        Relationships: []
      }
      committees: {
        Row: {
          description: string
          id: string
          name: string
        }
        Insert: {
          description?: string
          id: string
          name: string
        }
        Update: {
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          committee_id: string
          email: string
          id: string
          is_admin: boolean
          name: string
          role: string
        }
        Insert: {
          committee_id?: string
          email?: string
          id: string
          is_admin?: boolean
          name: string
          role?: string
        }
        Update: {
          committee_id?: string
          email?: string
          id?: string
          is_admin?: boolean
          name?: string
          role?: string
        }
        Relationships: []
      }
      org_settings: {
        Row: {
          address: string
          email: string
          id: number
          logo: string
          name: string
          phone: string
          report_footer: string
        }
        Insert: {
          address?: string
          email?: string
          id?: number
          logo?: string
          name?: string
          phone?: string
          report_footer?: string
        }
        Update: {
          address?: string
          email?: string
          id?: number
          logo?: string
          name?: string
          phone?: string
          report_footer?: string
        }
        Relationships: []
      }
      progress_updates: {
        Row: {
          author_id: string
          challenges: string
          created_at: string
          expected_date: string
          id: string
          next_action: string
          next_update_date: string
          percent_complete: number
          progress_made: string
          status: string
          support_required: string
          task_id: string
        }
        Insert: {
          author_id?: string
          challenges?: string
          created_at?: string
          expected_date?: string
          id: string
          next_action?: string
          next_update_date?: string
          percent_complete?: number
          progress_made?: string
          status?: string
          support_required?: string
          task_id?: string
        }
        Update: {
          author_id?: string
          challenges?: string
          created_at?: string
          expected_date?: string
          id?: string
          next_action?: string
          next_update_date?: string
          percent_complete?: number
          progress_made?: string
          status?: string
          support_required?: string
          task_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          committee_id: string
          created_at: string
          description: string
          id: string
          lead_id: string
          member_ids: string[]
          name: string
          objective: string
          priority: string
          start_date: string
          status: string
          target_date: string
        }
        Insert: {
          committee_id?: string
          created_at?: string
          description?: string
          id: string
          lead_id?: string
          member_ids?: string[]
          name: string
          objective?: string
          priority?: string
          start_date?: string
          status?: string
          target_date?: string
        }
        Update: {
          committee_id?: string
          created_at?: string
          description?: string
          id?: string
          lead_id?: string
          member_ids?: string[]
          name?: string
          objective?: string
          priority?: string
          start_date?: string
          status?: string
          target_date?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string
          challenges: string
          created_at: string
          description: string
          due_date: string
          id: string
          next_action: string
          next_review_date: string
          percent_complete: number
          priority: string
          project_id: string
          start_date: string
          status: string
          support_ids: string[]
          title: string
        }
        Insert: {
          assignee_id?: string
          challenges?: string
          created_at?: string
          description?: string
          due_date?: string
          id: string
          next_action?: string
          next_review_date?: string
          percent_complete?: number
          priority?: string
          project_id?: string
          start_date?: string
          status?: string
          support_ids?: string[]
          title: string
        }
        Update: {
          assignee_id?: string
          challenges?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          next_action?: string
          next_review_date?: string
          percent_complete?: number
          priority?: string
          project_id?: string
          start_date?: string
          status?: string
          support_ids?: string[]
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_owner_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reset_sample_data: { Args: never; Returns: undefined }
      seed_demo_data: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
