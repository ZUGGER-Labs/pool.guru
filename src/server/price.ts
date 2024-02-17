import { gql } from "@apollo/client";

import { getGraphClient } from "./client";
import { queryAll } from "./poolData";
import { getBlockTimestamp, getLatestBlockNumber } from "./block";
import getRedis from "./redis";
import { RedisClientType } from "@redis/client";
import dayjs from "dayjs";
import { getTokenAlias } from "@/lib/token";
import { now } from "./utils";
import _ from "lodash";
import { db } from "@/db/db";
import { DBTokenOHCL, dbTokenOHCL } from "@/db/schema";

async function fetchUniswapTokenPrice(
  chainId: number,
  block: number,
  dex = "uniswapv3"
) {
  return queryAll(
    getGraphClient(chainId, "messari"),
    gql`
      query tokens($skip: Int!, $block: Int!) {
        tokens(
          where: { lastPriceUSD_gt: "0", lastPriceBlockNumber_gt: $block }
          skip: $skip
          first: 1000
          orderBy: lastPriceBlockNumber
          orderDirection: asc
        ) {
          id
          decimals
          lastPriceUSD
          lastPriceBlockNumber
          name
          symbol
        }
      }
    `,
    { block: block },
    "tokens"
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tokenPriceRoutine(chainId: number) {
  let blockNumber = await getLatestBlockNumber(chainId);
  console.log(`${now()} chain ${chainId} latest block: ${blockNumber}`);
  const rc = await getRedis();
  let currentHour = Math.floor(new Date().getTime() / 1000 / 3600);

  for (; true; ) {
    // const now = dayjs().format("YYYY-MM-DDTHH:mm:ss");
    // console.log(`${now} chainId: ${chainId} blockNumber: ${blockNumber}`);
    try {
      const prices = await fetchUniswapTokenPrice(chainId, blockNumber);
      const aliasMap = await getTokenAlias(chainId);
      const blocks = await getBlockTimestamp(chainId, blockNumber);

      for (let item of prices) {
        // save to redis
        if (+item.lastPriceBlockNumber > blockNumber) {
          blockNumber = +item.lastPriceBlockNumber;
        }
        refreshRedisTokenPrice(chainId, rc, item, aliasMap);
      }

      await refreshRedisTokenOHCL(chainId, rc, prices, blocks);

      const hour = Math.floor(new Date().getTime() / 1000 / 3600);
      if (hour > currentHour) {
        // sync token ohcl to DB
        await syncTokenOHCL(chainId, rc, hour);
        currentHour = hour;
      }
    } catch (err) {
      console.warn("${now() tokenPriceRoutine failed:", err);
    }

    // 30 second
    await sleep(30000);
  }
}

async function syncTokenOHCL(
  chainId: number,
  rc: RedisClientType<any, any, any>,
  currentHour: number
) {
  const blockHour = await rc.get(`tokenOHCLHour-${chainId}`);
  console.log(
    `${now()} syncTokenOHCL: blockHour=${blockHour} currentHour=${currentHour}`
  );
  const minHour = blockHour
    ? +blockHour > currentHour
      ? currentHour
      : +blockHour
    : currentHour;

  const ohclHours = await rc.keys(`tokenOHCL-${chainId}-*`);
  for (let hourKey of ohclHours) {
    const hour = +hourKey.split("-")[2];
    if (hour < minHour - 1) {
      const ohclMap = await rc.hGetAll(hourKey);
      const ohclList = _.values(ohclMap);
      await insertTokenOHCL(chainId, ohclList);

      await rc.del(hourKey);
    }
  }
}

async function insertTokenOHCL(chainId: number, ohclList: string[]) {
  const values: DBTokenOHCL[] = [];

  for (const item of ohclList) {
    const ohcl = JSON.parse(item);
    values.push({
      chainId: chainId,
      dex: "uniswapv3",
      interval: 3600,
      tokenId: ohcl.id,
      hour: ohcl.hour,
      startTs: +ohcl.hour * 3600,
      date: dayjs(3600 * +ohcl.hour).format("YYYY-MM-DD-HHmm"), // ex 2024-02-09-1200
      open: ohcl.open,
      high: ohcl.high,
      low: ohcl.low,
      close: ohcl.close,
    });
  }
  await db.insert(dbTokenOHCL).values(values);
  console.log(
    `${now()} insertTokenOHCL: sync chain ${chainId} ${
      ohclList.length
    } token OHCL to db`
  );
}

async function refreshRedisTokenOHCL(
  chainId: number,
  rc: RedisClientType<any, any, any>,
  prices: any[],
  blocks: { number: string; timestamp: string }[]
) {
  // key: block number, value: hour
  const blocksHour: { [key: string]: number } = {};
  for (let block of blocks) {
    blocksHour[block.number] = toHour(block.timestamp);
  }
  const latestBlock = blocks[blocks.length - 1];
  console.log(
    `${now()} refreshRedisTokenOHCL: chain ${chainId} latest block: ${
      latestBlock.number
    } ${latestBlock.timestamp} tokenOHCL: ${prices.length}`
  );

  const currentHour = toHour(new Date().getTime() / 1000);
  for (let item of prices) {
    let hour = blocksHour[item.lastPriceBlockNumber];
    if (!hour) {
      console.log(
        `${now()} not found chain ${chainId} block ${
          item.lastPriceBlockNumber
        } hour, set to current hour ${currentHour}`
      );
      hour = currentHour;
    }
    const key = `tokenOHCL-${chainId}-${hour}`;
    const data = await rc.hGet(key, item.id);
    let ohcl: any;
    if (!data) {
      ohcl = {
        id: item.id,
        hour: hour,
        open: item.lastPriceUSD,
        high: item.lastPriceUSD,
        low: item.lastPriceUSD,
        close: item.lastPriceUSD,
      };
    } else {
      ohcl = JSON.parse(data);
      let last = +item.lastPriceUSD;
      if (+ohcl.high < last) {
        ohcl.high = item.lastPriceUSD;
      }
      if (+ohcl.low > last) {
        ohcl.low = item.lastPriceUSD;
      }
      ohcl.close = item.lastPriceUSD;
    }

    await rc.hSet(key, item.id, JSON.stringify(ohcl));
    await rc.set(`tokenOHCLHour-${chainId}`, hour);
  }
}

function toHour(second: number | string) {
  return Math.floor(+second / 3600);
}

async function refreshRedisTokenPrice(
  chainId: number,
  rc: RedisClientType<any, any, any>,
  item: any,
  aliasMap: { [key: string]: string }
) {
  await rc.hSet("tokenPrice-" + chainId, item.id, item.lastPriceUSD);
  const alias = aliasMap[item.id.toLowerCase()];
  if (alias) {
    await rc.hSet("tokenPrice-" + chainId, alias, item.lastPriceUSD);
  }
  // console.log(
  //   `refresh token ${item.id} ${alias ? alias : ""} price to ${
  //     item.lastPriceUSD
  //   }`
  // );
}

async function loopTokenPrice(chainIds: number[]) {
  for (let chainId of chainIds) {
    tokenPriceRoutine(chainId);
  }
}

// loopTokenPrice([1]);

export { fetchUniswapTokenPrice, loopTokenPrice };
