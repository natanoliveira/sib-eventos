"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Plus, UserCheck, UserX, Calendar, X, Loader2, Mail, Phone } from "lucide-react";
import { ConfirmDialog } from "./feedback/confirm-dialog";
import { apiClient } from '../lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toastError, toastSuccess, toastWarning } from '@/lib/toast';
import { DataTablePagination } from "./data-display/data-table-pagination";
import { DataTableHeader } from "./data-display/data-table-header";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  price: number;
  status: string;
  maxCapacity?: number;
  _count?: {
    memberships: number;
  };
}

export function EventRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [newRegistration, setNewRegistration] = useState({
    personId: '',
    userId: '',
    eventId: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);


  useEffect(() => {
    loadData();
  }, [searchTerm, selectedEvent, selectedStatus, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEvent, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedEvent !== 'all') params.eventId = selectedEvent;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const [regsData, eventsData] = await Promise.all([
        apiClient.getEventRegistrations(params),
        apiClient.getEvents({})
      ]);

      setRegistrations(regsData.data);
      setTotalItems(regsData.total);
      setTotalPages(regsData.totalPages);
      setEvents(eventsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar membros (autocomplete)
  useEffect(() => {
    // if (!mounted) return;
    searchMembers();
    const debounce = setTimeout(searchMembers, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchMembers = async () => {
    if (searchQuery.length <= 2) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const response = await fetch(`/api/members/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchQuery(member.name);
    setShowSearchResults(false);
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleAddRegistration = async () => {
    if (!selectedMember || !newRegistration.eventId) return;

    try {
      setIsSubmitting(true);
      // Passa o ID do membro selecionado e o ID do evento
      // O user.id (usuário logado) pode ser passado como createdByUserId se a API suportar
      await apiClient.registerMemberToEvent(selectedMember.id, user?.id ?? '', newRegistration.eventId);
      toastSuccess('Inscrição realizada com sucesso!');
      setNewRegistration({ personId: '', userId: '', eventId: '' });
      setSelectedMember(null);
      setSearchQuery('');
      setIsAddDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toastWarning(error.message, { title: 'Erro ao realizar inscrição' });
    } finally {
      newRegistration.eventId = '';
      setIsSubmitting(false);
      // setIsAddDialogOpen(false);
    }
  };

  const handleConfirmRegistration = async (regId: string) => {
    try {
      setIsSubmitting(true);
      await apiClient.updateEventRegistration(regId, { status: 'CONFIRMED' });
      await loadData();
    } catch (error) {
      console.error('Error confirming registration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.updateEventRegistration(selectedRegistration.id, { status: 'CANCELLED' });
      toastSuccess('Inscricao cancelada com sucesso!');
      setSelectedRegistration(null);
      await loadData();
    } catch (error: any) {
      console.error('Error cancelling registration:', error);
      toastError(error.message, { title: 'Erro ao cancelar inscrição' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'PENDING': return 'Pendente';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const openModalDialogRegistration = () => {
    setIsAddDialogOpen(true);
    handleClearMember();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2>Inscrições em Eventos</h2>
          <p className="text-muted-foreground">
            Gerencie as inscrições dos membros nos eventos
          </p>
        </div>

        {/* Modal de Nova inscrição */}
        <Dialog open={isAddDialogOpen} onOpenChange={openModalDialogRegistration}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Inscrição
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Inscrever Membro em Evento</DialogTitle>
              <DialogDescription>
                Selecione o membro e o evento para realizar a inscrição
              </DialogDescription>
            </DialogHeader>

            {/* Autocomplete de pessoas */}
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <div className="relative" ref={searchRef}>
                  {loadingSearch && (
                    <div className="text-sm text-gray-500 mt-2">Buscando...</div>
                  )}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Nome, email ou telefone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                      className="pl-10 pr-10"
                    />
                    {selectedMember && (
                      <button
                        onClick={handleClearMember}
                        className="absolute right-3 top-1/4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                      {searchResults.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Previne o blur do input
                            handleSelectMember(member);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.email}
                            {member.phone && ` • ${member.phone}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* <Select 
                  value={newRegistration.userId} 
                  onValueChange={(value) => setNewRegistration({...newRegistration, userId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Evento</Label>
                <Select
                  value={newRegistration.eventId}
                  onValueChange={(value) => setNewRegistration({ ...newRegistration, eventId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.startDate).toLocaleDateString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  onClick={handleAddRegistration}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedMember || !newRegistration.eventId}
                >
                  Inscrever Membro
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
                placeholder="Buscar por membro ou evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200"
              />
            </div>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full md:w-[250px] border-blue-200">
                <SelectValue placeholder="Filtrar por evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Eventos</SelectItem>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[200px] border-blue-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card className="border-blue-200">
        <CardHeader>
          <DataTableHeader
            title="Lista de Inscrições"
            totalItems={totalItems}
            itemLabel="inscrições"
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Data de Inscrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 border-2 border-blue-200">
                              <AvatarImage src={reg.person.image} alt={reg.person.name} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800">
                                {reg.person.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-blue-900">{reg.person.name}</div>
                              <div className="text-sm text-muted-foreground">{reg.person.email}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                            <div>
                              <div className="text-blue-900">{reg.event.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(reg.event.date || reg.event.startDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {new Date(reg.registeredAt).toLocaleDateString('pt-BR')}
                        </TableCell>

                        <TableCell>
                          <Badge className={getStatusColor(reg.status)}>
                            {getStatusLabel(reg.status)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {reg.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 hover:bg-green-50"
                                onClick={() => handleConfirmRegistration(reg.id)}
                              >
                                <UserCheck className="h-4 w-4 text-green-600 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            {reg.status !== 'CANCELLED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedRegistration(reg);
                                  setIsCancelDialogOpen(true);
                                }}
                              >
                                <UserX className="h-4 w-4 text-red-600 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
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
                {registrations.map((reg) => {
                  const memberName = reg.person.name;
                  const memberEmail = reg.person.email;
                  const memberPhone = reg.person.phone;
                  const eventTitle = reg.event.title;
                  const eventDate = reg.event.date || reg.event.startDate;

                  return (
                    <Card key={reg.id} className="border-blue-200">
                      <CardContent className="p-4">
                        {/* Header com Avatar */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 border-2 border-blue-200">
                              <AvatarImage src={reg.person.image} alt={memberName} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800">
                                {memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-blue-900 font-medium">{memberName}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${getStatusColor(reg.status)} text-xs`}>
                                  {getStatusLabel(reg.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detalhes */}
                        <div className="space-y-2 mb-4">
                          <div className="text-sm flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="break-all">{memberEmail}</span>
                          </div>
                          {memberPhone && (
                            <div className="text-sm flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span>{memberPhone}</span>
                            </div>
                          )}
                          <div className="text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div>
                              <div className="text-blue-900">{eventTitle}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(eventDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Inscrito em: {new Date(reg.registeredAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 pt-4 border-t">
                          {reg.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                              onClick={() => handleConfirmRegistration(reg.id)}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Confirmar
                            </Button>
                          )}
                          {reg.status !== 'CANCELLED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedRegistration(reg);
                                setIsCancelDialogOpen(true);
                              }}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancelar Inscrição"
        description={`Tem certeza de que deseja cancelar a inscrição de ${selectedRegistration?.person.name} no evento ${selectedRegistration?.event.title}?`}
        confirmText="Cancelar Inscrição"
        onConfirm={handleCancelRegistration}
        destructive
      />
    </div>
  );
}
