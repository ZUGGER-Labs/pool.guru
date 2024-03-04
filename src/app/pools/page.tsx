import PoolList, { IPoolData } from "@/components/Pool/PoolList";
import { fetchPools } from "@/lib/pools";
import Link from "next/link";

// Pools List
async function Pools() {
  let itemsPerPage = 20
  let resp = await fetchPools({});
  const total = resp.total;
  const pools = resp.apyList.map((item: any) => {
    // console.log('logo:', item.baseToken.logoURI)
    return {
      poolName: item.dex,
      baseLogo: item.baseToken.logoURI,
      baseName: item.baseToken.symbol,
      quoteLogo: item.quoteToken.logoURI,
      quoteName: item.quoteToken.symbol,
      chainDex: {},
      tvlUSD: item.tvlUSD,
      volume24H: item.volumeUSD24H,
      volume7D: item.volumeUSD7D,
      volume14D: item.volumeUSD14D,
      fee24H: item.feeUSD24H,
      fee7D: item.feeUSD7D,
      fee14D: item.feeUSD14D,
      apy24H: item.apy24H.apyPoolByUSD,
      apy7D: item.apy7D.apyPoolByUSD,
      apy14D: item.apy14D.apyPoolByUSD,
      feeApy24H: item.apy24H.feeAPYByUSD,
      feeApy7D: item.apy7D.feeAPYByUSD,
      feeApy14D: item.apy14D.feeAPYByUSD,
    };
  });

  return (
    <main className="flex flex-col items-center justify-between p-24 md:max-w-[1600px] m-auto">
      <PoolList pools={pools} itemsPerPage={itemsPerPage} total={total} />
    </main>
  );
}

export default Pools;
