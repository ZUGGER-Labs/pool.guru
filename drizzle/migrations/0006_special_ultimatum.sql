CREATE TABLE IF NOT EXISTS "token_ohcl" (
	"chainId" integer DEFAULT 1 NOT NULL,
	"poolType" varchar DEFAULT 'uniswapv3' NOT NULL,
	"interval" integer NOT NULL,
	"tokenId" varchar(120) NOT NULL,
	"hour" integer DEFAULT 0 NOT NULL,
	"startTs" integer DEFAULT 0 NOT NULL,
	"date" varchar(20) DEFAULT '' NOT NULL,
	"open" numeric NOT NULL,
	"high" numeric NOT NULL,
	"low" numeric NOT NULL,
	"close" numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token_ohcl_hour_idx" ON "token_ohcl" ("hour");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token_ohcl_ts_idx" ON "token_ohcl" ("startTs");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token_ohcl_token_idx" ON "token_ohcl" ("tokenId");