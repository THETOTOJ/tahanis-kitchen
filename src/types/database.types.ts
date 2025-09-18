export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      collection_recipes: {
        Row: {
          collection_id: string;
          recipe_id: string;
        };
        Insert: {
          collection_id: string;
          recipe_id: string;
        };
        Update: {
          collection_id?: string;
          recipe_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_recipes_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_recipes_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      collections: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_public: boolean | null;
          name: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          name?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          name?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      comments: {
        Row: {
          body: string | null;
          created_at: string | null;
          id: string;
          rating: number | null;
          recipe_id: string | null;
          user_id: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string | null;
          id?: string;
          rating?: number | null;
          recipe_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string | null;
          id?: string;
          rating?: number | null;
          recipe_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comments_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      efforts: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          created_at: string | null;
          id: string;
          recipe_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          recipe_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          recipe_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      recipe_efforts: {
        Row: {
          effort_id: string;
          recipe_id: string;
        };
        Insert: {
          effort_id: string;
          recipe_id: string;
        };
        Update: {
          effort_id?: string;
          recipe_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_efforts_effort_id_fkey";
            columns: ["effort_id"];
            isOneToOne: false;
            referencedRelation: "efforts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_efforts_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      recipe_images: {
        Row: {
          created_at: string | null;
          id: string;
          image_url: string;
          recipe_id: string | null;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          image_url: string;
          recipe_id?: string | null;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          image_url?: string;
          recipe_id?: string | null;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_images_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      recipe_tags: {
        Row: {
          recipe_id: string;
          tag_id: string;
        };
        Insert: {
          recipe_id: string;
          tag_id: string;
        };
        Update: {
          recipe_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          }
        ];
      };
      recipes: {
        Row: {
          cook_time_mins: number | null;
          created_at: string | null;
          deleted: boolean | null;
          effort_id: string | null;
          external_link: string | null;
          id: string;
          ingredients: string | null;
          instructions: string | null;
          preview: string | null;
          title: string;
          user_id: string | null;
        };
        Insert: {
          cook_time_mins?: number | null;
          created_at?: string | null;
          deleted?: boolean | null;
          effort_id?: string | null;
          external_link?: string | null;
          id?: string;
          ingredients?: string | null;
          instructions?: string | null;
          preview?: string | null;
          title: string;
          user_id?: string | null;
        };
        Update: {
          cook_time_mins?: number | null;
          created_at?: string | null;
          deleted?: boolean | null;
          effort_id?: string | null;
          external_link?: string | null;
          id?: string;
          ingredients?: string | null;
          instructions?: string | null;
          preview?: string | null;
          title?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_effort_id_fkey";
            columns: ["effort_id"];
            isOneToOne: false;
            referencedRelation: "efforts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          banned: boolean | null;
          bio: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          is_admin: boolean | null;
          profile_picture: string | null;
          username: string | null;
        };
        Insert: {
          banned?: boolean | null;
          bio?: string | null;
          created_at?: string | null;
          email?: string | null;
          id: string;
          is_admin?: boolean | null;
          profile_picture?: string | null;
          username?: string | null;
        };
        Update: {
          banned?: boolean | null;
          bio?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          is_admin?: boolean | null;
          profile_picture?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
