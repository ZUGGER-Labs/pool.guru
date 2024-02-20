import {
  serial,
  integer,
  bigint,
  text,
  pgTable,
  timestamp,
  index,
  uniqueIndex,
  varchar,
  boolean,
  json,
  decimal,
  bigserial,
} from "drizzle-orm/pg-core";

export const dbNetworks = pgTable("networks", {
  id: varchar("id", { length: 32 }).primaryKey(),
  chainId: integer("chainId").default(1),
  name: varchar("name", { length: 32 }).notNull(),
  desc: text("desc"),
  logoURI: varchar("logoURI", { length: 300 }),
  disabled: boolean("disabled").default(false),
});

export const dbTokens = pgTable(
  "tokens",
  {
    id: serial("id").primaryKey(),
    tokenId: varchar("tokenId", { length: 120 }).notNull(),
    chainId: integer("chainId").default(1),
    name: varchar("name").notNull(),
    vname: varchar("vname").default(""), // verify name, for ex: WETH -> ETH
    symbol: varchar("symbol").notNull(),
    logoURI: varchar("logoURI", { length: 300 }),
    decimals: integer("decimals").default(18),
    tvlUSD: decimal("tvlUSD", { precision: 128, scale: 32 }),
    desc: text("desc"),
  },
  (table) => {
    return {
      tokenIdx: uniqueIndex("token_idx").on(table.tokenId, table.chainId),
      nameIdx: index("name_idx").on(table.name),
      symbolIdx: index("symbol_idx").on(table.symbol),
    };
  }
);

export const tokenAlias = pgTable('token_alias', {
  id: varchar('id', {length: 120}).notNull(),   // token contract address
  chainId: integer('chainId').default(1).notNull(),
  alias: varchar('alias').notNull(),
}, (table) => {
  return {
    tokenAliasIdx: uniqueIndex('token_alias_idx').on(table.id, table.chainId),
  }
})

export const dbTokenOHCL = pgTable(
  'token_ohcl', {
    // id: bigserial("id", { mode: 'number' }).primaryKey(),
    chainId: integer("chainId").notNull().default(1),
    dex: varchar("poolType").default("uniswapv3").notNull(),
    interval: integer("interval").notNull(),
    tokenId: varchar("tokenId", { length: 120 }).notNull(),
    hour: integer('hour').notNull().default(0),
    startTs: integer('startTs').notNull().default(0),
    date: varchar('date', { length: 20 }).notNull().default(''), // ex 2024-02-09-1200
    open: decimal("open").notNull(),
    high: decimal("high").notNull(),
    low: decimal("low").notNull(),
    close: decimal("close").notNull(),
  }, (table) => {
    return {
      tokenOHCLHourIdx: index('token_ohcl_hour_idx').on(table.hour),
      tokenOHCLTsIdx: index('token_ohcl_ts_idx').on(table.startTs),
      tokenOHCLTokenIdx: index('token_ohcl_token_idx').on(table.tokenId),
    }
  }
)

