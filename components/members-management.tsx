"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Search, Plus, Edit2, Trash2, Phone, Mail, MapPin, Loader2, AlertCircle } from "lucide-react";
import { ConfirmDialog } from "./feedback/confirm-dialog";
import { apiClient } from '../lib/api-client';
import { MEMBER_CATEGORY_OPTIONS, formatMemberCategory, parseMemberCategoryInput } from '../lib/member-categories';
import { toastError, toastSuccess } from '@/lib/toast';
import { DataTablePagination } from './data-display/data-table-pagination';
import { DataTableHeader } from './data-display/data-table-header';
import { usePermissions } from '../lib/use-permissions';
import { PERMISSIONS } from '../lib/permissions';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function MembersManagement() {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    notes: '',
    image: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadMembers();
  }, [searchTerm, selectedCategory, currentPage, itemsPerPage]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await apiClient.getMembers(params);
      setMembers(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };


  const handleAddMember = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.createMember(newMember);
      toastSuccess('Pessoa adicionada com sucesso!');
      setIsAddDialogOpen(false);
      setNewMember({ name: '', email: '', phone: '', address: '', category: '', notes: '', image: '' });
      await loadMembers();
    } catch (error: any) {
      toastError(error.message, { title: 'Erro ao adicionar pessoa' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = (member: any) => {
    const parsedCategory = parseMemberCategoryInput(member.category);
    const categoryValue =
      parsedCategory.isValid && parsedCategory.value !== undefined && parsedCategory.value !== null
        ? parsedCategory.value
        : '';

    setSelectedMember(member);
    setNewMember({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      category: categoryValue,
      notes: member.notes || '',
      image: member.image || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = async () => {
    try {
      setIsUpdating(true);
      await apiClient.updateMember(selectedMember.id, newMember);
      toastSuccess('Pessoa atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedMember(null);
      setNewMember({ name: '', email: '', phone: '', address: '', category: '', notes: '', image: '' });
      await loadMembers();
    } catch (error: any) {
      toastError(error.message, { title: 'Erro ao atualizar pessoa' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMember = (member: any) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMember = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.deleteMember(selectedMember.id);
      toastSuccess('Pessoa excluída com sucesso!');
      setSelectedMember(null);
      await loadMembers();
    } catch (error: any) {
      toastError(error.message, { title: 'Erro ao excluir pessoa' });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const label = formatMemberCategory(category) || category;
    switch (label) {
      case 'Membro Ativo': return 'bg-green-100 text-green-800';
      case 'Membro Regular': return 'bg-blue-100 text-blue-800';
      case 'Membro Novo': return 'bg-amber-100 text-amber-800';
      case 'Membro Visitante': return 'bg-purple-100 text-purple-800';
      case 'Visitante': return 'bg-gray-100 text-gray-800';
      case 'Adulto': return 'bg-sky-100 text-sky-800';
      case 'Jovem': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' || status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusLabel = (status: string) => {
    return status === 'ACTIVE' ? 'Ativo' : status === 'INACTIVE' ? 'Inativo' : status;
  };

  // Verificar permissão de visualização
  if (!hasPermission(PERMISSIONS.MEMBERS_VIEW)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para visualizar membros.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificar permissões para ações
  const canCreate = hasPermission(PERMISSIONS.MEMBERS_CREATE);
  const canEdit = hasPermission(PERMISSIONS.MEMBERS_EDIT);
  const canDelete = hasPermission(PERMISSIONS.MEMBERS_DELETE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2>Gerenciamento de Membros</h2>
          <p className="text-muted-foreground">
            Cadastre e gerencie os membros da sua igreja
          </p>
        </div>

        {canCreate && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Membro
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Membro</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo membro da igreja
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Ex: Maria Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newMember.category}
                    onValueChange={(value) => setNewMember({ ...newMember, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={newMember.address}
                  onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                  placeholder="Cidade, Estado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newMember.notes}
                  onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              {isSubmitting ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando
                </Button>
              ) : (
                <Button
                  onClick={handleAddMember}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Cadastrar Membro
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] border-blue-200">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {MEMBER_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listagem de Pessoas */}
      <Card className="border-blue-200">
        <CardHeader>
          <DataTableHeader
            title="Lista de Membros"
            totalItems={totalItems}
            itemLabel="membros"
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum membro encontrado
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Eventos</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 border-2 border-blue-200">
                              <AvatarImage src="" alt={member.name} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800">
                                {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-blue-900 font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {member.address}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm flex items-center">
                              <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                              {member.email}
                            </div>
                            <div className="text-sm flex items-center">
                              <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                              {member.phone}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={getCategoryColor(member.category)}>
                            {formatMemberCategory(member.category)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            {getStatusLabel(member.status)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-blue-900">
                          {member.events || 0} eventos
                        </TableCell>

                        <TableCell>
                          {(canEdit || canDelete) && (
                            <div className="flex items-center space-x-2">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-blue-50"
                                  onClick={() => handleEditMember(member)}
                                >
                                  <Edit2 className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-red-50"
                                  onClick={() => handleDeleteMember(member)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <DataTablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  loading={loading}
                />
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {members.map((member) => (
                  <Card key={member.id} className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-blue-200">
                            <AvatarImage src="" alt={member.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800">
                              {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-blue-900 font-medium">{member.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getCategoryColor(member.category)}>
                                {formatMemberCategory(member.category)}
                              </Badge>
                              <Badge className={getStatusColor(member.status)}>
                                {getStatusLabel(member.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-sm flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="break-all">{member.email}</span>
                        </div>
                        <div className="text-sm flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          {member.phone}
                        </div>
                        <div className="text-sm flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          {member.address}
                        </div>
                        <div className="text-sm text-blue-900 font-medium">
                          {member.events || 0} eventos participados
                        </div>
                      </div>

                      {(canEdit || canDelete) && (
                        <div className="flex items-center gap-2 pt-4 border-t">
                          {canEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleEditMember(member)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteMember(member)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

            </>
          )}
        </CardContent>
      </Card>


      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>
              Atualize as informações do membro
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <Select
                  value={newMember.category}
                  onValueChange={(value) => setNewMember({ ...newMember, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={newMember.address}
                onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                placeholder="Cidade, Estado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={newMember.notes}
                onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Cancelar
            </Button>
            {isUpdating ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando
              </Button>
            ) : (
              <Button
                onClick={handleUpdateMember}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Salvar Alterações
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir Membro"
        description={`Tem certeza de que deseja excluir ${selectedMember?.name}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        onConfirm={confirmDeleteMember}
        destructive
      />
    </div>
  );
}
