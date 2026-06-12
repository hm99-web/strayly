import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Tell us your name').max(60),
    email: z.email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const upgradeSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
export type UpgradeValues = z.infer<typeof upgradeSchema>;
