import _ from "lodash";

import { getUniswapV3Pools } from "@/uniswap/graph";
import { db } from "@/db/db";
import { getGraphClient } from "./client";
import { Token, Pool } from "@/interfaces/uniswap.interface";
import { gql } from "@apollo/client";
import { ChainId } from "@uniswap/sdk-core";
import { DBPool, dbPools } from "@/db/schema";
import { and, eq } from "drizzle-orm";

function toDBPool(
  chainId: number,
  pool: Pool,
  dex: string = "uniswapv3"
): DBPool {
  return {
    poolId: pool.id,
    chainId: chainId,
    dex: dex,
    feeTier: +pool.feeTier,
    liquidity: pool.liquidity,
    tick: pool.tick,
    sqrtPrice: pool.sqrtPrice,
    token0Price: pool.token0Price,
    token1Price: pool.token1Price,
    feeGrowthGlobal0X128: pool.feeGrowthGlobal0X128,
    feeGrowthGlobal1X128: pool.feeGrowthGlobal1X128,
    token0: pool.token0.id,
    token1: pool.token1.id,
    totalValueLockedUSD: pool.totalValueLockedUSD,
    tvlUSD: pool.totalValueLockedUSD, // decimal of totalValueLockedUSD
    createdAt: +pool.createdAtTimestamp,
    txCount: +pool.txCount,
  } as DBPool;
}

function fromDBPool(p: DBPool): Pool {
  return {
    id: p.poolId,
    feeTier: p.feeTier + "",
    liquidity: p.liquidity,
    tick: p.tick,
    sqrtPrice: p.sqrtPrice,
    createdAtTimestamp: p.createdAt + "",
    token0Price: p.token0Price,
    token1Price: p.token1Price,
    feeGrowthGlobal0X128: p.feeGrowthGlobal0X128,
    feeGrowthGlobal1X128: p.feeGrowthGlobal1X128,

    // For pool overview
    token0: { id: p.token0 } as Token,
    token1: { id: p.token1 } as Token,
    volumeUSD: "0",
    feesUSD: "0",
    txCount: p.txCount + "",
    totalValueLockedUSD: p.totalValueLockedUSD,
    poolDayData: [],
  };
}

// pools
// ticks
// positions
async function getPoolInfos(chainId: number) {
  const { pools, tokens } = await getUniswapV3Pools({
    chainId: chainId,
    tvlUSD_gte: 5000,
    volUSD_gte: 0,
  });

  // const poolsMap = _.keyBy(pools, (p) => p.id)
}

// 按照 tvl 排序的 pools
async function getPools(
  chainId: number,
  total: number = 0,
  tvlUSD: number = 5000,
  volUSD = 0
) {
  const take = total === 0 ? 1000 : total > 1000 ? 1000 : total;
  const client = getGraphClient(chainId, false);
  let pools: Pool[] = [];

  for (let i = 0; ; i++) {
    if (i * total > 5000) {
      // skip cannot > 5000
      break;
    }
    const res = await client.query({
      query: gql`
        query pools(
          $take: Int!
          $skip: Int!
          $tvlUSD: BigDecimal!
          $volUSD: BigDecimal!
        ) {
          pools(
            first: $take
            skip: $skip
            orderBy: totalValueLockedUSD
            orderDirection: desc
            where: {
              liquidity_gt: 0
              totalValueLockedUSD_gte: $tvlUSD
              volumeUSD_gte: $volUSD
            }
          ) {
            id
            token0 {
              id
            }
            token1 {
              id
            }
            feeTier
            liquidity
            tick
            sqrtPrice
            feesUSD
            volumeUSD
            txCount
            totalValueLockedUSD
            createdAtTimestamp
            poolDayData(
              first: 1
              skip: 1
              orderBy: date
              orderDirection: desc
            ) {
              date
              feesUSD
              volumeUSD
              open
              high
              low
              close
            }
          }
        }
      `,
      variables: {
        take: take,
        skip: take * i,
        tvlUSD: tvlUSD,
        volUSD: volUSD,
      },
    });
    // console.log("res:", res);
    if (res.errors || !res.data || res.data.pools.length === 0) {
      break;
    }
    pools = pools.concat(res.data.pools);
    if (total > 0 && pools.length >= total) {
      break;
    }
  }
  console.log(
    `getPools: chainId=${chainId} tvlUSD_gt=${tvlUSD} pools=${pools.length}`
  );
  return pools;
}

// 保存 pool 到数据库中, 如果已存在, 更新
async function savePool(chainId: number, pool: Pool, dex = "uniswapv3") {
  const record = await db.query.dbPools.findFirst({
    where: and(eq(dbPools.chainId, chainId), eq(dbPools.poolId, pool.id)),
  });
  if (record) {
    // todo update fields
    await db.update(dbPools).set({
      liquidity: pool.liquidity,
      tick: pool.tick,
      sqrtPrice: pool.sqrtPrice,
      token0Price: pool.token0Price,
      token1Price: pool.token1Price,
      feeGrowthGlobal0X128: pool.feeGrowthGlobal0X128,
      feeGrowthGlobal1X128: pool.feeGrowthGlobal1X128,
      totalValueLockedUSD: pool.totalValueLockedUSD,
      tvlUSD: pool.totalValueLockedUSD, // decimal of totalValueLockedUSD
      txCount: +pool.txCount,
    });
  } else {
    // insert
    const dbPool = toDBPool(chainId, pool, dex);
    await db.insert(dbPools).values(dbPool);
  }
}

// 从 graph 获取所有满足条件的 pool
async function getAllChainPools(tvlUSD = 5000, volUSD = 500) {
  const chains = [
    ChainId.MAINNET,
    ChainId.ARBITRUM_ONE,
    ChainId.POLYGON,
    ChainId.BASE,
    ChainId.BNB,
    ChainId.OPTIMISM,
    ChainId.CELO,
    ChainId.AVALANCHE,
  ];
  const poolsMap: { [key: string]: Pool } = {};

  for (let chainId of chains) {
    const pools = await getPools(chainId, 0, tvlUSD, volUSD);
    for (let p of pools) {
      poolsMap[chainId + "-" + p.id] = p;
    }
  }

  return poolsMap;
}

getAllChainPools();

export { getPoolInfos };
