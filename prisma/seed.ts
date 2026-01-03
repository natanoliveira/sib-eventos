import { PrismaClient, UserRole, UserStatus, EventStatus, RegistrationStatus, TicketStatus, PaymentMethod, PaymentStatus, InstallmentStatus, InvoiceStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpeza do banco (remover dados existentes)
  console.log('🧹 Limpando dados existentes...');
  await prisma.payment.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.eventMembership.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.person.deleteMany();
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

  // 2. CRIAÇÃO DE USUÁRIOS (Administradores e Líderes com autenticação)
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

  // 3. CRIAÇÃO DE PESSOAS (Membros da igreja)
  console.log('👤 Criando pessoas/membros...');

  const persons = await Promise.all([
    prisma.person.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@igreja.com',
        phone: '(11) 98888-8888',
        address: 'Av. Paulista, 456 - São Paulo, SP',
        category: 'Membro Ativo',
        status: UserStatus.ACTIVE,
        joinDate: new Date('2021-03-15'),
      },
    }),
    prisma.person.create({
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
    prisma.person.create({
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
    prisma.person.create({
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
    prisma.person.create({
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
    prisma.person.create({
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

  // 4. ATRIBUIÇÃO DE PERMISSÕES
  console.log('🔑 Atribuindo permissões...');

  await prisma.userPermission.createMany({
    data: [
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'events.view')!.id, grantedBy: admin.id },
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'members.view')!.id, grantedBy: admin.id },
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'members.edit')!.id, grantedBy: admin.id },
      { userId: leader1.id, permissionId: permissions.find(p => p.code === 'dashboard.view')!.id, grantedBy: admin.id },
    ],
  });

  console.log('✅ Permissões atribuídas!');

  // 5. CRIAÇÃO DE EVENTOS
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
      creatorId: leader1.id,
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
      creatorId: admin.id,
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

  const allEvents = [retiroAnual, conferencia, cultoEspecial, workshopLideranca, acampamentoFamilias];

  // 6. CRIAÇÃO DE INSCRIÇÕES EM EVENTOS
  console.log('📝 Criando inscrições em eventos...');

  const memberships = [];

  // Inscrições no Retiro Anual
  for (let i = 0; i < 3; i++) {
    const membership = await prisma.eventMembership.create({
      data: {
        personId: persons[i].id,
        eventId: retiroAnual.id,
        status: RegistrationStatus.CONFIRMED,
        registeredAt: new Date('2024-01-15'),
        createdByUserId: admin.id,
      },
    });
    memberships.push(membership);
  }

  // Inscrições na Conferência de Jovens
  for (let i = 1; i < 4; i++) {
    const membership = await prisma.eventMembership.create({
      data: {
        personId: persons[i].id,
        eventId: conferencia.id,
        status: RegistrationStatus.CONFIRMED,
        registeredAt: new Date('2024-02-10'),
        createdByUserId: leader1.id,
      },
    });
    memberships.push(membership);
  }

  // 7. CRIAÇÃO DE FATURAS (Invoice) → PARCELAS (Installment) → PAGAMENTOS (Payment)
  console.log('💰 Criando faturas, parcelas e pagamentos...');

  // FATURA 1: Maria Santos - Retiro Anual (à vista)
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      personId: persons[0].id,
      eventId: retiroAnual.id,
      totalAmount: 180.00,
      status: InvoiceStatus.PAID,
      createdByUserId: admin.id,
    },
  });

  const installment1 = await prisma.installment.create({
    data: {
      invoiceId: invoice1.id,
      installmentNumber: 1,
      amount: 180.00,
      dueDate: new Date('2024-02-15'),
      status: InstallmentStatus.PAID,
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2024-001',
      installmentId: installment1.id,
      amount: 180.00,
      method: PaymentMethod.PIX,
      status: PaymentStatus.PAID,
      transactionId: 'TXN-PIX-001',
      stripePaymentIntentId: 'pi_3NqK8I2eZvKYlo2C0vZdcA1B',
      stripeCustomerId: 'cus_OqK8I2eZvKYlo2C',
      paidAt: new Date('2024-02-10T10:30:00Z'),
      createdByUserId: admin.id,
    },
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-RET-2024-001',
      personId: persons[0].id,
      eventId: retiroAnual.id,
      invoiceId: invoice1.id,
      ticketType: 'VIP',
      price: 180.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-RET-001-' + Date.now(),
    },
  });

  // FATURA 2: Ana Costa - Conferência (3x parcelas)
  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-002',
      personId: persons[1].id,
      eventId: conferencia.id,
      totalAmount: 75.00,
      status: InvoiceStatus.PARTIALLY_PAID,
      createdByUserId: admin.id,
    },
  });

  const installment2_1 = await prisma.installment.create({
    data: {
      invoiceId: invoice2.id,
      installmentNumber: 1,
      amount: 25.00,
      dueDate: new Date('2024-03-01'),
      status: InstallmentStatus.PAID,
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2024-002',
      installmentId: installment2_1.id,
      amount: 25.00,
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PAID,
      transactionId: 'TXN-CC-002',
      stripePaymentIntentId: 'pi_3NqK8I2eZvKYlo2C0vZdcA2C',
      paidAt: new Date('2024-03-01T14:45:00Z'),
      createdByUserId: admin.id,
    },
  });

  await prisma.installment.create({
    data: {
      invoiceId: invoice2.id,
      installmentNumber: 2,
      amount: 25.00,
      dueDate: new Date('2024-04-01'),
      status: InstallmentStatus.PENDING,
    },
  });

  await prisma.installment.create({
    data: {
      invoiceId: invoice2.id,
      installmentNumber: 3,
      amount: 25.00,
      dueDate: new Date('2024-05-01'),
      status: InstallmentStatus.PENDING,
    },
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-CONF-2024-001',
      personId: persons[1].id,
      eventId: conferencia.id,
      invoiceId: invoice2.id,
      ticketType: 'STANDARD',
      price: 75.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-CONF-001-' + Date.now(),
    },
  });

  // FATURA 3: Pedro - Workshop (à vista, pendente)
  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-003',
      personId: persons[2].id,
      eventId: workshopLideranca.id,
      totalAmount: 45.00,
      status: InvoiceStatus.PENDING,
      createdByUserId: admin.id,
    },
  });

  await prisma.installment.create({
    data: {
      invoiceId: invoice3.id,
      installmentNumber: 1,
      amount: 45.00,
      dueDate: new Date('2024-05-10'),
      status: InstallmentStatus.PENDING,
    },
  });

  await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-WORK-2024-001',
      personId: persons[2].id,
      eventId: workshopLideranca.id,
      invoiceId: invoice3.id,
      ticketType: 'STANDARD',
      price: 45.00,
      status: TicketStatus.ACTIVE,
      qrCode: 'QR-WORK-001-' + Date.now(),
    },
  });

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log(`   🔐 ${permissions.length} permissões`);
  console.log(`   👥 2 usuários (1 admin, 1 líder)`);
  console.log(`   👤 ${persons.length} pessoas (membros)`);
  console.log(`   📅 ${allEvents.length} eventos`);
  console.log(`   📝 ${memberships.length} inscrições`);
  console.log(`   💰 3 faturas (Invoice)`);
  console.log(`   📄 5 parcelas (Installment)`);
  console.log(`   💳 2 pagamentos (Payment)`);
  console.log(`   🎫 3 tickets`);
  console.log('\n🔑 Credenciais de acesso:');
  console.log('   Admin: admin@igreja.com / 123456');
  console.log('   Líder: carlos@igreja.com / 123456');
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
