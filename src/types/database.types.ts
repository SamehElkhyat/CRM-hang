// Hand-written to match supabase/migrations/*.sql.
// Once the Supabase project is live, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts

export type UserRole = "admin" | "agent";
export type BookingStatus = "pending" | "confirmed" | "sent" | "cancelled";
export type DraftStatus = "draft" | "proofread" | "audited" | "sent";

export interface RoomType {
  name: string;
  base_rate: number;
}

export interface ChildPolicy {
  currency?: string;
  free_age_limit?: number;
  extra_bed?: {
    min_age: number;
    max_age: number;
    charge: number;
  };
  adult_extra_bed_charge?: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      hotels: {
        Row: {
          id: string;
          name: string;
          hotline: string | null;
          reservation_email: string | null;
          sales_email: string | null;
          finance_email: string | null;
          room_types: RoomType[];
          child_policy: ChildPolicy;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["hotels"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["hotels"]["Row"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          hotel_id: string;
          guest_name: string;
          normalized_guest_name: string;
          guest_phone: string | null;
          check_in: string;
          check_out: string;
          room_category: string | null;
          meal_plan: string | null;
          children_ages: number[];
          rate: number;
          total_cost: number;
          raw_arabic_text: string;
          status: BookingStatus;
          created_by: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          hotel_id: string;
          guest_name: string;
          check_in: string;
          check_out: string;
          raw_arabic_text: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          },
        ];
      };
      email_drafts: {
        Row: {
          id: string;
          booking_id: string;
          subject: string;
          body: string;
          audit_comparison: AuditComparisonRecord;
          proofread_issues: ProofreadIssue[];
          status: DraftStatus;
          resend_message_id: string | null;
          sent_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["email_drafts"]["Row"]> & {
          booking_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_drafts"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "email_drafts_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          booking_id: string;
          change_type: string;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          modified_by: string | null;
          timestamp: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "audit_logs_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_modified_by_fkey";
            columns: ["modified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_duplicate_booking: {
        Args: {
          p_hotel_id: string;
          p_guest_name: string;
          p_check_in: string;
          p_check_out: string;
          p_similarity_threshold?: number;
        };
        Returns: DuplicateCandidate[];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}

export interface DuplicateCandidate {
  booking_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  similarity_score: number;
}

export interface AuditDiscrepancy {
  field: string;
  raw_value: string;
  draft_value: string;
  severity: "low" | "medium" | "high";
  explanation: string;
}

export interface AuditComparisonRecord {
  discrepancies: AuditDiscrepancy[];
  overall_risk: "none" | "low" | "medium" | "high";
  summary: string;
}

export interface ProofreadIssue {
  original: string;
  suggestion: string;
  reason: string;
}
