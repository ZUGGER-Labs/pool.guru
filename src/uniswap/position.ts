import { Token as V3Token } from "@uniswap/sdk-core";
import { Position as V3Position, Pool as V3Pool } from "@uniswap/v3-sdk";

import {
  Pool,
  Position,
  PositionColumnDataType,
  PositionStrategy,
} from "@/interfaces/uniswap.interface";
import _query from "./query";
import { getNetworkDexEndpoint } from "@/lib/network";
import { orderBy } from "lodash";
import { calculatePositionFees, getPriceFromTick } from "./math";

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
  let take = total === 0 ? 1000 : total > 1000 ? 1000 : total;

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

// 分析 position 的 asset apy roi, position 不一定属于同一个 pool
const processPositions = async (
  chainId: number,
  ethPriceUSD: number,
  positions: Position[],
  pools: { [key: string]: Pool }
) => {
  const result = [];

  for (let pos of positions) {
    const pool = pools[pos.pool!.id];
    if (!pool) {
      console.warn("not found pool:", pos.pool?.id);
      continue;
    }
    const item = await processPosition(chainId, ethPriceUSD, pos, pool);
    result.push(item);
  }

  return result;
};

const processPosition = async (
  chainId: number,
  ethPriceUSD: number,
  pos: Position,
  pool: Pool,
  isPairToggled?: boolean
) => {
  const token0 = pool.token0;
  const token1 = pool.token1;
  const token0Price = (token0.derivedETH ?? 0) * ethPriceUSD;
  const token1Price = (token1.derivedETH ?? 0) * ethPriceUSD;

  const currentTick = Number(pool.tick);
  let currentPrice = getPriceFromTick(
    currentTick,
    token0.decimals,
    token1.decimals
  );
  if (isPairToggled) {
    currentPrice = getPriceFromTick(
      -currentTick,
      token0.decimals,
      token1.decimals
    );
  }
  const lowerTick = Number(pos.tickLower.tickIdx);
  const upperTick = Number(pos.tickUpper.tickIdx);

  // 这里为什么是反的? lowerPrice 用 upperTick 是不是写错了?
  let lowerPrice = getPriceFromTick(
    upperTick,
    token0.decimals,
    token1.decimals
  );
  let upperPrice = getPriceFromTick(
    lowerTick,
    token0.decimals,
    token1.decimals
  );
  if (isPairToggled) {
    const tmp = upperPrice;
    upperPrice = lowerPrice;
    lowerPrice = tmp;
  }
  const isActive = currentTick >= lowerTick && currentTick <= upperTick;
  const tokenA = new V3Token(chainId, token0.id, +token0.decimals);
  const tokenB = new V3Token(chainId, token1.id, +token1.decimals);
  const v3pool = new V3Pool(
    tokenA,
    tokenB,
    Number(pool.feeTier),
    pool.sqrtPrice,
    pool.liquidity,
    Number(pool.tick)
  );
  const v3position = new V3Position({
    pool: v3pool,
    liquidity: pos.liquidity,
    tickLower: lowerTick,
    tickUpper: upperTick,
  });
  const amount0 = +v3position.amount0.toSignificant(8);
  const amount1 = +v3position.amount1.toSignificant(8);
  const token0Amount = isPairToggled ? amount1 : amount0;
  const token1Amount = isPairToggled ? amount0 : amount1;
  const assetUSD = token0Amount * token0Price + token1Amount * token1Price;
  // Calculate earning fee
  const claimedFee0 = isPairToggled
    ? Number(pos.collectedFeesToken1)
    : Number(pos.collectedFeesToken0);
  const claimedFee1 = isPairToggled
    ? Number(pos.collectedFeesToken0)
    : Number(pos.collectedFeesToken1);
  const unclaimedFees = calculatePositionFees(
    pool,
    pos,
    isPairToggled ? token1 : token0,
    isPairToggled ? token0 : token1
  );
  console.log('unclaimedFees:', unclaimedFees)
  const unclaimedFee0 = isPairToggled ? unclaimedFees[1] : unclaimedFees[0];
  const unclaimedFee1 = isPairToggled ? unclaimedFees[0] : unclaimedFees[1];
  const totalFee0 = claimedFee0 + unclaimedFee0;
  const totalFee1 = claimedFee1 + unclaimedFee1;
  const totalFeeUSD = totalFee0 * token0Price + totalFee1 * token1Price;
  const roi = 100 * (totalFeeUSD / assetUSD);
  const createdAt = Number(pos.transaction.timestamp) * 1000;
  const ageInHours = (Date.now() - createdAt) / 1000 / 60 / 60;
  const hourlyFeeUSD = totalFeeUSD / ageInHours;
  const apr = assetUSD === 0 ? 0 : (hourlyFeeUSD * 24 * 365 * 100) / assetUSD;
  // unclaimedROI, use to filter out outliers
  const unclaimedROI =
    (100 * (unclaimedFee0 * token0Price + unclaimedFee1 * token1Price)) /
    assetUSD;

  let strategy = PositionStrategy.LONG;
  // if (upperPrice - lowerPrice <= maxDailyPriceFluctuation) {
  //   strategy = PositionStrategy.SHORT;
  // } else if (upperPrice - lowerPrice <= maxWeeklyPriceFluctuation) {
  //   strategy = PositionStrategy.MIDDLE;

  return {
    key: pos.id,
    positionId: pos.id,
    isActive,
    roi,
    apr,
    strategy,
    liquidity: BigInt(pos.liquidity),
    priceRange: {
      lower: lowerPrice,
      upper: upperPrice,
      current: currentPrice,
    },
    createdAt,

    // maxDailyPriceFluctuation,
    // maxWeeklyPriceFluctuation,
    token0Amount,
    token1Amount,
    token0Price,
    token1Price,
    totalFeeUSD,
    claimedFee0,
    claimedFee1,
    unclaimedFee0,
    unclaimedFee1,
    hourlyFeeUSD,

    unclaimedROI,
    assetUSD,
    pool: pool,
    position: pos,
  } as PositionColumnDataType;
};

export { getPositions, processPositions };
