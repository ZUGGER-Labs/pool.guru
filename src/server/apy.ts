import { LiquidityPool, Pool } from "@/interfaces/uniswap.interface";
import { getUniswapv3LiquidityPools,  } from "./pools";
import { getEthPriceUSD } from "./positions";
import { getPoolTokens } from "./tvl";
import BigNumber from "bignumber.js";
import { calcPoolVolumeFee } from "@/uniswap/graph";
import dayjs from "dayjs";
import { ChainId } from "@uniswap/sdk-core";
const utc = require('dayjs/plugin/utc');  // 引入 UTC 插件
dayjs.extend(utc);  // 使用 UTC 插件

function isNull(a: any): boolean {
  return a === null || a === undefined;
}
// avarage APY: pool fee / pool TVL

// async function getTokenPairsByApy(tokenId: string, chainId: number) {
//   const tvlUSD = 5000;
//   const pools = await getTokenPools(chainId, tokenId, tvlUSD);

//   console.log(
//     `token ${tokenId} pools with TVL>${tvlUSD} count: ${pools.length}`
//   );

//   return calcPoolApy(chainId, pools, tvlUSD)
// }
async function getTokenPairsByApy(tokenId: string, chainId: number) {}

async function calcPoolApy(chainId: number, pools: LiquidityPool[], tvlUSD: number) {
  const ethPriceUSD = await getEthPriceUSD();

  // 获取 pool 的 tvl
  // await getPoolTokens(chainId, pools);
  console.log("fetch pools contract tokenAmount completed");

  const ethPrice = BigNumber(ethPriceUSD);
  const prev1d = Math.floor(dayjs.utc().startOf('day').subtract(1, 'day').unix()/86400)
    , prev7d = prev1d - 7
    , prev30d = prev1d - 30
  console.log(`prev1d=${prev1d} prev7d=${prev7d} prev30d=${prev30d}`)

  // for (let pool of pools) {
  //   const a0 = pool.token0Amount,
  //     a1 = pool.token1Amount,
  //     pe0 = pool.token0.derivedETH,
  //     pe1 = pool.token1.derivedETH;

  //   if (isNull(a0) || isNull(a1) || isNull(pe0) || isNull(pe1)) {
  //     // 可能是合约被销毁了
  //     // 例如 pool 0x39a1ad3b33db6fa77755fcff2fd4fbec5ce4643d
  //     console.log(
  //       `pool ${pool.id} data invalid: token0Amount=${a0} token1Amount=${a1} token0ETHPrice=${pe0} token1ETHPrice=${pe1}`
  //     );
  //     // throw new Error(`pool data invalid`);
  //     pool.tvlContract = BigNumber(0);
  //     continue;
  //   }
  //   calcPoolVolumeFee(pool, prev1d, prev7d, prev30d);
  //   pool.tvlContract = BigNumber(a0!.toString())
  //     .div(BigNumber(10).pow(pool.token0.decimals))
  //     .times(pe0!)
  //     .times(ethPrice)
  //     .plus(
  //       BigNumber(a1!.toString())
  //         .div(BigNumber(10).pow(pool.token1.decimals))
  //         .times(pe1!)
  //         .times(ethPrice)
  //     );
  // }

  for (let pool of pools) {
    calcPoolVolumeFee(pool, prev1d, prev7d, prev30d);
  }

  const nzpools = pools.filter((p) => BigNumber(p.totalValueLockedUSD!).gt(tvlUSD));
  console.log(`pools with REAL tvl>${tvlUSD} count: ${nzpools.length}`);

  nzpools.map((p) => {
    p.apyBy1d = BigNumber(p.avgFee1D!).div(p.totalValueLockedUSD!);
    p.apyBy7d = BigNumber(p.avgFee7D!).div(p.totalValueLockedUSD!);
    p.apyBy30d = BigNumber(p.avgFee30D!).div(p.totalValueLockedUSD!);
  });

  nzpools.sort((a, b) => b.apyBy1d!.minus(a.apyBy1d!).toNumber());
  return nzpools;
}

(async () => {
  const chainId = ChainId.MAINNET
  const tvlUSD = 5000
  // console.log('start of today:', dayjs.utc().unix(), dayjs.utc().startOf('day').unix(), dayjs.utc().unix()-dayjs.utc().startOf('day').unix())
  const nzpools = 
    // await getTokenPairsByApy("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",56);
    await calcPoolApy(chainId, await getUniswapv3LiquidityPools(chainId, 0, tvlUSD), tvlUSD)
  
  console.log(`pools in ${chainId}: ${nzpools.length}`)

  const top20 = nzpools.slice(0, 20);
  for (let p of top20) {
    const symbol = p.inputTokens[0].symbol + '/' + p.inputTokens[1].symbol
    console.log(
      `${p.id} ${symbol} apy1d=${p.apyBy1d?.toFixed(4)} apy7d=${p.apyBy7d?.toFixed(4)} apy30d=${p.apyBy30d?.toFixed(4)} fee1d=${p.avgFee1D?.toFixed(4)} fee7d=${p.avgFee7D?.toFixed(4)} tvl=${(+p.totalValueLockedUSD).toFixed(2)}`
    );
  }

  // console.log("----------------------");
  // for (let p of nzpools.slice(nzpools.length - 20)) {
  //   console.log(
  //     `${p.id} ${p.token0.symbol}/${p.token1.symbol} apy1d=${p.apyBy1d} apy7d=${p.apyBy7d} apy30d=${p.apyBy30d} fee1d=${p.apyBy1d} fee7d=${p.avgFee7D} tvl=${p.tvlContract}`
  //   );
  // }
})();

export { getTokenPairsByApy };
