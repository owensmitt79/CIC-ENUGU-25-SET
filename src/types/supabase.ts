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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          added_at: string
          auth_user_id: string
        }
        Insert: {
          added_at?: string
          auth_user_id: string
        }
        Update: {
          added_at?: string
          auth_user_id?: string
        }
        Relationships: []
      }
      cicenuguset95: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      gallery: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string | null
          id: string
          image: string
          title: string
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image: string
          title: string
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leadership: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          email: string | null
          full_name: string
          id: string
          image_url: string | null
          is_published: boolean
          office: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          full_name: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          office: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          office?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      member_dues: {
        Row: {
          amount: number
          created_at: string
          due_month: string
          id: string
          member_id: string
          payment_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_month: string
          id?: string
          member_id: string
          payment_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_month?: string
          id?: string
          member_id?: string
          payment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_dues_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_dues_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_dues_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          avatar_url: string | null
          chapter: string | null
          class_year: string
          created_at: string
          directory_public: boolean
          dues_status: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          profession: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          chapter?: string | null
          class_year?: string
          created_at?: string
          directory_public?: boolean
          dues_status?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          profession?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          chapter?: string | null
          class_year?: string
          created_at?: string
          directory_public?: boolean
          dues_status?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          profession?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_categories: {
        Row: {
          base_amount: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
        }
        Insert: {
          base_amount?: number
          created_at?: string
          description?: string | null
          id: string
          is_active?: boolean
          name: string
          type: string
        }
        Update: {
          base_amount?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          category_id: string | null
          channel: string | null
          created_at: string
          gateway: string | null
          id: string
          item_description: string | null
          member_id: string | null
          paid_at: string | null
          payer_class_year: string | null
          payer_email: string
          payer_name: string
          payer_phone: string
          payment_type: string
          project_id: string | null
          receipt_number: string
          reference: string
          selected_months: string[]
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          channel?: string | null
          created_at?: string
          gateway?: string | null
          id?: string
          item_description?: string | null
          member_id?: string | null
          paid_at?: string | null
          payer_class_year?: string | null
          payer_email: string
          payer_name: string
          payer_phone: string
          payment_type?: string
          project_id?: string | null
          receipt_number: string
          reference: string
          selected_months?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          channel?: string | null
          created_at?: string
          gateway?: string | null
          id?: string
          item_description?: string | null
          member_id?: string | null
          paid_at?: string | null
          payer_class_year?: string | null
          payer_email?: string
          payer_name?: string
          payer_phone?: string
          payment_type?: string
          project_id?: string | null
          receipt_number?: string
          reference?: string
          selected_months?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "payment_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_donations: {
        Row: {
          amount: number
          donated_at: string
          donor_name: string
          id: string
          is_anonymous: boolean
          notes: string | null
          payment_id: string
          project_id: string
        }
        Insert: {
          amount: number
          donated_at?: string
          donor_name?: string
          id?: string
          is_anonymous?: boolean
          notes?: string | null
          payment_id: string
          project_id: string
        }
        Update: {
          amount?: number
          donated_at?: string
          donor_name?: string
          id?: string
          is_anonymous?: boolean
          notes?: string | null
          payment_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_donations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_donations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          order_rank: number
          phase_name: string
          project_id: string
          target_budget: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          order_rank?: number
          phase_name: string
          project_id: string
          target_budget: number
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          order_rank?: number
          phase_name?: string
          project_id?: string
          target_budget?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          beneficiaries: string | null
          category: string
          created_at: string
          description: string | null
          donor_count: number
          funding_percentage: number | null
          id: string
          image: string
          is_published: boolean
          lead_coordinator: string | null
          raised_amount: number
          slug: string
          status: string
          target_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          beneficiaries?: string | null
          category: string
          created_at?: string
          description?: string | null
          donor_count?: number
          funding_percentage?: number | null
          id: string
          image: string
          is_published?: boolean
          lead_coordinator?: string | null
          raised_amount?: number
          slug: string
          status?: string
          target_amount: number
          title: string
          updated_at?: string
        }
        Update: {
          beneficiaries?: string | null
          category?: string
          created_at?: string
          description?: string | null
          donor_count?: number
          funding_percentage?: number | null
          id?: string
          image?: string
          is_published?: boolean
          lead_coordinator?: string | null
          raised_amount?: number
          slug?: string
          status?: string
          target_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          account_name: string | null
          account_number: string | null
          active_gateway: string | null
          admin_pin_hash: string | null
          annual_dues_rate: number
          association_name: string
          bank_details: Json
          bank_name: string | null
          gateway_mode: string
          id: number
          monthly_dues_rate: number
          reunion_fee_rate: number
          slogan: string | null
          updated_at: string
          ussd_prefix: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          active_gateway?: string | null
          admin_pin_hash?: string | null
          annual_dues_rate?: number
          association_name?: string
          bank_details?: Json
          bank_name?: string | null
          gateway_mode?: string
          id?: number
          monthly_dues_rate?: number
          reunion_fee_rate?: number
          slogan?: string | null
          updated_at?: string
          ussd_prefix?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          active_gateway?: string | null
          admin_pin_hash?: string | null
          annual_dues_rate?: number
          association_name?: string
          bank_details?: Json
          bank_name?: string | null
          gateway_mode?: string
          id?: number
          monthly_dues_rate?: number
          reunion_fee_rate?: number
          slogan?: string | null
          updated_at?: string
          ussd_prefix?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      members_directory: {
        Row: {
          avatar_url: string | null
          chapter: string | null
          class_year: string | null
          full_name: string | null
          id: string | null
          profession: string | null
        }
        Insert: {
          avatar_url?: string | null
          chapter?: string | null
          class_year?: string | null
          full_name?: string | null
          id?: string | null
          profession?: string | null
        }
        Update: {
          avatar_url?: string | null
          chapter?: string | null
          class_year?: string | null
          full_name?: string | null
          id?: string | null
          profession?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_autonomous_project: {
        Args: {
          p_category: string
          p_description?: string
          p_image?: string
          p_initial_seed?: number
          p_seed_donor?: string
          p_target: number
          p_title: string
        }
        Returns: Json
      }
      create_public_dues_checkout: {
        Args: {
          p_class_year: number
          p_payer_email: string
          p_payer_name: string
          p_payer_phone: string
          p_selected_months: string[]
        }
        Returns: Json
      }
      is_cic_admin: { Args: never; Returns: boolean }
      reconcile_project_totals: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      verify_payment: {
        Args: { p_receipt_number?: string; p_reference?: string }
        Returns: Json
      }
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
    Enums: {},
  },
} as const
