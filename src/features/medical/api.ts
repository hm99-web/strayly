import { compressAndUpload, type PickedImage } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import type {
  DogHealthStatus,
  MedicalRecord,
  MedicalRecordType,
  SeverityLevel,
  VaccinationRecord,
  VaccineType,
} from '@/types/domain';

export interface AddMedicalRecordInput {
  dogId: string;
  recordType: MedicalRecordType;
  title: string;
  description?: string;
  observedHealthStatus?: DogHealthStatus;
  severity?: SeverityLevel;
  treatedByText?: string;
  photos?: PickedImage[];
}

export async function addMedicalRecord(input: AddMedicalRecordInput): Promise<void> {
  const photoPaths: string[] = [];
  for (const photo of input.photos ?? []) {
    const uploaded = await compressAndUpload('dog-media', `${input.dogId}/medical`, photo);
    photoPaths.push(uploaded.path);
  }

  const { error } = await supabase.from('medical_records').insert({
    dog_id: input.dogId,
    record_type: input.recordType,
    title: input.title,
    description: input.description || null,
    observed_health_status: input.observedHealthStatus ?? null,
    severity: input.severity ?? null,
    treated_by_text: input.treatedByText || null,
    photo_paths: photoPaths,
  });
  if (error) throw error;
}

export async function fetchMedicalRecords(dogId: string, limit = 30): Promise<MedicalRecord[]> {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('dog_id', dogId)
    .order('performed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export interface AddVaccinationInput {
  dogId: string;
  vaccineType: VaccineType;
  vaccineName?: string;
  administeredAt: string; // YYYY-MM-DD
  nextDueAt?: string;
  administeredByText?: string;
  notes?: string;
  proofPhoto?: PickedImage;
}

export async function addVaccination(input: AddVaccinationInput): Promise<void> {
  let proofPath: string | null = null;
  if (input.proofPhoto) {
    const uploaded = await compressAndUpload('dog-media', `${input.dogId}/vaccinations`, input.proofPhoto);
    proofPath = uploaded.path;
  }

  const { error } = await supabase.from('vaccination_records').insert({
    dog_id: input.dogId,
    vaccine_type: input.vaccineType,
    vaccine_name: input.vaccineName || null,
    administered_at: input.administeredAt,
    next_due_at: input.nextDueAt || null,
    administered_by_text: input.administeredByText || null,
    notes: input.notes || null,
    proof_photo_path: proofPath,
  });
  if (error) throw error;
}

export async function fetchVaccinations(dogId: string): Promise<VaccinationRecord[]> {
  const { data, error } = await supabase
    .from('vaccination_records')
    .select('*')
    .eq('dog_id', dogId)
    .order('administered_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}
