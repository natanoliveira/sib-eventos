import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware para validação de dados com Zod
 * Protege contra dados inválidos e maliciosos
 */

/**
 * Sanitiza recursivamente um objeto removendo HTML/scripts perigosos
 */
function sanitizeString(value: string) {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Valida o body de uma requisição usando um schema Zod
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();

    // Sanitiza os dados antes da validação
    const sanitizedBody = sanitizeObject(body);

    // Valida com Zod
    const validatedData = schema.parse(sanitizedBody);

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Dados inválidos',
            details: errors,
          },
          { status: 400 }
        ),
      };
    }

    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'JSON inválido',
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Erro ao processar requisição',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Valida query parameters de uma requisição usando um schema Zod
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const queryObj: any = {};

    // Converte searchParams para objeto
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    // Sanitiza os dados antes da validação
    const sanitizedQuery = sanitizeObject(queryObj);

    // Valida com Zod
    const validatedData = schema.parse(sanitizedQuery);

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Parâmetros inválidos',
            details: errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Erro ao processar parâmetros',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Valida route params (path parameters) usando um schema Zod
 */
export function validateParams<T>(
  params: any,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    // Sanitiza os dados antes da validação
    const sanitizedParams = sanitizeObject(params);

    // Valida com Zod
    const validatedData = schema.parse(sanitizedParams);

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Parâmetros de rota inválidos',
            details: errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Erro ao validar parâmetros de rota',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Escape de saída para prevenir XSS
 * Use antes de renderizar dados no HTML
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Verifica se uma string contém valores perigosos
 */
export function containsDangerousContent(value: string): boolean {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Scripts
    /javascript:/gi, // javascript: URLs
    /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc)
    /<iframe/gi, // iframes
    /<object/gi, // objects
    /<embed/gi, // embeds
    /eval\(/gi, // eval calls
    /expression\(/gi, // CSS expressions
  ];

  return dangerousPatterns.some((pattern) => pattern.test(value));
}

/**
 * Valida uploads de arquivos
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // em bytes
    allowedTypes?: string[]; // MIME types
  } = {}
): { valid: true } | { valid: false; error: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;

  // Verifica tamanho
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Verifica tipo
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`,
    };
  }

  // Verifica nome do arquivo
  if (containsDangerousContent(file.name)) {
    return {
      valid: false,
      error: 'Nome de arquivo contém caracteres perigosos',
    };
  }

  return { valid: true };
}
