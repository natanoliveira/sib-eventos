"use client";

import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Mail, Lock, Chrome, Calendar, Users, CreditCard, BarChart3, Shield, CheckCircle2 } from "lucide-react";
import { toastError, toastInfo } from "../lib/toast";

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
      toastInfo('Login realizado com sucesso');
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error instanceof Error ? error.message : 'E-mail ou senha incorretos';

      if (message === 'Failed to fetch') {
        toastError('Erro ao conectar ao servidor');
      } else {
        setError(message);
        toastError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onLogin('google');
      toastInfo('Login com Google realizado');
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

  const features = [
    {
      icon: Calendar,
      title: "Gestão de Eventos",
      description: "Organize e gerencie todos os eventos da sua igreja em um só lugar"
    },
    {
      icon: Users,
      title: "Controle de Membros",
      description: "Mantenha cadastro completo de membros e participantes"
    },
    {
      icon: CreditCard,
      title: "Pagamentos",
      description: "Gerencie faturas, parcelas e pagamentos de forma integrada"
    },
    {
      icon: BarChart3,
      title: "Relatórios",
      description: "Visualize métricas e relatórios detalhados em tempo real"
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "Sistema com autenticação segura e controle de permissões"
    }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Lado Esquerdo - Conteúdo da Plataforma */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
          {/* Logo e Título */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-white">EventoIgreja</h1>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Sistema Completo de<br />Gestão de Eventos
            </h2>
            <p className="text-blue-100 text-lg">
              Simplifique a administração da sua igreja com ferramentas profissionais
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer do lado esquerdo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-100">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Mais de 100 igrejas confiam em nossa plataforma</span>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-3">
            {/* Logo mobile */}
            <div className="lg:hidden mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-2">
              <Calendar className="w-9 h-9 text-white" />
            </div>

            <CardTitle className="text-2xl text-center">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-center">
              Entre com sua conta para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
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
                <span className="bg-card px-2 text-muted-foreground">ou continue com email</span>
              </div>
            </div> */}

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
                    className="pl-10"
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
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              {error && (
                <div className="text-red-500 text-sm text-center mt-2 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
            </form>
          </CardContent>

          {/* <CardFooter className="flex flex-col space-y-4">
            <Separator />
            <div className="w-full">
              <p className="text-sm text-muted-foreground mb-3 text-center">
                Credenciais para demonstração:
              </p>
              <div className="grid gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@igreja.com', '123456')}
                  disabled={isLoading}
                  className="flex justify-between items-center px-3 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  <span className="font-semibold text-blue-700">Admin</span>
                  <span className="text-gray-600">admin@igreja.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('pastor@igreja.com', '123456')}
                  disabled={isLoading}
                  className="flex justify-between items-center px-3 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 hover:border-indigo-300 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  <span className="font-semibold text-indigo-700">Pastor</span>
                  <span className="text-gray-600">pastor@igreja.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('membro@igreja.com', '123456')}
                  disabled={isLoading}
                  className="flex justify-between items-center px-3 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all disabled:opacity-50"
                >
                  <span className="font-semibold text-purple-700">Membro</span>
                  <span className="text-gray-600">membro@igreja.com</span>
                </button>
              </div>
            </div>
          </CardFooter> */}
        </Card>
      </div>
    </div>
  );
}
