import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Sistema de Rate Limiting simples e eficaz
 * Usa Map em memória (para produção, considerar Redis)
 */

interface RateLimitOptions {
  interval: number; // Janela de tempo em ms
  uniqueTokenPerInterval: number; // Número máximo de tokens únicos
  maxRequests: number; // Número máximo de requisições por intervalo
}

interface TokenBucket {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private cache = new Map<string, TokenBucket>();
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = options;

    // Limpar cache periodicamente (a cada 1 hora)
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now > value.resetTime) {
          this.cache.delete(key);
        }
      }
    }, 60 * 60 * 1000); // 1 hora
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const bucket = this.cache.get(identifier);

    if (!bucket || now > bucket.resetTime) {
      // Nova janela de tempo
      const resetTime = now + this.options.interval;
      this.cache.set(identifier, { count: 1, resetTime });

      return {
        allowed: true,
        remaining: this.options.maxRequests - 1,
        resetTime,
      };
    }

    if (bucket.count >= this.options.maxRequests) {
      // Limite excedido
      return {
        allowed: false,
        remaining: 0,
        resetTime: bucket.resetTime,
      };
    }

    // Incrementar contador
    bucket.count++;
    this.cache.set(identifier, bucket);

    return {
      allowed: true,
      remaining: this.options.maxRequests - bucket.count,
      resetTime: bucket.resetTime,
    };
  }
}

// Diferentes limitadores para diferentes endpoints
export const loginLimiter = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 500,
  maxRequests: 5, // 5 tentativas de login a cada 15 min
});

export const registerLimiter = new RateLimiter({
  interval: 60 * 60 * 1000, // 1 hora
  uniqueTokenPerInterval: 500,
  maxRequests: 3, // 3 registros por hora
});

export const apiLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
  maxRequests: 60, // 60 requests por minuto (1 por segundo)
});

export const paymentLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
  maxRequests: 10, // 10 tentativas de pagamento por minuto
});

/**
 * Middleware de rate limiting
 */
export function withRateLimit(
  limiter: RateLimiter,
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    // Obter identificador (IP ou user ID se autenticado)
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const identifier = ip;

    const { allowed, remaining, resetTime } = limiter.check(identifier);

    if (!allowed) {
      logger.warn('Rate limit excedido', {
        ip,
        endpoint: request.nextUrl.pathname,
      });

      return NextResponse.json(
        {
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000), // em segundos
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limiter['options'].maxRequests),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    // Adicionar headers de rate limit
    const response = await handler(request, context);

    response.headers.set('X-RateLimit-Limit', String(limiter['options'].maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));

    return response;
  };
}
