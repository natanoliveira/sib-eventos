import { z } from 'zod';

/**
 * Schema de validação para Member/Person
 * Usado tanto no frontend (React Hook Form) quanto no backend (API routes)
 */

// Regex patterns para validação
const phoneRegex = /^(\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Schema para criação de membro
export const createMemberSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .refine(
      (val) => val.split(' ').length >= 2,
      'Nome completo é obrigatório (nome e sobrenome)'
    ),
  email: z
    .string()
    .email('Email inválido')
    .regex(emailRegex, 'Formato de email inválido')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(phoneRegex, 'Telefone inválido. Use formato: (11) 99999-9999')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(5, 'Endereço deve ter no mínimo 5 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria inválida'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  notes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  image: z
    .string()
    .url('URL da imagem inválida')
    .optional()
    .or(z.literal('')),
});

// Schema para atualização de membro (todos os campos opcionais exceto um)
export const updateMemberSchema = createMemberSchema.partial();

// Schema para busca/filtro de membros
export const getMembersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// Schema para deletar membro (apenas ID)
export const deleteMemberSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// Types inferidos dos schemas
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type GetMembersQuery = z.infer<typeof getMembersQuerySchema>;
export type DeleteMemberInput = z.infer<typeof deleteMemberSchema>;
