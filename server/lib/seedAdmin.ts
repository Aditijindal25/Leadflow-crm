import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

async function seedAdmin() {
  const email = 'admin@leadflow.com';
  const password = 'admin123';

  const existing = await prisma.admin.findUnique({ where: { email } });

  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: {
        email,
        password: hashed,
      },
    });

    console.log('Seed admin created: admin@leadflow.com / admin123');
    return;
  }

  console.log('Seed admin already exists');
}

seedAdmin()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
