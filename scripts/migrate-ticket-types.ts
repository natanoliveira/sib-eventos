import { PrismaClient } from '@prisma/client';

/**
 * Script de migração de dados para criar TicketTypes padrão
 * para eventos existentes que não possuem tipos de ingresso
 *
 * Execução: npx tsx scripts/migrate-ticket-types.ts
 */

async function migrateExistingEvents() {
  const prisma = new PrismaClient();

  try {
    console.log('🚀 Iniciando migração de tipos de ingresso...\n');

    // Buscar todos os eventos existentes
    const events = await prisma.event.findMany({
      include: {
        memberships: true,
        ticketTypes: true,
      },
    });

    console.log(`📊 Encontrados ${events.length} eventos no banco de dados\n`);

    let migrated = 0;
    let skipped = 0;

    for (const event of events) {
      // Verificar se o evento já possui tipos de ingresso
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        console.log(`⏭️  Pulando evento "${event.title}" - já possui tipos de ingresso`);
        skipped++;
        continue;
      }

      // Criar TicketType padrão para o evento
      const ticketType = await prisma.ticketType.create({
        data: {
          name: 'Ingresso Padrão',
          description: 'Ingresso padrão do evento',
          price: event.price || 0,
          capacity: null, // Ilimitado dentro da capacidade do evento
          eventId: event.id,
        },
      });

      console.log(`✅ Criado tipo de ingresso para "${event.title}"`);

      // Atualizar todas as inscrições (EventMembership) existentes para vincular ao novo TicketType
      if (event.memberships && event.memberships.length > 0) {
        await prisma.eventMembership.updateMany({
          where: { eventId: event.id },
          data: { ticketTypeId: ticketType.id },
        });

        console.log(`   └─ ${event.memberships.length} inscrições vinculadas ao tipo de ingresso`);
      }

      migrated++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✨ Migração concluída com sucesso!`);
    console.log(`   - Eventos migrados: ${migrated}`);
    console.log(`   - Eventos pulados: ${skipped}`);
    console.log(`   - Total: ${events.length}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateExistingEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
