import { z } from 'zod';

/**
 * Schema de validação para Event Registration
 * Usado tanto no frontend (React Hook Form) quanto no backend (API routes)
 */

// Schema para criação de inscrição em evento
export const createRegistrationSchema = z.object({
  personId: z
    .string()
    .uuid('ID da pessoa inválido')
    .min(1, 'Pessoa é obrigatória'),
  eventId: z
    .string()
    .uuid('ID do evento inválido')
    .min(1, 'Evento é obrigatório'),
  ticketTypeId: z
    .string()
    .uuid('ID do tipo de ingresso inválido')
    .min(1, 'Tipo de ingresso é obrigatório'),
  createdByUserId: z
    .string()
    .uuid('ID do usuário inválido')
    .optional(),
});

// Schema para atualização de inscrição
export const updateRegistrationSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
});

// Schema para busca/filtro de inscrições
export const getRegistrationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  eventId: z.string().uuid().optional(),
  personId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
});

// Schema para cancelar inscrição
export const cancelRegistrationSchema = z.object({
  id: z.string().uuid('ID inválido'),
  reason: z
    .string()
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .optional(),
});

// Types inferidos dos schemas
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type GetRegistrationsQuery = z.infer<typeof getRegistrationsQuerySchema>;
export type CancelRegistrationInput = z.infer<typeof cancelRegistrationSchema>;