// hourly
export const dbPoolData = pgTable(
  "pool_data",
  {
    id: serial("id").primaryKey(),
    chainId: integer("chainId").default(1),
    dex: varchar("poolType").default("uniswapv3"),
    interval: integer("interval").notNull(),
    poolId: varchar("poolId", { length: 120 }).notNull(),
    periodStartUnix: bigint("periodStartUnix", { mode: "number" }).notNull(),
    hour: integer('hour').default(0),
    date: integer('date').default(0), // ex 20240209
    open: decimal("open").notNull(),
    high: decimal("high").notNull(),
    low: decimal("low").notNull(),
    close: decimal("close").notNull(),
    avgPrice: decimal("avgPrice").default('0').notNull(),
    feesUSD: decimal("feesUSD").notNull(),
    protocolFeesUSD: decimal("protocolFeesUSD").notNull(),
    tvlUSD: decimal("tvlUSD").notNull(),
    token0Price: decimal("token0Price").notNull(),
    token1Price: decimal("token1Price").notNull(),
    volToken0: decimal("volToken0").notNull(),
    volToken1: decimal("volToken1").notNull(),
    sqrtPrice: varchar("sqrtPrice", { length: 120 }),
    liquidity: varchar("liquidity", { length: 120 }),
    feeGrowthGlobal0X128: varchar("feeGrowthGlobal0X128", { length: 120 }),
    feeGrowthGlobal1X128: varchar("feeGrowthGlobal1X128", { length: 120 }),
    txCount: integer("txCount").default(0),
    volumeUSD: varchar("volumeUSD", { length: 32 }).notNull(),
    startAt: varchar("startAt", { length: 20 }), // 2024-01-20T15:00:00
    blockNumber: integer("blockNumber").notNull().default(0),
    closedPositionCount: integer("closedPositionCount").notNull().default(0),
    cumulativeDepositCount: integer("cumulativeDepositCount").notNull().default(0),
    cumulativeSwapCount: integer("cumulativeSwapCount").notNull().default(0),
    depositCount: integer("depositCount").notNull().default(0),
    cumulativeWithdrawCount: integer("cumulativeWithdrawCount").notNull().default(0),
    withdrawCount: integer("withdrawCount").notNull().default(0),
    openPositionCount: integer("openPositionCount").notNull().default(0),
    positionCount: integer("positionCount").notNull().default(0),
    tick: integer("tick").notNull().default(0),
    swapCount: integer("swapCount").notNull().default(0),
    activeLiquidity: decimal("activeLiquidity").notNull(),
    cumulativeProtocolSideRevenueUSD: decimal("cumulativeProtocolSideRevenueUSD").notNull(),
    cumulativeSupplySideRevenueUSD: decimal("cumulativeSupplySideRevenueUSD").notNull(),
    cumulativeTotalRevenueUSD: decimal("cumulativeTotalRevenueUSD").notNull(),
    cumulativeVolumeUSD: decimal("cumulativeVolumeUSD").notNull(),
    protocolSideRevenueUSD: decimal("protocolSideRevenueUSD").notNull(),
    supplySideRevenueUSD: decimal("supplySideRevenueUSD").notNull(),
    totalRevenueUSD: decimal("totalRevenueUSD").notNull(),
    totalLiquidity: decimal("totalLiquidity").notNull(),
    totalValueLockedUSD: decimal("totalValueLockedUSD").notNull(),
    volumeByTokenAmount0: decimal("volumeByTokenAmount0").notNull(),
    volumeByTokenUSD0: decimal("volumeByTokenUSD0").notNull(),
    inputTokenBalances0: decimal("inputTokenBalances0").notNull(),
    inputTokenBalancesUSD0: decimal("inputTokenBalancesUSD0").notNull(),
    cumulativeVolumeByTokenAmount0: decimal("cumulativeVolumeByTokenAmount0").notNull(),
    cumulativeVolumeByTokenUSD0: decimal("cumulativeVolumeByTokenUSD0").notNull(),
    volumeByTokenAmount1: decimal("volumeByTokenAmount1").notNull(),
    volumeByTokenUSD1: decimal("volumeByTokenUSD1").notNull(),
    inputTokenBalances1: decimal("inputTokenBalances1").notNull(),
    inputTokenBalancesUSD1: decimal("inputTokenBalancesUSD1").notNull(),
    cumulativeVolumeByTokenAmount1: decimal("cumulativeVolumeByTokenAmount1").notNull(),
    cumulativeVolumeByTokenUSD1: decimal("cumulativeVolumeByTokenUSD1").notNull(),
  },
  (table) => {
    return {
      klineIdx: uniqueIndex("pool_kline_idx").on(
        table.chainId,
        table.poolId,
        table.interval,
        table.hour
      ),
      poolIdIdx: index("chain_pool_id_idx").on(table.poolId),
      poolIdx: index("chain_pool_idx").on(table.poolId, table.chainId),
      dateIdx: index("date_idx").on(table.date),
      intervalIdx: index("interval").on(table.interval),
    };
  }
);

