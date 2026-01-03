"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Calendar, Plus, Edit2, Trash2, Users, MapPin, DollarSign } from "lucide-react";

const mockEvents = [
  {
    id: 1,
    title: "Encontro de Jovens 2024",
    description: "Evento especial para jovens com palestras e atividades",
    date: "2024-11-15",
    endDate: "2024-11-17",
    location: "Centro de Convenções",
    capacity: 500,
    registered: 245,
    price: 89.90,
    status: "Ativo",
    category: "Jovens"
  },
  {
    id: 2,
    title: "Retiro Espiritual",
    description: "Fim de semana de reflexão e oração",
    date: "2024-12-02",
    endDate: "2024-12-04", 
    location: "Sítio da Paz",
    capacity: 150,
    registered: 89,
    price: 120.00,
    status: "Ativo",
    category: "Geral"
  },
  {
    id: 3,
    title: "Conferência de Liderança",
    description: "Treinamento para líderes e ministros",
    date: "2025-01-20",
    endDate: "2025-01-22",
    location: "Auditório Principal", 
    capacity: 300,
    registered: 156,
    price: 150.00,
    status: "Em Breve",
    category: "Liderança"
  }
];

export function EventsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const filteredEvents = mockEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEvent = async () => {
    try {
      setIsSubmitting(true);
      // Mock add functionality
      console.log('Adding event:', newEvent);
      setIsAddDialogOpen(false);
      setNewEvent({
        title: '', description: '', date: '', endDate: '', 
        location: '', capacity: '', price: '', category: ''
      });
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
      case 'Jovens': return 'bg-purple-100 text-purple-800';
      case 'Liderança': return 'bg-orange-100 text-orange-800';
      case 'Geral': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" disabled={isSubmitting}>
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
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Ex: Encontro de Jovens 2024"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
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
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
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
                    onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
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
                    onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                    placeholder="89.90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={newEvent.category} 
                    onValueChange={(value) => setNewEvent({...newEvent, category: value})}
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
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {isSubmitting ? 'Salvando...' : 'Criar Evento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-pink-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-pink-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          const progressPercentage = (event.registered / event.capacity) * 100;
          const formatDate = (dateStr: string) => {
            return new Date(dateStr).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          };
          
          return (
            <Card key={event.id} className="border-pink-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-pink-900 text-lg">{event.title}</CardTitle>
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
                    {formatDate(event.date)} - {formatDate(event.endDate)}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-2" />
                    R$ {event.price.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Inscrições
                    </span>
                    <span className="text-pink-900">
                      {event.registered} / {event.capacity}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 border-pink-200 hover:bg-pink-50">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="border-pink-200">
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg text-muted-foreground mb-2">Nenhum evento encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Crie seu primeiro evento ou ajuste os filtros de busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
