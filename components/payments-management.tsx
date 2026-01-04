"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Search, DollarSign, CheckCircle, XCircle, Clock, CreditCard, Zap, FileText, Loader2 } from "lucide-react";
import { toastSuccess, toastError } from '../lib/toast';
import { apiClient } from '../lib/api-client';

export function PaymentsManagement() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPayments();
      setPayments(data);
    } catch (error: any) {
      toastError('Erro ao carregar pagamentos');
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (payment.installment?.invoice?.person?.name || '').toLowerCase().includes(searchLower) ||
      (payment.installment?.invoice?.person?.email || '').toLowerCase().includes(searchLower) ||
      payment.id.toLowerCase().includes(searchLower);
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
    console.log('Processing refund for:', paymentId);
    toastSuccess('Estorno processado com sucesso!');
  };

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const approvedCount = payments.filter(p => p.status === 'PAID').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const failedCount = payments.filter(p => p.status === 'FAILED').length;

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
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">R$ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pagamentos Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{approvedCount}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Recusados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-900">{failedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou ID do pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[150px] border-blue-200">
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
              <SelectTrigger className="w-full md:w-[170px] border-blue-200">
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
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Histórico de Pagamentos</CardTitle>
          <CardDescription>
            {filteredPayments.length} transações encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
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
                {filteredPayments.map((payment) => {
                  const memberName = payment.installment?.invoice?.person?.name || 'N/A';
                  const memberEmail = payment.installment?.invoice?.person?.email || 'N/A';
                  const eventTitle = payment.installment?.invoice?.event?.title || 'N/A';

                  return (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-blue-900 text-sm">{payment.id}</div>
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
                    <div className="text-sm text-blue-900">{eventTitle}</div>
                  </TableCell>

                  <TableCell>
                    <div className="text-blue-900">
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
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-blue-50"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <FileText className="h-4 w-4 text-blue-600" />
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
                  );
                })}
              </TableBody>
            </Table>
          )}
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
          
          {selectedPayment && (() => {
            const memberName = selectedPayment.installment?.invoice?.person?.name || 'N/A';
            const memberEmail = selectedPayment.installment?.invoice?.person?.email || 'N/A';
            const eventTitle = selectedPayment.installment?.invoice?.event?.title || 'N/A';

            return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">ID do Pagamento</label>
                  <div className="text-blue-900">{selectedPayment.id}</div>
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
                  <Avatar className="h-10 w-10 border border-blue-200">
                    <AvatarImage src="" alt={memberName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-200 to-indigo-200 text-blue-800">
                      {memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{memberName}</div>
                    <div className="text-sm text-muted-foreground">{memberEmail}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Evento</label>
                  <div className="text-blue-900">{eventTitle}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Valor</label>
                  <div className="text-blue-900">R$ {selectedPayment.amount.toFixed(2)}</div>
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
                  <div>{selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleDateString('pt-BR') : 'N/A'}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">ID da Transação Stripe</label>
                <div className="bg-muted p-2 rounded text-sm font-mono">{selectedPayment.stripePaymentIntentId || selectedPayment.stripeChargeId || 'N/A'}</div>
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
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
