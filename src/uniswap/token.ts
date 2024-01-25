"use server";

import { Pool, Token } from "@/interfaces/uniswap.interface";
import { chainPoolKey } from "@/server/pools";
import getRedis from "@/server/redis";
import { ChainId } from "@uniswap/sdk-core";
import _ from "lodash";
import { getTokenLogoURL } from "./helper";

async function getRedisPools(chainIds?: number[], topN?: number) {
  if (!(chainIds && chainIds.length > 0)) {
    chainIds = [
      ChainId.MAINNET,
      ChainId.ARBITRUM_ONE,
      ChainId.OPTIMISM,
      ChainId.POLYGON,
      ChainId.CELO,
      ChainId.BNB,
      ChainId.AVALANCHE,
      ChainId.BASE,
    ];
  }
  const pools: Pool[] = [];
  const rc = await getRedis();
  const resList = await Promise.all(
    chainIds.map((c) => rc.hGetAll(chainPoolKey(c)))
  );
  for (let res of resList) {
    for (let sp of _.values(res)) {
      pools.push(JSON.parse(sp));
    }
  }

  pools.sort((a, b) => +b.totalValueLockedUSD - +a.totalValueLockedUSD);
  if (topN) {
    return pools.slice(topN);
  }

  return pools;
}

async function sortTokens(chainIds?: number[], topN?: number) {
  const tokens: { [key: string]: Token } = {};
  const pools = await getRedisPools(chainIds);

  for (let pool of pools) {
    if (tokens[pool.token0.id.toLowerCase()]) {
      tokens[pool.token0.id.toLowerCase()].poolCount += 1;
    } else {
      tokens[pool.token0.id.toLowerCase()] = {
        id: pool.token0.id.toLowerCase(),
        name: pool.token0.name,
        symbol: pool.token0.symbol,
        decimals: pool.token0.decimals,
        poolCount: 1,
        volumeUSD: "0",
        logoURI: getTokenLogoURL(pool.token0.id),
        totalValueLockedUSD: "0",
      };
    }

    if (tokens[pool.token1.id.toLowerCase()]) {
      tokens[pool.token1.id.toLowerCase()].poolCount += 1;
    } else {
      tokens[pool.token1.id.toLowerCase()] = {
        id: pool.token1.id.toLowerCase(),
        name: pool.token1.name,
        symbol: pool.token1.symbol,
        decimals: pool.token1.decimals,
        poolCount: 1,
        volumeUSD: "0",
        logoURI: getTokenLogoURL(pool.token1.id),
        totalValueLockedUSD: "0",
      };
    }
  }

  return _.values(tokens)
    .sort((a, b) => b.poolCount - a.poolCount)
    .slice(0, topN);
}

export { getRedisPools, sortTokens };
