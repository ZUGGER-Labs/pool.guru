import { Position } from "@/interfaces/uniswap.interface";
import _query from "./query";
import { getNetworkDexEndpoint } from "@/lib/network";
import { orderBy } from "lodash";

interface PositionParams {
  total?: number; // max fetch
  poolAddress?: string;
  tickUpper?: number;
  tickLower?: number;
  orderBy?: string;
  orderDirection?: string;
}

// pid: pool address
const getPositions = async (
  chainId: number,
  {
    poolAddress,
    total,
    tickUpper,
    tickLower,
    orderBy,
    orderDirection,
  }: PositionParams
): Promise<Position[]> => {
  total = total === undefined ? 0 : total;
  const endpoint = getNetworkDexEndpoint(chainId);
  const args = poolAddress
    ? `pool: "${poolAddress}",`
    : "" +
      (tickLower ? `tickLower_gte: ${tickLower}` : "") +
      (tickUpper ? `tickUpper_lte: ${tickUpper}` : "");
  const order =
    (orderBy ? `orderBy: ${orderBy}, ` : "") +
    (orderDirection ? ` orderDirection: ${orderDirection}` : "");
  let pos: Position[] = [];
  let skip = 0;
  let take = total === 0 ? 1000 : (total > 1000 ? 1000 : total);

  do {
    const res = await _query(
      endpoint,
      `{
        positions(where: {
          liquidity_gt: 0,
          pool_: {liquidity_gt: 0},
          ${args},
        }, first: ${take}, skip: ${skip}, ${order}) {
          id
          owner
          pool {
            id
            liquidity
          }
          tickLower {
            tickIdx
            feeGrowthOutside0X128
            feeGrowthOutside1X128
          }
          tickUpper {
            tickIdx
            feeGrowthOutside0X128
            feeGrowthOutside1X128
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
        }
      }`
    );
    if (!res || res.errors || res.positions.length === 0) {
      console.log("get position error:", res.errors);
      break;
    }
    pos = pos.concat(res.positions);
    if (total > 0 && pos.length >= total) {
      break;
    }
    skip += take;
    if (skip > 5000) {
      break;
    }
  } while (1);

  return pos;
};

export { getPositions };
