import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const queryClient = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 30, });

export const db = drizzle(queryClient, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
