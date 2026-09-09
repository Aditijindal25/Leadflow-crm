import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';

dotenv.config();

const email = process.env.SEED_ADMIN_EMAIL || 'admin@leadflow.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
const organizationName = process.env.SEED_ORGANIZATION_NAME || 'LeadFlow Demo Workspace';

await connectDatabase();
try {
  const organization = await Organization.findOneAndUpdate(
    { slug: 'leadflow-demo' },
    { name: organizationName, slug: 'leadflow-demo' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log(`Workspace id: ${organization._id.toString()}`);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      email,
      password: await bcrypt.hash(password, 12),
      name: 'LeadFlow Admin',
      organizationId: organization._id,
      role: 'OWNER',
    });
    console.log(`Seed admin created: ${email}`);
  }
} finally {
  await disconnectDatabase();
}
