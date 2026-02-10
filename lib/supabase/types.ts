export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      wedding_photos: {
        Row: {
          id: string;
          created_at: string;
          guest_name: string;
          object_path: string;
          original_filename: string | null;
          mime_type: string | null;
          size_bytes: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          guest_name: string;
          object_path: string;
          original_filename?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          guest_name?: string;
          object_path?: string;
          original_filename?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
        };
        Relationships: [];
      };
      photo_likes: {
        Row: {
          id: string;
          photo_id: string;
          guest_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          photo_id: string;
          guest_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          photo_id?: string;
          guest_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photo_likes_photo_id_fkey";
            columns: ["photo_id"];
            referencedRelation: "wedding_photos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

