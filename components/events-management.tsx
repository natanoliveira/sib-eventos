"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Calendar, Plus, Edit2, Trash2, Users, MapPin, DollarSign, Loader2 } from "lucide-react";
import { apiClient } from '../lib/api-client';
import { toastSuccess, toastError } from '../lib/toast';
import { formatCurrencyBr } from '@/lib/utils';
import { DataTablePagination } from "./data-display/data-table-pagination";

export function EventsManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    capacity: '',
    price: '',
    category: ''
  });
  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    capacity: '',
    price: '',
    category: ''
  });

  useEffect(() => {
    loadEvents();
  }, [searchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.getEvents(params);
      setEvents(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      toastError('Erro ao carregar eventos');
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    try {
      setIsSubmitting(true);

      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        startDate: newEvent.date,
        endDate: newEvent.endDate || undefined,
        location: newEvent.location,
        capacity: parseInt(newEvent.capacity),
        price: parseFloat(newEvent.price),
        category: newEvent.category
      };

      await apiClient.createEvent(eventData);
      toastSuccess('Evento criado com sucesso!');

      setIsAddDialogOpen(false);
      setNewEvent({
        title: '', description: '', date: '', endDate: '',
        location: '', capacity: '', price: '', category: ''
      });

      await loadEvents();
    } catch (error: any) {
      toastError(error.message || 'Erro ao criar evento');
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (event: any) => {
    setSelectedEvent(event);
    setEditEvent({
      title: event.title,
      description: event.description || '',
      date: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      location: event.location,
      capacity: event.capacity.toString(),
      price: event.price.toString(),
      category: event.category || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      setIsSubmitting(true);

      const updateData = {
        title: editEvent.title,
        description: editEvent.description,
        startDate: editEvent.date,
        endDate: editEvent.endDate || undefined,
        location: editEvent.location,
        capacity: parseInt(editEvent.capacity),
        price: parseFloat(editEvent.price),
        category: editEvent.category
      };

      await apiClient.updateEvent(selectedEvent.id, updateData);
      toastSuccess('Evento atualizado com sucesso!');

      setIsEditDialogOpen(false);
      setSelectedEvent(null);

      await loadEvents();
    } catch (error: any) {
      toastError(error.message || 'Erro ao atualizar evento');
      console.error('Error updating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setIsSubmitting(true);

      await apiClient.deleteEvent(selectedEvent.id);
      toastSuccess('Evento removido com sucesso!');

      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);

      await loadEvents();
    } catch (error: any) {
      toastError(error.message || 'Erro ao remover evento');
      console.error('Error deleting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Em Breve': return 'bg-blue-100 text-blue-800';
      case 'Finalizado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Jovens': return 'bg-indigo-100 text-indigo-800';
      case 'Liderança': return 'bg-orange-100 text-orange-800';
      case 'Geral': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2>Gerenciamento de Eventos</h2>
          <p className="text-muted-foreground">
            Crie e gerencie eventos da sua igreja
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Preencha as informações do evento que será realizado
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Evento</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ex: Encontro de Jovens 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Descreva o evento..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data de Início</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Ex: Centro de Convenções"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                    placeholder="89.90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jovens">Jovens</SelectItem>
                      <SelectItem value="Adultos">Adultos</SelectItem>
                      <SelectItem value="Liderança">Liderança</SelectItem>
                      <SelectItem value="Geral">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddEvent}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSubmitting ? 'Salvando...' : 'Criar Evento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : events.map((event) => {
          const registered = event._count?.memberships || 0;
          const progressPercentage = (registered / event.capacity) * 100;
          const formatDate = (dateStr: string) => {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          };

          return (
            <Card key={event.id} className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-blue-900 text-lg">{event.title}</CardTitle>
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(event.startDate)} {event.endDate && `- ${formatDate(event.endDate)}`}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-2" />
                    R$ {formatCurrencyBr(event.price)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Inscrições
                    </span>
                    <span className="text-blue-900">
                      {registered} / {event.capacity}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleEditClick(event)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 hover:bg-red-50 text-red-600"
                    onClick={() => handleDeleteClick(event)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && events.length === 0 && (
        <Card className="border-blue-200">
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg text-muted-foreground mb-2">Nenhum evento encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Crie seu primeiro evento ou ajuste os filtros de busca
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && events.length > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          loading={loading}
        />
      )}

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Atualize as informações do evento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título do Evento</Label>
              <Input
                id="edit-title"
                value={editEvent.title}
                onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                placeholder="Ex: Encontro de Jovens 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editEvent.description}
                onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                placeholder="Descreva o evento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Data de Início</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editEvent.date}
                  onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Data de Término</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editEvent.endDate}
                  onChange={(e) => setEditEvent({ ...editEvent, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Local</Label>
              <Input
                id="edit-location"
                value={editEvent.location}
                onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                placeholder="Ex: Centro de Convenções"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacidade</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={editEvent.capacity}
                  onChange={(e) => setEditEvent({ ...editEvent, capacity: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editEvent.price}
                  onChange={(e) => setEditEvent({ ...editEvent, price: e.target.value })}
                  placeholder="89.90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <Select
                  value={editEvent.category}
                  onValueChange={(value) => setEditEvent({ ...editEvent, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jovens">Jovens</SelectItem>
                    <SelectItem value="Adultos">Adultos</SelectItem>
                    <SelectItem value="Liderança">Liderança</SelectItem>
                    <SelectItem value="Geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateEvent}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a remover o evento "{selectedEvent?.title}". Esta ação marcará o evento como removido (deleção lógica), mas os dados serão preservados no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Removendo...' : 'Sim, remover evento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
