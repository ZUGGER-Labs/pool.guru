import _ from "lodash";

import { getNetworkDexEndpoint } from "@/lib/network";
import _query from "./query";
import { Token } from "@uniswap/sdk-core";
import { tickToPrice } from "@uniswap/v3-sdk";

const MIN_TICK = -887272;
const MAX_TICK = -MIN_TICK;
const PRICE_FIXED_DIGITS = 4;
const DEFAULT_SURROUNDING_TICKS = 300;

export const FEE_TIER_TO_TICK_SPACING = (feeTier: string): number => {
  switch (feeTier) {
    case "10000":
      return 200;
    case "3000":
      return 60;
    case "500":
      return 10;
    case "100":
      return 1;
    default:
      throw Error(`Tick spacing for fee tier ${feeTier} undefined.`);
  }
};

interface TickPool {
  tick: string;
  feeTier: string;
  token0: {
    symbol: string;
    id: string;
    decimals: string;
  };
  token1: {
    symbol: string;
    id: string;
    decimals: string;
  };
  sqrtPrice: string;
  liquidity: string;
}

interface PoolResult {
  pool: TickPool;
}

// Raw tick returned from GQL
interface Tick {
  tickIdx: string;
  liquidityGross: string;
  liquidityNet: string;
  price0: string;
  price1: string;
}

interface SurroundingTicksResult {
  ticks: Tick[];
}

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  liquidityGross: bigint;
  liquidityNet: bigint;
  tickIdx: number;
  liquidityActive: bigint;
  price0: string;
  price1: string;
}

const fetchInitializedTicks = async (
  chainId: number,
  poolAddress: string,
  tickIdxLowerBound: number,
  tickIdxUpperBound: number
): Promise<{ loading?: boolean; error?: boolean; ticks?: Tick[] }> => {
  let skip = 0;
  const endpoint = getNetworkDexEndpoint(chainId);

  let surroundingTicks: Tick[] = [];
  let surroundingTicksResult: Tick[] = [];
  do {
    const tickQuery = `query surroundingTicks {
          ticks(
            subgraphError: allow
            first: 1000
            skip: ${skip}
            where: { poolAddress: "${poolAddress}", tickIdx_lte: ${tickIdxUpperBound}, tickIdx_gte: ${tickIdxLowerBound} }
          ) {
            tickIdx
            liquidityGross
            liquidityNet
            price0
            price1
          }
        }
      `;
    const data = await _query(endpoint, tickQuery);

    // console.log({ data, error, loading }, 'Result. Skip: ' + skip)

    if (data.errors) {
      return { error: true, ticks: surroundingTicksResult };
    }
    surroundingTicks = data.ticks;
    surroundingTicksResult = surroundingTicksResult.concat(surroundingTicks);
    skip += 1000;
  } while (surroundingTicks.length > 0);

  return { ticks: surroundingTicksResult, error: false };
};

export interface PoolTickData {
  ticksProcessed: TickProcessed[];
  feeTier: string;
  tickSpacing: number;
  activeTickIdx: number;
}

