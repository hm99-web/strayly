/**
 * Database types, hand-written to match `supabase gen types typescript` output.
 * Once Docker is available run `npm run db:types` to regenerate and verify drift.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type DogGender = 'male' | 'female' | 'unknown';
type DogStatus = 'active' | 'missing' | 'adopted' | 'deceased' | 'relocated';
type DogTemperament = 'friendly' | 'shy' | 'playful' | 'calm' | 'fearful' | 'aggressive' | 'unknown';
type TriState = 'yes' | 'no' | 'unknown';
type DogHealthStatus = 'healthy' | 'injured' | 'sick' | 'pregnant' | 'nursing' | 'recovering';
type FoodType = 'dog_food' | 'rice' | 'meat' | 'biscuits' | 'milk' | 'eggs' | 'leftovers' | 'other';
type MedicalRecordType = 'checkup' | 'treatment' | 'sterilization' | 'deworming' | 'injury_treatment' | 'other';
type VaccineType = 'rabies' | 'dhpp' | 'distemper' | 'parvovirus' | 'other';
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
type EmergencyType = 'injury' | 'accident' | 'illness' | 'cruelty' | 'aggressive_behavior' | 'missing' | 'other';
type EmergencyStatus = 'open' | 'in_progress' | 'resolved' | 'false_alarm';
type NotificationType = 'emergency_nearby' | 'new_dog_nearby' | 'followed_dog_update' | 'vaccination_due' | 'system';
type ActivityType =
  | 'dog_created'
  | 'dog_updated'
  | 'fed'
  | 'medical'
  | 'vaccination'
  | 'sterilization'
  | 'emergency_created'
  | 'emergency_resolved'
  | 'photo_added'
  | 'location_updated'
  | 'status_changed'
  | 'comment';
type UserRole = 'user' | 'volunteer' | 'ngo' | 'moderator' | 'admin';
type ReportReason = 'duplicate' | 'inaccurate' | 'spam' | 'abuse' | 'not_a_street_dog' | 'other';
type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';
type LocationSource = 'initial' | 'sighting' | 'feeding' | 'medical' | 'emergency' | 'manual';
type DevicePlatform = 'ios' | 'android' | 'web';

/** Shared row shape returned by dogs_within_radius / dogs_in_bbox. */
interface DogSearchRow {
  id: string;
  name: string;
  gender: DogGender;
  estimated_age_months: number | null;
  temperament: DogTemperament;
  status: DogStatus;
  health_status: DogHealthStatus;
  has_active_emergency: boolean;
  has_puppies: boolean;
  vaccination_status: TriState;
  sterilization_status: TriState;
  last_fed_at: string | null;
  feedings_count: number;
  followers_count: number;
  primary_photo_path: string | null;
  primary_thumb_path: string | null;
  lat: number;
  lng: number;
  address_text: string | null;
  city: string | null;
  last_seen_at: string;
  created_at: string;
  feeding_status: string;
  distance_m: number | null;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string;
          avatar_path: string | null;
          bio: string | null;
          role: UserRole;
          is_anonymous: boolean;
          trust_score: number;
          dogs_added_count: number;
          feedings_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string;
          avatar_path?: string | null;
          bio?: string | null;
          role?: UserRole;
          is_anonymous?: boolean;
        };
        Update: {
          username?: string | null;
          display_name?: string;
          avatar_path?: string | null;
          bio?: string | null;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          phone: string | null;
          locale: string;
          last_known_location: unknown | null;
          notification_radius_m: number;
          notify_emergency_nearby: boolean;
          notify_new_dog_nearby: boolean;
          notify_followed_dogs: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          phone?: string | null;
          locale?: string;
          last_known_location?: unknown | null;
          notification_radius_m?: number;
          notify_emergency_nearby?: boolean;
          notify_new_dog_nearby?: boolean;
          notify_followed_dogs?: boolean;
        };
        Update: {
          phone?: string | null;
          locale?: string;
          last_known_location?: unknown | null;
          notification_radius_m?: number;
          notify_emergency_nearby?: boolean;
          notify_new_dog_nearby?: boolean;
          notify_followed_dogs?: boolean;
        };
        Relationships: [];
      };
      dogs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          gender: DogGender;
          estimated_age_months: number | null;
          temperament: DogTemperament;
          color_markings: string | null;
          status: DogStatus;
          health_status: DogHealthStatus;
          has_active_emergency: boolean;
          has_puppies: boolean;
          vaccination_status: TriState;
          sterilization_status: TriState;
          sterilized_at: string | null;
          last_fed_at: string | null;
          last_fed_by: string | null;
          feedings_count: number;
          followers_count: number;
          primary_photo_path: string | null;
          primary_thumb_path: string | null;
          location: unknown;
          address_text: string | null;
          city: string | null;
          last_seen_at: string;
          last_seen_by: string | null;
          medical_notes: string | null;
          created_by: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          gender?: DogGender;
          estimated_age_months?: number | null;
          temperament?: DogTemperament;
          color_markings?: string | null;
          health_status?: DogHealthStatus;
          has_puppies?: boolean;
          vaccination_status?: TriState;
          sterilization_status?: TriState;
          location: unknown;
          address_text?: string | null;
          city?: string | null;
          medical_notes?: string | null;
          created_by?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          gender?: DogGender;
          estimated_age_months?: number | null;
          temperament?: DogTemperament;
          color_markings?: string | null;
          health_status?: DogHealthStatus;
          has_puppies?: boolean;
          status?: DogStatus;
          address_text?: string | null;
          city?: string | null;
          medical_notes?: string | null;
        };
        Relationships: [];
      };
      dog_photos: {
        Row: {
          id: string;
          dog_id: string;
          storage_path: string;
          thumb_path: string | null;
          caption: string | null;
          is_primary: boolean;
          width: number | null;
          height: number | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          dog_id: string;
          storage_path: string;
          thumb_path?: string | null;
          caption?: string | null;
          is_primary?: boolean;
          width?: number | null;
          height?: number | null;
          uploaded_by?: string;
        };
        Update: {
          caption?: string | null;
          is_primary?: boolean;
        };
        Relationships: [];
      };
      dog_locations: {
        Row: {
          id: number;
          dog_id: string;
          location: unknown;
          accuracy_m: number | null;
          source: LocationSource;
          note: string | null;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          dog_id: string;
          location: unknown;
          accuracy_m?: number | null;
          source?: LocationSource;
          note?: string | null;
          recorded_by?: string;
        };
        Update: {
          note?: string | null;
        };
        Relationships: [];
      };
      feeding_records: {
        Row: {
          id: number;
          dog_id: string;
          fed_by: string;
          food_type: FoodType;
          food_type_other: string | null;
          notes: string | null;
          photo_path: string | null;
          location: unknown | null;
          fed_at: string;
          created_at: string;
        };
        Insert: {
          dog_id: string;
          fed_by?: string;
          food_type: FoodType;
          food_type_other?: string | null;
          notes?: string | null;
          photo_path?: string | null;
          location?: unknown | null;
          fed_at?: string;
        };
        Update: {
          food_type?: FoodType;
          food_type_other?: string | null;
          notes?: string | null;
          photo_path?: string | null;
        };
        Relationships: [];
      };
      vaccination_records: {
        Row: {
          id: string;
          dog_id: string;
          vaccine_type: VaccineType;
          vaccine_name: string | null;
          administered_at: string;
          next_due_at: string | null;
          administered_by_text: string | null;
          batch_number: string | null;
          proof_photo_path: string | null;
          notes: string | null;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          dog_id: string;
          vaccine_type: VaccineType;
          vaccine_name?: string | null;
          administered_at: string;
          next_due_at?: string | null;
          administered_by_text?: string | null;
          batch_number?: string | null;
          proof_photo_path?: string | null;
          notes?: string | null;
          recorded_by?: string;
        };
        Update: {
          vaccine_type?: VaccineType;
          vaccine_name?: string | null;
          administered_at?: string;
          next_due_at?: string | null;
          administered_by_text?: string | null;
          batch_number?: string | null;
          proof_photo_path?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      medical_records: {
        Row: {
          id: string;
          dog_id: string;
          record_type: MedicalRecordType;
          title: string;
          description: string | null;
          observed_health_status: DogHealthStatus | null;
          severity: SeverityLevel | null;
          photo_paths: string[];
          treated_by_text: string | null;
          performed_at: string;
          next_followup_at: string | null;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          dog_id: string;
          record_type: MedicalRecordType;
          title: string;
          description?: string | null;
          observed_health_status?: DogHealthStatus | null;
          severity?: SeverityLevel | null;
          photo_paths?: string[];
          treated_by_text?: string | null;
          performed_at?: string;
          next_followup_at?: string | null;
          recorded_by?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          observed_health_status?: DogHealthStatus | null;
          severity?: SeverityLevel | null;
          photo_paths?: string[];
          treated_by_text?: string | null;
          next_followup_at?: string | null;
        };
        Relationships: [];
      };
      emergency_reports: {
        Row: {
          id: string;
          dog_id: string | null;
          reported_by: string;
          emergency_type: EmergencyType;
          severity: SeverityLevel;
          description: string | null;
          photo_paths: string[];
          location: unknown;
          address_text: string | null;
          status: EmergencyStatus;
          resolved_by: string | null;
          resolved_at: string | null;
          resolution_notes: string | null;
          notified_count: number;
          created_at: string;
        };
        Insert: {
          dog_id?: string | null;
          reported_by?: string;
          emergency_type: EmergencyType;
          severity: SeverityLevel;
          description?: string | null;
          photo_paths?: string[];
          location: unknown;
          address_text?: string | null;
        };
        Update: {
          dog_id?: string | null;
          emergency_type?: EmergencyType;
          severity?: SeverityLevel;
          description?: string | null;
          photo_paths?: string[];
          address_text?: string | null;
          status?: EmergencyStatus;
          resolved_by?: string | null;
          resolved_at?: string | null;
          resolution_notes?: string | null;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: number;
          dog_id: string;
          actor_id: string | null;
          activity_type: ActivityType;
          ref_table: string | null;
          ref_id: string | null;
          summary: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          dog_id: string;
          actor_id?: string | null;
          activity_type: ActivityType;
          ref_table?: string | null;
          ref_id?: string | null;
          summary?: string | null;
          metadata?: Json;
        };
        Update: {
          summary?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          data: Json;
          read_at: string | null;
          push_sent: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          data?: Json;
          read_at?: string | null;
          push_sent?: boolean;
        };
        Update: { read_at?: string | null };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          expo_push_token: string;
          platform: DevicePlatform;
          device_name: string | null;
          last_active_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          expo_push_token: string;
          platform: DevicePlatform;
          device_name?: string | null;
          last_active_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          last_active_at?: string;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
      dog_follows: {
        Row: { user_id: string; dog_id: string; created_at: string };
        Insert: { user_id: string; dog_id: string };
        Update: { user_id?: string; dog_id?: string };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          dog_id: string;
          user_id: string;
          parent_id: string | null;
          body: string;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: { dog_id: string; user_id?: string; parent_id?: string | null; body: string };
        Update: { body?: string; deleted_at?: string | null };
        Relationships: [];
      };
      upvotes: {
        Row: { user_id: string; target_type: string; target_id: string; created_at: string };
        Insert: { user_id?: string; target_type: string; target_id: string };
        Update: { target_type?: string; target_id?: string };
        Relationships: [];
      };
      trust_events: {
        Row: {
          id: number;
          user_id: string;
          event_type: string;
          points: number;
          ref: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          event_type: string;
          points: number;
          ref?: Json;
        };
        Update: {
          event_type?: string;
          points?: number;
          ref?: Json;
        };
        Relationships: [];
      };
      content_reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: ReportReason;
          details: string | null;
          status: ReportStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          reporter_id?: string;
          target_type: string;
          target_id: string;
          reason: ReportReason;
          details?: string | null;
        };
        Update: {
          status?: ReportStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      fn_feeding_status: {
        Args: { p_last_fed_at: string | null };
        Returns: string;
      };
      dogs_within_radius: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_m?: number;
          p_feeding_status?: string | null;
          p_vaccinated?: TriState | null;
          p_sterilized?: TriState | null;
          p_health?: DogHealthStatus[] | null;
          p_has_emergency?: boolean | null;
          p_puppies?: boolean | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: DogSearchRow[];
      };
      dogs_in_bbox: {
        Args: {
          p_min_lng: number;
          p_min_lat: number;
          p_max_lng: number;
          p_max_lat: number;
          p_feeding_status?: string | null;
          p_vaccinated?: TriState | null;
          p_sterilized?: TriState | null;
          p_health?: DogHealthStatus[] | null;
          p_has_emergency?: boolean | null;
          p_puppies?: boolean | null;
          p_limit?: number;
        };
        Returns: DogSearchRow[];
      };
      nearby_duplicate_check: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_gender?: DogGender | null;
          p_radius_m?: number;
        };
        Returns: {
          id: string;
          name: string;
          gender: DogGender;
          temperament: DogTemperament;
          primary_thumb_path: string | null;
          last_seen_at: string;
          distance_m: number;
          gender_match: boolean;
        }[];
      };
      get_dog_timeline: {
        Args: { p_dog_id: string; p_before_id?: number | null; p_limit?: number };
        Returns: {
          id: number;
          dog_id: string;
          actor_id: string | null;
          actor_name: string | null;
          actor_avatar: string | null;
          activity_type: ActivityType;
          summary: string | null;
          metadata: Json;
          created_at: string;
        }[];
      };
      users_to_notify: {
        Args: { p_lat: number; p_lng: number; p_kind: string; p_exclude?: string | null };
        Returns: { user_id: string; expo_push_token: string }[];
      };
      followers_to_notify: {
        Args: { p_dog_id: string; p_exclude?: string | null };
        Returns: { user_id: string; expo_push_token: string }[];
      };
      mark_all_notifications_read: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      admin_soft_delete_dog: {
        Args: { p_dog_id: string };
        Returns: undefined;
      };
      is_moderator: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      dog_gender: DogGender;
      dog_status: DogStatus;
      dog_temperament: DogTemperament;
      tri_state: TriState;
      dog_health_status: DogHealthStatus;
      food_type: FoodType;
      medical_record_type: MedicalRecordType;
      vaccine_type: VaccineType;
      severity_level: SeverityLevel;
      emergency_type: EmergencyType;
      emergency_status: EmergencyStatus;
      notification_type: NotificationType;
      activity_type: ActivityType;
      user_role: UserRole;
      report_reason: ReportReason;
      report_status: ReportStatus;
      location_source: LocationSource;
      device_platform: DevicePlatform;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type Functions<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];
