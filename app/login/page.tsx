'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LoginForm } from '@/components/login-form';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();

  // Se já estiver autenticado, redireciona para o dashboard (inclusive ao voltar para a aba)
  useEffect(() => {
    const checkSession = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        router.replace('/dashboard');
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
    if (type === 'google') {
      await signIn('google', { callbackUrl: '/dashboard' });
      return;
    }

    if (!credentials?.email || !credentials.password) {
      throw new Error('E-mail e senha são obrigatórios');
    }

    const data = await apiClient.login(credentials.email, credentials.password);
    apiClient.setToken(data.token);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_data', JSON.stringify(data.user));

    router.push('/dashboard');
  };

  return <LoginForm onLogin={handleLogin} />;
}
