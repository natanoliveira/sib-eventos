/**
 * Sistema de Permissões
 *
 * Define as permissões disponíveis no sistema e suas respectivas ações.
 */

export const PERMISSIONS = {
  // Inscrições em Eventos (event-registrations)
  EVENT_REGISTRATIONS_VIEW: 'event_registrations.view',
  EVENT_REGISTRATIONS_CREATE: 'event_registrations.create',
  EVENT_REGISTRATIONS_CANCEL: 'event_registrations.cancel',
  EVENT_REGISTRATIONS_CONFIRM: 'event_registrations.confirm',

  // Pagamentos (payments)
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MARK_AS_PAID: 'payments.mark_as_paid',
  PAYMENTS_CANCEL: 'payments.cancel',

  // Parcelas (installments)
  INSTALLMENTS_VIEW: 'installments.view',
  INSTALLMENTS_REGISTER_PAYMENT: 'installments.register_payment',
  INSTALLMENTS_STRIPE: 'installments.stripe',
  INSTALLMENTS_CANCEL: 'installments.cancel',

  // Pessoas (members)
  MEMBERS_VIEW: 'members.view',
  MEMBERS_EDIT: 'members.edit',
  MEMBERS_DELETE: 'members.delete',
  MEMBERS_CREATE: 'members.create',

  // Eventos
  EVENTS_VIEW: 'events.view',
  EVENTS_CREATE: 'events.create',
  EVENTS_EDIT: 'events.edit',
  EVENTS_DELETE: 'events.delete',

  // Tickets
  TICKETS_VIEW: 'tickets.view',
  TICKETS_SEND: 'tickets.send',
  TICKETS_PRINT: 'tickets.print',

  // Configurações (apenas ADMIN)
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',

  // Usuários
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_PERMISSIONS: 'users.manage_permissions',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Definição das permissões com metadados
 */
export const PERMISSION_DEFINITIONS = [
  // Event Registrations
  {
    code: PERMISSIONS.EVENT_REGISTRATIONS_VIEW,
    name: 'Visualizar Inscrições',
    description: 'Permite visualizar inscrições em eventos',
    module: 'event_registrations',
  },
  {
    code: PERMISSIONS.EVENT_REGISTRATIONS_CREATE,
    name: 'Criar Inscrição',
    description: 'Permite criar novas inscrições em eventos',
    module: 'event_registrations',
  },
  {
    code: PERMISSIONS.EVENT_REGISTRATIONS_CANCEL,
    name: 'Cancelar Inscrição',
    description: 'Permite cancelar inscrições em eventos',
    module: 'event_registrations',
  },
  {
    code: PERMISSIONS.EVENT_REGISTRATIONS_CONFIRM,
    name: 'Confirmar Inscrição',
    description: 'Permite confirmar inscrições em eventos',
    module: 'event_registrations',
  },

  // Payments
  {
    code: PERMISSIONS.PAYMENTS_VIEW,
    name: 'Visualizar Pagamentos',
    description: 'Permite visualizar pagamentos',
    module: 'payments',
  },
  {
    code: PERMISSIONS.PAYMENTS_MARK_AS_PAID,
    name: 'Marcar como Pago',
    description: 'Permite marcar pagamentos como pagos',
    module: 'payments',
  },
  {
    code: PERMISSIONS.PAYMENTS_CANCEL,
    name: 'Cancelar Pagamento',
    description: 'Permite cancelar pagamentos',
    module: 'payments',
  },

  // Installments
  {
    code: PERMISSIONS.INSTALLMENTS_VIEW,
    name: 'Visualizar Parcelas',
    description: 'Permite visualizar parcelas',
    module: 'installments',
  },
  {
    code: PERMISSIONS.INSTALLMENTS_REGISTER_PAYMENT,
    name: 'Registrar Pagamento',
    description: 'Permite registrar pagamento de parcelas',
    module: 'installments',
  },
  {
    code: PERMISSIONS.INSTALLMENTS_STRIPE,
    name: 'Pagamento via Stripe',
    description: 'Permite processar pagamentos via Stripe',
    module: 'installments',
  },
  {
    code: PERMISSIONS.INSTALLMENTS_CANCEL,
    name: 'Cancelar Parcela',
    description: 'Permite cancelar parcelas',
    module: 'installments',
  },

  // Members
  {
    code: PERMISSIONS.MEMBERS_VIEW,
    name: 'Visualizar Membros',
    description: 'Permite visualizar membros',
    module: 'members',
  },
  {
    code: PERMISSIONS.MEMBERS_CREATE,
    name: 'Criar Membro',
    description: 'Permite criar novos membros',
    module: 'members',
  },
  {
    code: PERMISSIONS.MEMBERS_EDIT,
    name: 'Editar Membro',
    description: 'Permite editar dados de membros',
    module: 'members',
  },
  {
    code: PERMISSIONS.MEMBERS_DELETE,
    name: 'Deletar Membro',
    description: 'Permite deletar membros',
    module: 'members',
  },

  // Events
  {
    code: PERMISSIONS.EVENTS_VIEW,
    name: 'Visualizar Eventos',
    description: 'Permite visualizar eventos',
    module: 'events',
  },
  {
    code: PERMISSIONS.EVENTS_CREATE,
    name: 'Criar Evento',
    description: 'Permite criar novos eventos',
    module: 'events',
  },
  {
    code: PERMISSIONS.EVENTS_EDIT,
    name: 'Editar Evento',
    description: 'Permite editar eventos',
    module: 'events',
  },
  {
    code: PERMISSIONS.EVENTS_DELETE,
    name: 'Deletar Evento',
    description: 'Permite deletar eventos',
    module: 'events',
  },

  // Tickets
  {
    code: PERMISSIONS.TICKETS_VIEW,
    name: 'Visualizar Tickets',
    description: 'Permite visualizar tickets',
    module: 'tickets',
  },
  {
    code: PERMISSIONS.TICKETS_SEND,
    name: 'Enviar Ticket',
    description: 'Permite enviar tickets por email',
    module: 'tickets',
  },
  {
    code: PERMISSIONS.TICKETS_PRINT,
    name: 'Imprimir Ticket',
    description: 'Permite imprimir tickets',
    module: 'tickets',
  },

  // Settings
  {
    code: PERMISSIONS.SETTINGS_VIEW,
    name: 'Visualizar Configurações',
    description: 'Permite acessar configurações do sistema',
    module: 'settings',
  },
  {
    code: PERMISSIONS.SETTINGS_MANAGE,
    name: 'Gerenciar Configurações',
    description: 'Permite modificar configurações do sistema',
    module: 'settings',
  },

  // Users
  {
    code: PERMISSIONS.USERS_VIEW,
    name: 'Visualizar Usuários',
    description: 'Permite visualizar usuários',
    module: 'users',
  },
  {
    code: PERMISSIONS.USERS_CREATE,
    name: 'Criar Usuário',
    description: 'Permite criar novos usuários',
    module: 'users',
  },
  {
    code: PERMISSIONS.USERS_EDIT,
    name: 'Editar Usuário',
    description: 'Permite editar usuários',
    module: 'users',
  },
  {
    code: PERMISSIONS.USERS_DELETE,
    name: 'Deletar Usuário',
    description: 'Permite deletar usuários',
    module: 'users',
  },
  {
    code: PERMISSIONS.USERS_MANAGE_PERMISSIONS,
    name: 'Gerenciar Permissões',
    description: 'Permite gerenciar permissões de usuários',
    module: 'users',
  },
];

/**
 * Permissões padrão por role
 */
export const DEFAULT_PERMISSIONS_BY_ROLE = {
  ADMIN: Object.values(PERMISSIONS), // ADMIN tem todas as permissões
  LEADER: [
    // Event Registrations
    PERMISSIONS.EVENT_REGISTRATIONS_VIEW,
    PERMISSIONS.EVENT_REGISTRATIONS_CREATE,
    PERMISSIONS.EVENT_REGISTRATIONS_CANCEL,
    PERMISSIONS.EVENT_REGISTRATIONS_CONFIRM,
    // Payments
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MARK_AS_PAID,
    // Installments
    PERMISSIONS.INSTALLMENTS_VIEW,
    PERMISSIONS.INSTALLMENTS_REGISTER_PAYMENT,
    PERMISSIONS.INSTALLMENTS_STRIPE,
    // Members
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_CREATE,
    PERMISSIONS.MEMBERS_EDIT,
    // Events
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_EDIT,
    // Tickets
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_SEND,
    PERMISSIONS.TICKETS_PRINT,
  ],
  MEMBER: [
    // Event Registrations
    PERMISSIONS.EVENT_REGISTRATIONS_VIEW,
    // Payments
    PERMISSIONS.PAYMENTS_VIEW,
    // Installments
    PERMISSIONS.INSTALLMENTS_VIEW,
    // Members
    PERMISSIONS.MEMBERS_VIEW,
    // Events
    PERMISSIONS.EVENTS_VIEW,
    // Tickets
    PERMISSIONS.TICKETS_VIEW,
  ],
};

/**
 * Verifica se o usuário é ADMIN
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'ADMIN';
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasPermission(
  userPermissions: string[],
  permission: PermissionCode,
  userRole?: string
): boolean {
  // ADMIN sempre tem acesso
  if (userRole && isAdmin(userRole)) {
    return true;
  }

  return userPermissions.includes(permission);
}

/**
 * Verifica se o usuário tem todas as permissões especificadas
 */
export function hasAllPermissions(
  userPermissions: string[],
  permissions: PermissionCode[],
  userRole?: string
): boolean {
  // ADMIN sempre tem acesso
  if (userRole && isAdmin(userRole)) {
    return true;
  }

  return permissions.every(permission => userPermissions.includes(permission));
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões especificadas
 */
export function hasAnyPermission(
  userPermissions: string[],
  permissions: PermissionCode[],
  userRole?: string
): boolean {
  // ADMIN sempre tem acesso
  if (userRole && isAdmin(userRole)) {
    return true;
  }

  return permissions.some(permission => userPermissions.includes(permission));
}
