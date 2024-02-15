import { gql } from "@apollo/client";

import { getGraphClient } from "./client";
import { queryAll } from "./poolData";
import { getLatestBlockNumber } from "./block";
import getRedis from "./redis";
import { RedisClientType } from "@redis/client";
import { db } from "@/db/db";
import { tokenAlias } from "@/db/schema";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";

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

async function getTokenAlias(chainId: number) {
  const records = await db.query.tokenAlias.findMany({
    where: eq(tokenAlias.chainId, chainId),
  });
  const aliases: { [key: string]: string } = {};

  for (let record of records) {
    aliases[record.id] = record.alias;
  }
  return aliases;
}

async function tokenPriceRoutine(chainId: number) {
  let blockNumber = await getLatestBlockNumber(chainId);
  const rc = await getRedis();

  for (; true; ) {
    const now = dayjs().format('YYYY-MM-DDTHH:mm:ss')
    console.log(`${now} chainId: ${chainId} blockNumber: ${blockNumber}`)
    const prices = await fetchUniswapTokenPrice(chainId, blockNumber);
    const aliasMap = await getTokenAlias(chainId);

    for (let item of prices) {
      // save to redis
      if (+item.lastPriceBlockNumber > blockNumber) {
        blockNumber = +item.lastPriceBlockNumber;
      }
      refreshRedisTokenPrice(chainId, rc, item, aliasMap);
    }

    await sleep(60000);
  }
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
  console.log(`refresh token ${item.id} ${alias ? alias: ''} price to ${item.lastPriceUSD}`)
}

async function loopTokenPrice(chainIds: number[]) {
  for (let chainId of chainIds) {
    tokenPriceRoutine(chainId);
  }
}

loopTokenPrice([1])

export { fetchUniswapTokenPrice, loopTokenPrice };
