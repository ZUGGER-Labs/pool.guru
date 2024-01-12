import { Pool, Token } from "@/interfaces/uniswap.interface";
import { DEX_TYPES, getNetworkEndpoint, getNetworkName } from "@/lib/network";
import { getTokenLogoURL, getUniqueItems } from "./helper";

// private helper functions
const _query = async (endpoint: string, query: string): Promise<any> => {
  const resp = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ query }),
  });

  if (resp.status !== 200) {
    throw new Error("invalid response status: " + resp.status);
  }

  const data = await resp.json();

  const errors = data.errors;
  if (errors && errors.length > 0) {
    console.error("Uniswap Subgraph Errors", { errors, query });
    throw new Error(`Uniswap Subgraph Errors: ${JSON.stringify(errors)}`);
  }

  return data.data;
};

const _processTokenInfo = (token: Token) => {
  token.logoURI = getTokenLogoURL(token.id);

  // TODO: check the network id before replace the token name
  if (token.name === "Wrapped Ether" || token.name === "Wrapped Ethereum") {
    token.name = "Ethereum";
    token.symbol = "ETH";
    token.logoURI =
      "https://cdn.iconscout.com/icon/free/png-128/ethereum-2752194-2285011.png";
  }
  if (token.name === "Wrapped Matic") {
    token.name = "Polygon Native Token";
    token.symbol = "MATIC";
  }
  if (token.name === "Wrapped BNB") {
    token.name = "BSC Native Token";
    token.symbol = "BNB";
  }

  return token;
};

const getBulkTokens = async (
  endpoint: string,
  tokenAddresses: string[]
): Promise<Token[]> => {
  const res = await _query(
    endpoint,
    `{
      tokens(where: {id_in: [${tokenAddresses
        .map((id) => `"${id}"`)
        .join(",")}]}) {
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
    }`
  );

  if (res.tokens !== null) {
    res.tokens = res.tokens.map(_processTokenInfo);
  }

  return res.tokens;
};

const processPools = async (
  endpoint: string,
  pools: Pool[]
) => {
  const tokenIds = getUniqueItems(
    pools.reduce(
      (acc: string[], p: Pool) => [...acc, p.token0.id, p.token1.id],
      []
    )
  );
  const queryPage = Math.ceil(tokenIds.length / 100);
  // batch query getBulkTokens function by page using Promise.all
  const tokens = await Promise.all(
    Array.from({ length: queryPage }, (_, i) => {
      const start = i * 100;
      const end = start + 100;
      return getBulkTokens(endpoint, tokenIds.slice(start, end));
    })
  ).then((res) => res.flat());
  // sort token by volume
  tokens.sort((a, b) => Number(b.volumeUSD) - Number(a.volumeUSD));
  // map poolCount
  const poolCountByTokenId = pools.reduce((acc: any, p: Pool) => {
    acc[p.token0.id] = (acc[p.token0.id] || 0) + 1;
    acc[p.token1.id] = (acc[p.token1.id] || 0) + 1;
    return acc;
  }, {});

  const _tokens = tokens.map((t: Token) => {
    return {
      ...t,
      poolCount: poolCountByTokenId[t.id],
    };
  });
  // create hashmap of tokens id
  const tokenMap = _tokens.reduce((acc: any, t: Token) => {
    acc[t.id] = t;
    return acc;
  }, {});
  const npools = pools.map((p: Pool) => {
    return {
      ...p,
      token0: tokenMap[p.token0.id],
      token1: tokenMap[p.token1.id],
    };
  });

  return { pools: npools, tokens };
};

// get uniswap v3 pools
const getUniswapV3Pools = async ({
  chainId,
  take,
  tvlUSD_gte,
  volUSD_gte,
}: {
  chainId?: number;
  skip?: number;
  take?: number;
  tvlUSD_gte: number;
  volUSD_gte: number;
}): Promise<{
  pools: Pool[];
  tokens: Token[];
}> => {
  chainId = chainId || 1;
  take = take || 1000; // fir
  const endpoint = getNetworkEndpoint(chainId);

  try {
    const res = await _query(
      endpoint,
      `{
        pools (first: ${take}, orderBy: totalValueLockedUSD, orderDirection: desc, where: {liquidity_gt: 0, totalValueLockedUSD_gte: ${tvlUSD_gte}, volumeUSD_gte: ${volUSD_gte}}) {
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
          volumeUSD
          totalValueLockedUSD
          createdAtTimestamp
        }
      }`
    );
    if (!res || res.length === 0) {
      return { pools: [], tokens: [] };
    }

    return processPools(endpoint, res.pools)
  } catch (err) {
    return { pools: [], tokens: [] };
  }
};

export { getUniswapV3Pools };
