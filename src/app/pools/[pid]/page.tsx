import { PageProps } from "@/lib/page";
import PoolDetail from "@/components/Pool/PoolDetail";
import { chain } from "lodash";
import { getPoolData } from "@/uniswap/graph";

async function Pool({ params, searchParams }: PageProps) {
  let chainId;
  const pid = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"; // params.pid;
  const poolData = await getPoolData({ chainId, poolAddress: pid });

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
