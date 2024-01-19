import {
  serial,
  integer,
  text,
  pgTable,
  timestamp,
  index,
  uniqueIndex,
  varchar,
  boolean,
  json,
  decimal,
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

export const dbPoolData = pgTable(
  "poolData",
  {
    id: serial("id").primaryKey(),
    chainId: integer("chainId").default(1),
    poolId: varchar("poolId", { length: 120 }).notNull(),
    date: integer("date").notNull(),
    open: varchar("open", { length: 32 }).notNull(),
    high: varchar("high", { length: 32 }).notNull(),
    low: varchar("low", { length: 32 }).notNull(),
    close: varchar("close", { length: 32 }).notNull(),
    volumeUSD: varchar("volumeUSD", { length: 32 }).notNull(),
  },
  (table) => {
    return {
      poolIdx: index("chain_pool_idx").on(table.poolId, table.chainId),
      dateIdx: index("date_idx").on(table.date),
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
    liquidity: varchar("liquidity", { length: 64 }).notNull().default('0'),
    tick: varchar("tick", { length: 20 }).notNull(),
    sqrtPrice: varchar("sqrtPrice", { length: 64 }).notNull(),
    token0Price: varchar("token0Price", { length: 64 }).notNull(),
    token1Price: varchar("token1Price", { length: 64 }).notNull(),
    feeGrowthGlobal0X128: varchar("feeGrowthGlobal0X128", { length: 64 }).notNull(),
    feeGrowthGlobal1X128: varchar("feeGrowthGlobal1X128", { length: 64 }).notNull(),
    totalValueLockedUSD: varchar("totalValueLockedUSD", { length: 64 }).notNull(),
    tvlUSD: decimal("tvlUSD", { precision: 128, scale: 32 }).notNull(), // decimal of totalValueLockedUSD
    txCount: integer('txCount').default(0).notNull(),
    createdAt: integer("createdAt").notNull(),
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
        length: 64,
      }
    ).notNull(),
    tickLower_feeGrowthOutside1X128: varchar(
      "tickLower_feeGrowthOutside1X128",
      {
        length: 64,
      }
    ).notNull(),

    tickUpper_tickIdx: varchar("tickUpper_tickIdx", { length: 64 }).notNull(),
    tickUpper_feeGrowthOutside0X128: varchar(
      "tickUpper_feeGrowthOutside0X128",
      {
        length: 64,
      }
    ).notNull(),
    tickUpper_feeGrowthOutside1X128: varchar(
      "tickUpper_feeGrowthOutside1X128",
      {
        length: 64,
      }
    ).notNull(),

    depositedToken0: varchar("depositedToken0", { length: 64 }).notNull(),
    depositedToken1: varchar("depositedToken1", { length: 64 }).notNull(),
    liquidity: varchar("liquidity", { length: 64 }).notNull(),
    createdAt: integer("createdAt").notNull(), // in second
    assetUSD: decimal("assetUSD", { precision: 128, scale: 32 }).notNull(),
    collectedFeesToken0: varchar("collectedFeesToken0", {
      length: 64,
    }).notNull(),
    collectedFeesToken1: varchar("collectedFeesToken1", {
      length: 64,
    }).notNull(),
    feeGrowthInside0LastX128: varchar("feeGrowthInside0LastX128", {
      length: 64,
    }).notNull(),
    feeGrowthInside1LastX128: varchar("feeGrowthInside1LastX128", {
      length: 64,
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

export type DBToken = typeof dbTokens.$inferSelect;
export type DBPool = typeof dbPools.$inferSelect;
export type DBPosition = typeof dbPositions.$inferSelect;
