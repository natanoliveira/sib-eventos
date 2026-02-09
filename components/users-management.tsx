"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, UserPlus, Edit2, Shield, ShieldCheck, Users, Loader2, Ban } from "lucide-react";
import { toastSuccess, toastError } from '../lib/toast';
import { apiClient } from '../lib/api-client';
import { ConfirmDialog } from './feedback/confirm-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const availablePermissions = [
  { key: "events.create", label: "Criar Eventos" },
  { key: "events.edit", label: "Editar Eventos" },
  { key: "events.delete", label: "Deletar Eventos" },
  { key: "members.view", label: "Visualizar Pessoa" },
  { key: "members.create", label: "Criar Pessoa" },
  { key: "members.edit", label: "Editar Pessoa" },
  { key: "dashboard.view", label: "Acessar Dashboard" },
  { key: "tickets.view", label: "Visualizar Tickets" },
  { key: "tickets.create", label: "Criar Tickets" },
  { key: "tickets.cancel", label: "Cancelar Tickets" },
  { key: "payments.view", label: "Visualizar Pagamentos" },
];

export function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInactivateDialogOpen, setIsInactivateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
    permissions: {} as Record<string, boolean>
  });

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'MEMBER',
    permissions: {} as Record<string, boolean>
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      const usersWithPermissions = await Promise.all(
        data.map(async (user) => {
          if (typeof user.permissions === 'object') {
            return user;
          }

          try {
            return await apiClient.getUser(user.id);
          } catch (error) {
            console.error('Error loading user permissions:', error);
            return user;
          }
        })
      );
      setUsers(usersWithPermissions);
    } catch (error: any) {
      toastError('Erro ao carregar usuários');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.createUser(newUser);
      toastSuccess('Usuário criado com sucesso!');
      setIsAddDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'MEMBER',
        permissions: {}
      });
      await loadUsers();
    } catch (error: any) {
      toastError(error.message || 'Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: { ...user.permissions } as Record<string, boolean>
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.updateUser(selectedUser?.id, editUser);
      toastSuccess('Usuário atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error: any) {
      toastError(error.message || 'Erro ao atualizar usuário');
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleDeleteClick = (user: any) => {
  //   setSelectedUser(user);
  //   setIsDeleteDialogOpen(true);
  // };

  // const handleDeleteUser = async () => {
  //   try {
  //     setIsSubmitting(true);
  //     await apiClient.deleteUser(selectedUser?.id);
  //     toastSuccess('Usuário removido com sucesso!');
  //     setIsDeleteDialogOpen(false);
  //     setSelectedUser(null);
  //     await loadUsers();
  //   } catch (error: any) {
  //     toastError(error.message || 'Erro ao remover usuário');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

    const handleInactivateClick = (user: any) => {
    setSelectedUser(user);
    setIsInactivateDialogOpen(true);
  };

  const handleInactivateUser = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.updateUser(selectedUser?.id,{status: 'INACTIVE'});
      toastSuccess('Usuário inativado com sucesso!');
      setIsInactivateDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error: any) {
      toastError(error.message || 'Erro ao inativar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'admin':
        return <Badge className="bg-indigo-100 text-indigo-800"><ShieldCheck className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'LEADER':
      case 'leader':
        return <Badge className="bg-blue-100 text-blue-800"><Shield className="w-3 h-3 mr-1" />Líder</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Users className="w-3 h-3 mr-1" />Membro</Badge>;
    }
  };

  const togglePermission = (permission: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditUser(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: !prev.permissions[permission]
        }
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: !prev.permissions[permission]
        }
      }));
    }
  };

  const setAllPermissions = (isChecked: boolean, isEdit: boolean = false) => {
    const updatedPermissions = availablePermissions.reduce((acc, perm) => {
      acc[perm.key] = isChecked;
      return acc;
    }, {} as Record<string, boolean>);

    if (isEdit) {
      setEditUser(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          ...updatedPermissions
        }
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          ...updatedPermissions
        }
      }));
    }
  };

  const PermissionsGrid = ({ permissions, isEdit }: { permissions: Record<string, boolean>, isEdit: boolean }) => {
    const allChecked = availablePermissions.every((perm) => !!permissions[perm.key]);

    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2 col-span-2">
          <Switch
            id={'todos'}
            checked={allChecked}
            onCheckedChange={(checked) => setAllPermissions(checked, isEdit)}
          />
          <Label htmlFor={'todos'} className="text-sm cursor-pointer" onClick={() => setAllPermissions(!allChecked, isEdit)}>
            Marcar todas
          </Label>
        </div>
        {availablePermissions.map((perm) => (
          <div key={perm.key} className="flex items-center space-x-2">
            <Switch
              id={perm.key}
              checked={!!permissions[perm.key]}
              onCheckedChange={() => togglePermission(perm.key, isEdit)}
            />
            <Label htmlFor={perm.key} className="text-sm cursor-pointer" onClick={() => togglePermission(perm.key, isEdit)}>
              {perm.label}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie usuários do sistema e suas permissões
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário ao sistema e configure suas permissões
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="joao@igreja.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="LEADER">Líder</SelectItem>
                      <SelectItem value="MEMBER">Membro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissões</Label>
                <Card>
                  <CardContent className="pt-4">
                    <PermissionsGrid permissions={newUser.permissions} isEdit={false} />
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              {isSubmitting ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando
              </Button>
            ) : (
              <Button
                onClick={handleAddUser}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Criar Usuário
              </Button>
            )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <Card className="border-blue-200">
          <CardContent className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-blue-900">{user.name}</h3>
                          {getRoleBadge(user.role)}
                          {user.status === 'INACTIVE' && <Badge variant="outline" className="border-red-200 text-red-600">Inativo</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.keys(user.permissions || {}).length} permissões configuradas
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 hover:bg-blue-50"
                        onClick={() => handleEditClick(user)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 hover:bg-red-50 text-red-600"
                            onClick={() => handleInactivateClick(user)}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Inativar usuário</p>
                        </TooltipContent>
                      </Tooltip>

                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card className="border-blue-200">
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg text-muted-foreground mb-2">Nenhum usuário encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Crie um novo usuário ou ajuste os filtros de busca
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações e permissões do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Função</Label>
              <Select
                value={editUser.role}
                onValueChange={(value) => setEditUser({...editUser, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="LEADER">Líder</SelectItem>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissões</Label>
              <Card>
                <CardContent className="pt-4">
                  <PermissionsGrid permissions={editUser.permissions} isEdit={true} />
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isInactivateDialogOpen}
        onOpenChange={setIsInactivateDialogOpen}
        title="Inativar usuário"
        description={
          selectedUser ? (
            <>
              Você está prestes a inativar o usuário {' '}
              <strong>{selectedUser?.name.toUpperCase() || 'N/A'}</strong>. {'\n'}Esta ação não pode ser desfeita.
            </>
          ) : (
            ''
          )
        }
        confirmText="Sim, inativar usuário"
        onConfirm={handleInactivateUser}
        destructive
      />

      {/* <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleInactivateUser}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a inativar o usuário "{selectedUser?.name}". Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleInactivateUser}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? 'Removendo...' : 'Sim, remover usuário'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}
