import { z } from 'zod';

export const patientSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  dateOfBirth: z.string().refine(val => {
    const date = new Date(val);
    return date instanceof Date && !isNaN(date.getTime()) && date <= new Date();
  }, { message: "Fecha de nacimiento inválida" }),
  sex: z.enum(["male", "female", "other"]),
  contact: z.object({
    phone: z.string().regex(/^\+?[\d\s()-]{7,15}$/, "Formato de teléfono inválido"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    address: z.string().optional()
  }),
  // ...resto del esquema
});

export type PatientSchemaType = z.infer<typeof patientSchema>;