// daily
export const dbPoolDayData = pgTable(
  "pool_day_data",
  {
    id: serial("id").primaryKey(),
    chainId: integer("chainId").default(1),
    dex: varchar("poolType").default("uniswapv3"),
    interval: integer("interval").notNull(),
    poolId: varchar("poolId", { length: 120 }).notNull(),
    date: bigint("date", { mode: "number" }).notNull(),
    day: integer('day').default(0),
    open: decimal("open").notNull(),
    high: decimal("high").notNull(),
    low: decimal("low").notNull(),
    close: decimal("close").notNull(),
    avgPrice: decimal("avgPrice").default('0').notNull(),
    feesUSD: decimal("feesUSD").notNull(),
    protocolFeesUSD: decimal("protocolFeesUSD").notNull(),
    tvlUSD: decimal("tvlUSD").notNull(),
    token0Price: decimal("token0Price").notNull(),
    token1Price: decimal("token1Price").notNull(),
    volToken0: decimal("volToken0").notNull(),
    volToken1: decimal("volToken1").notNull(),
    sqrtPrice: varchar("sqrtPrice", { length: 120 }),
    liquidity: varchar("liquidity", { length: 120 }),
    feeGrowthGlobal0X128: varchar("feeGrowthGlobal0X128", { length: 120 }),
    feeGrowthGlobal1X128: varchar("feeGrowthGlobal1X128", { length: 120 }),
    txCount: integer("txCount").default(0),
    volumeUSD: varchar("volumeUSD", { length: 32 }).notNull(),
    startAt: varchar("startAt", { length: 20 }), // 2024-01-20T15:00:00
    blockNumber: integer("blockNumber").notNull().default(0),
    closedPositionCount: integer("closedPositionCount").notNull().default(0),
    cumulativeDepositCount: integer("cumulativeDepositCount").notNull().default(0),
    cumulativeSwapCount: integer("cumulativeSwapCount").notNull().default(0),
    depositCount: integer("depositCount").notNull().default(0),
    cumulativeWithdrawCount: integer("cumulativeWithdrawCount").notNull().default(0),
    withdrawCount: integer("withdrawCount").notNull().default(0),
    openPositionCount: integer("openPositionCount").notNull().default(0),
    positionCount: integer("positionCount").notNull().default(0),
    tick: integer("tick").notNull().default(0),
    swapCount: integer("swapCount").notNull().default(0),
    activeLiquidity: decimal("activeLiquidity").notNull(),
    cumulativeProtocolSideRevenueUSD: decimal("cumulativeProtocolSideRevenueUSD").notNull(),
    cumulativeSupplySideRevenueUSD: decimal("cumulativeSupplySideRevenueUSD").notNull(),
    cumulativeTotalRevenueUSD: decimal("cumulativeTotalRevenueUSD").notNull(),
    cumulativeVolumeUSD: decimal("cumulativeVolumeUSD").notNull(),
    protocolSideRevenueUSD: decimal("protocolSideRevenueUSD").notNull(),
    supplySideRevenueUSD: decimal("supplySideRevenueUSD").notNull(),
    totalRevenueUSD: decimal("totalRevenueUSD").notNull(),
    totalLiquidity: decimal("totalLiquidity").notNull(),
    totalValueLockedUSD: decimal("totalValueLockedUSD").notNull(),
    volumeByTokenAmount0: decimal("volumeByTokenAmount0").notNull(),
    volumeByTokenUSD0: decimal("volumeByTokenUSD0").notNull(),
    inputTokenBalances0: decimal("inputTokenBalances0").notNull(),
    inputTokenBalancesUSD0: decimal("inputTokenBalancesUSD0").notNull(),
    cumulativeVolumeByTokenAmount0: decimal("cumulativeVolumeByTokenAmount0").notNull(),
    cumulativeVolumeByTokenUSD0: decimal("cumulativeVolumeByTokenUSD0").notNull(),
    volumeByTokenAmount1: decimal("volumeByTokenAmount1").notNull(),
    volumeByTokenUSD1: decimal("volumeByTokenUSD1").notNull(),
    inputTokenBalances1: decimal("inputTokenBalances1").notNull(),
    inputTokenBalancesUSD1: decimal("inputTokenBalancesUSD1").notNull(),
    cumulativeVolumeByTokenAmount1: decimal("cumulativeVolumeByTokenAmount1").notNull(),
    cumulativeVolumeByTokenUSD1: decimal("cumulativeVolumeByTokenUSD1").notNull(),
  },
  (table) => {
    return {
      klineDayIdx: uniqueIndex("pool_day_kline_idx").on(
        table.chainId,
        table.poolId,
        table.date
      ),
      poolIdIdx: index("chain_pool_id_day_idx").on(table.poolId),
      poolDayIdx: index("chain_pool_day_idx").on(table.poolId, table.chainId),
      dateDayIdx: index("date_day_idx").on(table.date),
    };
  }
);

