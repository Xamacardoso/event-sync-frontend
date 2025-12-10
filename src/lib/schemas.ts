import { z } from 'zod';

// Schema para Login
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(30),
});

// Schema para Registro
export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(30),
  city: z.string().optional(),
  role: z.enum(['user', 'organizer']), // Importante para definir se é organizador
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;