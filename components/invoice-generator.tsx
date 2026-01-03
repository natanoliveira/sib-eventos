"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, CreditCard, DollarSign, Calendar, User, Loader2 } from "lucide-react";
import { apiClient } from '../lib/api-client';
import { loadStripe } from '@stripe/stripe-js';
import { toastSuccess, toastError } from '../lib/toast';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY');

export function InvoiceGenerator() {
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    personId: '',
    eventId: '',
    amount: '',
    installments: '1',
    method: 'CREDIT_CARD',
    firstDueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersData, eventsData] = await Promise.all([
        apiClient.getMembers({}),
        apiClient.getEvents({})
      ]);
      setMembers(membersData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleEventChange = (eventId: string) => {
    setNewInvoice({ ...newInvoice, eventId });
    const event = events.find(e => e.id === eventId);
    if (event) {
      setNewInvoice(prev => ({
        ...prev,
        eventId,
        amount: event.price?.toString() || ''
      }));
    }
  };

  const calculateInstallmentAmount = () => {
    const total = parseFloat(newInvoice.amount || '0');
    const installments = parseInt(newInvoice.installments || '1');
    return (total / installments).toFixed(2);
  };

  const handleGenerateInvoice = async () => {
    try {
      setGenerating(true);

      const invoiceData = {
        personId: newInvoice.personId,
        eventId: newInvoice.eventId,
        amount: parseFloat(newInvoice.amount),
        installments: parseInt(newInvoice.installments),
        method: newInvoice.method,
        firstDueDate: new Date(newInvoice.firstDueDate)
      };

      // Generate invoice with installments
      const result = await apiClient.generateInvoice(invoiceData);

      setIsGenerateDialogOpen(false);
      setNewInvoice({
        personId: '',
        eventId: '',
        amount: '',
        installments: '1',
        method: 'CREDIT_CARD',
        firstDueDate: new Date().toISOString().split('T')[0]
      });

      // Show success message
      toastSuccess('Fatura gerada com sucesso!', {
        title: 'Sucesso!',
        description: `Número: ${result.invoice.invoiceNumber} | Total: R$ ${result.invoice.totalAmount} | Parcelas: ${result.invoice.installments.length}x de R$ ${calculateInstallmentAmount()}`
      });

    } catch (error) {
      console.error('Error generating invoice:', error);
      toastError('Erro ao gerar fatura. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePayWithStripe = async () => {
    try {
      setGenerating(true);

      // Create Stripe payment intent
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe não foi carregado');
      }

      const { clientSecret } = await apiClient.createStripePaymentIntent({
        userId: newInvoice.personId,
        eventId: newInvoice.eventId,
        amount: parseFloat(newInvoice.amount),
        installments: parseInt(newInvoice.installments)
      });

      // Redirect to Stripe checkout or show payment form
      console.log('Stripe Payment Intent criado:', clientSecret);

      // For demo purposes, just generate the invoice
      await handleGenerateInvoice();

    } catch (error) {
      console.error('Error with Stripe payment:', error);
      toastError('Erro ao processar pagamento. Gerando fatura offline...');
      await handleGenerateInvoice();
    } finally {
      setGenerating(false);
    }
  };

  const selectedMember = members.find(m => m.id === newInvoice.personId);
  const selectedEvent = events.find(e => e.id === newInvoice.eventId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2>Gerador de Faturas e Passaportes</h2>
          <p className="text-muted-foreground">
            Gere faturas e passaportes para membros em eventos
          </p>
        </div>

        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Fatura
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Gerar Nova Fatura/Passaporte</DialogTitle>
              <DialogDescription>
                Configure os detalhes do pagamento e parcelas
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member">Pessoa</Label>
                  <Select
                    value={newInvoice.personId}
                    onValueChange={(value) => setNewInvoice({ ...newInvoice, personId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a pessoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event">Evento</Label>
                  <Select
                    value={newInvoice.eventId}
                    onValueChange={handleEventChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedMember && selectedEvent && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-4 mb-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Membro Selecionado</p>
                      <p className="text-blue-900">{selectedMember.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Evento Selecionado</p>
                      <p className="text-indigo-900">{selectedEvent.title}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor Total (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Select
                    value={newInvoice.installments}
                    onValueChange={(value) => setNewInvoice({ ...newInvoice, installments: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newInvoice.amount && parseInt(newInvoice.installments) > 1 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    {newInvoice.installments}x de <strong>R$ {calculateInstallmentAmount()}</strong>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Método de Pagamento</Label>
                  <Select
                    value={newInvoice.method}
                    onValueChange={(value) => setNewInvoice({ ...newInvoice, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                      <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Transferência</SelectItem>
                      <SelectItem value="CASH">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstDueDate">Primeiro Vencimento</Label>
                  <Input
                    id="firstDueDate"
                    type="date"
                    value={newInvoice.firstDueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, firstDueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                Cancelar
              </Button>
              {generating ? (
                <Button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  disabled
                >
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando
                </Button>
              ) : (
                <Button
                  onClick={handleGenerateInvoice}
                  disabled={!newInvoice.personId || !newInvoice.eventId || !newInvoice.amount}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Fatura
                </Button>
              )}

              {newInvoice.method === 'CREDIT_CARD' && (
                <Button
                  onClick={handlePayWithStripe}
                  disabled={!newInvoice.personId || !newInvoice.eventId || !newInvoice.amount || generating}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {generating ? 'Processando...' : 'Pagar com Stripe'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Faturas</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-900">0</div>
            <p className="text-xs text-muted-foreground">
              Faturas geradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-indigo-900">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
              Valor total de todas as faturas
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Parcelas Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-blue-900">0</div>
            <p className="text-xs text-muted-foreground">
              Parcelas aguardando pagamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">1</div>
              <p>Selecione o membro e o evento para gerar a fatura</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">2</div>
              <p>Configure o valor total e o número de parcelas desejado</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">3</div>
              <p>Escolha o método de pagamento e a data do primeiro vencimento</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">4</div>
              <p>Gere a fatura ou processe o pagamento direto via Stripe</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
