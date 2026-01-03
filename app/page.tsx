import { redirect } from 'next/navigation';

export default function Home() {
  // Redirecionar para dashboard ou login
  redirect('/login');
}
