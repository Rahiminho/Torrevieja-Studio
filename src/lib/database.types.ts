export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          prenom: string;
          pseudo: string;
          email: string;
          password_hash: string;
          role: string;
          bio: string;
          photo_url: string;
          color: string;
          initials: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          prenom: string;
          pseudo: string;
          email: string;
          password_hash: string;
          role: string;
          bio?: string;
          photo_url?: string;
          color?: string;
          initials?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          prenom?: string;
          pseudo?: string;
          email?: string;
          password_hash?: string;
          role?: string;
          bio?: string;
          photo_url?: string;
          color?: string;
          initials?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          title: string;
          artist_ids: string[];
          extra_artists: string;
          prod: string;
          status: string;
          duration: string;
          progress_pct: number;
          notes: string;
          position: number;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist_ids?: string[];
          extra_artists?: string;
          prod?: string;
          status?: string;
          duration?: string;
          progress_pct?: number;
          notes?: string;
          position?: number;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          artist_ids?: string[];
          extra_artists?: string;
          prod?: string;
          status?: string;
          duration?: string;
          progress_pct?: number;
          notes?: string;
          position?: number;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      lyrics: {
        Row: {
          id: string;
          track_id: string;
          content: string;
          updated_by: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          content: string;
          updated_by: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          track_id?: string;
          content?: string;
          updated_by?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vocals: {
        Row: {
          id: string;
          track_id: string;
          author_id: string;
          type: string;
          data_url: string;
          duration_sec: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          author_id: string;
          type: string;
          data_url: string;
          duration_sec: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          track_id?: string;
          author_id?: string;
          type?: string;
          data_url?: string;
          duration_sec?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          name: string;
          category: string;
          extension: string;
          size_bytes: number;
          author_id: string;
          folder_id: string | null;
          data_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          extension: string;
          size_bytes: number;
          author_id: string;
          folder_id?: string | null;
          data_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          extension?: string;
          size_bytes?: number;
          author_id?: string;
          folder_id?: string | null;
          data_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          name: string;
          parent_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          parent_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          parent_id?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          track_id: string;
          user_id: string;
          direction: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          user_id: string;
          direction: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          track_id?: string;
          user_id?: string;
          direction?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          channel: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          channel?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      activity: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_type: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_type?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      project_settings: {
        Row: {
          id: string;
          mixtape_name: string;
          subtitle: string;
          target_date: string;
          cover_url: string;
        };
        Insert: {
          id?: string;
          mixtape_name: string;
          subtitle?: string;
          target_date?: string;
          cover_url?: string;
        };
        Update: {
          id?: string;
          mixtape_name?: string;
          subtitle?: string;
          target_date?: string;
          cover_url?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
