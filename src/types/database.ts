export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_id: string | null
          created_at: string
          dog_id: string
          id: number
          metadata: Json
          ref_id: string | null
          ref_table: string | null
          summary: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_id?: string | null
          created_at?: string
          dog_id: string
          id?: never
          metadata?: Json
          ref_id?: string | null
          ref_table?: string | null
          summary?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          actor_id?: string | null
          created_at?: string
          dog_id?: string
          id?: never
          metadata?: Json
          ref_id?: string | null
          ref_table?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string
          created_at: string
          deleted_at: string | null
          dog_id: string
          id: string
          parent_id: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          deleted_at?: string | null
          dog_id: string
          id?: string
          parent_id?: string | null
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          deleted_at?: string | null
          dog_id?: string
          id?: string
          parent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dog_follows: {
        Row: {
          created_at: string
          dog_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dog_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          dog_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dog_follows_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dog_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dog_locations: {
        Row: {
          accuracy_m: number | null
          created_at: string
          dog_id: string
          id: number
          location: unknown
          note: string | null
          recorded_by: string
          source: Database["public"]["Enums"]["location_source"]
        }
        Insert: {
          accuracy_m?: number | null
          created_at?: string
          dog_id: string
          id?: never
          location: unknown
          note?: string | null
          recorded_by?: string
          source?: Database["public"]["Enums"]["location_source"]
        }
        Update: {
          accuracy_m?: number | null
          created_at?: string
          dog_id?: string
          id?: never
          location?: unknown
          note?: string | null
          recorded_by?: string
          source?: Database["public"]["Enums"]["location_source"]
        }
        Relationships: [
          {
            foreignKeyName: "dog_locations_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dog_locations_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dog_photos: {
        Row: {
          caption: string | null
          created_at: string
          dog_id: string
          height: number | null
          id: string
          is_primary: boolean
          storage_path: string
          thumb_path: string | null
          uploaded_by: string
          width: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          dog_id: string
          height?: number | null
          id?: string
          is_primary?: boolean
          storage_path: string
          thumb_path?: string | null
          uploaded_by?: string
          width?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          dog_id?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          storage_path?: string
          thumb_path?: string | null
          uploaded_by?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dog_photos_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dog_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          address_text: string | null
          city: string | null
          color_markings: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          estimated_age_months: number | null
          feedings_count: number
          followers_count: number
          gender: Database["public"]["Enums"]["dog_gender"]
          has_active_emergency: boolean
          has_puppies: boolean
          health_status: Database["public"]["Enums"]["dog_health_status"]
          id: string
          last_fed_at: string | null
          last_fed_by: string | null
          last_seen_at: string
          last_seen_by: string | null
          location: unknown
          medical_notes: string | null
          name: string
          primary_photo_path: string | null
          primary_thumb_path: string | null
          status: Database["public"]["Enums"]["dog_status"]
          sterilization_status: Database["public"]["Enums"]["tri_state"]
          sterilized_at: string | null
          temperament: Database["public"]["Enums"]["dog_temperament"]
          updated_at: string
          vaccination_status: Database["public"]["Enums"]["tri_state"]
        }
        Insert: {
          address_text?: string | null
          city?: string | null
          color_markings?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          estimated_age_months?: number | null
          feedings_count?: number
          followers_count?: number
          gender?: Database["public"]["Enums"]["dog_gender"]
          has_active_emergency?: boolean
          has_puppies?: boolean
          health_status?: Database["public"]["Enums"]["dog_health_status"]
          id?: string
          last_fed_at?: string | null
          last_fed_by?: string | null
          last_seen_at?: string
          last_seen_by?: string | null
          location: unknown
          medical_notes?: string | null
          name: string
          primary_photo_path?: string | null
          primary_thumb_path?: string | null
          status?: Database["public"]["Enums"]["dog_status"]
          sterilization_status?: Database["public"]["Enums"]["tri_state"]
          sterilized_at?: string | null
          temperament?: Database["public"]["Enums"]["dog_temperament"]
          updated_at?: string
          vaccination_status?: Database["public"]["Enums"]["tri_state"]
        }
        Update: {
          address_text?: string | null
          city?: string | null
          color_markings?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          estimated_age_months?: number | null
          feedings_count?: number
          followers_count?: number
          gender?: Database["public"]["Enums"]["dog_gender"]
          has_active_emergency?: boolean
          has_puppies?: boolean
          health_status?: Database["public"]["Enums"]["dog_health_status"]
          id?: string
          last_fed_at?: string | null
          last_fed_by?: string | null
          last_seen_at?: string
          last_seen_by?: string | null
          location?: unknown
          medical_notes?: string | null
          name?: string
          primary_photo_path?: string | null
          primary_thumb_path?: string | null
          status?: Database["public"]["Enums"]["dog_status"]
          sterilization_status?: Database["public"]["Enums"]["tri_state"]
          sterilized_at?: string | null
          temperament?: Database["public"]["Enums"]["dog_temperament"]
          updated_at?: string
          vaccination_status?: Database["public"]["Enums"]["tri_state"]
        }
        Relationships: [
          {
            foreignKeyName: "dogs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dogs_last_fed_by_fkey"
            columns: ["last_fed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dogs_last_seen_by_fkey"
            columns: ["last_seen_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_reports: {
        Row: {
          address_text: string | null
          created_at: string
          description: string | null
          dog_id: string | null
          emergency_type: Database["public"]["Enums"]["emergency_type"]
          id: string
          location: unknown
          notified_count: number
          photo_paths: string[]
          reported_by: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["emergency_status"]
        }
        Insert: {
          address_text?: string | null
          created_at?: string
          description?: string | null
          dog_id?: string | null
          emergency_type: Database["public"]["Enums"]["emergency_type"]
          id?: string
          location: unknown
          notified_count?: number
          photo_paths?: string[]
          reported_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["emergency_status"]
        }
        Update: {
          address_text?: string | null
          created_at?: string
          description?: string | null
          dog_id?: string | null
          emergency_type?: Database["public"]["Enums"]["emergency_type"]
          id?: string
          location?: unknown
          notified_count?: number
          photo_paths?: string[]
          reported_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["emergency_status"]
        }
        Relationships: [
          {
            foreignKeyName: "emergency_reports_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_records: {
        Row: {
          created_at: string
          dog_id: string
          fed_at: string
          fed_by: string
          food_type: Database["public"]["Enums"]["food_type"]
          food_type_other: string | null
          id: number
          location: unknown
          notes: string | null
          photo_path: string | null
        }
        Insert: {
          created_at?: string
          dog_id: string
          fed_at?: string
          fed_by?: string
          food_type: Database["public"]["Enums"]["food_type"]
          food_type_other?: string | null
          id?: never
          location?: unknown
          notes?: string | null
          photo_path?: string | null
        }
        Update: {
          created_at?: string
          dog_id?: string
          fed_at?: string
          fed_by?: string
          food_type?: Database["public"]["Enums"]["food_type"]
          food_type_other?: string | null
          id?: never
          location?: unknown
          notes?: string | null
          photo_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feeding_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_records_fed_by_fkey"
            columns: ["fed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string
          description: string | null
          dog_id: string
          id: string
          next_followup_at: string | null
          observed_health_status:
            | Database["public"]["Enums"]["dog_health_status"]
            | null
          performed_at: string
          photo_paths: string[]
          record_type: Database["public"]["Enums"]["medical_record_type"]
          recorded_by: string
          severity: Database["public"]["Enums"]["severity_level"] | null
          title: string
          treated_by_text: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dog_id: string
          id?: string
          next_followup_at?: string | null
          observed_health_status?:
            | Database["public"]["Enums"]["dog_health_status"]
            | null
          performed_at?: string
          photo_paths?: string[]
          record_type: Database["public"]["Enums"]["medical_record_type"]
          recorded_by?: string
          severity?: Database["public"]["Enums"]["severity_level"] | null
          title: string
          treated_by_text?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dog_id?: string
          id?: string
          next_followup_at?: string | null
          observed_health_status?:
            | Database["public"]["Enums"]["dog_health_status"]
            | null
          performed_at?: string
          photo_paths?: string[]
          record_type?: Database["public"]["Enums"]["medical_record_type"]
          recorded_by?: string
          severity?: Database["public"]["Enums"]["severity_level"] | null
          title?: string
          treated_by_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: number
          push_sent: boolean
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: never
          push_sent?: boolean
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: never
          push_sent?: boolean
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string
          display_name: string
          dogs_added_count: number
          feedings_count: number
          id: string
          is_anonymous: boolean
          role: Database["public"]["Enums"]["user_role"]
          trust_score: number
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          dogs_added_count?: number
          feedings_count?: number
          id: string
          is_anonymous?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          trust_score?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          dogs_added_count?: number
          feedings_count?: number
          id?: string
          is_anonymous?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          trust_score?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          device_name: string | null
          expo_push_token: string
          id: string
          last_active_at: string
          platform: Database["public"]["Enums"]["device_platform"]
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          expo_push_token: string
          id?: string
          last_active_at?: string
          platform: Database["public"]["Enums"]["device_platform"]
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          expo_push_token?: string
          id?: string
          last_active_at?: string
          platform?: Database["public"]["Enums"]["device_platform"]
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          points: number
          ref: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: never
          points: number
          ref?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: never
          points?: number
          ref?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      upvotes: {
        Row: {
          created_at: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          last_known_location: unknown
          locale: string
          notification_radius_m: number
          notify_emergency_nearby: boolean
          notify_followed_dogs: boolean
          notify_new_dog_nearby: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          last_known_location?: unknown
          locale?: string
          notification_radius_m?: number
          notify_emergency_nearby?: boolean
          notify_followed_dogs?: boolean
          notify_new_dog_nearby?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          last_known_location?: unknown
          locale?: string
          notification_radius_m?: number
          notify_emergency_nearby?: boolean
          notify_followed_dogs?: boolean
          notify_new_dog_nearby?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccination_records: {
        Row: {
          administered_at: string
          administered_by_text: string | null
          batch_number: string | null
          created_at: string
          dog_id: string
          id: string
          next_due_at: string | null
          notes: string | null
          proof_photo_path: string | null
          recorded_by: string
          vaccine_name: string | null
          vaccine_type: Database["public"]["Enums"]["vaccine_type"]
        }
        Insert: {
          administered_at: string
          administered_by_text?: string | null
          batch_number?: string | null
          created_at?: string
          dog_id: string
          id?: string
          next_due_at?: string | null
          notes?: string | null
          proof_photo_path?: string | null
          recorded_by?: string
          vaccine_name?: string | null
          vaccine_type: Database["public"]["Enums"]["vaccine_type"]
        }
        Update: {
          administered_at?: string
          administered_by_text?: string | null
          batch_number?: string | null
          created_at?: string
          dog_id?: string
          id?: string
          next_due_at?: string | null
          notes?: string | null
          proof_photo_path?: string | null
          recorded_by?: string
          vaccine_name?: string | null
          vaccine_type?: Database["public"]["Enums"]["vaccine_type"]
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_soft_delete_dog: { Args: { p_dog_id: string }; Returns: undefined }
      dogs_in_bbox: {
        Args: {
          p_feeding_status?: string
          p_has_emergency?: boolean
          p_health?: Database["public"]["Enums"]["dog_health_status"][]
          p_limit?: number
          p_max_lat: number
          p_max_lng: number
          p_min_lat: number
          p_min_lng: number
          p_puppies?: boolean
          p_sterilized?: Database["public"]["Enums"]["tri_state"]
          p_vaccinated?: Database["public"]["Enums"]["tri_state"]
        }
        Returns: {
          address_text: string
          city: string
          created_at: string
          distance_m: number
          estimated_age_months: number
          feeding_status: string
          feedings_count: number
          followers_count: number
          gender: Database["public"]["Enums"]["dog_gender"]
          has_active_emergency: boolean
          has_puppies: boolean
          health_status: Database["public"]["Enums"]["dog_health_status"]
          id: string
          last_fed_at: string
          last_seen_at: string
          lat: number
          lng: number
          name: string
          primary_photo_path: string
          primary_thumb_path: string
          status: Database["public"]["Enums"]["dog_status"]
          sterilization_status: Database["public"]["Enums"]["tri_state"]
          temperament: Database["public"]["Enums"]["dog_temperament"]
          vaccination_status: Database["public"]["Enums"]["tri_state"]
        }[]
      }
      dogs_within_radius: {
        Args: {
          p_feeding_status?: string
          p_has_emergency?: boolean
          p_health?: Database["public"]["Enums"]["dog_health_status"][]
          p_lat: number
          p_limit?: number
          p_lng: number
          p_offset?: number
          p_puppies?: boolean
          p_radius_m?: number
          p_sterilized?: Database["public"]["Enums"]["tri_state"]
          p_vaccinated?: Database["public"]["Enums"]["tri_state"]
        }
        Returns: {
          address_text: string
          city: string
          created_at: string
          distance_m: number
          estimated_age_months: number
          feeding_status: string
          feedings_count: number
          followers_count: number
          gender: Database["public"]["Enums"]["dog_gender"]
          has_active_emergency: boolean
          has_puppies: boolean
          health_status: Database["public"]["Enums"]["dog_health_status"]
          id: string
          last_fed_at: string
          last_seen_at: string
          lat: number
          lng: number
          name: string
          primary_photo_path: string
          primary_thumb_path: string
          status: Database["public"]["Enums"]["dog_status"]
          sterilization_status: Database["public"]["Enums"]["tri_state"]
          temperament: Database["public"]["Enums"]["dog_temperament"]
          vaccination_status: Database["public"]["Enums"]["tri_state"]
        }[]
      }
      fn_feeding_status: { Args: { p_last_fed_at: string }; Returns: string }
      fn_log_activity: {
        Args: {
          p_actor_id: string
          p_dog_id: string
          p_metadata?: Json
          p_ref_id: string
          p_ref_table: string
          p_summary: string
          p_type: Database["public"]["Enums"]["activity_type"]
        }
        Returns: undefined
      }
      fn_notify_fanout: { Args: { p_payload: Json }; Returns: undefined }
      followers_to_notify: {
        Args: { p_dog_id: string; p_exclude?: string }
        Returns: {
          expo_push_token: string
          user_id: string
        }[]
      }
      get_dog_timeline: {
        Args: { p_before_id?: number; p_dog_id: string; p_limit?: number }
        Returns: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_avatar: string
          actor_id: string
          actor_name: string
          created_at: string
          dog_id: string
          id: number
          metadata: Json
          summary: string
        }[]
      }
      is_moderator: { Args: never; Returns: boolean }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      nearby_duplicate_check: {
        Args: {
          p_gender?: Database["public"]["Enums"]["dog_gender"]
          p_lat: number
          p_lng: number
          p_radius_m?: number
        }
        Returns: {
          distance_m: number
          gender: Database["public"]["Enums"]["dog_gender"]
          gender_match: boolean
          id: string
          last_seen_at: string
          name: string
          primary_thumb_path: string
          temperament: Database["public"]["Enums"]["dog_temperament"]
        }[]
      }
      users_to_notify: {
        Args: {
          p_exclude?: string
          p_kind: string
          p_lat: number
          p_lng: number
        }
        Returns: {
          expo_push_token: string
          user_id: string
        }[]
      }
    }
    Enums: {
      activity_type:
        | "dog_created"
        | "dog_updated"
        | "fed"
        | "medical"
        | "vaccination"
        | "sterilization"
        | "emergency_created"
        | "emergency_resolved"
        | "photo_added"
        | "location_updated"
        | "status_changed"
        | "comment"
      device_platform: "ios" | "android" | "web"
      dog_gender: "male" | "female" | "unknown"
      dog_health_status:
        | "healthy"
        | "injured"
        | "sick"
        | "pregnant"
        | "nursing"
        | "recovering"
      dog_status: "active" | "missing" | "adopted" | "deceased" | "relocated"
      dog_temperament:
        | "friendly"
        | "shy"
        | "playful"
        | "calm"
        | "fearful"
        | "aggressive"
        | "unknown"
      emergency_status: "open" | "in_progress" | "resolved" | "false_alarm"
      emergency_type:
        | "injury"
        | "accident"
        | "illness"
        | "cruelty"
        | "aggressive_behavior"
        | "missing"
        | "other"
      food_type:
        | "dog_food"
        | "rice"
        | "meat"
        | "biscuits"
        | "milk"
        | "eggs"
        | "leftovers"
        | "other"
      location_source:
        | "initial"
        | "sighting"
        | "feeding"
        | "medical"
        | "emergency"
        | "manual"
      medical_record_type:
        | "checkup"
        | "treatment"
        | "sterilization"
        | "deworming"
        | "injury_treatment"
        | "other"
      notification_type:
        | "emergency_nearby"
        | "new_dog_nearby"
        | "followed_dog_update"
        | "vaccination_due"
        | "system"
      report_reason:
        | "duplicate"
        | "inaccurate"
        | "spam"
        | "abuse"
        | "not_a_street_dog"
        | "other"
      report_status: "pending" | "reviewed" | "actioned" | "dismissed"
      severity_level: "low" | "medium" | "high" | "critical"
      tri_state: "yes" | "no" | "unknown"
      user_role: "user" | "volunteer" | "ngo" | "moderator" | "admin"
      vaccine_type: "rabies" | "dhpp" | "distemper" | "parvovirus" | "other"
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
      activity_type: [
        "dog_created",
        "dog_updated",
        "fed",
        "medical",
        "vaccination",
        "sterilization",
        "emergency_created",
        "emergency_resolved",
        "photo_added",
        "location_updated",
        "status_changed",
        "comment",
      ],
      device_platform: ["ios", "android", "web"],
      dog_gender: ["male", "female", "unknown"],
      dog_health_status: [
        "healthy",
        "injured",
        "sick",
        "pregnant",
        "nursing",
        "recovering",
      ],
      dog_status: ["active", "missing", "adopted", "deceased", "relocated"],
      dog_temperament: [
        "friendly",
        "shy",
        "playful",
        "calm",
        "fearful",
        "aggressive",
        "unknown",
      ],
      emergency_status: ["open", "in_progress", "resolved", "false_alarm"],
      emergency_type: [
        "injury",
        "accident",
        "illness",
        "cruelty",
        "aggressive_behavior",
        "missing",
        "other",
      ],
      food_type: [
        "dog_food",
        "rice",
        "meat",
        "biscuits",
        "milk",
        "eggs",
        "leftovers",
        "other",
      ],
      location_source: [
        "initial",
        "sighting",
        "feeding",
        "medical",
        "emergency",
        "manual",
      ],
      medical_record_type: [
        "checkup",
        "treatment",
        "sterilization",
        "deworming",
        "injury_treatment",
        "other",
      ],
      notification_type: [
        "emergency_nearby",
        "new_dog_nearby",
        "followed_dog_update",
        "vaccination_due",
        "system",
      ],
      report_reason: [
        "duplicate",
        "inaccurate",
        "spam",
        "abuse",
        "not_a_street_dog",
        "other",
      ],
      report_status: ["pending", "reviewed", "actioned", "dismissed"],
      severity_level: ["low", "medium", "high", "critical"],
      tri_state: ["yes", "no", "unknown"],
      user_role: ["user", "volunteer", "ngo", "moderator", "admin"],
      vaccine_type: ["rabies", "dhpp", "distemper", "parvovirus", "other"],
    },
  },
} as const
