import { z } from 'zod';

export const dogGenderValues = ['male', 'female', 'unknown'] as const;
export const dogTemperamentValues = [
  'friendly',
  'shy',
  'playful',
  'calm',
  'fearful',
  'aggressive',
  'unknown',
] as const;
export const dogHealthValues = ['healthy', 'injured', 'sick', 'pregnant', 'nursing', 'recovering'] as const;
export const triStateValues = ['yes', 'no', 'unknown'] as const;

// Age fields stay strings (TextInput-native) — converted at submit time.
const ageYearsField = z
  .string()
  .optional()
  .refine((v) => !v || (/^\d+$/.test(v) && Number(v) <= 30), 'Years must be 0–30');
const ageMonthsField = z
  .string()
  .optional()
  .refine((v) => !v || (/^\d+$/.test(v) && Number(v) <= 11), 'Months must be 0–11');

export const createDogSchema = z.object({
  name: z.string().trim().min(1, 'Give the dog a nickname').max(80),
  description: z.string().trim().max(2000).optional(),
  gender: z.enum(dogGenderValues),
  ageYears: ageYearsField,
  ageMonths: ageMonthsField,
  temperament: z.enum(dogTemperamentValues),
  colorMarkings: z.string().trim().max(200).optional(),
  healthStatus: z.enum(dogHealthValues),
  hasPuppies: z.boolean(),
  vaccinationStatus: z.enum(triStateValues),
  sterilizationStatus: z.enum(triStateValues),
  medicalNotes: z.string().trim().max(2000).optional(),
});

export type CreateDogValues = z.infer<typeof createDogSchema>;

export function toEstimatedAgeMonths(values: Pick<CreateDogValues, 'ageYears' | 'ageMonths'>): number | null {
  if (!values.ageYears && !values.ageMonths) return null;
  return Number(values.ageYears || 0) * 12 + Number(values.ageMonths || 0);
}
