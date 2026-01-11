import { z } from 'zod';

/**
 * Schema de validação para Event
 * Usado tanto no frontend (React Hook Form) quanto no backend (API routes)
 */

const baseEventSchema = z.object({
    title: z
      .string()
      .min(5, 'Título deve ter no mínimo 5 caracteres')
      .max(100, 'Título deve ter no máximo 100 caracteres')
      .trim(),
    description: z
      .string()
      .min(10, 'Descrição deve ter no mínimo 10 caracteres')
      .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
      .trim()
      .optional()
      .or(z.literal('')),
    startDate: z
      .string()
      .datetime('Data de início inválida')
      .or(z.date()),
    endDate: z
      .string()
      .datetime('Data de término inválida')
      .or(z.date())
      .optional()
      .nullable(),
    location: z
      .string()
      .min(5, 'Local deve ter no mínimo 5 caracteres')
      .max(200, 'Local deve ter no máximo 200 caracteres')
      .trim(),
    capacity: z
      .number()
      .int('Capacidade deve ser um número inteiro')
      .positive('Capacidade deve ser positiva')
      .max(10000, 'Capacidade máxima de 10.000 pessoas')
      .optional()
      .nullable(),
    price: z
      .number()
      .nonnegative('Preço não pode ser negativo')
      .max(100000, 'Preço máximo de R$ 100.000')
      .default(0),
    category: z
      .string()
      .min(3, 'Categoria é obrigatória')
      .max(50, 'Categoria inválida')
      .trim(),
    status: z
      .enum(['ACTIVE', 'CANCELLED', 'COMPLETED', 'DRAFT'])
      .default('ACTIVE'),
    imageUrl: z
      .string()
      .url('URL da imagem inválida')
      .optional()
      .or(z.literal('')),
  });

// Schema para criação de evento
export const createEventSchema = baseEventSchema.refine(
  (data) => {
    if (data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    }
    return true;
  },
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate'],
  }
);

// Schema para atualização de evento
export const updateEventSchema = baseEventSchema.partial().refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    }
    return true;
  },
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate'],
  }
);

// Schema para busca/filtro de eventos
export const getEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().optional(),
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED', 'DRAFT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Schema para deletar evento
export const deleteEventSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// Types inferidos dos schemas
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type GetEventsQuery = z.infer<typeof getEventsQuerySchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
