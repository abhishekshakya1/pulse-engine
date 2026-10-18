import { PrismaClient, Role, Plan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PulseEngine database...");

  // 1. Clean existing records (Optional, safe order)
  await prisma.incident.deleteMany();
  await prisma.telemetryEvent.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 2. Create Default Tenant / Organization
  const org = await prisma.organization.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp",
      plan: Plan.PRO,
      monthlyQuota: 500000,
      eventsCount: 0,
    },
  });
  console.log(`✅ Created Organization: ${org.name} (${org.id})`);

  // 3. Hash Password & Create Super Admin User
  const passwordHash = await bcrypt.hash("Password@123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Abhishek Admin",
      email: "admin@pulseengine.dev",
      passwordHash,
      role: Role.ADMIN,
      organizationId: org.id,
    },
  });
  console.log(`✅ Created Admin User: ${user.email}`);

  // 4. Create Ingestion API Key for Client Testing
  const apiKey = await prisma.apiKey.create({
    data: {
      name: "Default Ingestion Key",
      key: "pe_live_dev_8f7b2c9a1e3d4",
      rateLimit: 120, // 120 requests/min
      organizationId: org.id,
    },
  });
  console.log(`✅ Created API Key: ${apiKey.key}`);

  console.log("\n🎉 Database seeded successfully! Ready for Module 2.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
