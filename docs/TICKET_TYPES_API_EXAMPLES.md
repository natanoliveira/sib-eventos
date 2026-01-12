# Exemplos de Uso da API - Tipos de Ingresso

## Visão Geral

Este documento contém exemplos práticos de requisições HTTP para testar as funcionalidades de gerenciamento de tipos de ingresso.

---

## Variáveis de Ambiente

```bash
BASE_URL=http://localhost:3000
AUTH_TOKEN=seu_token_jwt_aqui
EVENT_ID=uuid_do_evento
TICKET_TYPE_ID=uuid_do_ticket_type
```

---

## 1. Listar Tipos de Ingresso de um Evento

### Request

```http
GET /api/events/{eventId}/ticket-types
Authorization: Bearer {token}
```

### cURL

```bash
curl -X GET "http://localhost:3000/api/events/{eventId}/ticket-types" \
  -H "Authorization: Bearer {token}"
```

### Response (200 OK)

```json
[
  {
    "id": "uuid-1",
    "name": "Ingresso Adulto",
    "description": "Entrada para adultos",
    "price": 100.00,
    "capacity": 50,
    "eventId": "event-uuid",
    "_count": {
      "eventMemberships": 12
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-12T00:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "name": "Ingresso Criança",
    "description": "Até 12 anos",
    "price": 50.00,
    "capacity": null,
    "eventId": "event-uuid",
    "_count": {
      "eventMemberships": 0
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-12T00:00:00.000Z"
  }
]
```

---

## 2. Criar Tipo de Ingresso

### Request

```http
POST /api/events/{eventId}/ticket-types
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Ingresso VIP",
  "description": "Acesso VIP com camarote",
  "price": 250.00,
  "capacity": 20
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/events/{eventId}/ticket-types" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ingresso VIP",
    "description": "Acesso VIP com camarote",
    "price": 250.00,
    "capacity": 20
  }'
```

### Response (201 Created)

```json
{
  "id": "uuid-3",
  "name": "Ingresso VIP",
  "description": "Acesso VIP com camarote",
  "price": 250.00,
  "capacity": 20,
  "eventId": "event-uuid",
  "createdAt": "2026-01-12T10:30:00.000Z",
  "updatedAt": "2026-01-12T10:30:00.000Z"
}
```

### Response (400 Bad Request) - Capacidade Excedida

```json
{
  "error": "Capacidade total dos tipos de ingresso excede capacidade do evento"
}
```

---

## 3. Atualizar Tipo de Ingresso

### Request - SEM Inscrições (Permitido)

```http
PUT /api/events/{eventId}/ticket-types/{ticketTypeId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Ingresso Adulto Premium",
  "price": 120.00,
  "capacity": 40
}
```

### cURL

```bash
curl -X PUT "http://localhost:3000/api/events/{eventId}/ticket-types/{ticketTypeId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ingresso Adulto Premium",
    "price": 120.00,
    "capacity": 40
  }'
```

### Response (200 OK)

```json
{
  "id": "uuid-1",
  "name": "Ingresso Adulto Premium",
  "description": "Entrada para adultos",
  "price": 120.00,
  "capacity": 40,
  "eventId": "event-uuid",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-12T11:00:00.000Z"
}
```

### Response (400 Bad Request) - Evento ACTIVE com Inscrições

```json
{
  "error": "Não é possível editar tipo de ingresso de evento aberto com inscrições vinculadas",
  "details": "Para editar, primeiro cancele ou conclua o evento"
}
```

---

## 4. Deletar Tipo de Ingresso

### Request - SEM Inscrições (Permitido)

```http
DELETE /api/events/{eventId}/ticket-types/{ticketTypeId}
Authorization: Bearer {token}
```

### cURL

```bash
curl -X DELETE "http://localhost:3000/api/events/{eventId}/ticket-types/{ticketTypeId}" \
  -H "Authorization: Bearer {token}"
```

### Response (200 OK)

