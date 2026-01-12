"use client";

import { useFieldArray, Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface TicketTypesFieldArrayProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  register: UseFormRegister<any>;
  allowRemove?: boolean;
}

export function TicketTypesFieldArray({
  control,
  errors,
  register,
  allowRemove = true,
}: TicketTypesFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes',
    keyName: 'fieldId',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Tipos de Ingresso</Label>
        <Button
        className="bg-blue-500 hover:bg-blue-600"
          type="button"
          // variant="outline"
          size="sm"
          onClick={() =>
            append({ name: '', description: '', price: 0, capacity: null })
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Tipo
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Adicione pelo menos um tipo de ingresso para o evento.
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.fieldId} className="bg-black/5 border border-gray-600 rounded-sm p-4 space-y-3">
          <input type="hidden" {...register(`ticketTypes.${index}.id`)} />
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Tipo {index + 1}</h4>
            {allowRemove && fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`ticketTypes.${index}.name`}>Nome *</Label>
              <Input
                {...register(`ticketTypes.${index}.name`)}
                placeholder="Ex: Ingresso Adulto"
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
                  valueAsNumber: true,
                })}
                type="number"
                step="0.01"
                placeholder="0.00"
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
            />
            <p className="text-xs text-muted-foreground">
              Se preenchido, limita quantos ingressos deste tipo podem ser
              vendidos
            </p>
            {(errors.ticketTypes as any)?.[index]?.capacity && (
              <p className="text-sm text-red-500">
                {(errors.ticketTypes as any)?.[index]?.capacity?.message}
              </p>
            )}
          </div>
        </div>
      ))}

      {errors.ticketTypes?.message && (
        <p className="text-sm text-red-500">
          {(errors.ticketTypes as any).message}
        </p>
      )}
    </div>
  );
}
