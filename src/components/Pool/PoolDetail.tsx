"use client";

import { createChart } from "lightweight-charts";

import { LiquidityPool, Pool } from "@/interfaces/uniswap.interface";
import {
  FEE_TIER_TO_TICK_SPACING,
  PoolTickData,
  TickProcessed,
  fetchTicksSurroundingPrice,
} from "@/uniswap/tick";
import { formatAmount } from "@/utils/format";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import {
  FeeAmount,
  TICK_SPACINGS,
  TickMath,
  Pool as V3Pool,
} from "@uniswap/v3-sdk";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { Chain } from "../common/Chain";
import { DEX } from "../common/DEX";
import PriceVolChart from "../charts/PriceVolChart";
import TVLFeeChart from "../charts/TVLFeeChart";
import PerformanceChart from "../charts/PerformanceChart";
import APYFeeChart from "../charts/APYFeeChart";

export interface ChartEntry {
  index: number;
  isCurrent: boolean;
  activeLiquidity: number;
  price0: number;
  price1: number;
  tvlToken0: number;
  tvlToken1: number;
}

export const MAX_UINT128 = BigNumber(2).pow(128).minus(1);

const toFeeAmount = (feeTier: string): FeeAmount => {
  switch (feeTier) {
    case "100":
      return FeeAmount.LOWEST;
    case "500":
      return FeeAmount.LOW;
    case "3000":
      return FeeAmount.MEDIUM;
    case "10000":
      return FeeAmount.HIGH;

    default:
      console.log("invalid feeTier: " + feeTier);
      return +feeTier as FeeAmount;
  }
};

function adjustOHCL(klines: any[]) {
  const ohcl: any[] = [];
  const vol: any[] = [];
  const tvl: any[] = [];
  const fees: any[] = [];
  const ratio: any[] = []; // fees/tvl

  for (let item of klines) {
    const time = item.date;
    ohcl.push({
      time: item.date,
      open: +item.basePriceOpen,
      high: +item.basePriceHigh,
      close: +item.basePriceClose,
      low: +item.basePriceLow,
    });
    vol.push({
      time: item.date,
      value: +item.volumeUSD,
    });
    tvl.push({
      time: item.date,
      value: +item.tvlUSD,
    });
    fees.push({
      time: item.date,
      value: +item.feesUSD,
    });

    ratio.push({
      time: item.date,
      value:
        item.tvlUSD === "0"
          ? "0"
          : BigNumber(item.feesUSD).div(item.tvlUSD).toNumber(),
    });
  }

  return { ohcl, vol, tvl, fees, ratio };
}

export function performanceData(data: any) {
  const apyBaseByUSD = data.apyBaseByUSD,
    apyPoolByUSD = data.apyPoolByUSD,
    apyQuoteByUSD = data.apyQuoteByUSD,
    apyBaseByNative = data.apyBaseByNative,
    apyPoolByNative = data.apyPoolByNative,
    apyQuoteByNative = data.apyQuoteByNative;

  const apyBaseByUSDList: any[] = [];
  const apyPoolByUSDList: any[] = [];
  const apyQuoteByUSDList: any[] = [];
  const apyBaseByNativeList: any[] = [];
  const apyPoolByNativeList: any[] = [];
  const apyQuoteByNativeList: any[] = [];
  const cumFeeApy: any[] = []
  const feeApy: any[] = []

  for (let i = 0; i < data.ohcl.length; i++) {
    const date = data.ohcl[i].date;
    apyBaseByUSDList.push({
      time: date,
      value: +apyBaseByUSD[i],
    });
    apyPoolByUSDList.push({
      time: date,
      value: +apyPoolByUSD[i],
    });
    apyQuoteByUSDList.push({
      time: date,
      value: +apyQuoteByUSD[i],
    });
    apyBaseByNativeList.push({
      time: date,
      value: +apyBaseByNative[i],
    });
    apyPoolByNativeList.push({
      time: date,
      value: +apyPoolByNative[i],
    });
    apyQuoteByNativeList.push({
      time: date,
      value: +apyQuoteByNative[i],
    });
    cumFeeApy.push({
      time:date,
      value: BigNumber(data.feeApyByUSD[i]).times(365*24).div(i+1).toNumber()
    })

    let hourFeeRatio = BigNumber(0)
    if (i === 0) {
      hourFeeRatio = BigNumber(data.feeApyByUSD[0])
    } else {
      hourFeeRatio = BigNumber(data.feeApyByUSD[i]).minus(data.feeApyByUSD[i-1])
    }
    feeApy.push({
      time: date,
      value: hourFeeRatio.times(365*24).toNumber(),
    })
  }

  return {
    apyBaseByUSDList,
    apyPoolByUSDList,
    apyQuoteByUSDList,
    apyBaseByNativeList,
    apyPoolByNativeList,
    apyQuoteByNativeList,
    cumFeeApy,
    feeApy,
  };
}

