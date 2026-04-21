const { PrismaClient, Stage } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Reset database
  await prisma.fieldUpdate.deleteMany();
  await prisma.field.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Mkulima Mkuu",
      email: "mkulimamkuu@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const agentHuria = await prisma.user.create({
    data: {
      name: "Mkulima Huria",
      email: "mkulimahuria@example.com",
      password: hashedPassword,
      role: "AGENT",
    },
  });

  const agentJasiri = await prisma.user.create({
    data: {
      name: "Mkulima Jasiri",
      email: "mkulimajasiri@example.com",
      password: hashedPassword,
      role: "AGENT",
    },
  });

  // Fields
  // Field 1: Active — recently updated, progressing normally
  const fieldMaize = await prisma.field.create({
    data: {
      name: "North Block – Maize",
      cropType: "Maize",
      plantingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      stage: "GROWING",
      assignedAgentId: agentHuria.id,
    },
  });

  // Field 2: At Risk — planted 20 days ago, still PLANTED (no progression)
  const fieldBeans = await prisma.field.create({
    data: {
      name: "East Plot – Beans",
      cropType: "Beans",
      plantingDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      stage: "PLANTED",
      assignedAgentId: agentHuria.id,
    },
  });

  // Field 3: Completed — harvested
  const fieldSorghum = await prisma.field.create({
    data: {
      name: "West Ridge – Sorghum",
      cropType: "Sorghum",
      plantingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      stage: "HARVESTED",
      assignedAgentId: agentJasiri.id,
    },
  });

  // Field 4: At Risk — no updates in 8+ days
  const fieldTomatoes = await prisma.field.create({
    data: {
      name: "South Greenhouse – Tomatoes",
      cropType: "Tomatoes",
      plantingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      stage: "GROWING",
      assignedAgentId: agentJasiri.id,
    },
  });

  // Field 5: Active — progressing, recently updated
  const fieldSunflower = await prisma.field.create({
    data: {
      name: "Central Plot – Sunflower",
      cropType: "Sunflower",
      plantingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      stage: "PLANTED",
      assignedAgentId: agentJasiri.id,
    },
  });

  // Field Updates
  // Maize — recent, healthy
  await prisma.fieldUpdate.create({
    data: {
      fieldId: fieldMaize.id,
      agentId: agentHuria.id,
      stage: "GROWING",
      notes: "Germination strong. Applying second fertilizer dose this week.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  // Beans — stale, last update was 9 days ago
  await prisma.fieldUpdate.create({
    data: {
      fieldId: fieldBeans.id,
      agentId: agentHuria.id,
      stage: "PLANTED",
      notes: "Seeds in the ground. Waiting for rainfall.",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    },
  });

  // Sorghum — full history
  await prisma.fieldUpdate.createMany({
    data: [
      {
        fieldId: fieldSorghum.id,
        agentId: agentJasiri.id,
        stage: "GROWING",
        notes: "Healthy growth, thinning done.",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        fieldId: fieldSorghum.id,
        agentId: agentJasiri.id,
        stage: "READY",
        notes: "Heads developed, ready for harvest in 5 days.",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        fieldId: fieldSorghum.id,
        agentId: agentJasiri.id,
        stage: "HARVESTED",
        notes: "Harvest complete. Yield: ~2.4 tons.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Sunflower — just planted update
  await prisma.fieldUpdate.create({
    data: {
      fieldId: fieldSunflower.id,
      agentId: agentJasiri.id,
      stage: "PLANTED",
      notes: "Planting complete. Irrigation system checked.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
    },
  });

  // Tomatoes — no recent updates (stale — at risk)
  await prisma.fieldUpdate.create({
    data: {
      fieldId: fieldTomatoes.id,
      agentId: agentJasiri.id,
      stage: "GROWING",
      notes: "Some leaf curl observed. Monitoring for pests.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  console.log("✅ Seed complete.\n");
  console.log("Demo credentials (all passwords: password123):");
  console.log(`  Admin : mkulimamkuu@example.com`);
  console.log(`  Agent : mkulimahuria@example.com`);
  console.log(`  Agent : mkulimajasiri@example.com`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
