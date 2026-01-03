"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, DollarSign, Calendar, CheckCircle, AlertCircle, XCircle, CreditCard } from "lucide-react";
import { apiClient } from '../lib/api-client';
import { toastSuccess, toastError } from '../lib/toast';

export function InstallmentsManagement() {
  const [installments, setInstallments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const installmentsData = await apiClient.getInstallments({});
      setInstallments(installmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredInstallments = installments.filter(inst => {
    const matchesSearch = inst.payment?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inst.payment?.paymentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkAsPaid = async (installmentId: string) => {
    try {
      await apiClient.markInstallmentAsPaid(installmentId);
      await loadData();
    } catch (error) {
      console.error('Error marking installment as paid:', error);
    }
  };

  const handlePayWithStripe = async (installment: any) => {
    try {
      const { clientSecret } = await apiClient.createStripePaymentIntentForInstallment(installment.id);
      console.log('Stripe Payment Intent criado para parcela:', clientSecret);
      
      // For demo, just mark as paid
      await handleMarkAsPaid(installment.id);
      toastSuccess('Pagamento processado com sucesso via Stripe!');
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      toastError('Erro ao processar pagamento com Stripe.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'OVERDUE': return <XCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pago';
      case 'PENDING': return 'Pendente';
      case 'OVERDUE': return 'Vencido';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const calculateTotals = () => {
    const total = installments.reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
    const paid = installments.filter(inst => inst.status === 'PAID').reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
    const pending = installments.filter(inst => inst.status === 'PENDING').reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
    const overdue = installments.filter(inst => inst.status === 'OVERDUE').reduce((sum, inst) => sum + parseFloat(inst.amount || 0), 0);
    
    return { total, paid, pending, overdue };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2>Gerenciamento de Parcelas</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as parcelas de pagamento
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-900">R$ {totals.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total de parcelas
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-green-900">R$ {totals.paid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {installments.filter(i => i.status === 'PAID').length} parcelas pagas
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-yellow-900">R$ {totals.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {installments.filter(i => i.status === 'PENDING').length} parcelas pendentes
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Vencidas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-red-900">R$ {totals.overdue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {installments.filter(i => i.status === 'OVERDUE').length} parcelas vencidas
            </p>
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
                placeholder="Buscar por membro ou número de pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] border-blue-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="OVERDUE">Vencido</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Installments Table */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Lista de Parcelas</CardTitle>
          <CardDescription>
            {filteredInstallments.length} parcelas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pagamento</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstallments.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="text-blue-900">
                    {inst.payment?.paymentNumber || 'N/A'}
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="text-blue-900">{inst.payment?.user?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{inst.payment?.user?.email || ''}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-indigo-900">{inst.payment?.event?.title || 'N/A'}</div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="border-blue-200">
                      {inst.installmentNumber}/{inst.payment?.installments || 1}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-green-900">R$ {parseFloat(inst.amount || 0).toFixed(2)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                      <span className={isOverdue(inst.dueDate) && inst.status !== 'PAID' ? 'text-red-600' : ''}>
                        {new Date(inst.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getStatusColor(inst.status)}>
                      <span className="mr-1">{getStatusIcon(inst.status)}</span>
                      {getStatusLabel(inst.status)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {inst.status === 'PENDING' && (
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 hover:bg-green-50"
                          onClick={() => handleMarkAsPaid(inst.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          Marcar como Pago
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 hover:bg-blue-50"
                          onClick={() => handlePayWithStripe(inst)}
                        >
                          <CreditCard className="h-4 w-4 text-blue-600 mr-1" />
                          Stripe
                        </Button>
                      </div>
                    )}
                    {inst.status === 'PAID' && inst.paidAt && (
                      <div className="text-sm text-muted-foreground">
                        Pago em {new Date(inst.paidAt).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredInstallments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhuma parcela encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
