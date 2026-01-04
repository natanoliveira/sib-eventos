"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Users, Calendar, CreditCard, Ticket, TrendingUp, MapPin, Loader2 } from "lucide-react";
import { apiClient } from '../lib/api-client';
import { toastError } from '../lib/toast';

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeEvents: 0,
    monthRevenue: 0,
    totalTickets: 0,
    revenueChange: '+0.0%',
    revenueChangeType: 'positive' as const,
    ticketsChange: '+0.0%',
    ticketsChangeType: 'positive' as const,
    upcomingEvents: [] as any[]
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toastError('Erro ao carregar estatísticas do dashboard');
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total de Pessoas",
      value: stats.totalMembers.toString(),
      icon: Users,
      change: "+0%",
      changeType: "positive" as const
    },
    {
      title: "Eventos Ativos",
      value: stats.activeEvents.toString(),
      icon: Calendar,
      change: "+0",
      changeType: "positive" as const
    },
    {
      title: "Receita do Mês",
      value: `R$ ${stats.monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: CreditCard,
      change: stats.revenueChange,
      changeType: stats.revenueChangeType
    },
    {
      title: "Passaportes Emitidos",
      value: stats.totalTickets.toString(),
      icon: Ticket,
      change: stats.ticketsChange,
      changeType: stats.ticketsChangeType
    }
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2>Visão Geral</h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho dos seus eventos e membros
        </p>
      </div>
      
      {/* Stats Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-blue-900">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                    <span className="text-green-600">{stat.change}</span>
                    <span className="ml-1">em relação ao mês anterior</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Upcoming Events */}
      {!loading && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Próximos Eventos</CardTitle>
            <CardDescription>
              Eventos programados e suas estatísticas de inscrição
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento programado
              </div>
            ) : (
              stats.upcomingEvents.map((event) => {
                const progressPercentage = (event.registrations / event.capacity) * 100;
                const startDate = new Date(event.startDate);
                const endDate = event.endDate ? new Date(event.endDate) : null;
                const dateRange = endDate
                  ? `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`
                  : startDate.toLocaleDateString('pt-BR');

                const getStatusLabel = (status: string) => {
                  switch (status) {
                    case 'ACTIVE': return 'Inscrições Abertas';
                    case 'DRAFT': return 'Em Breve';
                    case 'FULL': return 'Lotado';
                    case 'ENDED': return 'Encerrado';
                    case 'CANCELLED': return 'Cancelado';
                    default: return status;
                  }
                };

                return (
                  <div key={event.id} className="p-4 rounded-lg border border-blue-100 bg-blue-50/30">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-blue-900">{event.title}</h4>
                          <Badge
                            variant={event.status === "ACTIVE" ? "default" : "secondary"}
                            className={event.status === "ACTIVE" ? "bg-green-100 text-green-800" : ""}
                          >
                            {getStatusLabel(event.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {dateRange}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.location || 'Local a definir'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Inscrições</span>
                        <span className="text-blue-900">{event.registrations} / {event.capacity}</span>
                      </div>
                      <Progress
                        value={progressPercentage}
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}