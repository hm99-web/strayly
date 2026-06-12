create type public.dog_gender as enum ('male', 'female', 'unknown');
create type public.dog_status as enum ('active', 'missing', 'adopted', 'deceased', 'relocated');
create type public.dog_temperament as enum ('friendly', 'shy', 'playful', 'calm', 'fearful', 'aggressive', 'unknown');
create type public.tri_state as enum ('yes', 'no', 'unknown');
create type public.dog_health_status as enum ('healthy', 'injured', 'sick', 'pregnant', 'nursing', 'recovering');
create type public.food_type as enum ('dog_food', 'rice', 'meat', 'biscuits', 'milk', 'eggs', 'leftovers', 'other');
create type public.medical_record_type as enum ('checkup', 'treatment', 'sterilization', 'deworming', 'injury_treatment', 'other');
create type public.vaccine_type as enum ('rabies', 'dhpp', 'distemper', 'parvovirus', 'other');
create type public.severity_level as enum ('low', 'medium', 'high', 'critical');
create type public.emergency_type as enum ('injury', 'accident', 'illness', 'cruelty', 'aggressive_behavior', 'missing', 'other');
create type public.emergency_status as enum ('open', 'in_progress', 'resolved', 'false_alarm');
create type public.notification_type as enum ('emergency_nearby', 'new_dog_nearby', 'followed_dog_update', 'vaccination_due', 'system');
create type public.activity_type as enum (
  'dog_created', 'dog_updated', 'fed', 'medical', 'vaccination', 'sterilization',
  'emergency_created', 'emergency_resolved', 'photo_added', 'location_updated',
  'status_changed', 'comment'
);
create type public.user_role as enum ('user', 'volunteer', 'ngo', 'moderator', 'admin');
create type public.report_reason as enum ('duplicate', 'inaccurate', 'spam', 'abuse', 'not_a_street_dog', 'other');
create type public.report_status as enum ('pending', 'reviewed', 'actioned', 'dismissed');
create type public.location_source as enum ('initial', 'sighting', 'feeding', 'medical', 'emergency', 'manual');
create type public.device_platform as enum ('ios', 'android', 'web');
