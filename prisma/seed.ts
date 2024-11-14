import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a default user
  const defaultUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      // Add other user fields as needed
    },
  });

  // Create a default calendar
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