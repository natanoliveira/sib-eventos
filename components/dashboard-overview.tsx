import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Users, Calendar, CreditCard, Ticket, TrendingUp, MapPin } from "lucide-react";

const stats = [
  {
    title: "Total de Membros",
    value: "1,234",
    icon: Users,
    change: "+5.2%",
    changeType: "positive" as const
  },
  {
    title: "Eventos Ativos",
    value: "3",
    icon: Calendar,
    change: "+1",
    changeType: "positive" as const
  },
  {
    title: "Receita do Mês",
    value: "R$ 15.400",
    icon: CreditCard,
    change: "+12.5%",
    changeType: "positive" as const
  },
  {
    title: "Passaportes Emitidos",
    value: "892",
    icon: Ticket,
    change: "+23.1%",
    changeType: "positive" as const
  }
];

const upcomingEvents = [
  {
    id: 1,
    title: "Encontro de Jovens 2024",
    date: "15-17 Nov 2024",
    location: "Centro de Convenções",
    registrations: 245,
    capacity: 500,
    status: "Inscrições Abertas"
  },
  {
    id: 2,
    title: "Retiro Espiritual",
    date: "02-04 Dez 2024",
    location: "Sítio da Paz",
    registrations: 89,
    capacity: 150,
    status: "Inscrições Abertas"
  },
  {
    id: 3,
    title: "Conferência de Liderança",
    date: "20-22 Jan 2025",
    location: "Auditório Principal",
    registrations: 156,
    capacity: 300,
    status: "Em Breve"
  }
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2>Visão Geral</h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho dos seus eventos e membros
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
      
      {/* Upcoming Events */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Próximos Eventos</CardTitle>
          <CardDescription>
            Eventos programados e suas estatísticas de inscrição
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.map((event) => {
            const progressPercentage = (event.registrations / event.capacity) * 100;
            
            return (
              <div key={event.id} className="p-4 rounded-lg border border-blue-100 bg-blue-50/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-blue-900">{event.title}</h4>
                      <Badge 
                        variant={event.status === "Inscrições Abertas" ? "default" : "secondary"}
                        className={event.status === "Inscrições Abertas" ? "bg-green-100 text-green-800" : ""}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
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
          })}
        </CardContent>
      </Card>
    </div>
  );
}