'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-6 text-center">
      <div className="text-6xl font-bold text-blue-700">404</div>
      <p className="text-lg text-muted-foreground">
        Página não encontrada.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white hover:from-blue-600 hover:to-indigo-700"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
