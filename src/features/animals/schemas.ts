import { z } from 'zod';

export const speciesValues = ['dog', 'cat'] as const;
export const animalGenderValues = ['male', 'female', 'unknown'] as const;
export const animalTemperamentValues = [
  'friendly',
  'shy',
  'playful',
  'calm',
  'fearful',
  'aggressive',
  'unknown',
] as const;
export const animalHealthValues = ['healthy', 'injured', 'sick', 'pregnant', 'nursing', 'recovering'] as const;
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

export const createAnimalSchema = z.object({
  species: z.enum(speciesValues),
  name: z.string().trim().min(1, 'Give them a nickname').max(80),
  description: z.string().trim().max(2000).optional(),
  gender: z.enum(animalGenderValues),
  ageYears: ageYearsField,
  ageMonths: ageMonthsField,
  temperament: z.enum(animalTemperamentValues),
  colorMarkings: z.string().trim().max(200).optional(),
  healthStatus: z.enum(animalHealthValues),
  hasPuppies: z.boolean(),
  vaccinationStatus: z.enum(triStateValues),
  sterilizationStatus: z.enum(triStateValues),
  medicalNotes: z.string().trim().max(2000).optional(),
});

export type CreateAnimalValues = z.infer<typeof createAnimalSchema>;

export function toEstimatedAgeMonths(values: Pick<CreateAnimalValues, 'ageYears' | 'ageMonths'>): number | null {
  if (!values.ageYears && !values.ageMonths) return null;
  return Number(values.ageYears || 0) * 12 + Number(values.ageMonths || 0);
}
