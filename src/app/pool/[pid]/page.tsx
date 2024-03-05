import { PageProps } from "@/lib/page";
import PoolDetail from "@/components/Pool/PoolDetail";
import { chain } from "lodash";
import { getPoolInfo } from "@/lib/pool";

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
    <div>
      <h1>
        Pool <span>{pid}</span>
      </h1>
      <PoolDetail chainId={chainId} poolId={pid} poolData={poolData} />
    </div>
  );
}

export default Pool;
