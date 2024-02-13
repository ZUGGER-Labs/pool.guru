ALTER TABLE "poolData" ADD COLUMN "day" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "protocolFeesUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "blockNumber" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "closedPositionCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeDepositCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeSwapCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "depositCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeWithdrawCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "withdrawCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "openPositionCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "positionCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "tick" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "swapCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "activeLiquidity" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeProtocolSideRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeSupplySideRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeTotalRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeVolumeUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "protocolSideRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "supplySideRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "totalRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "totalLiquidity" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "totalValueLockedUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "volumeByTokenAmount0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "volumeByTokenUSD0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "inputTokenBalances0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "inputTokenBalancesUSD0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeVolumeByTokenAmount0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeVolumeByTokenUSD0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "volumeByTokenAmount1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "volumeByTokenUSD1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "inputTokenBalances1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "inputTokenBalancesUSD1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeVolumeByTokenAmount1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolData" ADD COLUMN "cumulativeVolumeByTokenUSD1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "protocolFeesUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "blockNumber" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "closedPositionCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeDepositCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeSwapCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "depositCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeWithdrawCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "withdrawCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "openPositionCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "positionCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "tick" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "swapCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "activeLiquidity" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeProtocolSideRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeSupplySideRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeTotalRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeVolumeUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "protocolSideRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "supplySideRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "totalRevenueUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "totalLiquidity" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "totalValueLockedUSD" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "volumeByTokenAmount0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "volumeByTokenUSD0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "inputTokenBalances0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "inputTokenBalancesUSD0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeVolumeByTokenAmount0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeVolumeByTokenUSD0" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "volumeByTokenAmount1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "volumeByTokenUSD1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "inputTokenBalances1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "inputTokenBalancesUSD1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeVolumeByTokenAmount1" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "poolDayData" ADD COLUMN "cumulativeVolumeByTokenUSD1" numeric NOT NULL;