import PoolList, { IPoolData } from "@/components/Pool/PoolList";
import { convertToPoolData, fetchPoolFilters, fetchPools } from "@/lib/pools";
import Link from "next/link";

import meta, { title } from "@/lib/meta";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params, searchParams }: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const poolId = params.pid;
  const dex = searchParams['dex'] ? searchParams['dex'] : 'uniswapv3'

  return {
    ...meta,
    title: `${dex} pool ${poolId} APY analysis`,
    description: `${dex} pool ${poolId} price chart, APY chart, Fees TVL chart`,
  }
}

// Pools List
async function Pools() {
  let itemsPerPage = 20;
  let resp = await fetchPools({});
  const total = resp.total;
  const pools = resp.apyList.map((item: any) => {
    // console.log('logo:', item.baseToken.logoURI)
    return convertToPoolData(item);
  });
  const filters = await fetchPoolFilters()

  return (
    <main className="flex flex-col items-center justify-between p-4 md:max-w-7xl w-full m-auto">
      <PoolList pools={pools} itemsPerPage={itemsPerPage} total={total} filters={filters} />
    </main>
  );
}

export default Pools;
