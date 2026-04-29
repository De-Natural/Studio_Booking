import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { PrismaClient } from "../frontend/src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

async function test() {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_DATABASE_URL || databaseUrl;

  console.log("TEST SCRIPT DIAGNOSTICS:");
  console.log("databaseUrl:", databaseUrl ? "SET" : "MISSING");
  console.log("directUrl:", directUrl ? "SET" : "MISSING");

  let prisma: any;

  if (directUrl) {
    console.log("Attempting connection with Driver Adapter...");
    const isRemote = directUrl.includes("render.com") || directUrl.includes("supabase.co") || directUrl.includes("neon.tech");
    const pool = new pg.Pool({
      connectionString: directUrl,
      ssl: isRemote ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    console.log("Attempting default connection...");
    prisma = new PrismaClient();
  }

  try {
    const userCount = await prisma.user.count();
    console.log("SUCCESS! User count:", userCount);
  } catch (error: any) {
    console.error("FAILED!");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

test();
