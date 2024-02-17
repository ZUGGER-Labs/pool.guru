import { db } from "@/db/db";
import { DBTokenOHCL, dbPoolInfo, dbTokenOHCL, tokenAlias } from "@/db/schema";
import getRedis from "@/server/redis";
import dayjs from "dayjs";
import { SQL, and, asc, eq, gte, lte, or, sql } from "drizzle-orm";
import _ from "lodash";

async function symbolToTokenId(symbol: string, chainId?: number) {
  const records = await db.query.tokenAlias.findMany({
    where: eq(tokenAlias.alias, symbol),
  });

  for (let record of records) {
    if (record.chainId === chainId) return record.id;
  }

  return records.length > 0 ? records[0].id : symbol;
}

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

export async function getTokenLatestPrice(
  symbol: string,
  tokenId: string,
  chainId?: number
) {
  chainId = chainId ? chainId : 1;
  const rc = await getRedis();
  const key = "tokenPrice-" + chainId;
  if (symbol) {
    return rc.hGet(key, symbol);
  } else {
    return rc.hGet(key, tokenId);
  }
}

// 直接根据 messari 的 token 数据将 token hour ohcl 写入数据库中
export async function getTokenHistoryPrice(
  tokenId: string,
  startTs: number,
  endTs: number,
  chainId?: number) {
  // tokenOHCL
  const wheres: SQL[] = [
    eq(dbTokenOHCL.tokenId, tokenId),
    gte(dbTokenOHCL.startTs, startTs),
    lte(dbTokenOHCL.startTs, endTs),
  ]
  if (chainId) {
    wheres.push(eq(dbTokenOHCL.chainId, chainId))
  }
    const items = await db.query.dbTokenOHCL.findMany({
      where: and(...wheres),
      orderBy: [asc(dbTokenOHCL.hour)]
    })

    if (items.length === 0) return items;

    const ohclList: DBTokenOHCL[] = []
    if (+items[0].startTs !== startTs) {
      let item = _.clone(items[0])
      item.startTs = startTs
      item.hour = Math.floor(startTs/3600)
      item.date = dayjs(startTs).format('YYYY-MM-DD-HHmm')
      ohclList.push(item)
    } else {
      ohclList.push(items[0])
    }

    for (let i = 1; i < items.length; i ++) {
      const item = items[i]
      if (item.hour === ohclList[i-1].hour + 1) {
        ohclList.push(item)
      } else if (item.hour <= ohclList[i-1].hour) {
        // 错误数据
        console.log(`invalid token ${tokenId} OHCL: prev hour=${ohclList[i-1].hour} hour=${item.hour}`)
      } else {
        // 有空缺的 K 线
        let fake = _.clone(ohclList[i-1])
        fake.hour += 1
        fake.startTs = 3600 * fake.hour
        fake.date = dayjs(fake.startTs).format('YYYY-MM-DD-HHmm')
        ohclList.push(fake)
      }
    }
    return ohclList
}

//
// 返回 token info:
//      pool count
//      latest price
//      price change 7D
//      price close 7D
async function getTokenInfo(chainId: number, symbol: string, tokenId: string) {
  // prefer symbol, then tokenId
  const poolCount = await countTokenPools(symbol, tokenId, chainId)
  const latestPrice = await getTokenLatestPrice(symbol, tokenId, chainId) || '0'
  if (!tokenId) {
      tokenId = await symbolToTokenId(symbol, chainId)
  }

  const endTs = Math.floor(new Date().getTime()/1000/3600)*3600
  const startTs = endTs - 86400*7
  const prices7d = await getTokenHistoryPrice(tokenId, chainId, startTs, endTs)
  const open = prices7d.length > 0 ? (+prices7d[0].open) : 0
  let change7d = '0'
  if (latestPrice) {
      change7d = ((+latestPrice - open)/(+latestPrice)).toFixed(4)
  }

  return {poolCount, latestPrice, prices7d, change7d}
}

export { symbolToTokenId, getTokenAlias, countTokenPools, getTokenInfo };
