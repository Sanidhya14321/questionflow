import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";
import { PREDEFINED_ASSESSMENTS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: "Site Administrator",
      email: adminEmail,
      passwordHash: adminHash,
      role: "admin",
    },
    update: {
      passwordHash: adminHash,
      role: "admin",
    },
  });

  for (const assessment of PREDEFINED_ASSESSMENTS) {
    await prisma.assessment.upsert({
      where: { id: assessment.id },
      create: {
        id: assessment.id,
        title: assessment.title,
        category: assessment.category,
        description: assessment.description,
        questions: assessment.questions as unknown as Prisma.InputJsonValue,
        durationMinutes: assessment.durationMinutes,
        upvotes: assessment.upvotes,
        downvotes: assessment.downvotes,
        isPredefined: true,
        createdByRole: "admin",
        createdByUserId: null,
        isAIGenerated: false,
        createdAt: new Date(assessment.createdAt),
      },
      update: {
        title: assessment.title,
        category: assessment.category,
        description: assessment.description,
        questions: assessment.questions as unknown as Prisma.InputJsonValue,
        durationMinutes: assessment.durationMinutes,
        isPredefined: true,
        createdByRole: "admin",
        isAIGenerated: false,
      },
    });
  }

  console.log("Prisma seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
