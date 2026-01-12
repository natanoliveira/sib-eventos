# Padrões de Rotas API no Projeto

## Problema Identificado e Corrigido

O arquivo `/api/events/route.ts` estava com **padrão inconsistente** e **faltando rate limiting** no endpoint POST.

---

## ❌ ANTES (Inconsistente)

```typescript
// GET - Função separada + Rate Limiting
async function getEventsHandler(request: NextRequest) { ... }
export const GET = requireAuth(withRateLimit(apiLimiter, getEventsHandler));

// POST - Inline SEM Rate Limiting ❌
export const POST = requireAuth(
  async (request: NextRequest, context: any) => { ... }
);
```

**Problemas:**
1. ⚠️ POST não tinha rate limiting (vulnerável a abuse)
2. ⚠️ Padrão diferente entre GET e POST
3. ⚠️ Inconsistente com outras rotas do projeto

---

## ✅ DEPOIS (Padronizado)

```typescript
// GET - Função separada + Rate Limiting ✅
async function getEventsHandler(request: NextRequest) { ... }
export const GET = requireAuth(withRateLimit(apiLimiter, getEventsHandler));

// POST - Função separada + Rate Limiting ✅
async function createEventHandler(request: NextRequest, context: any) { ... }
export const POST = requireAuth(withRateLimit(apiLimiter, createEventHandler));
```

**Benefícios:**
1. ✅ Ambos endpoints têm rate limiting (60 req/min)
2. ✅ Padrão consistente
3. ✅ Código mais organizado e documentado
4. ✅ Proteção contra spam/abuse

---

## Padrões do Projeto

### Padrão 1: Rotas SEM Rate Limiting

**Quando usar:**
- Endpoints de baixo custo computacional
- Operações simples de CRUD
- Endpoints menos críticos

**Estrutura:**
```typescript
// Função inline diretamente no export
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      // lógica aqui
    } catch (error) {
      // tratamento de erro
    }
  }
);

export const POST = requireAuth(
  async (request: NextRequest, context: any) => {
    try {
      // lógica aqui
    } catch (error) {
      // tratamento de erro
    }
  }
);
```

**Exemplo:** `/api/members/route.ts`

---

### Padrão 2: Rotas COM Rate Limiting ✅ RECOMENDADO

**Quando usar:**
- Endpoints críticos (eventos, pagamentos, inscrições)
- Operações custosas (queries complexas, joins)
- Proteção contra abuse/spam
- Criação de recursos importantes

**Estrutura:**
```typescript
/**
 * GET /api/recurso - Descrição
 *
 * Proteções implementadas:
 * - Rate limiting: 60 requests/minuto
 * - Validação Zod
 * - Autenticação obrigatória
 */
async function getRecursoHandler(request: NextRequest) {
  try {
    // Validação com Zod
    const validation = validateQuery(request, schema);
    if (!validation.success) {
      return validation.error;
    }

    // Lógica de negócio
    const data = await prisma.recurso.findMany({ ... });

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse('Erro ao buscar recursos', 500, error);
  }
}

// Aplicar rate limiting e autenticação
export const GET = requireAuth(withRateLimit(apiLimiter, getRecursoHandler));

/**
 * POST /api/recurso - Criar recurso
 *
 * Proteções implementadas:
 * - Rate limiting: 60 requests/minuto
 * - Validação Zod + sanitização
 * - Autenticação obrigatória
 */
async function createRecursoHandler(request: NextRequest, context: any) {
  try {
    // Validação com Zod
    const validation = await validateBody(request, schema);
    if (!validation.success) {
      return validation.error;
    }

    // Lógica de negócio
    const recurso = await prisma.recurso.create({ ... });

    return NextResponse.json(recurso, { status: 201 });
  } catch (error) {
    return errorResponse('Erro ao criar recurso', 500, error);
  }
}

// Aplicar rate limiting e autenticação
export const POST = requireAuth(withRateLimit(apiLimiter, createRecursoHandler));
```

**Exemplos:**
- ✅ `/api/events/route.ts` (CORRIGIDO)
- ✅ `/api/event-registrations/route.ts`

---

## Componentes Utilizados

### 1. requireAuth
**Localização:** `@/lib/auth-utils`

**O que faz:**
- Verifica se o usuário está autenticado
- Extrai informações do token JWT
- Bloqueia acesso não autorizado

**Uso:**
```typescript
export const GET = requireAuth(handler);
```

### 2. withRateLimit
**Localização:** `@/lib/rate-limit`

**O que faz:**
- Limita número de requisições por IP
- Padrão: 60 requisições por minuto
- Retorna 429 (Too Many Requests) quando excede

**Uso:**
```typescript
export const GET = requireAuth(withRateLimit(apiLimiter, handler));
```

### 3. validateQuery / validateBody
**Localização:** `@/lib/validation-middleware`

**O que faz:**
- Valida dados de entrada com Zod
- Sanitiza inputs
- Retorna erro 400 se inválido

**Uso:**
```typescript
const validation = validateQuery(request, schema);
// ou
const validation = await validateBody(request, schema);

if (!validation.success) {
  return validation.error; // Retorna 400 automaticamente
}
```

