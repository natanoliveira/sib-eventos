"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Search, DollarSign, CheckCircle, XCircle, Clock, CreditCard, Zap, FileText, Loader2, Calendar, AlertCircle } from "lucide-react";
import { ConfirmDialog } from "./feedback/confirm-dialog";
import { toastSuccess, toastError } from '../lib/toast';
import { apiClient } from '../lib/api-client';
import { formatCurrencyBr } from '@/lib/utils';
import { DataTablePagination } from "./data-display/data-table-pagination";
import { DataTableHeader } from "./data-display/data-table-header";
import { usePermissions } from '../lib/use-permissions';
import { PERMISSIONS } from '../lib/permissions';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function PaymentsManagement() {
  const { hasPermission } = usePermissions();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [paymentToCancel, setPaymentToCancel] = useState<any>(null);

  useEffect(() => {
    loadPayments();
  }, [searchTerm, selectedStatus, selectedMethod, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedMethod]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedMethod !== 'all') params.method = selectedMethod;

      const response = await apiClient.getPayments(params);
      setPayments(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      toastError('Erro ao carregar pagamentos');
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pago';
      case 'PENDING': return 'Pendente';
      case 'PROCESSING': return 'Processando';
      case 'FAILED': return 'Falhou';
      case 'REFUNDED': return 'Reembolsado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'PIX': return <Zap className="w-4 h-4" />;
      case 'CREDIT_CARD': return <CreditCard className="w-4 h-4" />;
      case 'DEBIT_CARD': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'PIX': return 'PIX';
      case 'CREDIT_CARD': return 'Cartão de Crédito';
      case 'DEBIT_CARD': return 'Cartão de Débito';
      case 'BANK_TRANSFER': return 'Transferência';
      case 'CASH': return 'Dinheiro';
      default: return method;
    }
  };

  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  const handleRefundPayment = (payment: any) => {
    setPaymentToCancel(payment);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancelPayment = async () => {
    if (!paymentToCancel) return;

    try {
      await apiClient.cancelPayment(paymentToCancel.id);
      toastSuccess('Pagamento cancelado com sucesso!');
      setIsCancelDialogOpen(false);
      setPaymentToCancel(null);
      setIsDetailsOpen(false);
      await loadPayments();
    } catch (error: any) {
      toastError(error.message || 'Erro ao cancelar pagamento');
    }
  };

  // TODO: Implementar quando integrar com Stripe
  // const handleRefundPaymentWithStripe = async (paymentId: string) => {
  //   try {
  //     await apiClient.refundPayment(paymentId);
  //     toastSuccess('Estorno processado com sucesso no Stripe!');
  //     await loadPayments();
  //   } catch (error: any) {
  //     toastError(error.message || 'Erro ao processar estorno');
  //   }
  // };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const approvedCount = payments.filter(p => p.status === 'PAID').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const failedCount = payments.filter(p => p.status === 'FAILED').length;

  // Verificar permissão de visualização
  if (!hasPermission(PERMISSIONS.PAYMENTS_VIEW)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para visualizar pagamentos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificar permissão para cancelar pagamentos
  const canCancelPayment = hasPermission(PERMISSIONS.PAYMENTS_CANCEL);

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
            <div className="text-2xl text-blue-900">R$ {formatCurrencyBr(totalRevenue)}</div>
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
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PROCESSING">Processando</SelectItem>
                <SelectItem value="FAILED">Falhou</SelectItem>
                <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-full md:w-[170px] border-blue-200">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Métodos</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                <SelectItem value="BANK_TRANSFER">Transferência</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-blue-200">
        <CardHeader>
          <DataTableHeader
            title="Histórico de Pagamentos"
            totalItems={totalItems}
            itemLabel="transações"
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
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const memberName = payment.installment?.invoice?.person?.name || 'N/A';
                      const memberEmail = payment.installment?.invoice?.person?.email || 'N/A';
                      const eventTitle = payment.installment?.invoice?.event?.title || 'N/A';

                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-blue-900 text-sm">{payment.paymentNumber || payment.id}</div>
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
                              R$ {formatCurrencyBr(payment.amount)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getMethodIcon(payment.method)}
                              <span className="text-sm">{getMethodLabel(payment.method)}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusLabel(payment.status)}
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
                              {canCancelPayment && payment.status === 'PAID' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-red-50"
                                  onClick={() => handleRefundPayment(payment)}
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Nenhum pagamento encontrado
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
                {payments.map((payment) => {
                  const memberName = payment.installment?.invoice?.person?.name || 'N/A';
                  const memberEmail = payment.installment?.invoice?.person?.email || 'N/A';
                  const eventTitle = payment.installment?.invoice?.event?.title || 'N/A';

                  return (
                    <Card key={payment.id} className="border-blue-200">
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
                                <Badge className={`${getStatusColor(payment.status)} text-xs`}>
                                  {getStatusLabel(payment.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detalhes */}
                        <div className="space-y-2 mb-4">
                          <div className="text-sm flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="text-blue-900">{payment.paymentNumber || payment.id}</span>
                          </div>
                          <div className="text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{eventTitle}</span>
                          </div>
                          <div className="text-sm flex items-center">
                            {getMethodIcon(payment.method)}
                            <span className="ml-2">{getMethodLabel(payment.method)}</span>
                          </div>
                          <div className="text-sm flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('pt-BR') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Valor</span>
                            <span className="text-lg font-medium text-blue-900">
                              R$ {formatCurrencyBr(payment.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                          {canCancelPayment && payment.status === 'PAID' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleRefundPayment(payment)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Estornar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
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
                      {getStatusLabel(selectedPayment.status)}
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
                    <div className="text-blue-900">R$ {formatCurrencyBr(selectedPayment.amount)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Método de Pagamento</label>
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(selectedPayment.method)}
                      <span>{getMethodLabel(selectedPayment.method)}</span>
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

                {canCancelPayment && selectedPayment.status === 'PAID' && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleRefundPayment(selectedPayment)}
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

      {/* Cancel Payment Confirmation Dialog */}
      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancelar Pagamento"
        description={
          paymentToCancel ? (
            <>
              Tem certeza de que deseja cancelar o pagamento de{' '}
              <strong> {paymentToCancel.installment?.invoice?.person?.name.toUpperCase() || 'N/A'} </strong> ? O valor de R${' '}
              <strong> {formatCurrencyBr(paymentToCancel.amount)}</strong>{' '}
              será estornado e a parcela voltará ao status <strong>PENDENTE</strong>.
            </>
          ) : (
            ''
          )
        }
        confirmText="Cancelar Pagamento"
        onConfirm={handleConfirmCancelPayment}
        destructive
      />
    </div>
  );
}
