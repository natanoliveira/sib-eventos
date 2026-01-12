# Regras de Edição e Deleção de Tipos de Ingresso

## Visão Geral

Este documento descreve as regras implementadas para edição e deleção de tipos de ingresso (TicketTypes) em eventos, incluindo validações no backend e bloqueios visuais no frontend.

---

## Regras de Negócio

### 1. Edição de TicketType

**Quando PERMITIDO:**
- Evento com status diferente de ACTIVE (ex: DRAFT, COMPLETED, CANCELLED)
- Evento ACTIVE mas o ticketType específico não tem inscrições vinculadas

**Quando BLOQUEADO:**
- ✋ Evento com status ACTIVE E o ticketType possui inscrições (eventMemberships > 0)

**Mensagem de erro:**
```
"Não é possível editar tipo de ingresso de evento aberto com inscrições vinculadas"
```

### 2. Deleção de TicketType

**Quando PERMITIDO:**
- Evento com status diferente de ACTIVE
- Evento ACTIVE mas o ticketType não tem inscrições
- Existe mais de 1 ticketType no evento (não pode excluir o único tipo)

**Quando BLOQUEADO:**
- ✋ Evento com status ACTIVE E o ticketType possui inscrições
- ✋ É o único ticketType do evento

**Mensagens de erro:**
```
"Não é possível excluir tipo de ingresso de evento aberto com inscrições vinculadas"
"Não é possível excluir o único tipo de ingresso do evento"
```

---

## Implementação Backend

### Endpoints Modificados

#### PUT `/api/events/[id]/ticket-types/[ticketTypeId]`

**Validações implementadas:**

```typescript
// 1. Buscar evento com ticketTypes e contagem de inscrições
const event = await prisma.event.findUnique({
  where: { id: eventId },
  include: {
    ticketTypes: {
      include: {
        _count: { select: { eventMemberships: true } }
      }
    }
  },
});

// 2. Verificar se ticketType existe
const ticketType = event.ticketTypes.find(tt => tt.id === ticketTypeId);
if (!ticketType) return 404;

// 3. Verificar se evento está ACTIVE e tem inscrições
const hasRegistrations = ticketType._count.eventMemberships > 0;
if (event.status === 'ACTIVE' && hasRegistrations) {
  return 400; // Bloqueado
}

// 4. Validar capacidade total (se aplicável)
// 5. Atualizar ticketType
```

#### DELETE `/api/events/[id]/ticket-types/[ticketTypeId]`

**Validações implementadas:**

```typescript
// 1. Buscar ticketType com evento e contagem de inscrições
const ticketType = await prisma.ticketType.findUnique({
  where: { id: ticketTypeId },
  include: {
    event: { select: { id: true, status: true } },
    _count: { select: { eventMemberships: true } }
  }
});

// 2. Verificar se pertence ao evento
if (ticketType.event.id !== eventId) return 400;

// 3. Verificar se evento está ACTIVE e tem inscrições
const hasRegistrations = ticketType._count.eventMemberships > 0;
if (ticketType.event.status === 'ACTIVE' && hasRegistrations) {
  return 400; // Bloqueado
}

// 4. Verificar se é o único ticketType
const totalTicketTypes = await prisma.ticketType.count({ where: { eventId } });
if (totalTicketTypes <= 1) {
  return 400; // Não pode excluir o único tipo
}

// 5. Deletar ticketType
```

---

## Implementação Frontend

### Componente: TicketTypesFieldArray

**Novas Props:**

```typescript
interface TicketTypesFieldArrayProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  register: UseFormRegister<any>;
  allowRemove?: boolean;              // Permite remover ticketTypes
  allowEdit?: boolean;                // Permite editar ticketTypes
  ticketTypesWithRegistrations?: string[];  // IDs dos ticketTypes com inscrições
  eventStatus?: string;               // Status do evento (ACTIVE, DRAFT, etc)
}
```

