import { db } from "@/db/db";
import { DBTokenOHCL, dbPoolInfo, dbTokenOHCL, tokenAlias } from "@/db/schema";

import dayjs from "dayjs";
import { SQL, and, asc, eq, gte, lte, or, sql } from "drizzle-orm";
import _ from "lodash";
import { zeroAddress } from "viem";

const DefaultAlias: { [key: number]: { [key: string]: string } } = {
  1: {
    [zeroAddress]: "ETH",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "ETH", // WETH
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "BTC", // WBTC
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
  },
  56: {
    [zeroAddress]: "BNB",
  }
};

async function symbolToTokenId(symbol: string, chainId?: number) {
  const records = await db.query.tokenAlias.findMany({
    where: eq(tokenAlias.alias, symbol),
  });

  for (let record of records) {
    if (record.chainId === chainId) return record.id;
  }
  if (records.length > 0) return records[0].id

  chainId = chainId ? chainId : 1
  const aliasMap = DefaultAlias[chainId]

  for (let id in aliasMap) {
    if (aliasMap[id] === symbol) {
      return id
    }
  }
  return symbol;
}

async function getTokenAlias(chainId: number) {
  const records = await db.query.tokenAlias.findMany({
    where: eq(tokenAlias.chainId, chainId),
  });
  const aliases: { [key: string]: string } = _.clone(DefaultAlias[chainId]);

  for (let record of records) {
    aliases[record.id.toLowerCase()] = record.alias;
  }
  return aliases;
}

// prefer use symbol, then tokenId
async function countTokenPools(
  symbol: string,
  tokenId: string,
  chainId?: number
) {
  const wheres: SQL[] = [];

  if (symbol) {
    wheres.push(
      or(
        eq(dbPoolInfo.token0Vname, symbol),
        eq(dbPoolInfo.token1Vname, symbol)
      )!
    );
  } else {
    if (!tokenId) {
      throw new Error("both symbol and tokenId empty");
    }
    wheres.push(
      or(eq(dbPoolInfo.token0Id, tokenId), eq(dbPoolInfo.token1Id, tokenId))!
    );
  }
  if (chainId) {
    wheres.push(eq(dbPoolInfo.chainId, chainId));
  }

  return (
    await db
      .select({ count: sql<number>`cast(count(1) as int)` })
      .from(dbPoolInfo)
      .where(and(...wheres))
  )[0].count;
}

// 直接根据 messari 的 token 数据将 token hour ohcl 写入数据库中
export async function getTokenHistoryPrice(
  tokenId: string,
  startTs: number,
  endTs: number,
  chainId?: number
) {
  // tokenOHCL
  const wheres: SQL[] = [
    eq(dbTokenOHCL.tokenId, tokenId),
    gte(dbTokenOHCL.startTs, startTs),
    lte(dbTokenOHCL.startTs, endTs),
  ];
  if (chainId) {
    wheres.push(eq(dbTokenOHCL.chainId, chainId));
  }
  const items = await db.query.dbTokenOHCL.findMany({
    where: and(...wheres),
    orderBy: [asc(dbTokenOHCL.hour)],
  });

  if (items.length === 0) return items;

  const ohclList: DBTokenOHCL[] = [];
  if (+items[0].startTs !== startTs) {
    let item = _.clone(items[0]);
    item.startTs = startTs;
    item.hour = Math.floor(startTs / 3600);
    item.date = dayjs(startTs).format("YYYY-MM-DD-HHmm");
    ohclList.push(item);
  } else {
    ohclList.push(items[0]);
  }

  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    if (item.hour === ohclList[i - 1].hour + 1) {
      ohclList.push(item);
    } else if (item.hour <= ohclList[i - 1].hour) {
      // 错误数据
      console.log(
        `invalid token ${tokenId} OHCL: prev hour=${
          ohclList[i - 1].hour
        } hour=${item.hour}`
      );
    } else {
      // 有空缺的 K 线
      let fake = _.clone(ohclList[i - 1]);
      fake.hour += 1;
      fake.startTs = 3600 * fake.hour;
      fake.date = dayjs(fake.startTs).format("YYYY-MM-DD-HHmm");
      ohclList.push(fake);
    }
  }
  return ohclList;
}

//
// 返回 token info:
//      pool count
//      latest price
//      price change 7D
//      price close 7D
async function getTokenInfo(chainId: number, symbol: string, tokenId: string) {
  // prefer symbol, then tokenId
  const poolCount = await countTokenPools(symbol, tokenId, chainId);
  // todo
  const latestPrice = '';
  if (!tokenId) {
    tokenId = await symbolToTokenId(symbol, chainId);
  }

  const endTs = Math.floor(new Date().getTime() / 1000 / 3600) * 3600;
  const startTs = endTs - 86400 * 7;
  const prices7d = await getTokenHistoryPrice(tokenId, chainId, startTs, endTs);
  const open = prices7d.length > 0 ? +prices7d[0].open : 0;
  let change7d = "0";
  if (latestPrice) {
    change7d = ((+latestPrice - open) / +latestPrice).toFixed(4);
  }

  return { poolCount, latestPrice, prices7d, change7d };
}

export { symbolToTokenId, getTokenAlias, countTokenPools, getTokenInfo };
