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
import { Search, Plus, UserCheck, UserX, Calendar } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";
import { apiClient } from '../lib/api-client';

export function EventRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [newRegistration, setNewRegistration] = useState({
    userId: '',
    eventId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [regsData, membersData, eventsData] = await Promise.all([
        apiClient.getEventRegistrations(),
        apiClient.getMembers({}),
        apiClient.getEvents({})
      ]);
      setRegistrations(regsData);
      setMembers(membersData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === 'all' || reg.eventId === selectedEvent;
    const matchesStatus = selectedStatus === 'all' || reg.status === selectedStatus;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const handleAddRegistration = async () => {
    try {
      await apiClient.registerMemberToEvent(newRegistration.userId, newRegistration.eventId);
      setIsAddDialogOpen(false);
      setNewRegistration({ userId: '', eventId: '' });
      await loadData();
    } catch (error) {
      console.error('Error adding registration:', error);
    }
  };

  const handleConfirmRegistration = async (regId: string) => {
    try {
      await apiClient.updateEventRegistration(regId, { status: 'CONFIRMED' });
      await loadData();
    } catch (error) {
      console.error('Error confirming registration:', error);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await apiClient.deleteEventRegistration(selectedRegistration.id);
      setSelectedRegistration(null);
      await loadData();
    } catch (error) {
      console.error('Error cancelling registration:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2>Inscrições em Eventos</h2>
          <p className="text-muted-foreground">
            Gerencie as inscrições dos membros nos eventos
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member">Membro</Label>
                <Select 
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
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event">Evento</Label>
                <Select 
                  value={newRegistration.eventId} 
                  onValueChange={(value) => setNewRegistration({...newRegistration, eventId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.date || event.startDate).toLocaleDateString('pt-BR')}
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
              <Button 
                onClick={handleAddRegistration}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newRegistration.userId || !newRegistration.eventId}
              >
                Inscrever Membro
              </Button>
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
          <CardTitle className="text-blue-900">Lista de Inscrições</CardTitle>
          <CardDescription>
            {filteredRegistrations.length} inscrições encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border-2 border-blue-200">
                        <AvatarImage src={reg.user.image} alt={reg.user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800">
                          {reg.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-blue-900">{reg.user.name}</div>
                        <div className="text-sm text-muted-foreground">{reg.user.email}</div>
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
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancelar Inscrição"
        description={`Tem certeza de que deseja cancelar a inscrição de ${selectedRegistration?.user.name} no evento ${selectedRegistration?.event.title}?`}
        confirmText="Cancelar Inscrição"
        onConfirm={handleCancelRegistration}
        destructive
      />
    </div>
  );
}