**Lógica de Bloqueio:**

```typescript
const isEventActive = eventStatus === 'ACTIVE';

// Verifica se um ticketType específico pode ser modificado
const canModifyTicketType = (ticketType: any) => {
  if (!ticketType.id) return true; // Novo ticketType, sempre pode

  const hasRegistrations = ticketTypesWithRegistrations.includes(ticketType.id);
  return !isEventActive || !hasRegistrations;
};
```

**Elementos Visuais:**

1. **Badge "Com inscrições"**
   - Exibido quando o ticketType possui inscrições

2. **Ícone de Cadeado (Lock)**
   - Exibido ao lado do título quando bloqueado

3. **Alert de Aviso**
   - Mensagem amarela no topo quando há restrições
   - Texto: "Tipos de ingresso com inscrições não podem ser editados ou removidos enquanto o evento estiver aberto"

4. **Campos Desabilitados**
   - Inputs/Textareas ficam com `disabled={true}`
   - Background cinza (`bg-gray-100`)
   - Cursor `cursor-not-allowed`

5. **Botão de Remover Oculto**
   - Só aparece quando `canModify === true`

---

## Componente: EventsManagement

**Função Auxiliar:**

```typescript
// Calcula quais ticketTypes têm inscrições
const getTicketTypesWithRegistrations = () => {
  if (!selectedEvent || !selectedEvent.ticketTypes) return [];

  return selectedEvent.ticketTypes
    .filter((tt: any) => tt._count?.eventMemberships > 0)
    .map((tt: any) => tt.id);
};
```

**Uso no Dialog de Edição:**

```tsx
<TicketTypesFieldArray
  control={editForm.control}
  errors={editForm.formState.errors}
  register={editForm.register}
  allowRemove={canRemoveTicketTypes}
  allowEdit={true}
  ticketTypesWithRegistrations={getTicketTypesWithRegistrations()}
  eventStatus={selectedEvent?.status}
/>
```

---

## Endpoints de Leitura

### GET `/api/events/[id]`

Retorna evento com ticketTypes incluindo contagem de inscrições:

```typescript
ticketTypes: {
  include: {
    _count: {
      select: { eventMemberships: true }
    }
  }
}
```

### GET `/api/events`

Retorna listagem de eventos com ticketTypes e contagens:

```typescript
ticketTypes: {
  select: {
    id: true,
    name: true,
    description: true,
    price: true,
    capacity: true,
    _count: {
      select: { eventMemberships: true }
    }
  }
}
```

---

## Fluxos de Validação

### Fluxo 1: Tentativa de Editar TicketType com Inscrições

```
1. Usuário abre modal de edição de evento ACTIVE
2. Frontend detecta ticketTypes com inscrições (via _count.eventMemberships > 0)
3. Componente TicketTypesFieldArray desabilita campos dos tipos bloqueados
4. Badges e ícones indicam visualmente o bloqueio
5. Se usuário forçar requisição (via API direta):
   → Backend valida e retorna erro 400
```

### Fluxo 2: Tentativa de Deletar TicketType com Inscrições

```
1. Usuário tenta remover ticketType via botão de lixeira
2. Frontend só mostra botão se canModify === true
3. Se requisição chegar ao backend:
   → Backend verifica status do evento + contagem de inscrições
   → Retorna erro 400 se bloqueado
```

### Fluxo 3: Edição de Evento SEM Inscrições

```
1. Evento ACTIVE mas sem inscrições no ticketType específico
2. Frontend permite edição normalmente
3. Backend valida e permite atualização
4. TicketType é atualizado com sucesso
```

### Fluxo 4: Edição de Evento NÃO ACTIVE

```
1. Evento com status DRAFT, COMPLETED ou CANCELLED
2. Frontend permite edição de todos os ticketTypes
3. Backend permite edição independente de inscrições
4. TicketTypes são atualizados normalmente
```

---

## Status do Evento

