import {
  Pool,
  Position,
  PositionColumnDataType,
} from "@/interfaces/uniswap.interface";
import { getGraphClient } from "./client";
import { QueryOptions, gql } from "@apollo/client";

import { db } from "@/db/db";
import { DBPositionData, dbPositionDatas, dbPositions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { processPositions } from "@/uniswap/position";
import { getPoolInfos, getUniswapv3PoolById, getUniswapv3Pools } from "./pools";
import { CHAIN_NAME } from "@/lib/network";

function toPositionData(
  chainId: number,
  pos: PositionColumnDataType,
  position: Position,
  dex = "uniswapv3"
): DBPositionData {
  const pool = pos.pool!;
  return {
    posTokenId: +pos.positionId, // position NFT tokenId
    chainId: chainId + "",
    dex: dex,
    poolId: pool.id,
    token0: pool.token0.id,
    token1: pool.token1.id,
    owner: position.owner,
    isActive: pos.isActive,
    strategy: pos.strategy,
    apy: pos.apr + "",
    roi: pos.roi + "",
    unclaimedROI: pos.unclaimedROI + "",

    token0Amount: pos.token0Amount + "",
    token1Amount: pos.token1Amount + "",
    depositedToken0: position.depositedToken0,
    depositedToken1: position.depositedToken1,
    liquidity: pos.liquidity.toString(),
    createdAt: pos.createdAt, // in second
    assetUSD: pos.assetUSD + "",
    claimedFee0: pos.claimedFee0 + "",
    claimedFee1: pos.claimedFee1 + "",
    unclaimedFee0: pos.unclaimedFee0 + "",
    unclaimedFee1: pos.unclaimedFee1 + "",
    feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
  };
}

async function refreshPoolPositions(
  chainId: number,
  pool: Pool,
  dex = "uniswapv3"
) {
  const cid = "" + chainId;

  const { positions, ethPriceUSD } = await getPoolPostions(chainId, pool);
  const processed = processPositions(chainId, ethPriceUSD, positions, {
    [pool.id]: pool,
  });
  if (processed.length === 0) {
    console.warn(
      `no processed position: chain=${CHAIN_NAME[chainId]} pool=${pool.id}`
    );
    return;
  }

  const posData = processed.map((p, idx) =>
    toPositionData(chainId, p, positions[idx], dex)
  );

  await db.transaction(async (tx) => {
    // 先删除所有 positions
    await tx
      .delete(dbPositions)
      .where(
        and(eq(dbPositions.chainId, cid), eq(dbPositions.poolId, pool.id))
      );

    // 插入新的数据
    // await tx.insert(dbPositions).values(posData as any);
    for (let i = 0; i < posData.length; i++) {
      const item = posData[i];
      try {
        await tx.insert(dbPositionDatas).values(item);
      } catch (err) {
        console.log("idx=%d data:", i, item);
        console.error(err);
        throw err;
      }
    }
  });
}

async function getEthPriceUSD() {
  const client = getGraphClient(1, false);
  const res = await client.query({
    query: gql`
      query pools {
        bundles {
          ethPriceUSD
        }
      }
    `,
  });

  return res.data.bundles[0].ethPriceUSD;
}

// 查询并处理单个 pool 的 positions
async function getPoolPostions(chainId: number, pool: Pool) {
  const client = getGraphClient(chainId, false);
  let positions: Position[] = [];
  let ethPriceUSD = 0;

  for (let i = 0; ; i++) {
    const res = await client.query({
      query: gql`
        query pools($poolId: String!, $skip: Int!) {
          bundles {
            ethPriceUSD
          }
          positions(
            first: 1000
            skip: $skip
            where: { pool: $poolId, liquidity_gt: "0" }
          ) {
            owner
            id
            pool {
              id
              liquidity
            }
            tickLower {
              feesUSD
              collectedFeesUSD
              collectedFeesToken1
              collectedFeesToken0
              createdAtTimestamp
              feeGrowthOutside0X128
              feeGrowthOutside1X128
              liquidityGross
              id
              liquidityNet
              tickIdx
            }
            tickUpper {
              feesUSD
              collectedFeesToken0
              collectedFeesToken1
              collectedFeesUSD
              createdAtTimestamp
              feeGrowthOutside0X128
              feeGrowthOutside1X128
              id
              liquidityGross
              liquidityNet
              tickIdx
            }
            depositedToken0
            depositedToken1
            liquidity
            collectedFeesToken0
            collectedFeesToken1
            feeGrowthInside0LastX128
            feeGrowthInside1LastX128
            transaction {
              timestamp
            }
            withdrawnToken0
            withdrawnToken1
          }
        }
      `,
      variables: {
        poolId: pool.id,
        skip: 1000 * i,
      },
    });
    if (!res || res.errors) {
      console.log(res);
      throw new Error("query position failed");
    }
    if (res.data.positions.length === 0) {
      break;
    }

    ethPriceUSD = res.data.bundles[0].ethPriceUSD;
    positions = positions.concat(res.data.positions);
  }
  console.log(
    `pool ${pool.id} positions: ${positions.length} ethPriceUSD: ${ethPriceUSD}`
  );

  return { ethPriceUSD, positions };
}
/*
(async function () {
  const ethusdc = await getUniswapv3PoolById(
    1,
    "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
  );
  console.log(`eth/usdc pool: ${ethusdc.id}`);

  await refreshPoolPositions(1, ethusdc);
})();
*/
export { getPoolPostions, refreshPoolPositions, getEthPriceUSD };
