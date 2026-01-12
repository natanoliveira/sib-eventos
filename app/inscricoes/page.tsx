'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, MapPin, DollarSign, Users, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

export default function InscricoesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);
  const [eventTicketTypes, setEventTicketTypes] = useState<{[eventId: string]: any[]}>({});
  const [selectedTicketTypes, setSelectedTicketTypes] = useState<{[eventId: string]: string}>({});
  const searchRef = useRef<HTMLDivElement>(null);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Buscar eventos abertos
  useEffect(() => {
    if (!mounted) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?status=ACTIVE');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Erro ao carregar eventos', {
          description: 'Não foi possível carregar a lista de eventos',
        });
      }
    };
    fetchEvents();
  }, [mounted]);

  // Buscar tipos de ingresso para cada evento
  useEffect(() => {
    if (!mounted || events.length === 0) return;

    const fetchTicketTypes = async () => {
      for (const event of events) {
        try {
          const response = await fetch(`/api/events/${event.id}/ticket-types`);
          if (response.ok) {
            const ticketTypes = await response.json();
            setEventTicketTypes(prev => ({ ...prev, [event.id]: ticketTypes }));

            // Auto-selecionar o primeiro tipo de ingresso se houver apenas um
            if (ticketTypes.length === 1) {
              setSelectedTicketTypes(prev => ({ ...prev, [event.id]: ticketTypes[0].id }));
            }
          }
        } catch (error) {
          console.error(`Error fetching ticket types for event ${event.id}:`, error);
        }
      }
    };
    fetchTicketTypes();
  }, [mounted, events]);

  // Buscar membros (autocomplete)
  useEffect(() => {
    if (!mounted) return;

    const searchMembers = async () => {
      if (searchQuery.length <= 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
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
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMembers, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery, mounted]);

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

  const handleRegister = async (event: Event) => {
    if (!selectedMember) {
      toast.error('Atenção', {
        description: 'Por favor, selecione um membro antes de se inscrever',
      });
      return;
    }

    const ticketTypeId = selectedTicketTypes[event.id];
    if (!ticketTypeId) {
      toast.error('Atenção', {
        description: 'Por favor, selecione um tipo de ingresso',
      });
      return;
    }

    setRegistering(event.id);

    // Loading toast
    const loadingToast = toast.loading('Processando inscrição...', {
      description: `Inscrevendo ${selectedMember.name} no evento ${event.title}`,
    });

    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: selectedMember.id,
          eventId: event.id,
          ticketTypeId: ticketTypeId,
        }),
      });

      const data = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok) {
        // Success toast
        toast.success('Inscrição Confirmada! 🎉', {
          description: `${selectedMember.name} foi inscrito(a) no evento ${event.title}`,
          duration: 3000,
        });

        // Redirect to success page after 1.5 seconds
        setTimeout(() => {
          const params = new URLSearchParams({
            member: selectedMember.name,
            event: event.title,
            date: event.startDate,
            location: event.location,
            price: event.price.toString(),
          });
          router.push(`/inscricoes/sucesso?${params.toString()}`);
        }, 1500);
      } else {
        // Error toast with specific message
        toast.error('Erro na Inscrição', {
          description: data.error || 'Não foi possível completar a inscrição',
          duration: 5000,
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Erro de Conexão', {
        description: 'Não foi possível conectar ao servidor. Tente novamente.',
        duration: 5000,
      });
    } finally {
      setRegistering(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      ACTIVE: { label: 'Aberto', variant: 'default' },
      COMPLETED: { label: 'Encerrado', variant: 'secondary' },
      CANCELLED: { label: 'Cancelado', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Inscrições em Eventos
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Encontre eventos abertos e realize sua inscrição
          </p>
        </div>

        {/* Search Member */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Membro</CardTitle>
              <CardDescription>
                Digite seu nome, email ou telefone para buscar seu cadastro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        onClick={() => handleSelectMember(member)}
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

                {loading && (
                  <div className="text-sm text-gray-500 mt-2">Buscando...</div>
                )}
              </div>

              {selectedMember && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-900 dark:text-green-100">
                        {selectedMember.name}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {selectedMember.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Eventos Disponíveis
          </h2>

          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum evento aberto no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      {getStatusBadge(event.status)}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    {event.endDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>até {formatDate(event.endDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-lg text-gray-900 dark:text-white">
                        {formatPrice(event.price)}
                      </span>
                    </div>
                    {event.maxCapacity && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Users className="h-4 w-4" />
                        <span>
                          {event._count?.memberships || 0} / {event.maxCapacity} inscritos
                        </span>
                      </div>
                    )}

                    {/* Ticket Type Selection */}
                    {eventTicketTypes[event.id]?.length > 0 && (
                      <div className="pt-4 border-t space-y-2">
                        <Label htmlFor={`ticket-${event.id}`} className="text-sm font-medium">
                          Tipo de Ingresso
                        </Label>
                        <Select
                          value={selectedTicketTypes[event.id] || ''}
                          onValueChange={(value) => setSelectedTicketTypes(prev => ({ ...prev, [event.id]: value }))}
                        >
                          <SelectTrigger id={`ticket-${event.id}`}>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTicketTypes[event.id].map((ticketType) => (
                              <SelectItem key={ticketType.id} value={ticketType.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{ticketType.name}</span>
                                  <span className="text-sm text-gray-500">
                                    {formatPrice(ticketType.price)}
                                    {ticketType.capacity && ` • ${ticketType._count?.eventMemberships || 0}/${ticketType.capacity} vagas`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleRegister(event)}
                      disabled={!selectedMember || registering === event.id || !selectedTicketTypes[event.id]}
                      className="w-full"
                    >
                      {registering === event.id ? 'Inscrevendo...' : 'Inscrever-se'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
