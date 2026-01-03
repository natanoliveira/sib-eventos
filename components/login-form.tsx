"use client";

import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Mail, Lock, Chrome } from "lucide-react";
import { toastSuccess, toastError } from "../lib/toast";

interface LoginFormProps {
  onLogin: (type: 'email' | 'google', credentials?: { email: string; password: string }) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');
    try {
      await onLogin('email', { email, password });
      toastSuccess('Login realizado com sucesso');
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error instanceof Error ? error.message : 'E-mail ou senha incorretos';
      setError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onLogin('google');
      toastSuccess('Login com Google realizado');
    } catch (error) {
      console.error('Google login error:', error);
      const message =
        error instanceof Error ? error.message : 'Erro no login com Google';
      setError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setIsLoading(true);
    setError('');
    try {
      await onLogin('email', { email, password });
    } catch (error) {
      console.error('Quick login error:', error);
      setError('E-mail ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-blue-200">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>
          <CardTitle className="text-blue-900">EventoIgreja</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar eventos da igreja
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            disabled={isLoading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Entrar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            {error && (
              <div className="text-red-500 text-sm text-center mt-2">
                {error}
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter className="text-center space-y-4">
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-3">
              Credenciais para demonstração:
            </p>
            <div className="grid gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@igreja.com', '123456')}
                disabled={isLoading}
                className="flex justify-between items-center px-3 py-2 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <span className="font-medium">Admin:</span>
                <span>admin@igreja.com / 123456</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('pastor@igreja.com', '123456')}
                disabled={isLoading}
                className="flex justify-between items-center px-3 py-2 bg-indigo-50 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                <span className="font-medium">Pastor:</span>
                <span>pastor@igreja.com / 123456</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('membro@igreja.com', '123456')}
                disabled={isLoading}
                className="flex justify-between items-center px-3 py-2 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <span className="font-medium">Membro:</span>
                <span>membro@igreja.com / 123456</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Ou clique em "Entrar com Google" para login automático
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
