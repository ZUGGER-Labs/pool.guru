DROP INDEX IF EXISTS "pool_day_kline_idx";--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "avgPrice" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "avgPrice" numeric NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pool_day_kline_idx" ON "poolDayData" ("chainId","poolId","date");