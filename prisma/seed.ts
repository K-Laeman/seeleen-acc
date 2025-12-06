import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 12);

  // Create owner account: Kiattiyot
  const kiattiyot = await prisma.user.upsert({
    where: { email: "kiattiyot@firedchicken.com" },
    update: {},
    create: {
      email: "kiattiyot@firedchicken.com",
      name: "Kiattiyot",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created owner account:", {
    id: kiattiyot.id,
    email: kiattiyot.email,
    name: kiattiyot.name,
    role: kiattiyot.role,
  });

  // Create owner account: Nartnara
  const nartnara = await prisma.user.upsert({
    where: { email: "nartnara@firedchicken.com" },
    update: {},
    create: {
      email: "nartnara@firedchicken.com",
      name: "Nartnara",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created owner account:", {
    id: nartnara.id,
    email: nartnara.email,
    name: nartnara.name,
    role: nartnara.role,
  });

  // Create default system settings
  const defaultExpenseCategoryLabels = {
    INGREDIENTS: "วัตถุดิบ",
    RENT: "ค่าเช่า",
    UTILITIES: "ค่าน้ำ/ไฟ",
    STAFF_WAGES: "ค่าแรงพนักงาน",
    PACKAGING: "บรรจุภัณฑ์",
    DELIVERY_FEES: "ค่าจัดส่ง",
    MARKETING: "การตลาด",
    EQUIPMENT: "อุปกรณ์",
    MAINTENANCE: "ซ่อมบำรุง",
    OTHER: "อื่นๆ",
  };

  const systemSettings = await prisma.systemSettings.upsert({
    where: { id: "system-settings" },
    update: {},
    create: {
      id: "system-settings",
      grabFoodFeeRate: 30,
      lineManFeeRate: 30,
      expenseCategoryLabels: defaultExpenseCategoryLabels,
    },
  });

  console.log("Created system settings:", {
    id: systemSettings.id,
    grabFoodFeeRate: systemSettings.grabFoodFeeRate,
    lineManFeeRate: systemSettings.lineManFeeRate,
  });

  console.log("\n-----------------------------------");
  console.log("Owner login credentials:");
  console.log("1. Email: kiattiyot@firedchicken.com");
  console.log("   Password: admin123");
  console.log("2. Email: nartnara@firedchicken.com");
  console.log("   Password: admin123");
  console.log("-----------------------------------\n");

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
