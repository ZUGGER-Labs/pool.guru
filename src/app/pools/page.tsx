import PoolList, { IPoolData } from "@/components/Pool/PoolList";
import { convertToPoolData, fetchPools } from "@/lib/pools";
import Link from "next/link";

import meta, { title } from "@/lib/meta";
import { Metadata } from "next";

export const metadata: Metadata = {
  ...meta,
  title: "Pool list - " + title,
};

// Pools List
async function Pools() {
  let itemsPerPage = 20;
  let resp = await fetchPools({});
  const total = resp.total;
  const pools = resp.apyList.map((item: any) => {
    // console.log('logo:', item.baseToken.logoURI)
    return convertToPoolData(item);
  });

  return (
    <main className="flex flex-col items-center justify-between p-24 md:max-w-[1600px] m-auto">
      <PoolList pools={pools} itemsPerPage={itemsPerPage} total={total} />
    </main>
  );
}

export default Pools;
