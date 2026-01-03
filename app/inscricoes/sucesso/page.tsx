'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, MapPin, DollarSign, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function SucessoContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const memberName = searchParams.get('member') || 'Membro';
  const eventTitle = searchParams.get('event') || 'Evento';
  const eventDate = searchParams.get('date');
  const eventLocation = searchParams.get('location');
  const eventPrice = searchParams.get('price');

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: string | null) => {
    if (!price) return 'Gratuito';
    const numPrice = parseFloat(price);
    if (numPrice === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numPrice);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-8 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 animate-in zoom-in duration-700 delay-150" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Inscrição Confirmada!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Parabéns, {memberName}! Sua inscrição foi realizada com sucesso.
          </p>
        </div>

        {/* Event Details Card */}
        <Card className="mb-6 border-2 border-green-200 dark:border-green-800 shadow-xl animate-in slide-in-from-bottom duration-700">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Detalhes do Evento
            </CardTitle>
            <CardDescription className="text-base">
              Informações sobre sua inscrição
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Event Title */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Evento</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {eventTitle}
              </p>
            </div>

            {/* Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventDate && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data e Hora</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(eventDate)}
                    </p>
                  </div>
                </div>
              )}

              {eventLocation && (
                <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Local</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {eventLocation}
                    </p>
                  </div>
                </div>
              )}

              {eventPrice && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg md:col-span-2">
                  <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor</p>
                    <p className="font-medium text-gray-900 dark:text-white text-xl">
                      {formatPrice(eventPrice)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Status: Aguardando Pagamento
                </p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Sua inscrição está confirmada! Complete o pagamento para garantir sua participação no evento.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-6 animate-in slide-in-from-bottom duration-700 delay-200">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  Aguarde o contato da equipe para instruções de pagamento
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  Após o pagamento, você receberá a confirmação final por email
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  Compareça no dia e horário marcados. Até lá!
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Payment Section */}
        {eventPrice && parseFloat(eventPrice) > 0 && (
          <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 shadow-xl animate-in slide-in-from-bottom duration-700 delay-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Realizar Pagamento
              </CardTitle>
              <CardDescription className="text-base">
                Complete o pagamento para confirmar sua participação
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Valor Total: {formatPrice(eventPrice)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Pague com segurança através do Stripe
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                >
                  <Link href="#">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Ir para Checkout Stripe
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom duration-700 delay-300">
          <Button
            asChild
            variant="outline"
            className="flex-1"
          >
            <Link href="/inscricoes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Fazer Outra Inscrição
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Link href="/inscricoes">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
        </div>

        {/* Footer Message */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Em caso de dúvidas, entre em contato com a administração do evento.
        </p>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  );
}
