import { PrismaClient } from '@prisma/client';
import { PERMISSION_DEFINITIONS } from '../lib/permissions';

export async function seedPermissions(prismaClient?: PrismaClient) {
  const prisma = prismaClient || new PrismaClient();

  console.log('🔐 Seeding permissions...');

  // Criar ou atualizar todas as permissões
  for (const permDef of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { code: permDef.code },
      update: {
        name: permDef.name,
        description: permDef.description,
        module: permDef.module,
      },
      create: {
        code: permDef.code,
        name: permDef.name,
        description: permDef.description || '',
        module: permDef.module,
      },
    });
  }

  console.log(`✅ Created/Updated ${PERMISSION_DEFINITIONS.length} permissions`);

  // Se criamos um novo cliente, desconectar
  if (!prismaClient) {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const prisma = new PrismaClient();

  seedPermissions(prisma)
    .then(() => {
      console.log('✅ Permissions seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding permissions:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
