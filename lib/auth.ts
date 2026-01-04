/**
 * Sistema de autenticação JWT para APIs
 *
 * Este arquivo gerencia autenticação baseada em tokens JWT para as APIs do projeto.
 * Anteriormente usava NextAuth, mas foi simplificado para JWT puro.
 */
import jwt from 'jsonwebtoken'

// Validar JWT_SECRET em produção
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET não está definido. Configure a variável de ambiente JWT_SECRET em produção.'
  );
}

// Fallback apenas em desenvolvimento
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET é obrigatório em produção');
  }
  console.warn('⚠️  ATENÇÃO: Usando JWT_SECRET padrão em desenvolvimento. Configure JWT_SECRET no .env');
  return 'dev-secret-key-change-in-production';
})();

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    return payload
  } catch {
    return null
  }
}
