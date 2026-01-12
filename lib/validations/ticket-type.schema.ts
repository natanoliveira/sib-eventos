import { z } from 'zod';

/**
 * Schema de validação para TicketType
 * Usado tanto no frontend (React Hook Form) quanto no backend (API routes)
 */

// Schema para criação de tipo de ingresso
export const createTicketTypeSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .nonnegative('Preço não pode ser negativo')
    .max(100000, 'Preço máximo de R$ 100.000'),
  capacity: z
    .number()
    .int('Capacidade deve ser um número inteiro')
    .positive('Capacidade deve ser positiva')
    .max(10000, 'Capacidade máxima de 10.000 pessoas')
    .nullable()
    .optional(),
});

// Schema para atualização de tipo de ingresso
export const updateTicketTypeSchema = createTicketTypeSchema.partial();

// Types inferidos dos schemas
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
