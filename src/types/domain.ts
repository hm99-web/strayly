import type { Database, Enums, Tables } from './database';

/** Full animals row (detail screen). */
export type Animal = Tables<'animals'>;

/** Row returned by animals_within_radius / animals_in_bbox (list + map). */
export type AnimalSummary = Database['public']['Functions']['animals_within_radius']['Returns'][number];

export type DuplicateMatch =
  Database['public']['Functions']['nearby_duplicate_check']['Returns'][number];

export type TimelineItem = Database['public']['Functions']['get_animal_timeline']['Returns'][number];

export type Profile = Tables<'profiles'>;
export type UserSettings = Tables<'user_settings'>;
export type FeedingRecord = Tables<'feeding_records'>;
export type VaccinationRecord = Tables<'vaccination_records'>;
export type MedicalRecord = Tables<'medical_records'>;
export type EmergencyReport = Tables<'emergency_reports'>;
export type AppNotification = Tables<'notifications'>;
export type AnimalPhoto = Tables<'animal_photos'>;

export type Species = Enums<'species'>;
export type AnimalGender = Enums<'animal_gender'>;
export type AnimalHealthStatus = Enums<'animal_health_status'>;
export type AnimalTemperament = Enums<'animal_temperament'>;
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
