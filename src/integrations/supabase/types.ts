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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bid_requests: {
        Row: {
          budget: number | null
          category: string
          created_at: string
          delivery_deadline: string | null
          delivery_location: string
          description: string
          id: string
          project_id: string | null
          quantity: number
          status: string
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          category: string
          created_at?: string
          delivery_deadline?: string | null
          delivery_location: string
          description: string
          id?: string
          project_id?: string | null
          quantity: number
          status?: string
          title: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          category?: string
          created_at?: string
          delivery_deadline?: string | null
          delivery_location?: string
          description?: string
          id?: string
          project_id?: string | null
          quantity?: number
          status?: string
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          bid_request_id: string
          created_at: string
          delivery_time_days: number
          id: string
          notes: string | null
          price: number
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          bid_request_id: string
          created_at?: string
          delivery_time_days: number
          id?: string
          notes?: string | null
          price: number
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          bid_request_id?: string
          created_at?: string
          delivery_time_days?: number
          id?: string
          notes?: string | null
          price?: number
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bim_elements: {
        Row: {
          area: number | null
          bim_model_id: string
          created_at: string | null
          element_name: string | null
          element_type: string
          id: string
          ifc_id: string
          length: number | null
          material_type: string | null
          properties: Json | null
          volume: number | null
        }
        Insert: {
          area?: number | null
          bim_model_id: string
          created_at?: string | null
          element_name?: string | null
          element_type: string
          id?: string
          ifc_id: string
          length?: number | null
          material_type?: string | null
          properties?: Json | null
          volume?: number | null
        }
        Update: {
          area?: number | null
          bim_model_id?: string
          created_at?: string | null
          element_name?: string | null
          element_type?: string
          id?: string
          ifc_id?: string
          length?: number | null
          material_type?: string | null
          properties?: Json | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bim_elements_bim_model_id_fkey"
            columns: ["bim_model_id"]
            isOneToOne: false
            referencedRelation: "bim_models"
            referencedColumns: ["id"]
          },
        ]
      }
      bim_models: {
        Row: {
          created_at: string | null
          element_count: number | null
          file_name: string
          file_size: number
          id: string
          ifc_schema: string | null
          metadata: Json | null
          project_id: string
          project_name: string | null
          storage_path: string
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          element_count?: number | null
          file_name: string
          file_size: number
          id?: string
          ifc_schema?: string | null
          metadata?: Json | null
          project_id: string
          project_name?: string | null
          storage_path: string
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          element_count?: number | null
          file_name?: string
          file_size?: number
          id?: string
          ifc_schema?: string | null
          metadata?: Json | null
          project_id?: string
          project_name?: string | null
          storage_path?: string
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "bim_models_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          bucket_name: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_primary: boolean | null
          storage_path: string
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          bucket_name: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_primary?: boolean | null
          storage_path: string
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          bucket_name?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_primary?: boolean | null
          storage_path?: string
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: []
      }
      project_costs: {
        Row: {
          amount: number
          bid_id: string | null
          category: string
          created_at: string | null
          created_by: string
          description: string
          id: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          bid_id?: string | null
          category: string
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bid_id?: string | null
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          area: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          primary_bim_model_url: string | null
          primary_floor_plan_url: string | null
          rooms: number | null
          status: string
          total_cost: number | null
          type: string
          updated_at: string
        }
        Insert: {
          area?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          primary_bim_model_url?: string | null
          primary_floor_plan_url?: string | null
          rooms?: number | null
          status?: string
          total_cost?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          area?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          primary_bim_model_url?: string | null
          primary_floor_plan_url?: string | null
          rooms?: number | null
          status?: string
          total_cost?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          email_bidding_updates: boolean | null
          email_notifications: boolean | null
          email_project_updates: boolean | null
          email_task_updates: boolean | null
          id: string
          realtime_notifications: string | null
          sound_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_bidding_updates?: boolean | null
          email_notifications?: boolean | null
          email_project_updates?: boolean | null
          email_task_updates?: boolean | null
          id?: string
          realtime_notifications?: string | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_bidding_updates?: boolean | null
          email_notifications?: boolean | null
          email_project_updates?: boolean | null
          email_task_updates?: boolean | null
          id?: string
          realtime_notifications?: string | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_products: {
        Row: {
          base_price: number
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_order_quantity: number | null
          name: string
          search_vector: unknown
          stock_quantity: number | null
          unit: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          base_price: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_order_quantity?: number | null
          name: string
          search_vector?: unknown
          stock_quantity?: number | null
          unit: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_order_quantity?: number | null
          name?: string
          search_vector?: unknown
          stock_quantity?: number | null
          unit?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          address: string
          business_license: string | null
          city: string
          company_name: string
          contact_email: string
          contact_phone: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          rating: number | null
          state: string
          tax_id: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          verification_status: string
          zip_code: string
        }
        Insert: {
          address: string
          business_license?: string | null
          city: string
          company_name: string
          contact_email: string
          contact_phone: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          rating?: number | null
          state: string
          tax_id?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string
          zip_code: string
        }
        Update: {
          address?: string
          business_license?: string | null
          city?: string
          company_name?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          rating?: number | null
          state?: string
          tax_id?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string
          zip_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_project_total_cost: {
        Args: { project_id_param: string }
        Returns: number
      }
      get_bim_quantities_summary: {
        Args: { bim_model_id_param: string }
        Returns: {
          element_count: number
          element_type: string
          material_type: string
          total_area: number
          total_length: number
          total_volume: number
        }[]
      }
      get_project_cost_breakdown: {
        Args: { project_id_param: string }
        Returns: {
          category: string
          cost_count: number
          total_amount: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_owner: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      search_vendor_products: {
        Args: {
          categories?: string[]
          in_stock_only?: boolean
          limit_count?: number
          max_price?: number
          min_price?: number
          min_rating?: number
          offset_count?: number
          p_vendor_city?: string
          p_vendor_state?: string
          search_query?: string
          sort_by?: string
        }
        Returns: {
          base_price: number
          category: string
          description: string
          id: string
          image_url: string
          name: string
          search_rank: number
          stock_quantity: number
          unit: string
          vendor_city: string
          vendor_id: string
          vendor_name: string
          vendor_rating: number
          vendor_state: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "member" | "viewer"
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
      app_role: ["admin", "manager", "member", "viewer"],
    },
  },
} as const
