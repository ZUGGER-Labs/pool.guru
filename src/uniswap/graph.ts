import {
  LiquidityPool,
  Pool,
  PoolVolumeFeeData,
  Position,
  Tick,
  Token,
} from "@/interfaces/uniswap.interface";
import {
  DEX_TYPES,
  getNetworkDexEndpoint,
  getNetworkName,
} from "@/lib/network";
import { getTokenLogoURL, getUniqueItems } from "./helper";
import _query from "./query";
import { getBlock24H } from "./block";

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

export const getBulkTokens = async (
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

const processPools = async (endpoint: string, pools: Pool[]) => {
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

// todo 这里需要确定 id_in 的最大数量
const getPoolVolumeFees24H = async (
  endpoint: string,
  pools: Pool[],
  block24H: number,
  opts: {
    total?: number;
    tvlUSD_gte?: number;
    volUSD_gte?: number;
  }
) => {
  let poolString = `[`;
  pools.map((p) => {
    return (poolString += `"${p.id}",`);
  });
  poolString += "]";
  const volUSD_gte = opts.volUSD_gte || 5000;
  let tvlUSD_gte = opts.tvlUSD_gte || 5000;
  if (tvlUSD_gte <= 5000) {
    tvlUSD_gte = 5000;
  }
  const total = opts.total !== undefined ? opts.total : 0;

  const poolMap: { [key: string]: Pool } = pools.reduce((acc: any, p: Pool) => {
    acc[p.id] = p;
    return acc;
  }, {});

  try {
    const queires: any[] = [];
    const take = total === 0 ? 1000 : total > 1000 ? 1000 : total;
    for (let i = 0; i < pools.length; i++) {
      const skip = take * i;
      if (skip > 5000) {
        break;
      }
      queires.push(
        _query(
          endpoint,
          `query pools {
      pools (first: ${take}, skip: ${skip}, block: {number: ${block24H}}, orderBy: totalValueLockedUSD, orderDirection: desc, where: { totalValueLockedUSD_gte: ${tvlUSD_gte}, volumeUSD_gte: ${volUSD_gte}}) {
        id
        feesUSD
        volumeUSD
    }
  }`
        )
      );
      if (total > 0 && take * (i + 1) >= total) {
        break;
      }
    }

    const results = await Promise.all(queires);
    console.log("pool@block results:", results);
    for (let result of results) {
      if (!result || result.pools.length === 0 || result.errors) {
        console.log("get pool fees/volume failed");
        continue;
      }
      for (let item of result.pools) {
        const feesUSD = item.feesUSD;
        const volumeUSD = item.volumeUSD;
        const pool = poolMap[item.id] as Pool;

        if (pool) {
          let fees7d = 0,
            volume7d = 0,
            fees30d = 0,
            volume30d = 0;
          pool.poolDayData.map((data, idx) => {
            fees30d += +data.feesUSD;
            volume30d += +data.volumeUSD;
            if (idx < 7) {
              fees7d += +data.feesUSD;
              volume7d += +data.volumeUSD;
            }
          });
          let volFeeData: PoolVolumeFeeData = {
            fees24h: +pool.feesUSD - feesUSD,
            volume24h: +pool.volumeUSD - volumeUSD,
            fees7d: fees7d,
            volume7d: volume7d,
            fees30d: fees30d,
            volume30d: volume30d,
          };
          pool.volFeeData = volFeeData;
        }
      }
    }
  } catch (err) {}

  const npools: Pool[] = [];
  const leftPools: Pool[] = []; // not get data
  for (let id in poolMap) {
    const pool = poolMap[id];
    if (pool.volFeeData) {
      npools.push(pool);
    } else {
      leftPools.push(pool);
    }
  }
  // todo get leftPools

  npools.sort((a, b) => +b.totalValueLockedUSD - +a.totalValueLockedUSD);
  return npools;
};

/*
const getPoolData = async ({
  chainId,
  poolAddress,
}: {
  chainId: number;
  poolAddress: string;
}): Promise<Pool> => {
  const endpoint = getNetworkDexEndpoint(chainId);
  const res = await _query(
    endpoint,
    `query pool {
    {
    pool (id: "${poolAddress}") {
      id
      token0 {
        decimals
        id
        name
        symbol
      }
      token1 {
        decimals
        id
        name
        symbol
      }
      feeTier
      liquidity
      tick
      sqrtPrice
      feesUSD
      volumeUSD
      totalValueLockedUSD
      createdAtTimestamp
      poolDayData(first: 1, skip: 1, orderBy: date, orderDirection: desc) {
        date
        feesUSD
        volumeUSD
        open 
        high
        low
        close
      }
    }
  }`
  );
  return res.data.pool;
};
*/

// get uniswap v3 pools & tokens
const getUniswapV3Pools = async ({
  chainId,
  total,
  tvlUSD_gte,
  volUSD_gte,
}: {
  chainId?: number;
  total?: number;
  tvlUSD_gte: number;
  volUSD_gte: number;
}): Promise<{
  pools: Pool[];
  tokens: Token[];
}> => {
  chainId = chainId || 1;
  total = total === undefined ? 0 : total;
  const take = total === 0 ? 1000 : total > 1000 ? 1000 : total; // first
  const endpoint = getNetworkDexEndpoint(chainId);

  // min tvl is 5000 USD
  if (tvlUSD_gte <= 5000) {
    tvlUSD_gte = 5000;
  }

  try {
    let skip = 0;
    let max = 10; // max get 10000 items
    const _pools: Pool[] = [];
    for (let i = 0; i < max; i++) {
      skip = i * take;
      if (skip > 5000) {
        break;
      }
      const res = await _query(
        endpoint,
        `{
        pools (first: ${take}, skip: ${skip}, orderBy: totalValueLockedUSD, orderDirection: desc, where: {liquidity_gt: 0, totalValueLockedUSD_gte: ${tvlUSD_gte}, volumeUSD_gte: ${volUSD_gte}}) {
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
          poolDayData(first: 30, skip: 1, orderBy: date, orderDirection: desc) {
            date
            feesUSD
            volumeUSD
            open 
            high
            low
            close
          }
        }
      }`
      );
      if (!res || res.length === 0 || res.errors) {
        break;
      }

      _pools.push(...res.pools);
      if (total > 0 && _pools.length >= total) {
        break;
      }
    }
    const b24h = await getBlock24H(chainId);
    // console.log('block 24H:', b24h)
    const pools = await getPoolVolumeFees24H(endpoint, _pools, b24h, {
      total,
      tvlUSD_gte,
      volUSD_gte,
    });

    const result = await processPools(endpoint, pools);
    return { pools: result.pools, tokens: result.tokens };
    // fetch pool volume 24H, fee 24H; calulate pool volume7d, fee7d, volume14d, fee14d
  } catch (err) {
    console.warn("fetch pools failed:", chainId, err);
    return { pools: [], tokens: [] };
  }
};

// todo: 根据 id 一次只返回100 个数据, 需要把 pool 的数据缓存到 redis 中!
const getPoolsByIdList = async (chainId: number, idList: string[]) => {
  const endpoint = getNetworkDexEndpoint(chainId);
  const idLen = idList.length;

  let pools: Pool[] = [];
  let ethPriceUSD = "";

  for (let i = 0; i < idLen; i++) {
    const ids =
      idList.slice(i*100, (i+1) * 100).reduce((acc, id) => {
        return acc + `"${id}",`;
      }, "[") + "]";

      // console.log('ids:', ids)
    const res = await _query(
      endpoint,
      `query pools {
      bundles {
        ethPriceUSD
      }
      pools (where: {id_in: ${ids} }) {
        id
        token0 {
          decimals
          derivedETH
          id
          symbol
          name
        }
        token1 {
          decimals
          derivedETH
          id
          symbol
          name
        }
        feeTier
        liquidity
        tick
        sqrtPrice
        feesUSD
        volumeUSD
        feeGrowthGlobal0X128
        feeGrowthGlobal1X128
        totalValueLockedUSD
        createdAtTimestamp
        poolDayData(first: 30, skip: 1, orderBy: date, orderDirection: desc) {
          date
          feesUSD
          volumeUSD
          open 
          high
          low
          close
        }
      }
    }`
    );

    if (!res || res.errors || res.pools.length === 0) {
      break;
    }

    ethPriceUSD = res.bundles[0].ethPriceUSD;
    pools = pools.concat(res.pools);
  }

  return { pools, ethPriceUSD };
};

function calcPoolPrice() {

}

// 计算 volume 1d 7d 30d, 以及平均手续费
// graph 返回的数据中, 如果某一个没有数据, 这一天没有数据记录。
// 这导致如果某个交易对某天没有数据的话, 最近30条数据可能并不是最近1个月的数据
function calcPoolVolumeFee(pool: LiquidityPool, prev1d: number, prev7d: number, prev30d: number) {
  const dataLen = pool.dailySnapshots.length
  if (dataLen === 0) {
    pool.avgFee1D = 0
    pool.avgFee7D = 0
    pool.avgFee30D = 0
    // console.log(`pool ${pool.id} has no day data`)
    return 
  }

  let fee1d = 0, fee7d = 0, fee30d = 0, d7 = 0, d30 = 0
  for (let i = 0; i < dataLen; i ++) {
    const data = pool.dailySnapshots[i]
    if (i === 0 && data.day === prev1d) {
      // console.log('pool:', pool)
      // console.log(`${pool.inputTokens[0].symbol}/${pool.inputTokens[1].symbol} prev day feesUSD: ${data.dailySupplySideRevenueUSD}`)
      fee1d = +data.dailySupplySideRevenueUSD
    }
    if (i < 7 && data.day >= prev7d) {
      fee7d += +data.dailySupplySideRevenueUSD
      d7 ++
    }
    if (i < 30 && data.day >= prev30d) {
      fee30d += +data.dailySupplySideRevenueUSD
      d30 ++
    }
  }

  if (d7 > 0) {
    fee7d = fee7d / 7
  } // else {
    // console.log(`pool ${pool.token0.symbol}/${pool.token1.symbol} has NO volume in latest 7 days:`, prev7d)
  //}
  if (d30 > 0) {
    fee30d = fee30d / 30
  }
  // const fr = pool.feeTier

  pool.avgFee1D = fee1d
  pool.avgFee7D = fee7d
  pool.avgFee30D = fee30d
}

// const getUniswapV3PoolTicks = async ({
//   chainId,
//   pool,
//   tickLower,
//   tickUpper,
// }: {
//   chainId: number;
//   pool: Pool;
//   tickLower?: number;
//   tickUpper?: number;
// }): Promise<{
//   ticks: Tick[];
// }> => {
//   const endpoint = getNetworkDexEndpoint(chainId);
//   const res = await _query(
//     endpoint,
//     `query ticks {
//     bundles {
//       ethPriceUSD
//     }
//     ticks(where: {pool: "${pool.id}", }) {

//     }
//   }`
//   );
//   return res.data.ticks;
// };

export {
  // getPoolData,
  getUniswapV3Pools,
  getPoolsByIdList,
  calcPoolVolumeFee
};
