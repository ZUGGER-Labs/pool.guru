CREATE TABLE IF NOT EXISTS "networks" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"chainId" integer DEFAULT 1,
	"name" varchar(32) NOT NULL,
	"desc" text,
	"logoURI" varchar(300),
	"disabled" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poolData" (
	"id" serial PRIMARY KEY NOT NULL,
	"chainId" integer DEFAULT 1,
	"poolId" varchar(120) NOT NULL,
	"date" integer NOT NULL,
	"open" varchar(32) NOT NULL,
	"high" varchar(32) NOT NULL,
	"low" varchar(32) NOT NULL,
	"close" varchar(32) NOT NULL,
	"volumeUSD" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"poolId" varchar(120) NOT NULL,
	"chainId" integer DEFAULT 1,
	"dex" varchar(32) DEFAULT 'uniswapv3',
	"feeTier" integer NOT NULL,
	"liquidity" varchar(64),
	"tick" varchar(20),
	"sqrtPrice" varchar(64),
	"token0Price" varchar(64),
	"token1Price" varchar(64),
	"feeGrowthGlobal0X128" varchar(64),
	"feeGrowthGlobal1X128" varchar(64),
	"token0" varchar(120),
	"token1" varchar(120),
	"totalValueLockedUSD" varchar(64),
	"tvlUSD" numeric(128, 32),
	"createdAt" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"posTokenId" integer NOT NULL,
	"chainId" varchar(10) DEFAULT '1',
	"dex" varchar(32) DEFAULT 'uniswapv3',
	"poolId" varchar(120) NOT NULL,
	"token0" varchar(120),
	"token1" varchar(120),
	"owner" varchar(120),
	"tickLower_tickIdx" varchar(64) NOT NULL,
	"tickLower_feeGrowthOutside0X128" varchar(64) NOT NULL,
	"tickLower_feeGrowthOutside1X128" varchar(64) NOT NULL,
	"tickUpper_tickIdx" varchar(64) NOT NULL,
	"tickUpper_feeGrowthOutside0X128" varchar(64) NOT NULL,
	"tickUpper_feeGrowthOutside1X128" varchar(64) NOT NULL,
	"depositedToken0" varchar(64) NOT NULL,
	"depositedToken1" varchar(64) NOT NULL,
	"liquidity" varchar(64) NOT NULL,
	"createdAt" integer NOT NULL,
	"assetUSD" numeric(128, 32) NOT NULL,
	"collectedFeesToken0" varchar(64) NOT NULL,
	"collectedFeesToken1" varchar(64) NOT NULL,
	"feeGrowthInside0LastX128" varchar(64) NOT NULL,
	"feeGrowthInside1LastX128" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"tokenId" varchar(120) NOT NULL,
	"chainId" integer DEFAULT 1,
	"name" varchar(32) NOT NULL,
	"symbol" varchar(32) NOT NULL,
	"logoURI" varchar(300),
	"decimals" integer DEFAULT 18,
	"tvlUSD" numeric(128, 32),
	"desc" text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chain_pool_idx" ON "poolData" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "date_idx" ON "poolData" ("date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pool_idx" ON "pools" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_liquidity_idx" ON "pools" ("liquidity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_tvl_idx" ON "pools" ("tvlUSD");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_created_idx" ON "pools" ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_pool_idx" ON "positions" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_liquidity_idx" ON "positions" ("liquidity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_tvl_idx" ON "positions" ("assetUSD");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "owner_idx" ON "positions" ("owner");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_created_idx" ON "positions" ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "token_idx" ON "tokens" ("tokenId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "tokens" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "symbol_idx" ON "tokens" ("symbol");