```typescript
enum EventStatus {
  ACTIVE    // Aberto para inscrições - RESTRITO
  DRAFT     // Rascunho - LIBERADO
  COMPLETED // Concluído - LIBERADO
  CANCELLED // Cancelado - LIBERADO
  FULL      // Lotação completa
  ENDED     // Finalizado
}
```

**Restrições aplicam-se APENAS quando status === 'ACTIVE'**

---

## Resumo das Validações

| Ação | Evento Status | Tem Inscrições? | Resultado |
|------|---------------|-----------------|-----------|
| **Editar** | ACTIVE | ✅ Sim | ❌ BLOQUEADO |
| **Editar** | ACTIVE | ❌ Não | ✅ PERMITIDO |
| **Editar** | != ACTIVE | Qualquer | ✅ PERMITIDO |
| **Deletar** | ACTIVE | ✅ Sim | ❌ BLOQUEADO |
| **Deletar** | ACTIVE | ❌ Não | ✅ PERMITIDO* |
| **Deletar** | != ACTIVE | Qualquer | ✅ PERMITIDO* |

*Exceto se for o único ticketType do evento

---

## Testes Recomendados

### Cenário 1: Evento Aberto COM Inscrições
1. Criar evento com status ACTIVE
2. Adicionar 2 ticketTypes
3. Criar inscrição no TicketType A
4. Tentar editar TicketType A → ❌ Deve bloquear
5. Tentar editar TicketType B → ✅ Deve permitir
6. Tentar deletar TicketType A → ❌ Deve bloquear
7. Tentar deletar TicketType B → ✅ Deve permitir

### Cenário 2: Evento Aberto SEM Inscrições
1. Criar evento com status ACTIVE
2. Adicionar 2 ticketTypes
3. Tentar editar qualquer ticketType → ✅ Deve permitir
4. Tentar deletar qualquer ticketType → ✅ Deve permitir

### Cenário 3: Evento Fechado
1. Criar evento com status COMPLETED
2. Adicionar ticketTypes com inscrições
3. Tentar editar → ✅ Deve permitir
4. Tentar deletar → ✅ Deve permitir

### Cenário 4: Único TicketType
1. Criar evento com 1 ticketType
2. Tentar deletar → ❌ Deve bloquear
3. Adicionar outro ticketType
4. Tentar deletar → ✅ Deve permitir

---

## Arquivos Modificados

### Backend
- `app/api/events/[id]/ticket-types/[ticketTypeId]/route.ts`
  - PUT: Adicionado validação de status + inscrições
  - DELETE: Adicionado validação de status + inscrições + único tipo

### Frontend
- `components/ticket-types-field-array.tsx`
  - Adicionadas props: allowEdit, ticketTypesWithRegistrations, eventStatus
  - Implementada lógica de bloqueio visual
  - Badges, ícones e alerts de aviso

- `components/events-management.tsx`
  - Adicionada função getTicketTypesWithRegistrations()
  - Atualizado uso de TicketTypesFieldArray com novas props

### Endpoints Existentes (já corretos)
- GET `/api/events` - Inclui _count de eventMemberships
- GET `/api/events/[id]` - Inclui _count de eventMemberships

---

## Build Status

✅ **Compilação bem-sucedida**
- Sem erros de TypeScript
- Sem erros de linting
- Build de produção OK

---

## Conclusão

A implementação completa garante que:

1. ✅ TicketTypes com inscrições não podem ser editados em eventos ACTIVE
2. ✅ TicketTypes com inscrições não podem ser deletados em eventos ACTIVE
3. ✅ Último ticketType do evento não pode ser deletado
4. ✅ Validações no backend previnem bypass via API
5. ✅ Interface visual clara indica bloqueios ao usuário
6. ✅ Eventos não-ACTIVE podem ser editados livremente
7. ✅ Sistema compatível com fluxo de criação de novos eventos

**Data de Implementação:** 2026-01-12
**Status:** ✅ Completo e Testado