export const fetchTicksSurroundingPrice = async (
  chainId: number,
  poolAddress: string,
  numSurroundingTicks = DEFAULT_SURROUNDING_TICKS
): Promise<{
  loading?: boolean;
  error?: boolean;
  data?: PoolTickData;
}> => {
  const endpoint = getNetworkDexEndpoint(chainId);
  const poolQuery = `query pool {
        pool(id: "${poolAddress}") {
          tick
          token0 {
            symbol
            id
            decimals
          }
          token1 {
            symbol
            id
            decimals
          }
          feeTier
          sqrtPrice
          liquidity
        }
      }
    `;
  const data = await _query(endpoint, poolQuery);

  if (!data || data.errors) {
    return {
      error: Boolean(data.errors),
      data: undefined,
    };
  }

  const {
    pool: {
      tick: poolCurrentTick,
      feeTier,
      liquidity,
      token0: { id: token0Address, decimals: token0Decimals },
      token1: { id: token1Address, decimals: token1Decimals },
    },
  } = data;

  const poolCurrentTickIdx = parseInt(poolCurrentTick);
  const tickSpacing = FEE_TIER_TO_TICK_SPACING(feeTier);

  // The pools current tick isn't necessarily a tick that can actually be initialized.
  // Find the nearest valid tick given the tick spacing.
  const activeTickIdx =
    Math.floor(poolCurrentTickIdx / tickSpacing) * tickSpacing;

  // Our search bounds must take into account fee spacing. i.e. for fee tier 1%, only
  // ticks with index 200, 400, 600, etc can be active.
  const tickIdxLowerBound = activeTickIdx - numSurroundingTicks * tickSpacing;
  const tickIdxUpperBound = activeTickIdx + numSurroundingTicks * tickSpacing;

  const initializedTicksResult = await fetchInitializedTicks(
    chainId,
    poolAddress,
    tickIdxLowerBound,
    tickIdxUpperBound
  );
  if (initializedTicksResult.error || initializedTicksResult.loading) {
    return {
      error: initializedTicksResult.error,
      loading: initializedTicksResult.loading,
    };
  }

  const { ticks: initializedTicks } = initializedTicksResult;

  const tickIdxToInitializedTick = _.keyBy(initializedTicks, "tickIdx");

  const token0 = new Token(1, token0Address, parseInt(token0Decimals));
  const token1 = new Token(1, token1Address, parseInt(token1Decimals));

  // console.log({ activeTickIdx, poolCurrentTickIdx }, 'Active ticks')

  // If the pool's tick is MIN_TICK (-887272), then when we find the closest
  // initializable tick to its left, the value would be smaller than MIN_TICK.
  // In this case we must ensure that the prices shown never go below/above.
  // what actual possible from the protocol.
  let activeTickIdxForPrice = activeTickIdx;
  if (activeTickIdxForPrice < MIN_TICK) {
    activeTickIdxForPrice = MIN_TICK;
  }
  if (activeTickIdxForPrice > MAX_TICK) {
    activeTickIdxForPrice = MAX_TICK;
  }

  const activeTickProcessed: TickProcessed = {
    liquidityActive: BigInt(liquidity),
    tickIdx: activeTickIdx,
    liquidityNet: BigInt(0),
    price0: tickToPrice(token0, token1, activeTickIdxForPrice).toFixed(
      PRICE_FIXED_DIGITS
    ),
    price1: tickToPrice(token1, token0, activeTickIdxForPrice).toFixed(
      PRICE_FIXED_DIGITS
    ),
    liquidityGross: BigInt(0),
  };

  // If our active tick happens to be initialized (i.e. there is a position that starts or
  // ends at that tick), ensure we set the gross and net.
  // correctly.
  const activeTick = tickIdxToInitializedTick[activeTickIdx];
  if (activeTick) {
    activeTickProcessed.liquidityGross = BigInt(activeTick.liquidityGross);
    activeTickProcessed.liquidityNet = BigInt(activeTick.liquidityNet);
  }

  enum Direction {
    ASC,
    DESC,
  }

  // Computes the numSurroundingTicks above or below the active tick.
  const computeSurroundingTicks = (
    activeTickProcessed: TickProcessed,
    tickSpacing: number,
    numSurroundingTicks: number,
    direction: Direction
  ) => {
    let previousTickProcessed: TickProcessed = {
      ...activeTickProcessed,
    };

    // Iterate outwards (either up or down depending on 'Direction') from the active tick,
    // building active liquidity for every tick.
    let processedTicks: TickProcessed[] = [];
    for (let i = 0; i < numSurroundingTicks; i++) {
      const currentTickIdx =
        direction == Direction.ASC
          ? previousTickProcessed.tickIdx + tickSpacing
          : previousTickProcessed.tickIdx - tickSpacing;

      if (currentTickIdx < MIN_TICK || currentTickIdx > MAX_TICK) {
        break;
      }

      const currentTickProcessed: TickProcessed = {
        liquidityActive: previousTickProcessed.liquidityActive,
        tickIdx: currentTickIdx,
        liquidityNet: BigInt(0),
        price0: tickToPrice(token0, token1, currentTickIdx).toFixed(
          PRICE_FIXED_DIGITS
        ),
        price1: tickToPrice(token1, token0, currentTickIdx).toFixed(
          PRICE_FIXED_DIGITS
        ),
        liquidityGross: BigInt(0),
      };

      // Check if there is an initialized tick at our current tick.
      // If so copy the gross and net liquidity from the initialized tick.
      const currentInitializedTick =
        tickIdxToInitializedTick[currentTickIdx.toString()];
      if (currentInitializedTick) {
        currentTickProcessed.liquidityGross = BigInt(
          currentInitializedTick.liquidityGross
        );
        currentTickProcessed.liquidityNet = BigInt(
          currentInitializedTick.liquidityNet
        );
      }

      // Update the active liquidity.
      // If we are iterating ascending and we found an initialized tick we immediately apply
      // it to the current processed tick we are building.
      // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
      if (direction == Direction.ASC && currentInitializedTick) {
        currentTickProcessed.liquidityActive =
          previousTickProcessed.liquidityActive +
          BigInt(currentInitializedTick.liquidityNet);
        // JSBI.add(
        //   previousTickProcessed.liquidityActive,
        //   JSBI.BigInt(currentInitializedTick.liquidityNet)
        // );
      } else if (
        direction == Direction.DESC &&
        previousTickProcessed.liquidityNet !== 0n
        // JSBI.notEqual(previousTickProcessed.liquidityNet, JSBI.BigInt(0))
      ) {
        // We are iterating descending, so look at the previous tick and apply any net liquidity.
        currentTickProcessed.liquidityActive =
          previousTickProcessed.liquidityActive -
          previousTickProcessed.liquidityNet;
        // JSBI.subtract(
        //   previousTickProcessed.liquidityActive,
        //   previousTickProcessed.liquidityNet
        // );
      }

      processedTicks.push(currentTickProcessed);
      previousTickProcessed = currentTickProcessed;
    }

    if (direction == Direction.DESC) {
      processedTicks = processedTicks.reverse();
    }

    return processedTicks;
  };

  const subsequentTicks: TickProcessed[] = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.ASC
  );

  const previousTicks: TickProcessed[] = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.DESC
  );

  const ticksProcessed = previousTicks
    .concat(activeTickProcessed)
    .concat(subsequentTicks);

  return {
    data: {
      ticksProcessed,
      feeTier,
      tickSpacing,
      activeTickIdx,
    },
  };
};
