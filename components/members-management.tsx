"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Search, Plus, Edit2, Trash2, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";
import { apiClient } from '../lib/api-client';

export function MembersManagement() {
  const [members, setMembers] = useState<any[]>([]);
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

  useEffect(() => {
    loadMembers();
  }, [searchTerm, selectedCategory]);

  const loadMembers = async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const data = await apiClient.getMembers(params);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
      // Fallback to mock data for demo
      setMembers([
        {
          id: "1",
          name: "Maria Silva",
          email: "maria.silva@email.com",
          phone: "(11) 99999-9999",
          address: "São Paulo, SP",
          category: "Jovem",
          status: "ACTIVE",
          joinDate: "2023-01-15",
          events: 5
        },
        {
          id: "2",
          name: "João Santos",
          email: "joao.santos@email.com",
          phone: "(11) 88888-8888",
          address: "Campinas, SP",
          category: "Adulto",
          status: "ACTIVE",
          joinDate: "2022-06-20",
          events: 8
        }
      ]);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || member.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddMember = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.createMember(newMember);
      setIsAddDialogOpen(false);
      setNewMember({ name: '', email: '', phone: '', address: '', category: '', notes: '', image: '' });
      await loadMembers();
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setNewMember({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      category: member.category || '',
      notes: member.notes || '',
      image: member.image || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = async () => {
    try {
      setIsUpdating(true);
      await apiClient.updateMember(selectedMember.id, newMember);
      setIsEditDialogOpen(false);
      setSelectedMember(null);
      setNewMember({ name: '', email: '', phone: '', address: '', category: '', notes: '', image: '' });
      await loadMembers();
    } catch (error) {
      console.error('Error updating member:', error);
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
      await apiClient.deleteMember(selectedMember.id);
      setSelectedMember(null);
      await loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Líder': return 'bg-indigo-100 text-indigo-800';
      case 'Adulto': return 'bg-blue-100 text-blue-800';
      case 'Jovem': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' || status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusLabel = (status: string) => {
    return status === 'ACTIVE' ? 'Ativo' : status === 'INACTIVE' ? 'Inativo' : status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2>Gerenciamento de Membros</h2>
          <p className="text-muted-foreground">
            Cadastre e gerencie os membros da sua igreja
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
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
                      <SelectItem value="Jovem">Jovem</SelectItem>
                      <SelectItem value="Adulto">Adulto</SelectItem>
                      <SelectItem value="Líder">Líder</SelectItem>
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
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  Cadastrar Membro
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <SelectItem value="Jovem">Jovem</SelectItem>
                <SelectItem value="Adulto">Adulto</SelectItem>
                <SelectItem value="Líder">Líder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Lista de Membros</CardTitle>
          <CardDescription>
            {filteredMembers.length} membros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {filteredMembers.map((member) => (
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
                        <div className="text-blue-900">{member.name}</div>
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
                      {member.category}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(member.status)}>
                      {getStatusLabel(member.status)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-blue-900">
                    {member.events} eventos
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-blue-50"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50"
                        onClick={() => handleDeleteMember(member)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                    <SelectItem value="Jovem">Jovem</SelectItem>
                    <SelectItem value="Adulto">Adulto</SelectItem>
                    <SelectItem value="Líder">Líder</SelectItem>
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
            {isSubmitting ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando
              </Button>
            ) : (
              <Button
                onClick={handleUpdateMember}
                disabled={isUpdating}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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
