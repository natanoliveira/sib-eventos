"use client";

import { useFieldArray, Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Plus, Trash2, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { formatCurrencyBr, parseCurrencyBrInput } from '@/lib/utils';

interface TicketTypesFieldArrayProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  register: UseFormRegister<any>;
  allowRemove?: boolean;
  allowEdit?: boolean;
  ticketTypesWithRegistrations?: string[]; // IDs dos ticketTypes que têm inscrições
  eventStatus?: string;
}

export function TicketTypesFieldArray({
  control,
  errors,
  register,
  allowRemove = true,
  allowEdit = true,
  ticketTypesWithRegistrations = [],
  eventStatus,
}: TicketTypesFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes',
    keyName: 'fieldId',
  });

  const isEventActive = eventStatus === 'ACTIVE';

  // Verifica se um ticketType específico pode ser editado ou removido
  const canModifyTicketType = (ticketType: any) => {
    if (!ticketType.id) return true; // Novo ticketType, sempre pode modificar
    const hasRegistrations = ticketTypesWithRegistrations.includes(ticketType.id);
    return !isEventActive || !hasRegistrations;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Tipos de Ingresso</Label>
        <Button
          className="bg-blue-500 hover:bg-blue-600"
          type="button"
          size="sm"
          onClick={() =>
            append({ name: '', description: '', price: 0, capacity: null })
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Tipo
        </Button>
      </div>

      {isEventActive && ticketTypesWithRegistrations.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Tipos de ingresso com inscrições não podem ser editados ou removidos enquanto o evento estiver aberto.
          </AlertDescription>
        </Alert>
      )}

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Adicione pelo menos um tipo de ingresso para o evento.
        </p>
      )}

      {fields.map((field, index) => {
        const fieldValue = field as any;
        const canModify = canModifyTicketType(fieldValue);
        const hasRegistrations = fieldValue.id && ticketTypesWithRegistrations.includes(fieldValue.id);

        return (
          <div
            key={field.fieldId}
            className={`relative border rounded-sm p-4 space-y-3 ${
              !canModify ? 'bg-gray-50 border-gray-300' : 'bg-black/5 border-gray-600'
            }`}
          >
            <input type="hidden" {...register(`ticketTypes.${index}.id`)} />

            {/* Header com status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Tipo {index + 1}</h4>
                {hasRegistrations && (
                  <Badge variant="secondary" className="text-xs">
                    Com inscrições
                  </Badge>
                )}
                {!canModify && (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
              </div>

              {allowRemove && fields.length > 1 && canModify && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  title="Remover tipo de ingresso"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>

            {/* Campos do formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`ticketTypes.${index}.name`}>Nome *</Label>
                <Input
                  {...register(`ticketTypes.${index}.name`)}
                  placeholder="Ex: Ingresso Adulto"
                  disabled={!allowEdit || !canModify}
                  className={!canModify ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
                {(errors.ticketTypes as any)?.[index]?.name && (
                  <p className="text-sm text-red-500">
                    {(errors.ticketTypes as any)?.[index]?.name?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ticketTypes.${index}.price`}>Preço (R$) *</Label>
                <Input
                  {...register(`ticketTypes.${index}.price`, {
                    setValueAs: (value) => parseCurrencyBrInput(String(value)),
                    onChange: (event) => {
                      const rawValue = event.target.value;
                      if (rawValue === '') return;

                      const parsedValue = parseCurrencyBrInput(rawValue);
                      if (Number.isNaN(parsedValue)) return;

                      event.target.value = formatCurrencyBr(parsedValue);
                    },
                  })}
                  type="text"
                  step="0.01"
                  placeholder="0.00"
                  disabled={!allowEdit || !canModify}
                  className={!canModify ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
                {(errors.ticketTypes as any)?.[index]?.price && (
                  <p className="text-sm text-red-500">
                    {(errors.ticketTypes as any)?.[index]?.price?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`ticketTypes.${index}.description`}>
                Descrição
              </Label>
              <Textarea
                {...register(`ticketTypes.${index}.description`)}
                placeholder="Ex: até 4 anos"
                rows={2}
                disabled={!allowEdit || !canModify}
                className={!canModify ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
              {(errors.ticketTypes as any)?.[index]?.description && (
                <p className="text-sm text-red-500">
                  {(errors.ticketTypes as any)?.[index]?.description?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`ticketTypes.${index}.capacity`}>
                Capacidade (opcional)
              </Label>
              <Input
                {...register(`ticketTypes.${index}.capacity`, {
                  valueAsNumber: true,
                  setValueAs: (v: any) =>
                    v === '' || v === null ? null : Number(v),
                })}
                type="number"
                placeholder="Deixe em branco para ilimitado"
                disabled={!allowEdit || !canModify}
                className={!canModify ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Se preenchido, limita quantos ingressos deste tipo podem ser vendidos
              </p>
              {(errors.ticketTypes as any)?.[index]?.capacity && (
                <p className="text-sm text-red-500">
                  {(errors.ticketTypes as any)?.[index]?.capacity?.message}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {errors.ticketTypes?.message && (
        <p className="text-sm text-red-500">
          {(errors.ticketTypes as any).message}
        </p>
      )}
    </div>
  );
}
