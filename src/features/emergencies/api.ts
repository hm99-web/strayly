import { compressAndUpload, type PickedImage } from '@/lib/images';
import { getCurrentPosition } from '@/lib/location';
import { supabase } from '@/lib/supabase';
import { toWkt, type EmergencyReport, type EmergencyType, type LatLng, type SeverityLevel } from '@/types/domain';

export interface CreateEmergencyInput {
  animalId?: string;
  emergencyType: EmergencyType;
  severity: SeverityLevel;
  description?: string;
  photos?: PickedImage[];
  /** Falls back to current GPS position, then to the animal's location server-side. */
  location?: LatLng;
  addressText?: string;
}

export async function createEmergency(input: CreateEmergencyInput): Promise<string> {
  const position = input.location ?? (await getCurrentPosition());
  if (!position) {
    throw new Error('Location is required for an emergency report — enable location access.');
  }

  const photoPaths: string[] = [];
  for (const photo of input.photos ?? []) {
    const prefix = input.animalId ? `${input.animalId}/emergencies` : 'unknown/emergencies';
    const uploaded = await compressAndUpload('animal-media', prefix, photo);
    photoPaths.push(uploaded.path);
  }

  const { data, error } = await supabase
    .from('emergency_reports')
    .insert({
      animal_id: input.animalId ?? null,
      emergency_type: input.emergencyType,
      severity: input.severity,
      description: input.description || null,
      photo_paths: photoPaths,
      location: toWkt(position),
      address_text: input.addressText ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function fetchEmergency(id: string): Promise<EmergencyReport> {
  const { data, error } = await supabase
    .from('emergency_reports')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchEmergenciesForAnimal(animalId: string): Promise<EmergencyReport[]> {
  const { data, error } = await supabase
    .from('emergency_reports')
    .select('*')
    .eq('animal_id', animalId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function updateEmergencyStatus(
  id: string,
  status: 'in_progress' | 'resolved' | 'false_alarm',
  resolutionNotes?: string,
): Promise<void> {
  const isClosing = status === 'resolved' || status === 'false_alarm';
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('emergency_reports')
    .update({
      status,
      resolution_notes: resolutionNotes || null,
      resolved_by: isClosing ? (auth.user?.id ?? null) : null,
      resolved_at: isClosing ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) throw error;
}
