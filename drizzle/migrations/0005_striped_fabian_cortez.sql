CREATE TABLE IF NOT EXISTS "token_alias" (
	"id" varchar(120) NOT NULL,
	"chainId" integer DEFAULT 1 NOT NULL,
	"alias" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "poolData" ALTER COLUMN "avgPrice" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "poolDayData" ALTER COLUMN "avgPrice" SET DEFAULT '0';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "token_alias_idx" ON "token_alias" ("id","chainId");