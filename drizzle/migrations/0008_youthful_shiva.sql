ALTER TABLE "pool_info" ALTER COLUMN "feeTier" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "pool_info" ADD COLUMN "token0Symbol" varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE "pool_info" ADD COLUMN "createdBlock" integer NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token0_vname_idx" ON "pool_info" ("token0Vname");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token1_vname_idx" ON "pool_info" ("token1Vname");