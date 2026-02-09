'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { apiClient } from '@/lib/api-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  // Se já estiver autenticado, redireciona para o dashboard (inclusive ao voltar para a aba)
  useEffect(() => {
    const checkSession = async () => {
      try {
        await apiClient.getProfile();
        router.replace('/dashboard');
      } catch {
        // Sem sessão válida
      }
    };

    checkSession();
    const handler = () => checkSession();
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [router]);

  const handleLogin = async (
    type: 'email' | 'google',
    credentials?: { email: string; password: string }
  ) => {
    // Google OAuth foi removido - usando apenas autenticação JWT
    if (type === 'google') {
      throw new Error('Login com Google temporariamente desabilitado');
    }

    if (!credentials?.email || !credentials.password) {
      throw new Error('E-mail e senha são obrigatórios');
    }

    await apiClient.login(credentials.email, credentials.password);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen">
      {reason === 'expired' && (
        <div className="max-w-3xl mx-auto px-6 pt-8">
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900">
            <AlertTitle>Sessão expirada</AlertTitle>
            <AlertDescription>
              Sua sessão expirou por segurança. Faça login novamente para continuar.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