```json
{
  "message": "Tipo de ingresso removido com sucesso"
}
```

### Response (400 Bad Request) - Evento ACTIVE com Inscrições

```json
{
  "error": "Não é possível excluir tipo de ingresso de evento aberto com inscrições vinculadas",
  "details": "Para excluir, primeiro cancele as inscrições ou conclua o evento"
}
```

### Response (400 Bad Request) - Único TicketType

```json
{
  "error": "Não é possível excluir o único tipo de ingresso do evento"
}
```

---

## 5. Criar Evento com Múltiplos Tipos de Ingresso

### Request

```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Conferência Tech 2026",
  "description": "Maior evento de tecnologia do ano",
  "startDate": "2026-03-15T09:00:00.000Z",
  "endDate": "2026-03-17T18:00:00.000Z",
  "location": "Centro de Convenções SP",
  "capacity": 500,
  "category": "Tecnologia",
  "status": "ACTIVE",
  "ticketTypes": [
    {
      "name": "Early Bird",
      "description": "Preço promocional limitado",
      "price": 199.00,
      "capacity": 100
    },
    {
      "name": "Regular",
      "description": "Ingresso padrão",
      "price": 299.00,
      "capacity": 300
    },
    {
      "name": "VIP",
      "description": "Acesso completo + workshops",
      "price": 599.00,
      "capacity": 100
    }
  ]
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Conferência Tech 2026",
    "description": "Maior evento de tecnologia do ano",
    "startDate": "2026-03-15T09:00:00.000Z",
    "endDate": "2026-03-17T18:00:00.000Z",
    "location": "Centro de Convenções SP",
    "capacity": 500,
    "category": "Tecnologia",
    "status": "ACTIVE",
    "ticketTypes": [
      {
        "name": "Early Bird",
        "description": "Preço promocional limitado",
        "price": 199.00,
        "capacity": 100
      },
      {
        "name": "Regular",
        "description": "Ingresso padrão",
        "price": 299.00,
        "capacity": 300
      },
      {
        "name": "VIP",
        "description": "Acesso completo + workshops",
        "price": 599.00,
        "capacity": 100
      }
    ]
  }'
```

### Response (201 Created)

```json
{
  "id": "event-uuid",
  "title": "Conferência Tech 2026",
  "description": "Maior evento de tecnologia do ano",
  "startDate": "2026-03-15T09:00:00.000Z",
  "endDate": "2026-03-17T18:00:00.000Z",
  "location": "Centro de Convenções SP",
  "capacity": 500,
  "category": "Tecnologia",
  "status": "ACTIVE",
  "creator": {
    "id": "user-uuid",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "ticketTypes": [
    {
      "id": "ticket-uuid-1",
      "name": "Early Bird",
      "description": "Preço promocional limitado",
      "price": 199.00,
      "capacity": 100,
      "eventId": "event-uuid",
      "createdAt": "2026-01-12T12:00:00.000Z",
      "updatedAt": "2026-01-12T12:00:00.000Z"
    },
    {
      "id": "ticket-uuid-2",
      "name": "Regular",
      "description": "Ingresso padrão",
      "price": 299.00,
      "capacity": 300,
      "eventId": "event-uuid",
      "createdAt": "2026-01-12T12:00:00.000Z",
      "updatedAt": "2026-01-12T12:00:00.000Z"
    },
    {
      "id": "ticket-uuid-3",
      "name": "VIP",
      "description": "Acesso completo + workshops",
      "price": 599.00,
      "capacity": 100,
      "eventId": "event-uuid",
      "createdAt": "2026-01-12T12:00:00.000Z",
      "updatedAt": "2026-01-12T12:00:00.000Z"
    }
  ],
  "createdAt": "2026-01-12T12:00:00.000Z",
  "updatedAt": "2026-01-12T12:00:00.000Z"
}
```

---

## 6. Obter Evento com Tipos de Ingresso

### Request

