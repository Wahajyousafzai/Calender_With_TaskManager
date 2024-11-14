import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default user
  const defaultUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: await hash('password123', 12),
    },
  });

  // Create default calendar
  const defaultCalendar = await prisma.calendar.upsert({
    where: {
      id: 'default-calendar',
    },
    update: {},
    create: {
      id: 'default-calendar',
      name: 'My Calendar',
      color: '#2563eb',
      isDefault: true,
      userId: defaultUser.id,
    },
  });

  console.log({ defaultUser, defaultCalendar });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 