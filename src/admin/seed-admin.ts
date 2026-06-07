import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI!);

  const db = mongoose.connection.db!;
  const users = db.collection('users');

  const existing = await users.findOne({ email: 'admin@osta.com' });
  if (existing) {
    console.log('✅ Admin already exists — skipping');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@1234', 10);

  await users.insertOne({
    fullName: 'Osta Admin',
    email: 'admin@osta.com',
    password: hashedPassword,
    phone: '01000000000',
    role: 'admin',
    provider: 'local',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Admin created successfully');
  console.log('📧 Email:    admin@osta.com');
  console.log('🔑 Password: Admin@1234');
  console.log('⚠️  Change the password after first login!');

  await mongoose.disconnect();
}

seedAdmin().catch(console.error);
