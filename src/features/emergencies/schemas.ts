import { z } from 'zod';

export const emergencyTypeValues = [
  'injury',
  'accident',
  'illness',
  'cruelty',
  'aggressive_behavior',
  'missing',
  'other',
] as const;

export const emergencySeverityValues = ['low', 'medium', 'high', 'critical'] as const;

export const createEmergencySchema = z.object({
  emergencyType: z.enum(emergencyTypeValues),
  severity: z.enum(emergencySeverityValues),
  description: z.string().trim().max(2000).optional(),
});

export type CreateEmergencyValues = z.infer<typeof createEmergencySchema>;
