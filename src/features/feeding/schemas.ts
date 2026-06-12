import { z } from 'zod';

export const foodTypeValues = [
  'dog_food',
  'rice',
  'meat',
  'biscuits',
  'milk',
  'eggs',
  'leftovers',
  'other',
] as const;

export const markFedSchema = z
  .object({
    foodType: z.enum(foodTypeValues),
    foodTypeOther: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.foodType !== 'other' || (v.foodTypeOther && v.foodTypeOther.length > 0), {
    message: 'Tell us what food it was',
    path: ['foodTypeOther'],
  });

export type MarkFedValues = z.infer<typeof markFedSchema>;