function PoolDetail({
  chainId,
  poolId,
  poolData,
}: {
  chainId: number;
  poolId: string;
  poolData: any;
}) {
  console.log("pool data:", poolData);

  const { ohcl, vol, tvl, fees, ratio } = adjustOHCL(poolData.ohcl);
  const {
    apyBaseByUSDList,
    apyPoolByUSDList,
    apyQuoteByUSDList,
    apyBaseByNativeList,
    apyPoolByNativeList,
    apyQuoteByNativeList,
    cumFeeApy,
    feeApy,
  } = performanceData(poolData);

  // console.log("ohcl:", ohcl);
  // console.log("vol:", vol);
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-row">
        <Chain chainId={chainId} />
        <DEX name="uniswapv3" />
        <div>TVL</div>
        <div>7D Volume</div>
        <div>7D Fees APY</div>
      </div>

      <div>
        <div>
          Price/Volume Chart
          <PriceVolChart ohcl={ohcl} vol={vol} height={400} />
        </div>
      </div>

      <div className="flex flex-col">
        <div>Performance</div>
        <PerformanceChart
          usdOrNative="USD"
          apyBaseByUSDList={apyBaseByUSDList}
          apyPoolByUSDList={apyPoolByUSDList}
          apyQuoteByUSDList={apyQuoteByUSDList}
          apyBaseByNativeList={apyBaseByNativeList}
          apyPoolByNativeList={apyPoolByNativeList}
          apyQuoteByNativeList={apyQuoteByNativeList}
          width={1248}
          height={400}
        />
      </div>

      <div className="flex flex-col">
        <div>
          TVL/Volume/Fees/TVL chart
          <TVLFeeChart
            tvl={tvl}
            fee={fees}
            ratio={ratio}
            width={1248}
            height={400}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <div>APY/Fees</div>
      <APYFeeChart apy={feeApy} fee={fees} cumApy={cumFeeApy} />
      </div>
    </div>
  );
  /*
  // const chainId = poolData.chainId || 1
  const poolAddress = poolData.id
  const token0 = new Token(chainId, poolData.inputTokens[0].id, +poolData.inputTokens[0].decimals)
  const token1 = new Token(chainId, poolData.inputTokens[0].id, +poolData.inputTokens[1].decimals)
  const feeTier = poolData.feeTier

  const [tickData, setTickData] = useState<PoolTickData | null>(null);
  const [formattedDat, setFormattedData] = useState<ChartEntry[] | undefined>();

  useEffect(() => {
    async function formatData(poolTickData: PoolTickData) {
      if (poolTickData) {
        const newData = await Promise.all(
          poolTickData.ticksProcessed.map(async (t: TickProcessed, i) => {
            const active = t.tickIdx === poolTickData.activeTickIdx
            const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx)
            const feeAmount = poolData.feeTier
            const mockTicks = [
              {
                index: t.tickIdx - FEE_TIER_TO_TICK_SPACING(feeAmount),
                liquidityGross: t.liquidityGross.toString(),
                liquidityNet: (t.liquidityNet * BigInt('-1')).toString(),
              },
              {
                index: t.tickIdx,
                liquidityGross: t.liquidityGross.toString(),
                liquidityNet: t.liquidityNet.toString(),
              },
            ]
            const pool =
              token0 && token1 && feeTier
                ? new V3Pool(token0, token1, toFeeAmount(feeTier), sqrtPriceX96, t.liquidityActive.toString(), t.tickIdx, mockTicks)
                : undefined
            const nextSqrtX96 = poolTickData.ticksProcessed[i - 1]
              ? TickMath.getSqrtRatioAtTick(poolTickData.ticksProcessed[i - 1].tickIdx)
              : undefined
            const maxAmountToken0 = token0 ? CurrencyAmount.fromRawAmount(token0, MAX_UINT128.toString()) : undefined
            const outputRes0 =
              pool && maxAmountToken0 ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96) : undefined

            const token1Amount = outputRes0?.[0] as CurrencyAmount<Token> | undefined

            const amount0 = token1Amount ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1) : 0
            const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0

            return {
              index: i,
              isCurrent: active,
              activeLiquidity: parseFloat(t.liquidityActive.toString()),
              price0: parseFloat(t.price0),
              price1: parseFloat(t.price1),
              tvlToken0: amount0,
              tvlToken1: amount1,
            }
          }),
        )
        // offset the values to line off bars with TVL used to swap across bar
        newData?.map((entry, i) => {
          if (i > 0) {
            newData[i - 1].tvlToken0 = entry.tvlToken0
            newData[i - 1].tvlToken1 = entry.tvlToken1
          }
        })

        if (newData) {
          setFormattedData(newData)
        }
        return
      } else {
        return []
      }
    }

    const getTicks = async () => {
      const resp = await fetchTicksSurroundingPrice(chainId, poolAddress);
      if (resp.error) {
        console.error(resp.error);
        return;
      }
      const data = resp.data;
      if (!data) {
        console.warn("not found tick data");
        return;
      }

      console.log('ticks:', data.ticksProcessed.length)
      setTickData(data);
      formatData(data)
    };

    getTicks()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, poolAddress]);

  return (
    <div>
      <h1>Ticks:</h1>
      <table>
        <thead>
          <tr>
            <td>Index</td>
            <td>liquidityGross</td>
            <td>liquidityNet</td>
            <td>liquidityActive</td>
            <td>price0</td>
            <td>price1</td>
          </tr>
        </thead>
        <tbody>
          {tickData?.ticksProcessed.map((tick) => {
            return (
              <tr key={tick.tickIdx}>
                <td>{tick.tickIdx}</td>
                <td>{(tick.liquidityGross.toString())}</td>
                <td>{tick.liquidityNet.toString()}</td>
                <td>{(tick.liquidityActive.toString())}</td>
                <td>{tick.price0}</td>
                <td>{tick.price1}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  */
}

export default PoolDetail;
