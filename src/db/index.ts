import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  // Allow build to succeed; queries will fail at runtime without a real URL
  console.warn("[db] DATABASE_URL is not set — database queries will fail at runtime");
}

const sql = neon(process.env.DATABASE_URL || "postgresql://placeholder:placeholder@placeholder.neon.tech/vover");
export const db = drizzle(sql, { schema });
