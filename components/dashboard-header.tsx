import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Bell, Settings, LogOut, Menu, User, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  userName: string;
  userEmail: string;
}

export function DashboardHeader({ onMenuToggle, onLogout, onProfileClick, userName, userEmail }: DashboardHeaderProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const confirmLogout = () => {
    setIsSigningOut(true);
    // Aguarda 2 segundos antes de sair exibindo loading no botão
    setTimeout(() => {
      setIsSigningOut(false);
      setLogoutOpen(false);
      onLogout();
    }, 2000);
  };

  return (
    <>
      <header className="border-b border-blue-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden mr-2 hover:bg-blue-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2 mr-auto">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-full"></div>
          </div>
          <h1 className="hidden md:block text-blue-900">EventoIgreja</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-blue-50">
            <Bell className="h-5 w-5 text-blue-700" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
              2
            </Badge>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50">
                <Avatar className="h-10 w-10 border-2 border-blue-200">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onProfileClick}
                className="hover:bg-blue-50"
              >
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-50">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLogoutOpen(true)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
      </header>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado da plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSigningOut}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              disabled={isSigningOut}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSigningOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSigningOut ? 'Saindo...' : 'Sair do sistema'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
