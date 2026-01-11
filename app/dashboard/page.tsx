'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { DashboardOverview } from '@/components/dashboard-overview';
import { MembersManagement } from '@/components/members-management';
import { EventsManagement } from '@/components/events-management';
import { EventRegistrations } from '@/components/event-registrations';
import { InvoiceGenerator } from '@/components/invoice-generator';
import { InstallmentsManagement } from '@/components/installments-management';
import { TicketsManagement } from '@/components/tickets-management';
import { PaymentsManagement } from '@/components/payments-management';
import { UserProfile } from '@/components/user-profile';
import { UsersManagement } from '@/components/users-management';
import { Loader2 } from 'lucide-react';

type TabId =
  | 'dashboard'
  | 'members'
  | 'events'
  | 'registrations'
  | 'invoices'
  | 'installments'
  | 'tickets'
  | 'payments'
  | 'reports'
  | 'settings'
  | 'profile';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setUser({ name: parsed.name || 'Usuário', email: parsed.email || '' });
    } catch {
      router.replace('/login');
    }
    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  const content = useMemo(() => {
    switch (activeTab) {
      case 'members':
        return <MembersManagement />;
      case 'events':
        return <EventsManagement />;
      case 'registrations':
        return <EventRegistrations />;
      case 'invoices':
        return <InvoiceGenerator />;
      case 'installments':
        return <InstallmentsManagement />;
      case 'tickets':
        return <TicketsManagement />;
      case 'payments':
        return <PaymentsManagement />;
      case 'profile':
        return <UserProfile onClose={() => setActiveTab('dashboard')} />;
      case 'settings':
        return <UsersManagement />;
      case 'reports':
      case 'dashboard':
      default:
        return <DashboardOverview />;
    }
  }, [activeTab]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <DashboardHeader
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        onLogout={handleLogout}
        onProfileClick={() => setActiveTab('profile')}
        userName={user.name}
        userEmail={user.email}
      />

      <div className="flex">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab as TabId);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{content}</div>
        </main>
      </div>
    </div>
  );
}
