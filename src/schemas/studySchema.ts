import { z } from 'zod';

// Esquema para neuroconducciones
export const neuroConductionSchema = z.object({
  latency: z.number().positive("La latencia debe ser positiva"),
  velocity: z.number().positive("La velocidad debe ser positiva"),
  amplitude: z.number().positive("La amplitud debe ser positiva")
});

// Esquema para estudio completo
export const studySchema = z.object({
  id: z.string().optional(),
  patientId: z.string(),
  studyType: z.enum(["neuroconduction", "myography", "special"]),
  timestamp: z.string().optional(),
  data: z.record(z.string(), z.any()),
  conclusion: z.string().optional()
});

export type NeuroConductionSchemaType = z.infer<typeof neuroConductionSchema>;
export type StudySchemaType = z.infer<typeof studySchema>;