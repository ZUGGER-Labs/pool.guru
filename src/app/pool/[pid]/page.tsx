import { PageProps } from "@/lib/page";
import PoolDetail from "@/components/Pool/PoolDetail";
import { chain } from "lodash";
import { getPoolInfo } from "@/lib/pool";

import meta, { title } from "@/lib/meta";
import { Metadata } from "next";

export const metadata: Metadata = {
  ...meta,
  title: "Pool list - " + title,
};

async function Pool({ params, searchParams }: PageProps) {
  let chainId;
  const pid = params.pid;
  const poolData = await getPoolInfo(pid);

  if (searchParams["chainId"]) {
    if (typeof searchParams["chainId"] === "string") {
      chainId = +searchParams["chainId"];
    } else {
      chainId = +searchParams["chainId"][0];
    }
  } else {
    chainId = 1;
  }

  return (
    <main className="flex flex-col items-center justify-between p-2 md:max-w-7xl w-full m-auto">
      <PoolDetail chainId={chainId} poolId={pid} poolData={poolData} />
    </main>
  );
}

export default Pool;
