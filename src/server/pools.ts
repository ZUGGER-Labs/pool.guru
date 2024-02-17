import _ from "lodash";

import { getUniswapV3Pools } from "@/uniswap/graph";
import { db } from "@/db/db";
import { getGraphClient } from "./client";
import {
  Token,
  Pool,
  LiquidityPool,
  PoolDayData,
  PriceOpenClose,
} from "@/interfaces/uniswap.interface";
import { QueryOptions, gql } from "@apollo/client";
import { ChainId } from "@uniswap/sdk-core";
import { DBPoolInfo, DBPools, dbPoolInfo, dbPools } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import getRedis from "./redis";
import { RedisClientType } from "redis";
import { CHAIN_NAME, DEX_TYPES } from "@/lib/network";
import { now, sleep } from "./utils";
import BigNumber from "bignumber.js";
import { queryAll } from "./poolData";
import { getTokenAlias } from "@/lib/token";

function chainPoolKey(chainId: number): string {
  const RedisPoolsKey = "pools";
  return RedisPoolsKey + ":" + chainId;
}

function toDBPool(
  chainId: number,
  pool: Pool,
  dex: string = "uniswapv3"
): DBPools {
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
  } as DBPools;
}

function fromDBPool(p: DBPools): Pool {
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
  const client = getGraphClient(chainId, "uniswap");

  const res = await client.query({
    query: gql`
      query pool($id: String!) {
        pool(id: $id) {
          id
          token0 {
            id
            name
            symbol
            decimals
            derivedETH
          }
          token1 {
            id
            name
            symbol
            decimals
            derivedETH
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
    throw new Error("fetch pool failed");
    return null;
  }

  return res.data.pool;
}
/*
// pools query 的 or 条件没法用
async function getTokenPools(
  chainId: number,
  tokenId: string,
  tvlUSD = 5000,
  volUSD = 0
) {
  const queries: QueryOptions[] = [];

  queries.push({
    query: gql`
      query pools(
        $tvlUSD: BigDecimal!
        $volUSD: BigDecimal!
        $tokenId: String!
      ) {
        liquidityPools(
          first: 1000,
          orderBy: totalValueLockedUSD
          orderDirection: desc
          where: {
            totalValueLockedUSD_gte: $tvlUSD
            token0: $tokenId
          }
        ) {
          id
          inputTokens {
            id
            symbol
            decimals
            lastPriceUSD
          }
          totalLiquidity
          totalLiquidityUSD
          tick
          totalValueLockedUSD
          dailySnapshots(first: 30, orderBy: day, orderDirection: desc) {
            dailyVolumeUSD
            dailyTotalRevenueUSD
            dailyVolumeByTokenUSD
            day
            totalValueLockedUSD
            totalLiquidity
            dailySupplySideRevenueUSD
          }
        }
      }
    `,
    variables: {
      tvlUSD: tvlUSD,
      volUSD: volUSD,
      tokenId: tokenId,
    },
  });
  queries.push({
    query: gql`
      query pools(
        $tvlUSD: BigDecimal!
        $volUSD: BigDecimal!
        $tokenId: String!
      ) {
        liquidityPools(
          first: 1000,
          orderBy: totalValueLockedUSD
          orderDirection: desc
          where: {
            liquidity_gt: 0
            totalValueLockedUSD_gte: $tvlUSD
            volumeUSD_gt: $volUSD
            token1: $tokenId
          }
        ) {
          id
          token0 {
            id
            name
            symbol
            decimals
            derivedETH
          }
          token1 {
            id
            name
            symbol
            decimals
            derivedETH
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
          dailySnapshots(first: 30, orderBy: day, orderDirection: desc) {
            dailyVolumeUSD
            dailyTotalRevenueUSD
            dailyVolumeByTokenUSD
            day
            totalValueLockedUSD
            totalLiquidity
            dailySupplySideRevenueUSD
          }
        }
      }
    `,
    variables: {
      tvlUSD: tvlUSD,
      volUSD: volUSD,
      tokenId: tokenId,
    },
  });
  const client = getGraphClient(chainId, false);
  const resList = await Promise.all(queries.map((q) => client.query(q)));
  let pools: Pool[] = [];
  for (let res of resList) {
    if (res.errors || !res.data || res.data.pools.length === 0) {
      console.log('query failed:', res.errors)
      continue;
    }
    pools = pools.concat(res.data.pools);
  }

  return pools.sort((a, b) => +b.totalValueLockedUSD - +a.totalValueLockedUSD);
}
*/

// 从 uniswap 获取的k线数据得到价格
async function getPoolPrice(chainId: number, pools: LiquidityPool[]) {
  const client = getGraphClient(chainId, "uniswap");

  const queries: QueryOptions[] = [];
  for (let i = 0; ; i++) {
    if (i * 100 > 5000) {
      // max
      break;
    }

    queries.push({
      query: gql`
        query pools($ids: [ID!]) {
          pools(where: { id_in: $ids }) {
            poolDayData(
              first: 31
              skip: 1
              orderBy: date
              orderDirection: desc
            ) {
              open
              close
              high
              low
              date
            }
            id
          }
        }
      `,
      variables: {
        ids: pools.slice(i * 100, (i + 1) * 100).map((p) => p.id),
      },
    });
    if ((i + 1) * 100 > pools.length) break;
  }
  // console.log(pools.slice(0 * 100, (0 + 1) * 100).map((p) => p.id))
  // console.log('queries:', queries)

  const resList = await Promise.all(queries.map((q) => client.query(q)));
  const prices: { [key: string]: PoolDayData[] } = {};
  for (let resp of resList) {
    if (resp.errors || !resp.data) {
      console.log("query pool day data failed:", resp.errors);
      continue;
    }
    // console.log('resp:', resp)

    for (let item of resp.data.pools) {
      for (let i = 0; i < item.poolDayData.length - 1; i++) {
        item.poolDayData[i].open = item.poolDayData[i + 1].close;
      }
      prices[item.id] = item.poolDayData;
      console.log("got pool poolDayData", item.id);
    }
  }

  for (let p of pools) {
    if (prices[p.id]) {
      p.poolDayData = prices[p.id];
    }
  }
}

// 昨天开盘价 收盘价
// 7天开盘价 收盘价
// 30天开盘价 收盘价
function calcPoolPrice(
  pools: LiquidityPool[],
  prev1d: number,
  prev7d: number,
  prev30d: number
) {
  for (let pool of pools) {
    if (pool.poolDayData) {
      let price: PriceOpenClose = {} as PriceOpenClose;
      const dataLen = pool.poolDayData.length;
      for (let i = 0; i < dataLen; i++) {
        const item = pool.poolDayData[i];
        const day = item.date / 86400;
        if (day === prev1d) {
          // console.log('day price:', item)
          price.open1D = item.open;
          price.close1D = item.close;
          price.close30D = item.close;
          price.close7D = item.close;
        } else {
          const z0 = pool.poolDayData[0];
          const day = z0.date / 86400;
          if (day >= prev7d) {
            price.close7D = z0.close;
            price.close30D = z0.close;
          } else if (day >= prev30d) {
            price.close30D = z0.close;
          }
        }

        if (day === prev7d) {
          price.open7D = item.open;
        } else if (price.open7D === undefined && day < prev7d) {
          price.open7D = item.close;
        }

        if (day === prev30d) {
          price.open30D = item.open;
        } else if (price.open30D === undefined && day < prev30d) {
          price.open30D = item.close;
        }
      }

      pool.price = price; // toReciprocal(price) as PriceOpenClose
    } else {
      console.log(`pool ${pool.id} has no poolDayData`);
    }
  }
}

// uniswap 价格似乎是倒数
function toReciprocal(price: PriceOpenClose) {
  const bn1 = BigNumber(1);
  return {
    open1D: price.open1D ? bn1.div(price.open1D) : undefined,
    close1D: price.close1D ? bn1.div(price.close1D) : undefined,
    open7D: price.open7D ? bn1.div(price.open7D) : undefined,
    close7D: price.close7D ? bn1.div(price.close7D) : undefined,
    open30D: price.open30D ? bn1.div(price.open30D) : undefined,
    close30D: price.close30D ? bn1.div(price.close30D) : undefined,
  };
}

// 按照 tvl 排序的 pools, 从 messari graph 接口获取数据
async function getUniswapv3LiquidityPools(
  chainId: number,
  total: number = 0,
  tvlUSD: number = 5000
): Promise<LiquidityPool[]> {
  const take = total === 0 ? 1000 : total > 1000 ? 1000 : total;
  const client = getGraphClient(chainId, "messari");
  let pools: LiquidityPool[] = [];
  const queries: QueryOptions[] = [];

  // console.log('client:', client)
  for (let i = 0; ; i++) {
    if (i * take > 5000) {
      // skip cannot > 5000
      break;
    }
    queries.push({
      query: gql`
        query pools($take: Int!, $skip: Int!, $tvlUSD: BigDecimal!) {
          liquidityPools(
            first: $take
            skip: $skip
            orderBy: totalValueLockedUSD
            orderDirection: desc
            where: { totalValueLockedUSD_gte: $tvlUSD }
          ) {
            id
            tick
            totalValueLockedUSD
            inputTokens {
              id
              symbol
              decimals
              lastPriceUSD
            }
            dailySnapshots(first: 30, orderBy: day, orderDirection: desc) {
              dailyVolumeUSD
              dailyTotalRevenueUSD
              dailyVolumeByTokenUSD
              day
              totalValueLockedUSD
              totalLiquidity
              dailySupplySideRevenueUSD
            }
            fees(orderBy: feePercentage, orderDirection: desc, first: 1) {
              feePercentage
            }
          }
        }
      `,
      variables: {
        take: take,
        skip: take * i,
        tvlUSD: tvlUSD,
      },
    });
    if (total > 0 && (i + 1) * take > total) {
      break;
    }
  }
  const resList = await Promise.all(queries.map((q) => client.query(q)));
  for (let i = 0; i < resList.length; i++) {
    const res = resList[i];
    if (res.errors || !res.data) {
      console.log("query pool failed:", i, res);
      continue;
    }
    if (res.data.liquidityPools.length > 0)
      pools = pools.concat(res.data.liquidityPools);
  }

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
    chains.map((cid) =>
      getUniswapV3Pools({
        chainId: cid,
        total: 0,
        tvlUSD_gte: tvlUSD,
        volUSD_gte: volUSD,
      })
    )
  );

  for (let i = 0; i < chains.length; i++) {
    const pools = poolsList[i];
    const chainId = chains[i];
    for (let p of pools.pools) {
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
  const items = await getUniswapV3Pools({
    chainId,
    total: opts.total,
    tvlUSD_gte: opts.tvlUSD || 0,
    volUSD_gte: opts.volUSD || 0,
  });
  const pools = items.pools;
  const graphPools = _.keyBy(pools, (item) => item.id);
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

// 更新 pool 的信息
async function fetchPools(chainId: number, blockNumber: number) {
  const client = getGraphClient(chainId, "messari");

  const res = await client.query({
    query: gql`
      query liquidityPools($blockNumber: BigInt!) {
        liquidityPools(
          where: { createdBlockNumber_gt: $blockNumber }
          first: 1000
          orderBy: createdBlockNumber
          orderDirection: asc
        ) {
          id
          inputTokens {
            id
            decimals
            name
            symbol
          }
          createdTimestamp
          createdBlockNumber
          fees {
            feeType
            feePercentage
          }
          symbol
        }
      }
    `,
    variables: { blockNumber: blockNumber },
  });
  if (res.errors || !res.data) {
    console.log("query pool failed:", res);
    return [];
  }
  // console.log(key, res.data[key])
  const pools = res.data["liquidityPools"];
  if (pools.length < 1000) {
    return pools;
  }
  // 移除最后一个 block number 创建的 pools, 下次从这个 block 开始继续查询
  let lastBlockNumber = pools[pools.length - 1].createdBlockNumber;
  let index = pools.length - 2;
  for (; index >= 0; index--) {
    if (pools[index].createdBlockNumber !== lastBlockNumber) break;
  }
  return pools.slice(0, index + 1);
}

async function insertPoolInfo(
  chainId: number,
  pools: any[],
  dex = "uniswapv3"
) {
  const aliasMap = await getTokenAlias(chainId);

  const values: DBPoolInfo[] = [];
  for (let pool of pools) {
    let feeTier: string = "";
    for (let item of pool.fees) {
      if (item.feeType.indexOf("TRADING_FEE") !== -1) {
        // FIXED_TRADING_FEE
        feeTier = item.feePercentage;
      }
    }
    const token0 = pool.inputTokens[0];
    const token1 = pool.inputTokens[1];
    const token0Vname = aliasMap[token0.id.toLowerCase()] || "";
    const token1Vname = aliasMap[token1.id.toLowerCase()] || "";
    values.push({
      poolId: pool.id.toLowerCase(),
      chainId: chainId,
      dex: dex,
      feeTier: feeTier,
      token0: token0.name.slice(0, 100),
      token1: token1.name.slice(0, 100), // name
      token0Symbol: token0.symbol.slice(0, 100),
      token1Symbol: token1.symbol.slice(0, 100),
      token0Vname: token0Vname,
      token1Vname: token1Vname,
      token0Id: token0.id.toLowerCase(), // id
      token1Id: token1.id.toLowerCase(),
      symbol: pool.symbol.slice(0, 100),
      token0Decimals: token0.decimals,
      token1Decimals: token1.decimals,
      createdBlock: pool.createdBlockNumber,
      createdAt: pool.createdTimestamp,
    });
  }

  await db.insert(dbPoolInfo).values(values);
  console.log(
    `${now()} insert chain ${chainId} ${dex} new created pools: ${
      values.length
    } pools`
  );
}

async function getPoolLastBlockNumber() {
  const records = await db
    .select({
      createdBlock: dbPoolInfo.createdBlock,
    })
    .from(dbPoolInfo)
    .orderBy(desc(dbPoolInfo.createdBlock))
    .limit(1);
  if (records.length === 0) return 0;

  return +records[0].createdBlock;
}

async function loopPoolsRoutine(chainId: number) {
  let lastBlockNumber: number = await getPoolLastBlockNumber();

  console.log(`${now()} loopPoolsRoutine: get chain ${chainId} new pools from ${lastBlockNumber}`)

  for (; true; ) {
    const pools = await fetchPools(chainId, lastBlockNumber);
    if (pools.length === 0) {
      await sleep(60000);
      continue;
    }
    // insert
    try {
      await insertPoolInfo(chainId, pools, "uniswapv3");
      for (let pool of pools) {
        if (+pool.createdBlockNumber > lastBlockNumber) {
          lastBlockNumber = +pool.createdBlockNumber;
        }
      }
    } catch (err){
      console.log(`${now()} insert pools failed:`, err)
      await sleep(60000);
    }
  }
}

async function loopPoolsRoutines(chainIds: number[]) {
  for (let chainId of chainIds) {
    loopPoolsRoutine(chainId)
  }
}

// console.log((await fetchPools(1, 12444815)).length);
// console.log(await getPoolLastBlockNumber());
// runPoolRoutine({
//   1: {},
//   [ChainId.BASE]: {interval: 5000},
//   [ChainId.BNB]: {interval: 5000},
// })
// getPools(1, 0, 5000)
// loopPoolsRoutine(1)

export {
  chainPoolKey,
  getUniswapv3LiquidityPools,
  getPoolInfos,
  runPoolRoutine,
  getUniswapv3PoolById,
  getPoolPrice,
  calcPoolPrice,
  loopPoolsRoutine,
  loopPoolsRoutines,
  // getTokenPools,
};
