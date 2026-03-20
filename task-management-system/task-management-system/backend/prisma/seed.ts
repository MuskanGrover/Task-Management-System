import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@example.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email,
      passwordHash: await bcrypt.hash('Password123!', 10),
      tasks: {
        create: [
          { title: 'Read the assessment', description: 'Review project scope carefully.', status: 'COMPLETED' },
          { title: 'Implement authentication', description: 'Access + refresh token flow.' },
          { title: 'Build responsive dashboard', description: 'Search, filter and CRUD UI.' }
        ]
      }
    }
  });

  console.log(`Seeded demo user ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
