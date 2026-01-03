import { PrismaClient, UserRole, UserStatus, EventStatus, RegistrationStatus, TicketStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpeza do banco (remover dados existentes)
  console.log('🧹 Limpando dados existentes...');
  await prisma.paymentInstallment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.eventMembership.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();

  // 1. CRIAÇÃO DE PERMISSÕES
  console.log('🔐 Criando permissões...');
  const permissions = await Promise.all([
    prisma.permission.create({ data: { code: 'events.view', name: 'Visualizar Eventos', module: 'events' } }),
    prisma.permission.create({ data: { code: 'events.create', name: 'Criar Eventos', module: 'events' } }),
    prisma.permission.create({ data: { code: 'events.edit', name: 'Editar Eventos', module: 'events' } }),
    prisma.permission.create({ data: { code: 'events.delete', name: 'Deletar Eventos', module: 'events' } }),
    prisma.permission.create({ data: { code: 'members.view', name: 'Visualizar Membros', module: 'members' } }),
    prisma.permission.create({ data: { code: 'members.create', name: 'Criar Membros', module: 'members' } }),
    prisma.permission.create({ data: { code: 'members.edit', name: 'Editar Membros', module: 'members' } }),
    prisma.permission.create({ data: { code: 'members.delete', name: 'Deletar Membros', module: 'members' } }),
    prisma.permission.create({ data: { code: 'payments.view', name: 'Visualizar Pagamentos', module: 'payments' } }),
    prisma.permission.create({ data: { code: 'payments.create', name: 'Criar Pagamentos', module: 'payments' } }),
    prisma.permission.create({ data: { code: 'payments.refund', name: 'Reembolsar Pagamentos', module: 'payments' } }),
    prisma.permission.create({ data: { code: 'tickets.view', name: 'Visualizar Tickets', module: 'tickets' } }),
    prisma.permission.create({ data: { code: 'tickets.create', name: 'Criar Tickets', module: 'tickets' } }),
    prisma.permission.create({ data: { code: 'tickets.cancel', name: 'Cancelar Tickets', module: 'tickets' } }),
    prisma.permission.create({ data: { code: 'dashboard.view', name: 'Visualizar Dashboard', module: 'dashboard' } }),
  ]);

  console.log(`✅ ${permissions.length} permissões criadas!`);

  // 2. CRIAÇÃO DE USUÁRIOS
  console.log('👥 Criando usuários...');

  const hashedPassword = await hash('123456', 12);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Pastor João Silva',
      email: 'admin@igreja.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      phone: '(11) 99999-9999',
      address: 'Rua da Igreja, 123 - São Paulo, SP',
      category: 'Pastor Principal',
      status: UserStatus.ACTIVE,
      joinDate: new Date('2020-01-01'),
    },
  });

  // Líderes
  const leader1 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@igreja.com',
      password: hashedPassword,
      role: UserRole.LEADER,
      phone: '(11) 98888-8888',
      address: 'Av. Paulista, 456 - São Paulo, SP',
      category: 'Líder de Louvor',
      status: UserStatus.ACTIVE,
      joinDate: new Date('2021-03-15'),
    },
  });

  const leader2 = await prisma.user.create({
    data: {
      name: 'Carlos Oliveira',
      email: 'carlos@igreja.com',
      password: hashedPassword,
      role: UserRole.LEADER,
      phone: '(11) 97777-7777',
      address: 'Rua Augusta, 789 - São Paulo, SP',
      category: 'Líder de Jovens',
      status: UserStatus.ACTIVE,
      joinDate: new Date('2021-06-20'),
    },
  });

  // Membros
  // Membros (entidade separada)
  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: 'Ana Costa',
        email: 'ana@igreja.com',
        phone: '(11) 96666-6666',
        address: 'Rua das Flores, 321 - São Paulo, SP',
        category: 'Membro Ativo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2022-01-10'),
      },
    }),
    prisma.member.create({
      data: {
        name: 'Pedro Almeida',
        email: 'pedro@igreja.com',
        phone: '(11) 95555-5555',
        address: 'Av. Brasil, 654 - São Paulo, SP',
        category: 'Membro Visitante',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2022-05-22'),
      },
    }),
    prisma.member.create({
      data: {
        name: 'Luiza Ferreira',
        email: 'luiza@igreja.com',
        phone: '(11) 94444-4444',
        address: 'Rua da Esperança, 987 - São Paulo, SP',
        category: 'Membro Ativo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2023-02-14'),
      },
    }),
    prisma.member.create({
      data: {
        name: 'Ricardo Souza',
        email: 'ricardo@igreja.com',
        phone: '(11) 93333-3333',
        address: 'Av. Liberdade, 147 - São Paulo, SP',
        category: 'Membro Novo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2023-08-30'),
      },
    }),
    prisma.member.create({
      data: {
        name: 'Fernanda Lima',
        email: 'fernanda@igreja.com',
        phone: '(11) 92222-2222',
        address: 'Rua do Progresso, 258 - São Paulo, SP',
        category: 'Membro Ativo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2022-11-05'),
      },
    }),
  ]);

  // Usuários que representam pessoas com acesso (mantidos para rotas atuais)
  const memberUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ana Costa',
        email: 'ana@igreja.com',
        password: hashedPassword,
        role: UserRole.MEMBER,
        phone: '(11) 96666-6666',
        address: 'Rua das Flores, 321 - São Paulo, SP',
        category: 'Membro Ativo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2022-01-10'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Pedro Almeida',
        email: 'pedro@igreja.com',
        password: hashedPassword,
        role: UserRole.MEMBER,
        phone: '(11) 95555-5555',
        address: 'Av. Brasil, 654 - São Paulo, SP',
        category: 'Membro Visitante',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2022-05-22'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Luiza Ferreira',
        email: 'luiza@igreja.com',
        password: hashedPassword,
        role: UserRole.MEMBER,
        phone: '(11) 94444-4444',
        address: 'Rua da Esperança, 987 - São Paulo, SP',
        category: 'Membro Ativo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2023-02-14'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ricardo Souza',
        email: 'ricardo@igreja.com',
        password: hashedPassword,
        role: UserRole.MEMBER,
        phone: '(11) 93333-3333',
        address: 'Av. Liberdade, 147 - São Paulo, SP',
        category: 'Membro Novo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2023-08-30'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Fernanda Lima',
        email: 'fernanda@igreja.com',
        password: hashedPassword,
        role: UserRole.MEMBER,
        phone: '(11) 92222-2222',
        address: 'Rua do Progresso, 258 - São Paulo, SP',
        category: 'Membro Ativo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2022-11-05'),
      },
    }),
  ]);

  // 3. ATRIBUIÇÃO DE PERMISSÕES AOS LÍDERES
  console.log('🔑 Atribuindo permissões...');

  // Maria (Líder de Louvor) - Permissões de eventos e visualização
  await prisma.userPermission.createMany({
    data: [
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'events.view')!.id, grantedBy: admin.id },
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'events.create')!.id, grantedBy: admin.id },
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'events.edit')!.id, grantedBy: admin.id },
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'members.view')!.id, grantedBy: admin.id },
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'dashboard.view')!.id, grantedBy: admin.id },
    ],
  });

  // Carlos (Líder de Jovens) - Permissões de membros e eventos
  await prisma.userPermission.createMany({
    data: [
      { userId: leader2.id, permissionId: permissions.find(p => p.code === 'events.view')!.id, grantedBy: admin.id },
      { userId: leader2.id, permissionId: permissions.find(p => p.code === 'members.view')!.id, grantedBy: admin.id },
      { userId: leader2.id, permissionId: permissions.find(p => p.code === 'members.edit')!.id, grantedBy: admin.id },
      { userId: leader2.id, permissionId: permissions.find(p => p.code === 'dashboard.view')!.id, grantedBy: admin.id },
    ],
  });

  console.log('✅ Permissões atribuídas!');

  // 4. CRIAÇÃO DE EVENTOS
  console.log('📅 Criando eventos...');

  const retiroAnual = await prisma.event.create({
    data: {
      title: 'Retiro Anual 2024 - Renovação Espiritual',
      description: 'Um fim de semana transformador com palestras, ministração e comunhão. Venha renovar sua fé e fortalecer sua caminhada com Deus.',
      startDate: new Date('2024-03-15T14:00:00Z'),
      endDate: new Date('2024-03-17T16:00:00Z'),
      location: 'Chácara Esperança - Atibaia, SP',
      capacity: 150,
      price: 180.00,
      category: 'Retiro',
      status: EventStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      creatorId: admin.id,
      removed: false,
    },
  });

  const conferencia = await prisma.event.create({
    data: {
      title: 'Conferência de Jovens 2024',
      description: 'Três dias intensos de adoração, palavra e comunhão. Palestrantes especiais e muito louvor.',
      startDate: new Date('2024-04-10T19:00:00Z'),
      endDate: new Date('2024-04-12T22:00:00Z'),
      location: 'Centro de Convenções - São Paulo, SP',
      capacity: 500,
      price: 75.00,
      category: 'Conferência',
      status: EventStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      creatorId: leader2.id,
      removed: false,
    },
  });

  const cultoEspecial = await prisma.event.create({
    data: {
      title: 'Culto Especial de Páscoa',
      description: 'Celebração especial da ressurreição de Cristo com coral, orquestra e ministração especial.',
      startDate: new Date('2024-03-31T19:00:00Z'),
      endDate: new Date('2024-03-31T21:30:00Z'),
      location: 'Templo Central - São Paulo, SP',
      capacity: 800,
      price: 0.00,
      category: 'Culto Especial',
      status: EventStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=600&fit=crop',
      creatorId: admin.id,
      removed: false,
    },
  });

  const workshopLideranca = await prisma.event.create({
    data: {
      title: 'Workshop de Liderança Cristã',
      description: 'Capacitação para líderes atuais e futuros, com foco em liderança servidora e gestão de ministérios.',
      startDate: new Date('2024-05-18T08:00:00Z'),
      endDate: new Date('2024-05-18T17:00:00Z'),
      location: 'Salão de Eventos - Igreja Central',
      capacity: 80,
      price: 45.00,
      category: 'Workshop',
      status: EventStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
      creatorId: leader1.id,
      removed: false,
    },
  });

  const acampamentoFamilias = await prisma.event.create({
    data: {
      title: 'Acampamento de Famílias',
      description: 'Uma experiência inesquecível para toda a família com atividades, ministração e muito lazer.',
      startDate: new Date('2024-07-20T15:00:00Z'),
      endDate: new Date('2024-07-22T14:00:00Z'),
      location: 'Camping Vida Nova - Campos do Jordão, SP',
      capacity: 200,
      price: 120.00,
      category: 'Acampamento',
      status: EventStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&h=600&fit=crop',
      creatorId: admin.id,
      removed: false,
    },
  });

  // Evento passado
  const eventoPassado = await prisma.event.create({
    data: {
      title: 'Congresso de Missões 2023',
      description: 'Evento já realizado com grande impacto missionário.',
      startDate: new Date('2023-11-15T19:00:00Z'),
      endDate: new Date('2023-11-17T21:00:00Z'),
      location: 'Centro de Convenções - São Paulo, SP',
      capacity: 300,
      price: 60.00,
      category: 'Congresso',
      status: EventStatus.ENDED,
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop',
      creatorId: admin.id,
      removed: false,
    },
  });

  const allEvents = [retiroAnual, conferencia, cultoEspecial, workshopLideranca, acampamentoFamilias, eventoPassado];
  const allUsers = [admin, leader1, leader2, ...memberUsers];

  // 5. CRIAÇÃO DE INSCRIÇÕES EM EVENTOS
  console.log('📝 Criando inscrições em eventos...');

  const memberships = [];

  // Inscrições no Retiro Anual (feitas pelo admin)
  for (let i = 0; i < 4 && i < members.length; i++) {
    const membership = await prisma.eventMembership.create({
      data: {
        memberId: members[i].id,
        eventId: retiroAnual.id,
        status: RegistrationStatus.CONFIRMED,
        registeredAt: new Date('2024-01-15'),
        createdByUserId: admin.id,
      },
    });
    memberships.push(membership);
  }

  // Inscrições na Conferência de Jovens (feitas pelo leader2)
  for (let i = 0; i < 3 && i < members.length; i++) {
    const membership = await prisma.eventMembership.create({
      data: {
        memberId: members[(i + 1) % members.length].id,
        eventId: conferencia.id,
        status: RegistrationStatus.CONFIRMED,
        registeredAt: new Date('2024-02-10'),
        createdByUserId: leader2.id,
      },
    });
    memberships.push(membership);
  }

  // 6. CRIAÇÃO DE PAGAMENTOS
  console.log('💳 Criando pagamentos...');

  const payments = [];

  // Pagamento para Retiro Anual - 2 tickets
  const payment1 = await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2024-001',
      userId: memberUsers[0].id,
      eventId: retiroAnual.id,
      amount: 360.00, // 2 tickets x R$ 180.00
      method: PaymentMethod.PIX,
      status: PaymentStatus.PAID,
      transactionId: 'TXN-PIX-001',
      stripePaymentIntentId: 'pi_3NqK8I2eZvKYlo2C0vZdcA1B',
      stripeCustomerId: 'cus_OqK8I2eZvKYlo2C',
      paidAt: new Date('2024-01-20T10:30:00Z'),
      dueDate: new Date('2024-03-01T23:59:59Z'),
    },
  });
  payments.push(payment1);

  // Pagamento para Conferência - 1 ticket
  const payment2 = await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2024-002',
      userId: memberUsers[1].id,
      eventId: conferencia.id,
      amount: 75.00,
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PAID,
      transactionId: 'TXN-CC-002',
      stripePaymentIntentId: 'pi_3NqK8I2eZvKYlo2C0vZdcA2C',
      stripeCustomerId: 'cus_OqK8I2eZvKYlo2D',
      paidAt: new Date('2024-02-15T14:45:00Z'),
      dueDate: new Date('2024-04-01T23:59:59Z'),
    },
  });
  payments.push(payment2);

  // Pagamento para Workshop - 1 ticket
  const payment3 = await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2024-003',
      userId: memberUsers[2].id,
      eventId: workshopLideranca.id,
      amount: 45.00,
      method: PaymentMethod.PIX,
      status: PaymentStatus.PAID,
      transactionId: 'TXN-PIX-003',
      stripePaymentIntentId: 'pi_3NqK8I2eZvKYlo2C0vZdcA3D',
      stripeCustomerId: 'cus_OqK8I2eZvKYlo2E',
      paidAt: new Date('2024-03-01T09:15:00Z'),
      dueDate: new Date('2024-05-10T23:59:59Z'),
    },
  });
  payments.push(payment3);

  // Pagamento pendente
  const payment4 = await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2024-004',
      userId: memberUsers[3].id,
      eventId: acampamentoFamilias.id,
      amount: 240.00, // 2 tickets x R$ 120.00
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PENDING,
      dueDate: new Date('2024-07-10T23:59:59Z'),
    },
  });
  payments.push(payment4);

  // 7. CRIAÇÃO DE TICKETS
  console.log('🎫 Criando tickets...');

  // Tickets para o primeiro pagamento (Retiro Anual - 2 tickets)
  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-RET-2024-001',
      userId: memberUsers[0].id,
      eventId: retiroAnual.id,
      ticketType: 'VIP',
      price: 180.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-RET-001-' + Date.now(),
      stripePaymentIntentId: payment1.stripePaymentIntentId,
      stripeCustomerId: payment1.stripeCustomerId,
      paymentId: payment1.id,
    },
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-RET-2024-002',
      userId: memberUsers[0].id,
      eventId: retiroAnual.id,
      ticketType: 'VIP',
      price: 180.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-RET-002-' + Date.now(),
      stripePaymentIntentId: payment1.stripePaymentIntentId,
      stripeCustomerId: payment1.stripeCustomerId,
      paymentId: payment1.id,
    },
  });

  // Ticket para o segundo pagamento (Conferência)
  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-CONF-2024-001',
      userId: memberUsers[1].id,
      eventId: conferencia.id,
      ticketType: 'STANDARD',
      price: 75.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-CONF-001-' + Date.now(),
      stripePaymentIntentId: payment2.stripePaymentIntentId,
      stripeCustomerId: payment2.stripeCustomerId,
      paymentId: payment2.id,
    },
  });

  // Ticket para o terceiro pagamento (Workshop)
  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-WORK-2024-001',
      userId: memberUsers[2].id,
      eventId: workshopLideranca.id,
      ticketType: 'STANDARD',
      price: 45.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-WORK-001-' + Date.now(),
      stripePaymentIntentId: payment3.stripePaymentIntentId,
      stripeCustomerId: payment3.stripeCustomerId,
      paymentId: payment3.id,
    },
  });

  // Tickets para o pagamento pendente (Acampamento - 2 tickets)
  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-CAMP-2024-001',
      userId: memberUsers[3].id,
      eventId: acampamentoFamilias.id,
      ticketType: 'FAMILY',
      price: 120.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-CAMP-001-' + Date.now(),
      paymentId: payment4.id,
    },
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-CAMP-2024-002',
      userId: memberUsers[3].id,
      eventId: acampamentoFamilias.id,
      ticketType: 'FAMILY',
      price: 120.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-CAMP-002-' + Date.now(),
      paymentId: payment4.id,
    },
  });

  // Ticket usado (evento passado)
  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-MISS-2023-001',
      userId: memberUsers[4].id,
      eventId: eventoPassado.id,
      ticketType: 'STANDARD',
      price: 60.00,
      status: TicketStatus.USED,
      qrCode: 'QR-MISS-001-' + Date.now(),
    },
  });

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log(`   🔐 ${permissions.length} permissões`);
  console.log(`   👥 ${allUsers.length} usuários (1 admin, 2 líderes, ${members.length} membros)`);
  console.log(`   📅 ${allEvents.length} eventos`);
  console.log(`   📝 ${memberships.length} inscrições`);
  console.log(`   💳 ${payments.length} pagamentos`);
  console.log(`   🎫 7 tickets`);
  console.log('\n🔑 Credenciais de acesso:');
  console.log('   Admin: admin@igreja.com / 123456');
  console.log('   Líder 1: maria@igreja.com / 123456');
  console.log('   Líder 2: carlos@igreja.com / 123456');
  console.log('   Membro: ana@igreja.com / 123456');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
