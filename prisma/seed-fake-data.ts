import { Prisma, RegistrationStatus, UserStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const FIRST_NAMES = [
  'Ana',
  'Bruno',
  'Carla',
  'Diego',
  'Eduardo',
  'Fernanda',
  'Gustavo',
  'Helena',
  'Igor',
  'Juliana',
  'Kaique',
  'Larissa',
  'Marcos',
  'Natalia',
  'Otavio',
  'Paula',
  'Rafael',
  'Sabrina',
  'Tiago',
  'Vanessa',
  'Willian',
  'Yasmin',
  'Zeca',
];

const LAST_NAMES = [
  'Almeida',
  'Barbosa',
  'Cardoso',
  'Dias',
  'Esteves',
  'Ferreira',
  'Goncalves',
  'Henrique',
  'Lima',
  'Moraes',
  'Nunes',
  'Oliveira',
  'Pereira',
  'Ramos',
  'Silva',
  'Teixeira',
  'Vieira',
];

const CATEGORIES = ['Membro Ativo', 'Membro Novo', 'Visitante', 'Membro Regular'];

const STREETS = [
  'Rua das Flores',
  'Avenida Brasil',
  'Rua da Esperanca',
  'Avenida Central',
  'Rua do Progresso',
  'Rua da Paz',
  'Avenida Paulista',
  'Rua Sao Bento',
  'Avenida Liberdade',
  'Rua das Oliveiras',
];

type FakeSeedResult = {
  persons: Prisma.PersonCreateManyInput[];
  memberships: Prisma.EventMembershipCreateManyInput[];
};

export function buildFakePeopleAndMemberships(options: {
  count: number;
  eventIds: string[];
  createdByUserId: string;
}): FakeSeedResult {
  const { count, eventIds, createdByUserId } = options;

  if (eventIds.length === 0) {
    throw new Error('eventIds must have at least one item');
  }

  const persons: Prisma.PersonCreateManyInput[] = [];
  const memberships: Prisma.EventMembershipCreateManyInput[] = [];

  for (let i = 0; i < count; i++) {
    const personId = randomUUID();
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const joinYear = 2020 + (i % 5);
    const joinMonth = i % 12;
    const joinDay = (i % 28) + 1;
    const phoneSuffix = String(1000 + (i % 9000));
    const addressNumber = 100 + (i % 900);
    const street = STREETS[(i * 3) % STREETS.length];
    const emailIndex = String(i + 1).padStart(5, '0');

    const joinDate = new Date(joinYear, joinMonth, joinDay);

    persons.push({
      id: personId,
      name: `${first} ${last}`,
      email: `membro${emailIndex}@igreja.com`,
      phone: `(11) 9${String(80000000 + (i % 90000000)).slice(-8)}`,
      address: `${street}, ${addressNumber} - Sao Paulo, SP`,
      category: CATEGORIES[i % CATEGORIES.length],
      status: UserStatus.ACTIVE,
      joinDate,
    });

    const primaryEventId = eventIds[i % eventIds.length];
    const shouldAddSecond = i % 4 === 0 && eventIds.length > 1;
    const secondaryEventId = eventIds[(i + 1) % eventIds.length];
    const registeredAt = new Date(2024, joinMonth, joinDay);

    memberships.push({
      personId,
      eventId: primaryEventId,
      status: RegistrationStatus.CONFIRMED,
      registeredAt,
      createdByUserId,
    });

    if (shouldAddSecond) {
      memberships.push({
        personId,
        eventId: secondaryEventId,
        status: RegistrationStatus.CONFIRMED,
        registeredAt,
        createdByUserId,
      });
    }
  }

  return { persons, memberships };
}
