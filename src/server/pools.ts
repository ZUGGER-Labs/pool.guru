import _ from "lodash";

import { getUniswapV3Pools } from "@/uniswap/graph";
import { db } from "@/db/db";
import { getGraphClient } from "./client";
import { Token, Pool } from "@/interfaces/uniswap.interface";
import { QueryOptions, gql } from "@apollo/client";
import { ChainId } from "@uniswap/sdk-core";
import { DBPool, dbPools } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import getRedis from "./redis";
import { RedisClientType } from "redis";
import { CHAIN_NAME, DEX_TYPES } from "@/lib/network";
import { now } from "./utils";

function chainPoolKey(chainId: number): string {
  const RedisPoolsKey = "pools";
  return RedisPoolsKey + ":" + chainId;
}

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
async function getUniswapv3PoolById(chainId: number, poolId: string) {
  const client = getGraphClient(chainId, false);

  const res = await client.query({
    query: gql`
      query pool($id: String!) {
        pool(id: $id) {
          id
          token0 {
            id
            decimals
          }
          token1 {
            id
            decimals
          }
          feeTier
          liquidity
          tick
          sqrtPrice
          feesUSD
          volumeUSD
          txCount
          feeGrowthGlobal0X128
          feeGrowthGlobal1X128
          totalValueLockedUSD
          createdAtTimestamp
        }
      }
    `,
    variables: {
      id: poolId,
    },
  });

  if (res.errors || !res.data || !res.data.pool) {
    console.error(res.errors);
    throw new Error('fetch pool failed')
    return null;
  }

  return res.data.pool;
}

// 按照 tvl 排序的 pools
async function getUniswapv3Pools(
  chainId: number,
  total: number = 0,
  tvlUSD: number = 5000,
  volUSD = 0
) {
  const take = total === 0 ? 1000 : total > 1000 ? 1000 : total;
  const client = getGraphClient(chainId, false);
  let pools: Pool[] = [];
  const queries: QueryOptions[] = [];

  for (let i = 0; ; i++) {
    if (i * take > 5000) {
      // skip cannot > 5000
      break;
    }
    queries.push({
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
              name
              symbol
              decimals
            }
            token1 {
              id
              name
              symbol
              decimals
            }
            feeTier
            liquidity
            tick
            sqrtPrice
            feesUSD
            volumeUSD
            txCount
            feeGrowthGlobal0X128
            feeGrowthGlobal1X128
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
    if (total > 0 && (i + 1) * take > total) {
      break;
    }
    // console.log("res:", res);
    // if (res.errors || !res.data || res.data.pools.length === 0) {
    //   break;
    // }
    // pools = pools.concat(res.data.pools);
    // if (total > 0 && pools.length >= total) {
    //   break;
    // }
  }
  const resList = await Promise.all(queries.map((q) => client.query(q)));
  for (let res of resList) {
    if (res.errors || !res.data || res.data.pools.length === 0) {
      continue;
    }
    pools = pools.concat(res.data.pools);
  }
  // console.log(
  //   `getPools: chainId=${chainId} tvlUSD_gt=${tvlUSD} pools=${pools.length}`
  // );
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

  const poolsList = await Promise.all(
    chains.map((cid) => getUniswapv3Pools(cid, 0, tvlUSD, volUSD))
  );

  for (let i = 0; i < chains.length; i++) {
    const pools = poolsList[i];
    const chainId = chains[i];
    for (let p of pools) {
      const key = chainId + "-" + p.id;
      poolsMap[key] = p;
    }
  }

  return poolsMap;
}

// 从 redis 中 load 所有的 pools
async function hgetPools(
  rc: any,
  chainId: number
): Promise<{ [key: string]: Pool }> {
  const poolsResp = await rc.hGetAll(chainPoolKey(chainId));
  const pools: { [key: string]: Pool } = {};
  for (let pid in poolsResp) {
    pools[pid] = JSON.parse(poolsResp[pid]) as Pool;
  }

  return pools;
}

async function syncPoolToRedis(rc: any, chainId: number, pool: Pool) {
  await rc.hSet(chainPoolKey(chainId), pool.id, JSON.stringify(pool));
}

export interface PoolRoutineOpts {
  dex?: DEX_TYPES;
  total?: number;
  interval?: number; // milli second
  tvlUSD?: number;
  volUSD?: number;
}

async function chainPoolsRoutine(chainId: number, opts: PoolRoutineOpts) {
  const rc = await getRedis();
  const tm1 = new Date().getTime();
  const items = await getUniswapv3Pools(
    chainId,
    opts.total,
    opts.tvlUSD,
    opts.volUSD
  );
  const graphPools = _.keyBy(items, (item) => item.id);
  const redisPools = await hgetPools(rc, chainId);
  const tm2 = new Date().getTime();
  const chainName = CHAIN_NAME[chainId];

  let tm = now();
  console.log(
    "--------------------------------------------------------------------"
  );
  console.log(`${tm}: fetch ${chainName} pools used: ${tm2 - tm1} ms`);
  console.log(
    `${tm}: ${chainName} pools from graph: ${_.size(
      graphPools
    )}, pools in redis: ${_.size(redisPools)}`
  );
  let changed = 0,
    notexist = 0;
  for (let pid in graphPools) {
    const gPool = graphPools[pid];
    const rPool = redisPools[pid];
    if (rPool) {
      // exist in redis, diff with txCount
      if (+rPool.txCount !== +gPool.txCount) {
        changed++;
        // console.log(`chain ${chainId} pool ${poolId} txCount changed: redis=${rPool.txCount} lates=${gPool.txCount}`)
      }
    } else {
      await syncPoolToRedis(rc, chainId, gPool);
      notexist++;
    }
  }
  tm = now();
  console.log(
    `${tm}: ${chainName} pools changed: `,
    changed,
    "new pool:",
    notexist
  );
}

function runPoolRoutine(chains: { [key: number]: PoolRoutineOpts }) {
  for (let chainId in chains) {
    const opts = chains[chainId];

    setInterval(
      async () => {
        await chainPoolsRoutine(+chainId, {});
      },
      opts.interval ? opts.interval : 15000
    );
  }
}

// runPoolRoutine({
//   1: {},
//   [ChainId.BASE]: {interval: 5000},
//   [ChainId.BNB]: {interval: 5000},
// })
// getPools(1, 0, 5000)

export { chainPoolKey, getUniswapv3Pools, getPoolInfos, runPoolRoutine, getUniswapv3PoolById };
