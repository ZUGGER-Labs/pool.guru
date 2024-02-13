DROP INDEX IF EXISTS "pool_kline_idx";--> statement-breakpoint
ALTER TABLE "poolData" ALTER COLUMN "date" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "poolData" ALTER COLUMN "date" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "poolData" ALTER COLUMN "date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "periodStartUnix" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "hour" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "day" integer DEFAULT 0;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pool_kline_idx" ON "poolData" ("chainId","poolId","interval","hour");--> statement-breakpoint
ALTER TABLE "poolData" DROP COLUMN IF EXISTS "day";