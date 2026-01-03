import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIB Eventos - Sistema de Gestão de Eventos',
  description: 'Sistema completo para gestão de eventos religiosos com autenticação, pagamentos via Stripe e controle de participantes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
