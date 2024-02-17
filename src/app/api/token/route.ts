import { countTokenPools, getTokenHistoryPrice, getTokenLatestPrice, symbolToTokenId } from "@/lib/token";
import { NextRequest } from "next/server";

const TokenMethodInfo7d = "info7d";

export async function GET(req: NextRequest) {}

export async function POST(req: NextRequest) {
  let { method, symbol, tokenId, chainId } = await req.json();

  if (!chainId) {
    chainId = 1;
  }
  if (!tokenId) {
    tokenId = symbolToTokenId(symbol, chainId);
  }
  switch (method) {
    case TokenMethodInfo7d:
      return getTokenInfo(chainId, symbol, tokenId);
  }
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