```http
GET /api/events/{eventId}
Authorization: Bearer {token}
```

### cURL

```bash
curl -X GET "http://localhost:3000/api/events/{eventId}" \
  -H "Authorization: Bearer {token}"
```

### Response (200 OK)

```json
{
  "id": "event-uuid",
  "title": "Conferência Tech 2026",
  "description": "Maior evento de tecnologia do ano",
  "startDate": "2026-03-15T09:00:00.000Z",
  "endDate": "2026-03-17T18:00:00.000Z",
  "location": "Centro de Convenções SP",
  "capacity": 500,
  "status": "ACTIVE",
  "ticketTypes": [
    {
      "id": "ticket-uuid-1",
      "name": "Early Bird",
      "description": "Preço promocional limitado",
      "price": 199.00,
      "capacity": 100,
      "_count": {
        "eventMemberships": 45
      }
    },
    {
      "id": "ticket-uuid-2",
      "name": "Regular",
      "description": "Ingresso padrão",
      "price": 299.00,
      "capacity": 300,
      "_count": {
        "eventMemberships": 120
      }
    },
    {
      "id": "ticket-uuid-3",
      "name": "VIP",
      "description": "Acesso completo + workshops",
      "price": 599.00,
      "capacity": 100,
      "_count": {
        "eventMemberships": 0
      }
    }
  ],
  "_count": {
    "memberships": 165,
    "tickets": 165
  }
}
```

---

## 7. Registrar em Evento com Tipo de Ingresso

### Request

```http
POST /api/events/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "personId": "person-uuid",
  "eventId": "event-uuid",
  "ticketTypeId": "ticket-uuid-1"
}
```

### cURL

```bash
curl -X POST "http://localhost:3000/api/events/register" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "person-uuid",
    "eventId": "event-uuid",
    "ticketTypeId": "ticket-uuid-1"
  }'
```

### Response (201 Created)

```json
{
  "message": "Inscrição realizada com sucesso",
  "registration": {
    "id": "registration-uuid",
    "personId": "person-uuid",
    "eventId": "event-uuid",
    "ticketTypeId": "ticket-uuid-1",
    "status": "PENDING",
    "person": {
      "id": "person-uuid",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "event": {
      "id": "event-uuid",
      "title": "Conferência Tech 2026",
      "startDate": "2026-03-15T09:00:00.000Z"
    },
    "ticketType": {
      "id": "ticket-uuid-1",
      "name": "Early Bird",
      "description": "Preço promocional limitado",
      "price": 199.00
    },
    "registeredAt": "2026-01-12T14:30:00.000Z"
  }
}
```

### Response (400 Bad Request) - TicketType Esgotado

```json
{
  "error": "Este tipo de ingresso está esgotado"
}
```

### Response (400 Bad Request) - Evento Lotado

```json
{
  "error": "Evento está com lotação completa"
}
```

---

## 8. Listar Inscrições com Tipos de Ingresso

### Request

```http
GET /api/event-registrations?eventId={eventId}&page=1&limit=10
Authorization: Bearer {token}
```

### cURL

```bash
curl -X GET "http://localhost:3000/api/event-registrations?eventId={eventId}&page=1&limit=10" \
  -H "Authorization: Bearer {token}"
```

### Response (200 OK)

```json
{
  "data": [
    {
      "id": "registration-uuid-1",
      "userId": "user-uuid",
      "eventId": "event-uuid",
      "ticketTypeId": "ticket-uuid-1",
      "status": "CONFIRMED",
      "registeredAt": "2026-01-10T10:00:00.000Z",
      "person": {
        "id": "person-uuid-1",
        "name": "João Silva",
        "email": "joao@example.com",
        "phone": "+55 11 99999-9999",
        "image": null
      },
      "event": {
        "id": "event-uuid",
        "title": "Conferência Tech 2026",
        "startDate": "2026-03-15T09:00:00.000Z",
        "location": "Centro de Convenções SP",
        "status": "ACTIVE"
      },
      "ticketType": {
        "id": "ticket-uuid-1",
        "name": "Early Bird",
        "description": "Preço promocional limitado",
        "price": 199.00
      },
      "createdBy": {
        "id": "admin-uuid",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "total": 165,
  "page": 1,
  "limit": 10,
  "totalPages": 17
}
```

