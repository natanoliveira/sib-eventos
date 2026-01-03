'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 p-6 text-center">
      <div className="text-6xl font-bold text-pink-700">404</div>
      <p className="text-lg text-muted-foreground">
        Página não encontrada.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-white hover:from-pink-600 hover:to-purple-700"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
