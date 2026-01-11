# Guia de Validação com Zod

Este guia explica como usar o sistema de validação implementado com Zod em todo o projeto, tanto no frontend quanto no backend.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Schemas Disponíveis](#schemas-disponíveis)
3. [Uso no Backend (API Routes)](#uso-no-backend-api-routes)
4. [Uso no Frontend (React Hook Form)](#uso-no-frontend-react-hook-form)
5. [Segurança e Sanitização](#segurança-e-sanitização)
6. [Exemplos Completos](#exemplos-completos)

## 🎯 Visão Geral

O sistema de validação implementado oferece:

- ✅ **Contrato único**: Schemas compartilhados entre frontend e backend
- ✅ **Validação robusta**: Zod valida tipos, formatos e regras de negócio
- ✅ **Sanitização automática**: Remove HTML/scripts perigosos
- ✅ **Proteção XSS**: Escape de saídas e bloqueio de valores perigosos
- ✅ **Type safety**: TypeScript infere tipos automaticamente dos schemas
- ✅ **Mensagens personalizadas**: Erros claros e em português

## 📦 Schemas Disponíveis

### Members/Persons

```typescript
import {
  createMemberSchema,
  updateMemberSchema,
  getMembersQuerySchema,
  deleteMemberSchema,
} from '@/lib/validations';
```

### Events

```typescript
import {
  createEventSchema,
  updateEventSchema,
  getEventsQuerySchema,
  deleteEventSchema,
} from '@/lib/validations';
```

### Event Registrations

```typescript
import {
  createRegistrationSchema,
  updateRegistrationSchema,
  getRegistrationsQuerySchema,
  cancelRegistrationSchema,
} from '@/lib/validations';
```

### Payments & Installments

```typescript
import {
  registerPaymentSchema,
  cancelPaymentSchema,
  createStripePaymentIntentSchema,
  getPaymentsQuerySchema,
  getInstallmentsQuerySchema,
} from '@/lib/validations';
```

## 🔒 Uso no Backend (API Routes)

### Exemplo 1: Validar Query Parameters (GET)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getMembersQuerySchema } from '@/lib/validations';
import { validateQuery } from '@/lib/validation-middleware';
import { requireAuth } from '@/lib/auth-utils';

export const GET = requireAuth(async (request: NextRequest) => {
  // Valida query parameters com Zod
  const validation = validateQuery(request, getMembersQuerySchema);

  if (!validation.success) {
    return validation.error; // Retorna erro 400 com detalhes
  }

  const { page, limit, search, category, status } = validation.data;

  // Use os dados validados...
  // Todos os campos estão tipados e sanitizados
});
```

### Exemplo 2: Validar Body (POST)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createMemberSchema } from '@/lib/validations';
import { validateBody } from '@/lib/validation-middleware';
import { requireAuth } from '@/lib/auth-utils';

export const POST = requireAuth(async (request: NextRequest) => {
  // Valida e sanitiza body com Zod
  const validation = await validateBody(request, createMemberSchema);

  if (!validation.success) {
    return validation.error; // Retorna erro 400 com detalhes
  }

  const { name, email, phone, address, category } = validation.data;

  // Dados já validados e sanitizados
  // HTML perigoso foi removido automaticamente
  const person = await prisma.person.create({
    data: validation.data,
  });

  return NextResponse.json(person, { status: 201 });
});
```

### Exemplo 3: Validar Route Params (DELETE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { deleteMemberSchema } from '@/lib/validations';
import { validateParams } from '@/lib/validation-middleware';
import { requireAuth } from '@/lib/auth-utils';

export const DELETE = requireAuth(async (request: NextRequest, context: any) => {
  // Valida route params
  const validation = validateParams(context.params, deleteMemberSchema);

  if (!validation.success) {
    return validation.error;
  }

  const { id } = validation.data;

  await prisma.person.delete({ where: { id } });

  return NextResponse.json({ message: 'Pessoa excluída com sucesso' });
});
```

## 🎨 Uso no Frontend (React Hook Form)

### Instalação das Dependências

```bash
npm install react-hook-form @hookform/resolvers zod
```

### Exemplo 1: Formulário de Criação de Membro

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema, CreateMemberInput } from '@/lib/validations';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function CreateMemberForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      notes: '',
    },
  });

  const onSubmit = async (data: CreateMemberInput) => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Erro ao criar membro');
        return;
      }

      alert('Membro criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar membro');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome Completo *</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Endereço</Label>
        <Input id="address" {...register('address')} />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="category">Categoria *</Label>
        <Input id="category" {...register('category')} />
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Criar Membro'}
      </Button>
    </form>
  );
}
```

### Exemplo 2: Formulário com Select e Textarea

```typescript
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, CreateEventInput } from '@/lib/validations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

export function CreateEventForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
  });

  const onSubmit = async (data: CreateEventInput) => {
    // Enviar para API...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="text-red-500 text-sm">{errors.status.message}</p>
        )}
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea {...register('description')} rows={4} />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>
    </form>
  );
}
```

## 🛡️ Segurança e Sanitização

### Sanitização Automática

O middleware `validateBody` e `validateQuery` automaticamente sanitizam os dados, removendo:

- Tags HTML
- Scripts maliciosos
- Event handlers (onclick, onerror, etc)
- javascript: URLs
- iframes, objects, embeds
- Espaços em branco extras

### Validação de Uploads

```typescript
import { validateFileUpload } from '@/lib/validation-middleware';

function handleFileUpload(file: File) {
  const validation = validateFileUpload(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });

  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // Upload o arquivo...
}
```

### Escape de Saída (XSS Protection)

```typescript
import { escapeHtml } from '@/lib/validation-middleware';

// Antes de renderizar dados do usuário no HTML
const safeContent = escapeHtml(userInput);
```

### Verificar Conteúdo Perigoso

```typescript
import { containsDangerousContent } from '@/lib/validation-middleware';

if (containsDangerousContent(userInput)) {
  throw new Error('Conteúdo perigoso detectado');
}
```

## 📚 Exemplos Completos

### Fluxo Completo: Frontend → Backend

**Frontend (components/create-member-form.tsx):**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMemberSchema, CreateMemberInput } from '@/lib/validations';
import { apiClient } from '@/lib/api-client';

export function CreateMemberForm() {
  const form = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema),
  });

  const onSubmit = async (data: CreateMemberInput) => {
    try {
      await apiClient.createMember(data);
      alert('Membro criado!');
    } catch (error) {
      alert('Erro ao criar membro');
    }
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

**Backend (app/api/members/route.ts):**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMemberSchema } from '@/lib/validations';
import { validateBody } from '@/lib/validation-middleware';
import { requireAuth } from '@/lib/auth-utils';

export const POST = requireAuth(async (request: NextRequest) => {
  // Valida e sanitiza automaticamente
  const validation = await validateBody(request, createMemberSchema);

  if (!validation.success) {
    return validation.error;
  }

  // Dados já validados, sanitizados e tipados
  const person = await prisma.person.create({
    data: validation.data,
  });

  return NextResponse.json(person, { status: 201 });
});
```

## ✅ Checklist de Implementação

Para cada novo formulário/API:

- [ ] Criar schema Zod em `lib/validations/`
- [ ] Exportar schema e tipos em `lib/validations/index.ts`
- [ ] Usar `validateBody` ou `validateQuery` na API route
- [ ] Usar `useForm` + `zodResolver` no componente frontend
- [ ] Adicionar mensagens de erro para cada campo
- [ ] Testar com dados inválidos
- [ ] Testar com caracteres especiais/HTML
- [ ] Verificar se sanitização está funcionando

## 🎓 Boas Práticas

1. **Sempre valide no backend**: Nunca confie apenas na validação do frontend
2. **Use o mesmo schema**: Frontend e backend devem usar o mesmo schema Zod
3. **Sanitize dados do usuário**: Use o middleware de validação que já sanitiza automaticamente
4. **Mensagens claras**: Customize mensagens de erro para serem claras e em português
5. **Tipos seguros**: Use os tipos inferidos do Zod (`z.infer<typeof schema>`)
6. **Valide uploads**: Use `validateFileUpload` para validar arquivos
7. **Escape saídas**: Use `escapeHtml` antes de renderizar dados do usuário

## 🚨 Alertas de Segurança

⚠️ **NUNCA**:
- Confie em dados do cliente sem validação
- Renderize HTML/scripts enviados por usuários
- Desabilite sanitização
- Use `dangerouslySetInnerHTML` com dados não sanitizados
- Execute código enviado pelo usuário

✅ **SEMPRE**:
- Valide no servidor
- Sanitize dados de entrada
- Escape dados de saída
- Use schemas Zod
- Verifique tipos de arquivo em uploads
- Limite tamanhos de upload
- Use HTTPS em produção

## 📖 Recursos Adicionais

- [Documentação Zod](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