export const dbPoolInfo = pgTable(
  "pool_info",
  {
    id: serial("id").primaryKey(),
    poolId: varchar("poolId", { length: 120 }).notNull(),
    chainId: integer("chainId").default(1),
    dex: varchar("dex", { length: 32 }).default("uniswapv3"),
    feeTier: varchar("feeTier").notNull(),
    token0: varchar("token0", { length: 120 }).notNull(),
    token1: varchar("token1", { length: 120 }).notNull(), // name
    token0Symbol: varchar("token0Symbol", { length: 120 }).notNull(),
    token1Symbol: varchar("token1Symbol", { length: 120 }).notNull(),
    token0Vname: varchar("token0Vname", { length: 120 }).default(""),
    token1Vname: varchar("token1Vname", { length: 120 }).default(""),
    token0Id: varchar("token0Id", { length: 120 }).notNull(), // id
    token1Id: varchar("token1Id", { length: 120 }).notNull(),
    symbol: varchar("symbol", { length: 120 }).notNull(),
    token0Decimals: integer("token0Decimals").notNull(),
    token1Decimals: integer("token1Decimals").notNull(),
    createdBlock: integer('createdBlock').notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  },
  (table) => {
    return {
      poolInfoIdx: uniqueIndex("pool_info_idx").on(table.poolId, table.chainId),
      token0Idx: index("token0_id_idx").on(table.token0Id),
      token1Idx: index("token1_id_idx").on(table.token0Id),
      token0VnameIdx: index("token0_vname_idx").on(table.token0Vname),
      token1VanmeIdx: index("token1_vname_idx").on(table.token1Vname),
    };
  }
);

export const dbPools = pgTable(
  "pools",
  {
    id: serial("id").primaryKey(),
    poolId: varchar("poolId", { length: 120 }).notNull(),
    chainId: integer("chainId").default(1),
    dex: varchar("dex", { length: 32 }).default("uniswapv3"),
    feeTier: integer("feeTier").notNull(),
    token0: varchar("token0", { length: 120 }).notNull(),
    token1: varchar("token1", { length: 120 }).notNull(),
    liquidity: varchar("liquidity", { length: 80 }).notNull().default("0"),
    tick: varchar("tick", { length: 20 }).notNull(),
    sqrtPrice: varchar("sqrtPrice", { length: 80 }).notNull(),
    token0Price: varchar("token0Price", { length: 80 }).notNull(),
    token1Price: varchar("token1Price", { length: 80 }).notNull(),
    feeGrowthGlobal0X128: varchar("feeGrowthGlobal0X128", {
      length: 64,
    }).notNull(),
    feeGrowthGlobal1X128: varchar("feeGrowthGlobal1X128", {
      length: 64,
    }).notNull(),
    totalValueLockedUSD: varchar("totalValueLockedUSD", {
      length: 64,
    }).notNull(),
    tvlUSD: decimal("tvlUSD", { precision: 128, scale: 32 }).notNull(), // decimal of totalValueLockedUSD
    txCount: integer("txCount").default(0).notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  },
  (table) => {
    return {
      poolIdx: uniqueIndex("pool_idx").on(table.poolId, table.chainId),
      liquidityIdx: index("pool_liquidity_idx").on(table.liquidity),
      tvlIdx: index("pool_tvl_idx").on(table.tvlUSD),
      createdIdx: index("pool_created_idx").on(table.createdAt),
    };
  }
);

export const dbPositions = pgTable(
  "positions",
  {
    id: serial("id").primaryKey(),
    posTokenId: integer("posTokenId").notNull(), // position NFT tokenId
    chainId: varchar("chainId", { length: 10 }).default("1"),
    dex: varchar("dex", { length: 32 }).default("uniswapv3"),
    poolId: varchar("poolId", { length: 120 }).notNull(),
    token0: varchar("token0", { length: 120 }),
    token1: varchar("token1", { length: 120 }),
    owner: varchar("owner", { length: 120 }),

    tickLower_tickIdx: varchar("tickLower_tickIdx", { length: 64 }).notNull(),
    tickLower_feeGrowthOutside0X128: varchar(
      "tickLower_feeGrowthOutside0X128",
      {
        length: 80,
      }
    ).notNull(),
    tickLower_feeGrowthOutside1X128: varchar(
      "tickLower_feeGrowthOutside1X128",
      {
        length: 80,
      }
    ).notNull(),

    tickUpper_tickIdx: varchar("tickUpper_tickIdx", { length: 64 }).notNull(),
    tickUpper_feeGrowthOutside0X128: varchar(
      "tickUpper_feeGrowthOutside0X128",
      {
        length: 80,
      }
    ).notNull(),
    tickUpper_feeGrowthOutside1X128: varchar(
      "tickUpper_feeGrowthOutside1X128",
      {
        length: 80,
      }
    ).notNull(),

    depositedToken0: varchar("depositedToken0", { length: 80 }).notNull(),
    depositedToken1: varchar("depositedToken1", { length: 80 }).notNull(),
    liquidity: varchar("liquidity", { length: 80 }).notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(), // in second
    assetUSD: decimal("assetUSD", { precision: 128, scale: 32 }).notNull(),
    collectedFeesToken0: varchar("collectedFeesToken0", {
      length: 80,
    }).notNull(),
    collectedFeesToken1: varchar("collectedFeesToken1", {
      length: 80,
    }).notNull(),
    feeGrowthInside0LastX128: varchar("feeGrowthInside0LastX128", {
      length: 80,
    }).notNull(),
    feeGrowthInside1LastX128: varchar("feeGrowthInside1LastX128", {
      length: 80,
    }).notNull(),
  },
  (table) => {
    return {
      poolIdx: index("pos_pool_idx").on(table.poolId, table.chainId),
      liquidityIdx: index("pos_liquidity_idx").on(table.liquidity),
      tvlIdx: index("pos_tvl_idx").on(table.assetUSD),
      ownerIdx: index("owner_idx").on(table.owner),
      createdIdx: index("pos_created_idx").on(table.createdAt),
    };
  }
);

