"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Search, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, CreditCard, Zap, FileText } from "lucide-react";

const mockPayments = [
  {
    id: "PAY001",
    memberName: "Maria Silva",
    memberEmail: "maria.silva@email.com",
    eventTitle: "Encontro de Jovens 2024",
    amount: 89.90,
    method: "PIX",
    status: "Aprovado",
    date: "2024-10-15",
    transactionId: "PIX123456789",
    dueDate: "2024-10-20"
  },
  {
    id: "PAY002",
    memberName: "João Santos", 
    memberEmail: "joao.santos@email.com",
    eventTitle: "Encontro de Jovens 2024",
    amount: 129.90,
    method: "Cartão de Crédito",
    status: "Aprovado",
    date: "2024-10-20",
    transactionId: "CC987654321",
    dueDate: "2024-10-25"
  },
  {
    id: "PAY003",
    memberName: "Ana Costa",
    memberEmail: "ana.costa@email.com", 
    eventTitle: "Retiro Espiritual",
    amount: 120.00,
    method: "PIX",
    status: "Pendente",
    date: "2024-10-25",
    transactionId: "PIX555666777",
    dueDate: "2024-11-01"
  },
  {
    id: "PAY004",
    memberName: "Pedro Oliveira",
    memberEmail: "pedro.oliveira@email.com",
    eventTitle: "Retiro Espiritual", 
    amount: 120.00,
    method: "Cartão de Crédito",
    status: "Recusado",
    date: "2024-10-22",
    transactionId: "CC111222333",
    dueDate: "2024-10-27"
  }
];

const paymentStats = [
  {
    title: "Receita Total",
    value: "R$ 15.400",
    icon: DollarSign,
    change: "+12.5%",
    color: "text-green-600"
  },
  {
    title: "Pagamentos Aprovados",
    value: "234",
    icon: CheckCircle,
    change: "+8.2%",
    color: "text-green-600"
  },
  {
    title: "Pendentes",
    value: "23",
    icon: Clock,
    change: "-2.1%",
    color: "text-yellow-600"
  },
  {
    title: "Recusados",
    value: "8",
    icon: XCircle,
    change: "+1.5%",
    color: "text-red-600"
  }
];

export function PaymentsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesMethod = selectedMethod === 'all' || payment.method === selectedMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Recusado': return 'bg-red-100 text-red-800';
      case 'Cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'PIX': return <Zap className="w-4 h-4" />;
      case 'Cartão de Crédito': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  const handleRefundPayment = (paymentId: string) => {
    // Mock refund functionality
    console.log('Processing refund for:', paymentId);
    alert('Estorno processado com sucesso!');
  };

  const totalRevenue = mockPayments
    .filter(p => p.status === 'Aprovado')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2>Gerenciamento de Pagamentos</h2>
        <p className="text-muted-foreground">
          Acompanhe e gerencie todos os pagamentos dos eventos
        </p>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {paymentStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-pink-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-pink-900">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className={`mr-1 h-3 w-3 ${stat.color}`} />
                  <span className={stat.color}>{stat.change}</span>
                  <span className="ml-1">em relação ao mês anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Progress */}
      <Card className="border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-900">Meta de Receita Mensal</CardTitle>
          <CardDescription>
            Progresso em relação à meta de R$ 20.000
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>R$ {totalRevenue.toFixed(2)} arrecadados</span>
              <span>77% da meta</span>
            </div>
            <Progress value={77} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-pink-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou ID do pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-pink-200"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[150px] border-pink-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Recusado">Recusado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-full md:w-[170px] border-pink-200">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Métodos</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-900">Histórico de Pagamentos</CardTitle>
          <CardDescription>
            {filteredPayments.length} transações encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID / Participante</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-pink-900 text-sm">{payment.id}</div>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 border border-pink-200">
                          <AvatarImage src="" alt={payment.memberName} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-pink-800 text-xs">
                            {payment.memberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm">{payment.memberName}</div>
                          <div className="text-xs text-muted-foreground">{payment.memberEmail}</div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-pink-900">{payment.eventTitle}</div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-pink-900">
                      R$ {payment.amount.toFixed(2)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(payment.method)}
                      <span className="text-sm">{payment.method}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {new Date(payment.date).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-pink-50"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <FileText className="h-4 w-4 text-pink-600" />
                      </Button>
                      {payment.status === 'Aprovado' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-red-50"
                          onClick={() => handleRefundPayment(payment.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
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

      {/* Payment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
            <DialogDescription>
              Informações completas da transação
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">ID do Pagamento</label>
                  <div className="text-pink-900">{selectedPayment.id}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Participante</label>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-10 w-10 border border-pink-200">
                    <AvatarImage src="" alt={selectedPayment.memberName} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-pink-800">
                      {selectedPayment.memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedPayment.memberName}</div>
                    <div className="text-sm text-muted-foreground">{selectedPayment.memberEmail}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Evento</label>
                  <div className="text-pink-900">{selectedPayment.eventTitle}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Valor</label>
                  <div className="text-pink-900">R$ {selectedPayment.amount.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Método de Pagamento</label>
                  <div className="flex items-center space-x-2">
                    {getMethodIcon(selectedPayment.method)}
                    <span>{selectedPayment.method}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Data do Pagamento</label>
                  <div>{new Date(selectedPayment.date).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">ID da Transação</label>
                <div className="bg-muted p-2 rounded text-sm font-mono">{selectedPayment.transactionId}</div>
              </div>
              
              {selectedPayment.status === 'Aprovado' && (
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => handleRefundPayment(selectedPayment.id)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Processar Estorno
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
