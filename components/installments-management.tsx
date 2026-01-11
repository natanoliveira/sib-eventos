"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Search, DollarSign, Calendar, CheckCircle, AlertCircle, XCircle, CreditCard, Loader2 } from "lucide-react";
import { apiClient } from '../lib/api-client';
import { toastSuccess, toastError } from '../lib/toast';
import { formatCurrencyBr } from '@/lib/utils';
import { DataTablePagination } from "./data-display/data-table-pagination";
import { DataTableHeader } from "./data-display/data-table-header";

export function InstallmentsManagement() {
  const [installments, setInstallments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'PIX',
    amount: '',
    transactionId: ''
  });

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await apiClient.getInstallments(params);
      setInstallments(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentDialog = (installment: any) => {
    setSelectedInstallment(installment);
    setPaymentData({
      method: 'PIX',
      amount: installment.amount.toString(),
      transactionId: ''
    });
    setIsPaymentDialogOpen(true);
  };

  const handleRegisterPayment = async () => {
    if (!selectedInstallment) return;

    try {
      setProcessing(true);

      await apiClient.payInstallment(
        selectedInstallment.id,
        paymentData.method,
        paymentData.transactionId || undefined,
        parseFloat(paymentData.amount)
      );

      toastSuccess('Pagamento registrado com sucesso!');
      setIsPaymentDialogOpen(false);
      setPaymentData({
        method: 'PIX',
        amount: '',
        transactionId: ''
      });
      setSelectedInstallment(null);
      await loadData();
    } catch (error) {
      console.error('Error registering payment:', error);
      toastError('Erro ao registrar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayWithStripe = async (installment: any) => {
    try {
      const { clientSecret } = await apiClient.createStripePaymentIntentForInstallment(installment.id);
      console.log('Stripe Payment Intent criado para parcela:', clientSecret);

      // For demo, just mark as paid
      await apiClient.payInstallment(installment.id, 'CREDIT_CARD', 'Stripe Payment Intent: ' + clientSecret);
      await loadData();
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
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
            <div className="text-blue-900">R$ {formatCurrencyBr(totals.total)}</div>
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
            <div className="text-green-900">R$ {formatCurrencyBr(totals.paid)}</div>
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
            <div className="text-yellow-900">R$ {formatCurrencyBr(totals.pending)}</div>
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
            <div className="text-red-900">R$ {formatCurrencyBr(totals.overdue)}</div>
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
                placeholder="Buscar por pessoa, evento ou número da fatura..."
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
          <DataTableHeader
            title="Lista de Parcelas"
            totalItems={totalItems}
            itemLabel="parcelas"
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
                      <TableHead>Nº Fatura</TableHead>
                      <TableHead>Pessoa</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installments.map((inst) => (
                      <TableRow key={inst.id}>
                        <TableCell className="text-blue-900">
                          {inst.invoice?.invoiceNumber || 'N/A'}
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="text-blue-900">{inst.invoice?.person?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{inst.invoice?.person?.email || ''}</div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-indigo-900">{inst.invoice?.event?.title || 'N/A'}</div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="border-blue-200">
                            Parcela {inst.installmentNumber}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            <span className="text-green-900">R$ {formatCurrencyBr(parseFloat(inst.amount || 0))}</span>
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
                                onClick={() => handleOpenPaymentDialog(inst)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                Registrar Pagamento
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
                          {inst.status === 'PAID' && inst.payments?.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Pago em {new Date(inst.payments[0].paidAt).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          {inst.status === 'PAID' && (!inst.payments || inst.payments.length === 0) && (
                            <div className="text-sm text-muted-foreground">
                              Pago
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {installments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Nenhuma parcela encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

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
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {installments.map((inst) => {
                  const memberName = inst.invoice?.person?.name || 'N/A';
                  const memberEmail = inst.invoice?.person?.email || '';
                  const eventTitle = inst.invoice?.event?.title || 'N/A';
                  const invoiceNumber = inst.invoice?.invoiceNumber || 'N/A';

                  return (
                    <Card key={inst.id} className="border-blue-200">
                      <CardContent className="p-4">
                        {/* Header com Info */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-blue-900 font-medium">{memberName}</div>
                            <div className="text-xs text-muted-foreground break-all">{memberEmail}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="border-blue-200 text-xs">
                                Parcela {inst.installmentNumber}
                              </Badge>
                              <Badge className={`${getStatusColor(inst.status)} text-xs`}>
                                {getStatusLabel(inst.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Detalhes */}
                        <div className="space-y-2 mb-4">
                          <div className="text-sm flex items-center">
                            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="text-blue-900">Fatura {invoiceNumber}</span>
                          </div>
                          <div className="text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div>
                              <div className="text-indigo-900">{eventTitle}</div>
                            </div>
                          </div>
                          <div className="text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className={isOverdue(inst.dueDate) && inst.status !== 'PAID' ? 'text-red-600' : ''}>
                              Vencimento: {new Date(inst.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {inst.status === 'PAID' && inst.payments?.length > 0 && (
                            <div className="text-sm flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span>Pago em {new Date(inst.payments[0].paidAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Valor</span>
                            <span className="text-lg font-medium text-green-900">
                              R$ {formatCurrencyBr(parseFloat(inst.amount || 0))}
                            </span>
                          </div>
                        </div>

                        {/* Ações */}
                        {inst.status === 'PENDING' && (
                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                              onClick={() => handleOpenPaymentDialog(inst)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Registrar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => handlePayWithStripe(inst)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Stripe
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registre os detalhes do pagamento da parcela
            </DialogDescription>
          </DialogHeader>

          {selectedInstallment && (
            <div className="space-y-4 py-4">
              {/* Informações da Parcela */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Pessoa</p>
                      <p className="text-blue-900 font-medium">{selectedInstallment.invoice?.person?.name}</p>
                    </div>
                    <Badge variant="outline" className="border-blue-200">
                      Parcela {selectedInstallment.installmentNumber}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Evento</p>
                    <p className="text-indigo-900">{selectedInstallment.invoice?.event?.title}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <p className="text-sm text-muted-foreground">Vencimento</p>
                    <p className="text-sm">{new Date(selectedInstallment.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              {/* Formulário de Pagamento */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Método de Pagamento *</Label>
                  <Select
                    value={paymentData.method}
                    onValueChange={(value) => setPaymentData({ ...paymentData, method: value })}
                  >
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                      <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
                      <SelectItem value="CASH">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor original da parcela: R$ {formatCurrencyBr(parseFloat(selectedInstallment.amount))}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">Observação / ID da Transação</Label>
                  <Textarea
                    id="transactionId"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                    placeholder="Ex: Comprovante PIX, ID da transação, observações..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            {processing ? (
              <Button disabled className="bg-green-600">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </Button>
            ) : (
              <Button
                onClick={handleRegisterPayment}
                disabled={!paymentData.amount}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Pagamento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