export const dbPositionData = pgTable(
  "position_data",
  {
    id: serial("id").primaryKey(),
    posTokenId: integer("posTokenId").notNull(), // position NFT tokenId
    chainId: varchar("chainId", { length: 10 }).default("1"),
    dex: varchar("dex", { length: 32 }).default("uniswapv3"),
    poolId: varchar("poolId", { length: 120 }).notNull(),
    token0: varchar("token0", { length: 120 }),
    token1: varchar("token1", { length: 120 }),
    owner: varchar("owner", { length: 120 }),
    isActive: boolean("isActive").default(true),
    strategy: varchar("strategy", { length: 32 }),
    apy: decimal("apy", { precision: 128, scale: 32 }),
    roi: decimal("roi", { precision: 128, scale: 32 }),
    unclaimedROI: decimal("unclaimedROI", { precision: 128, scale: 32 }),

    token0Amount: varchar("token0Amount", { length: 80 }).notNull(),
    token1Amount: varchar("token1Amount", { length: 80 }).notNull(),
    depositedToken0: varchar("depositedToken0", { length: 80 }).notNull(),
    depositedToken1: varchar("depositedToken1", { length: 80 }).notNull(),
    liquidity: varchar("liquidity", { length: 80 }).notNull(),
    createdAt: bigint("createdAt", { mode: "number" }).notNull(), // in second
    assetUSD: decimal("assetUSD", { precision: 128, scale: 32 }).notNull(),
    claimedFee0: varchar("claimedFee0", {
      length: 80,
    }).notNull(),
    claimedFee1: varchar("claimedFee1", {
      length: 80,
    }).notNull(),
    unclaimedFee0: varchar("unclaimedFee0", {
      length: 80,
    }).notNull(),
    unclaimedFee1: varchar("unclaimedFee1", {
      length: 80,
    }).notNull(),
    feeGrowthInside0LastX128: varchar("feeGrowthInside0LastX128", {
      length: 80,
    }).notNull(),
    feeGrowthInside1LastX128: varchar("feeGrowthInside1LastX128", {
      length: 80,
    }).notNull(),
  },
  (table) => {
    return {
      poolIdx: index("pos_data_idx").on(table.poolId, table.chainId),
      liquidityIdx: index("pos_data_liquidity_idx").on(table.liquidity),
      tvlIdx: index("pos_data_tvl_idx").on(table.assetUSD),
      ownerIdx: index("pos_data_owner_idx").on(table.owner),
      createdIdx: index("pos_data_created_idx").on(table.createdAt),
    };
  }
);

export type DBToken = typeof dbTokens.$inferSelect;
export type DBPools = typeof dbPools.$inferSelect;
export type DBPoolInfo = typeof dbPoolInfo.$inferInsert;
export type DBPosition = typeof dbPositions.$inferSelect;
export type DBPositionData = typeof dbPositionData.$inferInsert;

export type DBPoolData = typeof dbPoolData.$inferInsert;
export type DBPoolDayData = typeof dbPoolDayData.$inferInsert;
export type DBTokenOHCL = typeof dbTokenOHCL.$inferSelect;
