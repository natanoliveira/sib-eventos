import { z } from 'zod';

/**
 * Schema de validação para Payment e Installment
 * Usado tanto no frontend (React Hook Form) quanto no backend (API routes)
 */

// Schema para registro de pagamento em parcela
export const registerPaymentSchema = z.object({
  installmentId: z
    .string()
    .uuid('ID da parcela inválido')
    .min(1, 'Parcela é obrigatória'),
  method: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  amount: z
    .number()
    .positive('Valor deve ser positivo')
    .max(1000000, 'Valor máximo de R$ 1.000.000')
    .refine((val) => {
      // Verifica se tem no máximo 2 casas decimais
      return /^\d+(\.\d{1,2})?$/.test(val.toString());
    }, 'Valor deve ter no máximo 2 casas decimais'),
  transactionId: z
    .string()
    .max(200, 'ID da transação muito longo')
    .trim()
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
});

// Schema para cancelamento de pagamento
export const cancelPaymentSchema = z.object({
  id: z.string().uuid('ID do pagamento inválido'),
  reason: z
    .string()
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
});

// Schema para criar payment intent do Stripe
export const createStripePaymentIntentSchema = z.object({
  installmentId: z
    .string()
    .uuid('ID da parcela inválido')
    .min(1, 'Parcela é obrigatória'),
});

// Schema para busca/filtro de pagamentos
export const getPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z
    .enum(['PENDING', 'PAID', 'PROCESSING', 'FAILED', 'REFUNDED', 'CANCELLED'])
    .optional(),
  method: z
    .enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH'])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Schema para busca/filtro de parcelas
export const getInstallmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  invoiceId: z.string().uuid().optional(),
  personId: z.string().uuid().optional(),
});

// Schema para marcar pagamento como pago
export const markPaymentAsPaidSchema = z.object({
  id: z.string().uuid('ID do pagamento inválido'),
  paidAt: z
    .string()
    .datetime('Data de pagamento inválida')
    .or(z.date())
    .optional(),
});

// Types inferidos dos schemas
export type RegisterPaymentInput = z.infer<typeof registerPaymentSchema>;
export type CancelPaymentInput = z.infer<typeof cancelPaymentSchema>;
export type CreateStripePaymentIntentInput = z.infer<
  typeof createStripePaymentIntentSchema
>;
export type GetPaymentsQuery = z.infer<typeof getPaymentsQuerySchema>;
export type GetInstallmentsQuery = z.infer<typeof getInstallmentsQuerySchema>;
export type MarkPaymentAsPaidInput = z.infer<typeof markPaymentAsPaidSchema>;
