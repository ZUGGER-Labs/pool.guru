"use client";

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
import PerformanceChart from "../charts/PerformanceChart";
import { performanceData } from "../Pool/PoolDetail";


function YieldChart({
  chainId,
  poolId,
  poolData,
}: {
  chainId: number;
  poolId: string;
  poolData: any;
}) {

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

  console.log(apyBaseByUSDList)

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-row">
        <Chain chainId={chainId} />
        <DEX name="uniswapv3" />
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
          isLoading = {false}
        />
      </div>
    </div>
  );
}
export default YieldChart;
