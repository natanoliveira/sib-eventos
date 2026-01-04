import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Resposta de erro segura para APIs
 * Não expõe detalhes sensíveis em produção
 */
export function errorResponse(
  message: string,
  status: number = 500,
  error?: Error | unknown,
  context?: Record<string, any>
) {
  // Log do erro completo (apenas servidor)
  logger.error(message, error, context);

  // Resposta ao cliente (sem detalhes sensíveis)
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return NextResponse.json(
    {
      error: message,
      // Apenas em desenvolvimento, incluir detalhes
      ...(isDevelopment && error instanceof Error && {
        details: error.message,
      }),
    },
    { status }
  );
}

/**
 * Resposta de sucesso padronizada
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Resposta de validação com erros específicos
 */
export function validationErrorResponse(errors: Record<string, string>) {
  return NextResponse.json(
    {
      error: 'Erro de validação',
      errors,
    },
    { status: 400 }
  );
}
