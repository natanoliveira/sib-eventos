"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { TicketTypesFieldArray } from './ticket-types-field-array';
import { createEventSchema } from '@/lib/validations/event.schema';

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

  // React Hook Form setup para criar evento
  const createForm = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      capacity: 100,
      category: 'Geral',
      ticketTypes: [
        { name: 'Ingresso Padrão', description: '', price: 0, capacity: null }
      ],
    },
  });

  const editForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      capacity: 0,
      price: null,
      category: 'Geral',
      ticketTypes: [],
    },
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = createForm.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      const eventData = {
        ...data,
        capacity: Number(data.capacity),
      };

      await apiClient.createEvent(eventData);
      toastSuccess('Evento criado com sucesso!');

      setIsAddDialogOpen(false);
      createForm.reset();

      await loadEvents();
    } catch (error: any) {
      toastError(error.message || 'Erro ao criar evento');
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleEditClick = (event: any) => {
    setSelectedEvent(event);
    const startDate = event.startDate
      ? new Date(event.startDate).toISOString().slice(0, 16)
      : '';
    const endDate = event.endDate
      ? new Date(event.endDate).toISOString().slice(0, 16)
      : '';

    editForm.reset({
      title: event.title || '',
      description: event.description || '',
      startDate,
      endDate,
      location: event.location || '',
      capacity: event.capacity ?? 0,
      price: event.price ?? null,
      category: event.category || 'Geral',
      ticketTypes: (event.ticketTypes || []).map((ticketType: any) => ({
        id: ticketType.id,
        name: ticketType.name,
        description: ticketType.description || '',
        price: ticketType.price ?? 0,
        capacity: ticketType.capacity ?? null,
      })),
    });
    setIsEditDialogOpen(true);
  };

  // Calcula quais ticketTypes têm inscrições
  const getTicketTypesWithRegistrations = () => {
    if (!selectedEvent || !selectedEvent.ticketTypes) return [];

    return selectedEvent.ticketTypes
      .filter((tt: any) => tt._count?.eventMemberships > 0)
      .map((tt: any) => tt.id);
  };

  const syncTicketTypes = async (eventId: string, ticketTypes: any[]) => {
    const existingTicketTypes = selectedEvent?.ticketTypes || [];
    const existingById = new Map(
      existingTicketTypes.map((ticketType: any) => [ticketType.id, ticketType])
    );

    const normalizeTicketType = (ticketType: any) => ({
      name: ticketType.name?.trim() || '',
      description: ticketType.description?.trim() || '',
      price: Number(ticketType.price) || 0,
      capacity: ticketType.capacity === null || ticketType.capacity === undefined
        ? null
        : Number(ticketType.capacity),
    });

    const incomingWithId = ticketTypes.filter((ticketType) => ticketType.id);
    const incomingIds = new Set(incomingWithId.map((ticketType) => ticketType.id));

    const toCreate = ticketTypes.filter((ticketType) => !ticketType.id);
    const toDelete = existingTicketTypes.filter(
      (ticketType: any) => !incomingIds.has(ticketType.id)
    );

    const toUpdate = incomingWithId.filter((ticketType) => {
      const existing = existingById.get(ticketType.id);
      if (!existing) return true;

      const existingNormalized = normalizeTicketType(existing);
      const incomingNormalized = normalizeTicketType(ticketType);

      return (
        existingNormalized.name !== incomingNormalized.name ||
        existingNormalized.description !== incomingNormalized.description ||
        existingNormalized.price !== incomingNormalized.price ||
        existingNormalized.capacity !== incomingNormalized.capacity
      );
    });

    for (const ticketType of toCreate) {
      await apiClient.createTicketType(eventId, normalizeTicketType(ticketType));
    }

    for (const ticketType of toUpdate) {
      await apiClient.updateTicketType(
        eventId,
        ticketType.id,
        normalizeTicketType(ticketType)
      );
    }

    // Deletar ticketTypes removidos
    // Backend valida individualmente se cada tipo pode ser deletado
    for (const ticketType of toDelete) {
      try {
        await apiClient.deleteTicketType(eventId, ticketType.id);
      } catch (error: any) {
        // Se o backend bloquear a deleção, mostra erro mas continua com outros
        console.error(`Erro ao deletar ticketType ${ticketType.id}:`, error);
        toastError(`Não foi possível remover "${ticketType.name}": ${error.message}`);
      }
    }
  };

  const handleUpdateEvent = editForm.handleSubmit(async (data) => {
    if (!selectedEvent) return;

    try {
      setIsSubmitting(true);

      const price =
        data.price === null || Number.isNaN(data.price) ? null : Number(data.price);
      const capacity = Number.isNaN(data.capacity)
        ? selectedEvent.capacity
        : Number(data.capacity);

      const updateData = {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        location: data.location,
        capacity,
        price,
        category: data.category,
      };

      await apiClient.updateEvent(selectedEvent.id, updateData);
      await syncTicketTypes(selectedEvent.id, data.ticketTypes || []);
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
  });

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
        
        {/* Inclusão de evento */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Preencha as informações do evento que será realizado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEvent}>
              <div className="grid gap-4 py-4 max-h-[calc(90vh-200px)] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Evento *</Label>
                  <Input
                    id="title"
                    {...createForm.register('title')}
                    placeholder="Ex: Encontro de Jovens 2024"
                  />
                  {createForm.formState.errors.title && (
                    <p className="text-sm text-red-500">
                      {createForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    {...createForm.register('description')}
                    placeholder="Descreva o evento..."
                    rows={3}
                  />
                  {createForm.formState.errors.description && (
                    <p className="text-sm text-red-500">
                      {createForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      {...createForm.register('startDate')}
                    />
                    {createForm.formState.errors.startDate && (
                      <p className="text-sm text-red-500">
                        {createForm.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      {...createForm.register('endDate')}
                    />
                    {createForm.formState.errors.endDate && (
                      <p className="text-sm text-red-500">
                        {createForm.formState.errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Local *</Label>
                  <Input
                    id="location"
                    {...createForm.register('location')}
                    placeholder="Ex: Centro de Convenções"
                  />
                  {createForm.formState.errors.location && (
                    <p className="text-sm text-red-500">
                      {createForm.formState.errors.location.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidade Total *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      {...createForm.register('capacity', { valueAsNumber: true })}
                      placeholder="500"
                    />
                    {createForm.formState.errors.capacity && (
                      <p className="text-sm text-red-500">
                        {createForm.formState.errors.capacity.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={createForm.watch('category')}
                      onValueChange={(value) => createForm.setValue('category', value)}
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
                    {createForm.formState.errors.category && (
                      <p className="text-sm text-red-500">
                        {createForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <TicketTypesFieldArray
                    control={createForm.control}
                    errors={createForm.formState.errors}
                    register={createForm.register}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    createForm.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSubmitting ? 'Salvando' : 'Criar Evento'}
                </Button>
              </DialogFooter>
            </form>
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
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          A partir de R$ {formatCurrencyBr(Math.min(...event.ticketTypes.map((tt: any) => tt.price)))}
                        </span>
                      </div>
                      <div className="pl-6 space-y-0.5">
                        {event.ticketTypes.map((ticketType: any) => (
                          <div key={ticketType.id} className="text-xs text-muted-foreground">
                            {ticketType.name}: R$ {formatCurrencyBr(ticketType.price)}
                            {ticketType.capacity && (
                              <span className="ml-1">
                                ({ticketType._count?.eventMemberships || 0}/{ticketType.capacity})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" />
                      R$ {formatCurrencyBr(event.price)}
                    </div>
                  )}
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Atualize as informações do evento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEvent}>
            <div className="grid gap-4 py-4 max-h-[calc(90vh-200px)] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título do Evento</Label>
                <Input
                  id="edit-title"
                  {...editForm.register('title')}
                  placeholder="Ex: Encontro de Jovens 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  {...editForm.register('description')}
                  placeholder="Descreva o evento..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">Data de Início</Label>
                  <Input
                    id="edit-startDate"
                    type="datetime-local"
                    {...editForm.register('startDate')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">Data de Término</Label>
                  <Input
                    id="edit-endDate"
                    type="datetime-local"
                    {...editForm.register('endDate')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Local</Label>
                <Input
                  id="edit-location"
                  {...editForm.register('location')}
                  placeholder="Ex: Centro de Convenções"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacidade</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    {...editForm.register('capacity', { valueAsNumber: true })}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço (R$)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    {...editForm.register('price', {
                      valueAsNumber: true,
                      setValueAs: (value) =>
                        value === '' || value === null ? null : Number(value),
                    })}
                    placeholder="89.90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={editForm.watch('category')}
                    onValueChange={(value) => editForm.setValue('category', value)}
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
              <div className="border-t pt-4">
                <TicketTypesFieldArray
                  control={editForm.control}
                  errors={editForm.formState.errors}
                  register={editForm.register}
                  allowRemove={true}
                  allowEdit={true}
                  ticketTypesWithRegistrations={getTicketTypesWithRegistrations()}
                  eventStatus={selectedEvent?.status}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
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
