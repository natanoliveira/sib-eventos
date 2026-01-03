"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Download, QrCode, Mail, Printer, Calendar, MapPin, User } from "lucide-react";
import { toastSuccess } from '../lib/toast';

const mockTickets = [
  {
    id: "EVT001-001",
    memberName: "Maria Silva",
    memberEmail: "maria.silva@email.com",
    eventTitle: "Encontro de Jovens 2024",
    eventDate: "2024-11-15",
    eventLocation: "Centro de Convenções",
    ticketType: "Padrão",
    price: 89.90,
    paymentStatus: "Pago",
    status: "Ativo",
    issueDate: "2024-10-15",
    qrCode: "QR123456789"
  },
  {
    id: "EVT001-002", 
    memberName: "João Santos",
    memberEmail: "joao.santos@email.com",
    eventTitle: "Encontro de Jovens 2024",
    eventDate: "2024-11-15",
    eventLocation: "Centro de Convenções",
    ticketType: "VIP",
    price: 129.90,
    paymentStatus: "Pago",
    status: "Ativo",
    issueDate: "2024-10-20",
    qrCode: "QR987654321"
  },
  {
    id: "EVT002-001",
    memberName: "Ana Costa",
    memberEmail: "ana.costa@email.com",
    eventTitle: "Retiro Espiritual",
    eventDate: "2024-12-02",
    eventLocation: "Sítio da Paz",
    ticketType: "Padrão",
    price: 120.00,
    paymentStatus: "Pendente",
    status: "Pendente",
    issueDate: "2024-10-25",
    qrCode: "QR555666777"
  }
];

export function TicketsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === 'all' || ticket.eventTitle === selectedEvent;
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      case 'Usado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    // Mock print functionality
    console.log('Printing ticket:', ticketId);
    window.print();
  };

  const events = [...new Set(mockTickets.map(ticket => ticket.eventTitle))];

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
          <CardTitle className="text-blue-900">Lista de Passaportes</CardTitle>
          <CardDescription>
            {filteredTickets.length} passaportes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-blue-900 text-sm">{ticket.id}</div>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 border border-blue-200">
                          <AvatarImage src="" alt={ticket.memberName} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800 text-xs">
                            {ticket.memberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm">{ticket.memberName}</div>
                          <div className="text-xs text-muted-foreground">{ticket.memberEmail}</div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-blue-900">{ticket.eventTitle}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(ticket.eventDate).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {ticket.eventLocation}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="border-blue-200">
                        {ticket.ticketType}
                      </Badge>
                      <div className="text-sm text-blue-900">
                        R$ {ticket.price.toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getPaymentStatusColor(ticket.paymentStatus)}>
                      {ticket.paymentStatus}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
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
              ))}
            </TableBody>
          </Table>
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
          
          {selectedTicket && (
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
                    <h3 className="text-lg text-blue-900">{selectedTicket.eventTitle}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTicket.eventLocation}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{selectedTicket.memberName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">ID: {selectedTicket.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(selectedTicket.eventDate).toLocaleDateString('pt-BR')}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
