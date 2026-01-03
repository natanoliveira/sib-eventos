import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  CreditCard, 
  Ticket, 
  BarChart3, 
  Settings,
  Plus,
  X,
  UserCheck,
  FileText,
  CalendarCheck
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'members', icon: Users, label: 'Membros' },
  { id: 'events', icon: Calendar, label: 'Eventos' },
  { id: 'registrations', icon: UserCheck, label: 'Inscrições' },
  { id: 'invoices', icon: FileText, label: 'Faturas' },
  { id: 'installments', icon: CalendarCheck, label: 'Parcelas' },
  { id: 'tickets', icon: Ticket, label: 'Passaportes' },
  { id: 'payments', icon: CreditCard, label: 'Pagamentos' },
  { id: 'reports', icon: BarChart3, label: 'Relatórios' },
  { id: 'settings', icon: Settings, label: 'Configurações' },
];

export function DashboardSidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-gradient-to-b from-pink-50 to-purple-50 border-r border-pink-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-pink-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
            <span className="text-pink-900">EventoIgreja</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden hover:bg-pink-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 mb-6">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeTab === item.id 
                      ? "bg-pink-100 text-pink-900 hover:bg-pink-200" 
                      : "text-pink-700 hover:bg-pink-100"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}