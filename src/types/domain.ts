import type { Database, Enums, Tables } from './database';

/** Full dogs row (detail screen). */
export type Dog = Tables<'dogs'>;

/** Row returned by dogs_within_radius / dogs_in_bbox (list + map). */
export type DogSummary = Database['public']['Functions']['dogs_within_radius']['Returns'][number];

export type DuplicateMatch =
  Database['public']['Functions']['nearby_duplicate_check']['Returns'][number];

export type TimelineItem = Database['public']['Functions']['get_dog_timeline']['Returns'][number];

export type Profile = Tables<'profiles'>;
export type UserSettings = Tables<'user_settings'>;
export type FeedingRecord = Tables<'feeding_records'>;
export type VaccinationRecord = Tables<'vaccination_records'>;
export type MedicalRecord = Tables<'medical_records'>;
export type EmergencyReport = Tables<'emergency_reports'>;
export type AppNotification = Tables<'notifications'>;
export type DogPhoto = Tables<'dog_photos'>;

export type DogGender = Enums<'dog_gender'>;
export type DogHealthStatus = Enums<'dog_health_status'>;
export type DogTemperament = Enums<'dog_temperament'>;
export type TriState = Enums<'tri_state'>;
export type FoodType = Enums<'food_type'>;
export type EmergencyType = Enums<'emergency_type'>;
export type SeverityLevel = Enums<'severity_level'>;
export type VaccineType = Enums<'vaccine_type'>;
export type MedicalRecordType = Enums<'medical_record_type'>;

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** Serialize a LatLng for a PostGIS geography column via PostgREST. */
export function toWkt(point: LatLng): string {
  return `POINT(${point.longitude} ${point.latitude})`;
}
