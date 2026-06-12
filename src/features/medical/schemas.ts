import { z } from 'zod';

export const vaccineTypeValues = ['rabies', 'dhpp', 'distemper', 'parvovirus', 'other'] as const;
export const medicalRecordTypeValues = [
  'checkup',
  'treatment',
  'sterilization',
  'deworming',
  'injury_treatment',
  'other',
] as const;
export const severityValues = ['low', 'medium', 'high', 'critical'] as const;

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Not a valid date');

export const addVaccinationSchema = z.object({
  vaccineType: z.enum(vaccineTypeValues),
  vaccineName: z.string().trim().max(120).optional(),
  administeredAt: dateField,
  nextDueAt: dateField.optional().or(z.literal('')),
  administeredByText: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
});
export type AddVaccinationValues = z.infer<typeof addVaccinationSchema>;

export const addMedicalSchema = z.object({
  recordType: z.enum(medicalRecordTypeValues),
  title: z.string().trim().min(1, 'Give it a short title').max(150),
  description: z.string().trim().max(2000).optional(),
  observedHealthStatus: z
    .enum(['healthy', 'injured', 'sick', 'pregnant', 'nursing', 'recovering'])
    .optional(),
  severity: z.enum(severityValues).optional(),
  treatedByText: z.string().trim().max(200).optional(),
});
export type AddMedicalValues = z.infer<typeof addMedicalSchema>;

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
