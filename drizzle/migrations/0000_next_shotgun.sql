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
	"poolType" varchar DEFAULT 'uniswapv3',
	"interval" integer NOT NULL,
	"poolId" varchar(120) NOT NULL,
	"date" bigint NOT NULL,
	"open" numeric NOT NULL,
	"high" numeric NOT NULL,
	"low" numeric NOT NULL,
	"close" numeric NOT NULL,
	"feesUSD" numeric NOT NULL,
	"tvlUSD" numeric NOT NULL,
	"token0Price" numeric NOT NULL,
	"token1Price" numeric NOT NULL,
	"volToken0" numeric NOT NULL,
	"volToken1" numeric NOT NULL,
	"sqrtPrice" varchar(120),
	"liquidity" varchar(120),
	"feeGrowthGlobal0X128" varchar(120),
	"feeGrowthGlobal1X128" varchar(120),
	"txCount" integer DEFAULT 0,
	"volumeUSD" varchar(32) NOT NULL,
	"startAt" varchar(20)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poolDayData" (
	"id" serial PRIMARY KEY NOT NULL,
	"chainId" integer DEFAULT 1,
	"poolType" varchar DEFAULT 'uniswapv3',
	"interval" integer NOT NULL,
	"poolId" varchar(120) NOT NULL,
	"date" bigint NOT NULL,
	"open" numeric NOT NULL,
	"high" numeric NOT NULL,
	"low" numeric NOT NULL,
	"close" numeric NOT NULL,
	"feesUSD" numeric NOT NULL,
	"tvlUSD" numeric NOT NULL,
	"token0Price" numeric NOT NULL,
	"token1Price" numeric NOT NULL,
	"volToken0" numeric NOT NULL,
	"volToken1" numeric NOT NULL,
	"sqrtPrice" varchar(120),
	"liquidity" varchar(120),
	"feeGrowthGlobal0X128" varchar(120),
	"feeGrowthGlobal1X128" varchar(120),
	"txCount" integer DEFAULT 0,
	"volumeUSD" varchar(32) NOT NULL,
	"startAt" varchar(20)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poolInfo" (
	"id" serial PRIMARY KEY NOT NULL,
	"poolId" varchar(120) NOT NULL,
	"chainId" integer DEFAULT 1,
	"dex" varchar(32) DEFAULT 'uniswapv3',
	"feeTier" integer NOT NULL,
	"token0" varchar(120) NOT NULL,
	"token1" varchar(120) NOT NULL,
	"token0Vname" varchar(120) DEFAULT '',
	"token1Vname" varchar(120) DEFAULT '',
	"token0Id" varchar(120) NOT NULL,
	"token1Id" varchar(120) NOT NULL,
	"symbol" varchar(120) NOT NULL,
	"token0Decimals" integer NOT NULL,
	"token1Decimals" integer NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"poolId" varchar(120) NOT NULL,
	"chainId" integer DEFAULT 1,
	"dex" varchar(32) DEFAULT 'uniswapv3',
	"feeTier" integer NOT NULL,
	"token0" varchar(120) NOT NULL,
	"token1" varchar(120) NOT NULL,
	"liquidity" varchar(80) DEFAULT '0' NOT NULL,
	"tick" varchar(20) NOT NULL,
	"sqrtPrice" varchar(80) NOT NULL,
	"token0Price" varchar(80) NOT NULL,
	"token1Price" varchar(80) NOT NULL,
	"feeGrowthGlobal0X128" varchar(64) NOT NULL,
	"feeGrowthGlobal1X128" varchar(64) NOT NULL,
	"totalValueLockedUSD" varchar(64) NOT NULL,
	"tvlUSD" numeric(128, 32) NOT NULL,
	"txCount" integer DEFAULT 0 NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "positionDatas" (
	"id" serial PRIMARY KEY NOT NULL,
	"posTokenId" integer NOT NULL,
	"chainId" varchar(10) DEFAULT '1',
	"dex" varchar(32) DEFAULT 'uniswapv3',
	"poolId" varchar(120) NOT NULL,
	"token0" varchar(120),
	"token1" varchar(120),
	"owner" varchar(120),
	"isActive" boolean DEFAULT true,
	"strategy" varchar(32),
	"apy" numeric(128, 32),
	"roi" numeric(128, 32),
	"unclaimedROI" numeric(128, 32),
	"token0Amount" varchar(80) NOT NULL,
	"token1Amount" varchar(80) NOT NULL,
	"depositedToken0" varchar(80) NOT NULL,
	"depositedToken1" varchar(80) NOT NULL,
	"liquidity" varchar(80) NOT NULL,
	"createdAt" bigint NOT NULL,
	"assetUSD" numeric(128, 32) NOT NULL,
	"claimedFee0" varchar(80) NOT NULL,
	"claimedFee1" varchar(80) NOT NULL,
	"unclaimedFee0" varchar(80) NOT NULL,
	"unclaimedFee1" varchar(80) NOT NULL,
	"feeGrowthInside0LastX128" varchar(80) NOT NULL,
	"feeGrowthInside1LastX128" varchar(80) NOT NULL
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
	"tickLower_feeGrowthOutside0X128" varchar(80) NOT NULL,
	"tickLower_feeGrowthOutside1X128" varchar(80) NOT NULL,
	"tickUpper_tickIdx" varchar(64) NOT NULL,
	"tickUpper_feeGrowthOutside0X128" varchar(80) NOT NULL,
	"tickUpper_feeGrowthOutside1X128" varchar(80) NOT NULL,
	"depositedToken0" varchar(80) NOT NULL,
	"depositedToken1" varchar(80) NOT NULL,
	"liquidity" varchar(80) NOT NULL,
	"createdAt" bigint NOT NULL,
	"assetUSD" numeric(128, 32) NOT NULL,
	"collectedFeesToken0" varchar(80) NOT NULL,
	"collectedFeesToken1" varchar(80) NOT NULL,
	"feeGrowthInside0LastX128" varchar(80) NOT NULL,
	"feeGrowthInside1LastX128" varchar(80) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"tokenId" varchar(120) NOT NULL,
	"chainId" integer DEFAULT 1,
	"name" varchar NOT NULL,
	"vname" varchar DEFAULT '',
	"symbol" varchar NOT NULL,
	"logoURI" varchar(300),
	"decimals" integer DEFAULT 18,
	"tvlUSD" numeric(128, 32),
	"desc" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pool_kline_idx" ON "poolData" ("chainId","poolId","interval","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chain_pool_idx" ON "poolData" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "date_idx" ON "poolData" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interval" ON "poolData" ("interval");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pool_day_kline_idx" ON "poolDayData" ("chainId","poolId","interval","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chain_pool_day_idx" ON "poolDayData" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "date_day_idx" ON "poolDayData" ("date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pool_info_idx" ON "poolInfo" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token0_id_idx" ON "poolInfo" ("token0Id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token1_id_idx" ON "poolInfo" ("token0Id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pool_idx" ON "pools" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_liquidity_idx" ON "pools" ("liquidity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_tvl_idx" ON "pools" ("tvlUSD");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_created_idx" ON "pools" ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_data_idx" ON "positionDatas" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_data_liquidity_idx" ON "positionDatas" ("liquidity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_data_tvl_idx" ON "positionDatas" ("assetUSD");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_data_owner_idx" ON "positionDatas" ("owner");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_data_created_idx" ON "positionDatas" ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_pool_idx" ON "positions" ("poolId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_liquidity_idx" ON "positions" ("liquidity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_tvl_idx" ON "positions" ("assetUSD");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "owner_idx" ON "positions" ("owner");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_created_idx" ON "positions" ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "token_idx" ON "tokens" ("tokenId","chainId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "tokens" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "symbol_idx" ON "tokens" ("symbol");