
import chainTokenImageURI from "../uniswap/chainTokenImageURI.json";
import { CHAIN_ID_BY_NAME } from "@/lib/network";
import { Token } from "@/interfaces/uniswap.interface";
import _ from "lodash";
import { getGraphClient } from "./client";
import { gql } from "@apollo/client";
import { db } from '@/db/db'
import { DBToken, dbTokens } from "@/db/schema";
import { getTokenLogoURL } from "@/uniswap/helper";
import { and, eq } from "drizzle-orm";

/*
token: {
  id: string;
  name: string;
  symbol: string;
  volumeUSD: string;
  logoURI: string;
  decimals: string;

  // For pool overview
  tokenDayData: TokenDayData[];
  totalValueLockedUSD: string;
  poolCount: number;

  derivedETH?: number
}
*/
function insertTokens(chainId: number) {}

async function queryTokens(chainId: number, tokenIds: string[]) {
  const client = getGraphClient(chainId, false);

  const res = await client.query({
    query: gql`
      query tokens($idList: [ID!]) {
        tokens(where: { id_in: $idList }) {
          id
          name
          symbol
          volumeUSD
          decimals
          totalValueLockedUSD
          tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
            priceUSD
          }
        }
      }
    `,
    variables: {
      idList: tokenIds,
    },
  });

  return res.data.tokens;
}

function toDBToken(chainId: number, token: Token): DBToken {
    return {
        tokenId: token.id,
        chainId: chainId,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI || getTokenLogoURL(token.id),
        decimals: +token.decimals,
        desc: '',
        tvlUSD: '0',
    } as DBToken
}

function fromDBToken(token: DBToken): Token {
    return {
        id: token.tokenId,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI || '',
        decimals: '' + token.decimals,
        poolCount: 0,
        volumeUSD: '0',
        totalValueLockedUSD: '0'
    }
}

// create or update token by tokenId
async function saveToken(chainId: number, token: Token) {
  const res = await queryTokens(chainId, [token.id])
  if (res.length === 0) {
    console.log('not found token info:', chainId, token.id)
    return
  }
  const record = await db.query.dbTokens.findFirst({
    where: and(
      eq(dbTokens.chainId, chainId),
      eq(dbTokens.tokenId, token.id)
    )
  })
  if (!record) {
    // insert token
    const dbtoken = toDBToken(chainId, token)
    await db.insert(dbTokens).values(dbtoken)
  } else {
    // update
    await db.update(dbTokens).set({
      logoURI: token.logoURI === '' ? record.logoURI : token.logoURI,
      tvlUSD: token.totalValueLockedUSD,
    })
  }
}

// 初始化 token 信息
async function initTokens() {
  for (let name in chainTokenImageURI) {
    const chainId = CHAIN_ID_BY_NAME[name];
    if (!chainId) {
      throw new Error("invalid chain: " + name);
    }

    const tokenMap = (chainTokenImageURI as any)[name];
    const tokenIds = _.keys(tokenMap);

    console.log("chain:", name, "total tokenIds:", tokenIds.length);
    const queryPage = Math.ceil(tokenIds.length / 100);
    for (let i = 0; i < queryPage; i++) {
      const start = i * 100;
      const end = start + 100;
      try {
        const idList = tokenIds.slice(start, end)
        const tokens = await queryTokens(chainId, idList);
        if (tokens.length === 0) {
          continue
        }
        // if (tokens.length < 10) {
        //   console.log('too many tokens info not fetch:', idList)
        //   return;
        // }
        await db.insert(dbTokens).values(tokens.map((t: Token) => toDBToken(chainId, t))) // insertMany(tokens);
        console.log("insert %s %d tokens", name, tokens.length);
      } catch (err) {
        console.log("query or insert token failed:", err);
      }
    }
  }
}

// initTokens();
// queryTokens(1, ["0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"]);

export {
  saveToken,
  initTokens,
}