---

## Códigos de Status HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| 200 | OK | Operação bem-sucedida (GET, PUT, DELETE) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 400 | Bad Request | Dados inválidos ou regras de negócio violadas |
| 401 | Unauthorized | Token de autenticação ausente ou inválido |
| 403 | Forbidden | Usuário sem permissão para a operação |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |

---

## Cenários de Teste

### Teste 1: Fluxo Completo de Criação

```bash
# 1. Criar evento com ticketTypes
POST /api/events

# 2. Listar ticketTypes criados
GET /api/events/{eventId}/ticket-types

# 3. Adicionar novo ticketType
POST /api/events/{eventId}/ticket-types

# 4. Verificar evento atualizado
GET /api/events/{eventId}
```

### Teste 2: Validação de Bloqueios

```bash
# 1. Criar evento ACTIVE com ticketType
POST /api/events

# 2. Criar inscrição no ticketType
POST /api/events/register

# 3. Tentar editar ticketType (deve falhar)
PUT /api/events/{eventId}/ticket-types/{ticketTypeId}

# 4. Tentar deletar ticketType (deve falhar)
DELETE /api/events/{eventId}/ticket-types/{ticketTypeId}

# 5. Mudar status do evento para COMPLETED
PUT /api/events/{eventId}

# 6. Tentar editar ticketType novamente (deve funcionar)
PUT /api/events/{eventId}/ticket-types/{ticketTypeId}
```

### Teste 3: Capacidades

```bash
# 1. Criar evento com capacity=100
POST /api/events

# 2. Criar ticketType com capacity=60
POST /api/events/{eventId}/ticket-types

# 3. Tentar criar ticketType com capacity=50 (total=110, deve falhar)
POST /api/events/{eventId}/ticket-types

# 4. Criar ticketType com capacity=40 (total=100, deve funcionar)
POST /api/events/{eventId}/ticket-types
```

---

## Ferramentas Recomendadas

### Postman Collection

Importe o seguinte JSON no Postman:

```json
{
  "info": {
    "name": "SIB Eventos - Ticket Types",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "event_id",
      "value": "",
      "type": "string"
    },
    {
      "key": "ticket_type_id",
      "value": "",
      "type": "string"
    }
  ]
}
```

### Thunder Client (VS Code)

Instale a extensão Thunder Client e use os exemplos acima.

### HTTPie

```bash
# Instalar
pip install httpie

# Exemplo de uso
http POST localhost:3000/api/events/register \
  Authorization:"Bearer $TOKEN" \
  personId="uuid" \
  eventId="uuid" \
  ticketTypeId="uuid"
```

---

## Observações Importantes

1. **Autenticação**: Todos os endpoints (exceto alguns públicos) requerem token JWT no header `Authorization: Bearer {token}`

2. **UUIDs**: Todos os IDs são UUIDs v4. Use geradores online ou bibliotecas para criar.

3. **Timestamps**: Datas devem estar no formato ISO 8601: `2026-01-12T14:30:00.000Z`

4. **Decimals**: Valores monetários são armazenados com precisão decimal (2 casas)

5. **Validações Zod**: O backend valida todos os dados com schemas Zod antes de processar

6. **Rate Limiting**: APIs têm rate limit de 60 requests/minuto por IP

---

## Suporte

Para dúvidas ou problemas:
- Documentação completa: `/docs/TICKET_TYPES_IMPLEMENTATION.md`
- Regras de edição: `/docs/TICKET_TYPES_EDIT_RULES.md`
- Issues: GitHub repository

**Última atualização:** 2026-01-12
