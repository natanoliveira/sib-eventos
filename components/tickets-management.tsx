"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Download, QrCode, Mail, Printer, Calendar, MapPin, User, Loader2 } from "lucide-react";
import { toastSuccess, toastError } from '../lib/toast';
import { apiClient } from '../lib/api-client';
import { DataTablePagination } from "./data-display/data-table-pagination";
import { DataTableHeader } from "./data-display/data-table-header";

export function TicketsManagement() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [searchTerm, selectedEvent, selectedStatus, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEvent, selectedStatus]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedEvent !== 'all') params.event = selectedEvent;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const response = await apiClient.getTickets(params);
      setTickets(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      toastError('Erro ao carregar tickets');
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'USED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ACTIVE': 'Ativo',
      'PENDING': 'Pendente',
      'CANCELLED': 'Cancelado',
      'USED': 'Usado'
    };
    return labels[status] || status;
  };

  const getPaymentLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PAID': 'Pago',
      'PENDING': 'Pendente',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  };

  const handlePreviewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsPreviewOpen(true);
  };

  const handleSendTicket = (ticketId: string) => {
    // Mock send functionality
    console.log('Sending ticket:', ticketId);
    toastSuccess('Passaporte enviado por email com sucesso!');
  };

  const handlePrintTicket = (ticketId: string) => {
    console.log('Printing ticket:', ticketId);
    window.print();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const events = [...new Set(tickets.map(ticket => ticket.event?.title).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div>
        <h2>Gerenciamento de Passaportes</h2>
        <p className="text-muted-foreground">
          Visualize e gerencie os passaportes/boletos emitidos para os eventos
        </p>
      </div>

      {/* Filters */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou ID do passaporte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200"
              />
            </div>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full md:w-[200px] border-blue-200">
                <SelectValue placeholder="Evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Eventos</SelectItem>
                {events.map(event => (
                  <SelectItem key={event} value={event}>{event}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[150px] border-blue-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
                <SelectItem value="Usado">Usado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="border-blue-200">
        <CardHeader>
          <DataTableHeader
            title="Lista de Passaportes"
            totalItems={totalItems}
            itemLabel="passaportes"
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
                      <TableHead>ID / Participante</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => {
                      const memberName = ticket.person?.name || 'N/A';
                      const memberEmail = ticket.person?.email || 'N/A';
                      const eventTitle = ticket.event?.title || 'N/A';
                      const eventDate = ticket.event?.startDate;
                      const eventLocation = ticket.event?.location || 'N/A';
                      const paymentStatus = ticket.invoice?.status || 'PENDING';

                      return (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-blue-900 text-sm">{ticket.ticketNumber || ticket.id}</div>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8 border border-blue-200">
                                  <AvatarImage src="" alt={memberName} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800 text-xs">
                                    {memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm">{memberName}</div>
                                  <div className="text-xs text-muted-foreground">{memberEmail}</div>
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm text-blue-900">{eventTitle}</div>
                              {eventDate && (
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(eventDate).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {eventLocation}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className="border-blue-200">
                                {ticket.ticketType || 'Padrão'}
                              </Badge>
                              {ticket.event?.price && (
                                <div className="text-sm text-blue-900">
                                  R$ {ticket.event.price.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={getPaymentStatusColor(paymentStatus)}>
                              {getPaymentLabel(paymentStatus)}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusLabel(ticket.status)}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50"
                                onClick={() => handlePreviewTicket(ticket)}
                              >
                                <QrCode className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50"
                                onClick={() => handleSendTicket(ticket.id)}
                              >
                                <Mail className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50"
                                onClick={() => handlePrintTicket(ticket.id)}
                              >
                                <Printer className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50"
                              >
                                <Download className="h-4 w-4 text-blue-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {tickets.map((ticket) => {
                  const memberName = ticket.person?.name || 'N/A';
                  const memberEmail = ticket.person?.email || 'N/A';
                  const eventTitle = ticket.event?.title || 'N/A';
                  const eventDate = ticket.event?.startDate;
                  const eventLocation = ticket.event?.location || 'N/A';
                  const paymentStatus = ticket.invoice?.status || 'PENDING';

                  return (
                    <Card key={ticket.id} className="border-blue-200">
                      <CardContent className="p-4">
                        {/* Header com Avatar */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 border-2 border-blue-200">
                              <AvatarImage src="" alt={memberName} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800">
                                {memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-blue-900 font-medium">{memberName}</div>
                              <div className="text-xs text-muted-foreground break-all">{memberEmail}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${getPaymentStatusColor(paymentStatus)} text-xs`}>
                                  {getPaymentLabel(paymentStatus)}
                                </Badge>
                                <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                                  {getStatusLabel(ticket.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detalhes */}
                        <div className="space-y-2 mb-4">
                          <div className="text-sm flex items-center">
                            <QrCode className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="text-blue-900">{ticket.ticketNumber || ticket.id}</span>
                          </div>
                          <div className="text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div>
                              <div className="text-blue-900">{eventTitle}</div>
                              {eventDate && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(eventDate).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                            {eventLocation}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="border-blue-200">
                              {ticket.ticketType || 'Padrão'}
                            </Badge>
                            {ticket.event?.price && (
                              <div className="text-sm font-medium text-blue-900">
                                R$ {ticket.event.price.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => handlePreviewTicket(ticket)}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleSendTicket(ticket.id)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => handlePrintTicket(ticket.id)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

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
            </>
          )}
        </CardContent>
      </Card>

      {/* Ticket Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Visualização do Passaporte</DialogTitle>
            <DialogDescription>
              Pré-visualização do passaporte do evento
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (() => {
            const memberName = selectedTicket.person?.name || 'N/A';
            const eventTitle = selectedTicket.event?.title || 'N/A';
            const eventLocation = selectedTicket.event?.location || 'N/A';
            const eventDate = selectedTicket.event?.startDate;

            return (
              <div className="space-y-4">
                {/* Ticket Design */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg text-blue-900">{eventTitle}</h3>
                      <p className="text-sm text-muted-foreground">{eventLocation}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{memberName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">ID: {selectedTicket.ticketNumber || selectedTicket.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {eventDate ? new Date(eventDate).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </div>

                    {/* Mock QR Code */}
                    <div className="flex justify-center">
                      <div className="w-24 h-24 bg-white border-2 border-blue-200 rounded flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-blue-600" />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Apresente este QR Code na entrada do evento
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSendTicket(selectedTicket.id)}
                    className="flex-1 border-blue-200 hover:bg-blue-50"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar por Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePrintTicket(selectedTicket.id)}
                    className="flex-1 border-blue-200 hover:bg-blue-50"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