### 4. errorResponse
**Localização:** `@/lib/api-response`

**O que faz:**
- Padroniza respostas de erro
- Loga erros no console
- Esconde detalhes sensíveis em produção

**Uso:**
```typescript
return errorResponse('Mensagem amigável', 500, error);
```

---

## Checklist para Criar Nova Rota

### Rota Simples (SEM Rate Limiting)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { validateQuery, validateBody } from '@/lib/validation-middleware';
import { meuSchema } from '@/lib/validations';

export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      const validation = validateQuery(request, meuSchema);
      if (!validation.success) return validation.error;

      const data = await prisma.meuRecurso.findMany();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
  }
);
```

### Rota Protegida (COM Rate Limiting)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';
import { validateQuery, validateBody } from '@/lib/validation-middleware';
import { meuSchema } from '@/lib/validations';

/**
 * GET /api/meu-recurso - Descrição
 */
async function getMeuRecursoHandler(request: NextRequest) {
  try {
    const validation = validateQuery(request, meuSchema);
    if (!validation.success) return validation.error;

    const data = await prisma.meuRecurso.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse('Erro ao buscar recursos', 500, error);
  }
}

export const GET = requireAuth(withRateLimit(apiLimiter, getMeuRecursoHandler));

/**
 * POST /api/meu-recurso - Criar
 */
async function createMeuRecursoHandler(request: NextRequest, context: any) {
  try {
    const validation = await validateBody(request, meuSchema);
    if (!validation.success) return validation.error;

    const recurso = await prisma.meuRecurso.create({
      data: { ...validation.data, userId: context.user.id },
    });

    return NextResponse.json(recurso, { status: 201 });
  } catch (error) {
    return errorResponse('Erro ao criar recurso', 500, error);
  }
}

export const POST = requireAuth(withRateLimit(apiLimiter, createMeuRecursoHandler));
```

---

## Quando Usar Rate Limiting

### ✅ USE Rate Limiting

1. **Criação de Recursos**
   - Eventos
   - Inscrições
   - Pagamentos
   - Usuários

2. **Operações Custosas**
   - Queries complexas
   - Joins múltiplos
   - Agregações

3. **Endpoints Públicos**
   - Login
   - Registro
   - Recuperação de senha

4. **Operações Sensíveis**
   - Alteração de permissões
   - Deleção em massa
   - Exportação de dados

### ❌ NÃO USE Rate Limiting

1. **Leitura Simples**
   - GET de recurso único por ID
   - Listagem de categorias fixas

2. **Endpoints Internos**
   - Health checks
   - Métricas internas

3. **Webhooks de Terceiros**
   - Stripe webhooks
   - Payment providers
   - (Usar outra forma de validação)

---

## Rotas do Projeto Auditadas

| Rota | Rate Limiting | Status | Observação |
|------|---------------|--------|------------|
| `/api/events` | ✅ SIM | ✅ OK | Corrigido (POST agora tem) |
| `/api/event-registrations` | ✅ SIM | ✅ OK | Padrão correto |
| `/api/members` | ❌ NÃO | ⚠️ Revisar | Considerar adicionar |
| `/api/tickets` | ❌ NÃO | ⚠️ Revisar | Considerar adicionar |
| `/api/payments` | ❌ NÃO | ⚠️ Revisar | DEVE adicionar (crítico) |
| `/api/invoices` | ❌ NÃO | ⚠️ Revisar | DEVE adicionar (crítico) |
| `/api/auth/login` | ❌ NÃO | ⚠️ Revisar | DEVE adicionar (segurança) |
| `/api/auth/register` | ❌ NÃO | ⚠️ Revisar | DEVE adicionar (segurança) |

---

## Benefícios do Rate Limiting

### Segurança
- ✅ Previne ataques de força bruta
- ✅ Protege contra spam
- ✅ Mitiga DDoS básicos

### Performance
- ✅ Evita sobrecarga do servidor
- ✅ Protege banco de dados
- ✅ Melhora experiência para usuários legítimos

### Custo
- ✅ Reduz custos de infraestrutura
- ✅ Evita bills inesperados
- ✅ Otimiza uso de recursos

---

## Configuração do Rate Limiter

**Arquivo:** `@/lib/rate-limit.ts`

```typescript
// Limiter padrão: 60 requisições por minuto
export const apiLimiter = {
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requisições
};

// Limiter para login (mais restritivo)
export const authLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
};
```

---

## Próximos Passos Recomendados

1. ✅ **Revisar rotas críticas** (payments, invoices, auth)
2. ✅ **Adicionar rate limiting** onde necessário
3. ✅ **Documentar** decisões no código
4. ✅ **Testar** limites configurados
5. ✅ **Monitorar** logs de rate limit

---

## Conclusão

✅ **Problema corrigido:** `/api/events/route.ts` agora segue o padrão correto

**Padrão adotado:**
- Funções separadas para cada handler
- Rate limiting em endpoints críticos
- Documentação inline com JSDoc
- Validação Zod em todos endpoints
- Tratamento de erro padronizado

**Build status:** ✅ Sucesso

---

**Data:** 2026-01-12
**Versão:** 1.2.0
**Status:** ✅ PADRONIZADO
