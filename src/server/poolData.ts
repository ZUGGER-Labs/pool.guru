// fetch pool hourly daily data

import {
  ApolloClient,
  DocumentNode,
  OperationVariables,
  QueryOptions,
  TypedDocumentNode,
  gql,
} from "@apollo/client";
import { getGraphClient } from "./client";
import _ from "lodash";
import { DBPoolData, DBPoolDayData } from "@/db/schema";
import dayjs from "dayjs";
import { insertDailyPoolData, insertHourlyPoolData } from "./db";
import BigNumber from "bignumber.js";

export async function queryAll(
  client: ApolloClient<any>,
  query: DocumentNode | TypedDocumentNode<any, any>,
  variable: OperationVariables,
  key: string
) {
  const queries: QueryOptions[] = [];
  for (let i = 0; i <= 5000; i += 1000) {
    const vary = _.clone(variable);
    vary.skip = i;

    queries.push({
      query: query,
      variables: vary,
    });
  }

  //   console.log('queries:', queries)
  let data: any[] = [];
  const resList = await Promise.all(queries.map((q) => client.query(q)));
  for (let i = 0; i < resList.length; i++) {
    const res = resList[i];
    if (res.errors || !res.data) {
      console.log("query pool failed:", i, res);
      continue;
    }
    // console.log(key, res.data[key])
    if (res.data[key].length > 0) data = data.concat(res.data[key]);
  }
  return data;
}

async function fetchUniswapHourlyPoolData(
  chainId: number,
  hour: number,
  dex = "uniswapv3"
) {
  return queryAll(
    getGraphClient(chainId, "uniswap"),
    gql`
      query poolData($skip: Int!, $periodStartUnix: Int!) {
        poolHourDatas(
          first: 1000
          skip: $skip
          where: { periodStartUnix: $periodStartUnix }
        ) {
          close
          feeGrowthGlobal0X128
          feeGrowthGlobal1X128
          feesUSD
          high
          id
          liquidity
          low
          open
          periodStartUnix
          sqrtPrice
          tick
          token0Price
          token1Price
          tvlUSD
          txCount
          volumeToken0
          volumeToken1
          volumeUSD
          pool {
            id
          }
        }
      }
    `,
    { periodStartUnix: hour * 3600 },
    "poolHourDatas"
  );
}

async function fetchMessariHourlyPoolData(
  chainId: number,
  hour: number,
  dex = "uniswapv3"
) {
  return queryAll(
    getGraphClient(chainId, "messari"),
    gql`
      query poolData($hour: Int!, $skip: Int!) {
        liquidityPoolHourlySnapshots(
          where: { hour: $hour }
          first: 1000
          skip: $skip
        ) {
          activeLiquidity
          activeLiquidityUSD
          blockNumber
          closedPositionCount
          cumulativeDepositCount
          cumulativeProtocolSideRevenueUSD
          cumulativeSupplySideRevenueUSD
          cumulativeSwapCount
          cumulativeTotalRevenueUSD
          cumulativeVolumeByTokenAmount
          cumulativeVolumeByTokenUSD
          cumulativeVolumeUSD
          cumulativeWithdrawCount
          hour
          hourlyDepositCount
          hourlyProtocolSideRevenueUSD
          hourlySupplySideRevenueUSD
          hourlySwapCount
          hourlyTotalRevenueUSD
          hourlyVolumeByTokenAmount
          hourlyVolumeByTokenUSD
          hourlyVolumeUSD
          hourlyWithdrawCount
          id
          inputTokenBalances
          inputTokenBalancesUSD
          inputTokenWeights
          openPositionCount
          positionCount
          rewardTokenEmissionsAmount
          rewardTokenEmissionsUSD
          stakedOutputTokenAmount
          tick
          timestamp
          totalLiquidity
          totalLiquidityUSD
          totalValueLockedUSD
          uncollectedProtocolSideTokenAmounts
          uncollectedProtocolSideValuesUSD
          uncollectedSupplySideTokenAmounts
          uncollectedSupplySideValuesUSD
          pool {
            id
          }
        }
      }
    `,
    {
      hour: hour,
    },
    "liquidityPoolHourlySnapshots"
  );
}

async function fetchMessariDailyPoolData(
  chainId: number,
  day: number,
  dex = "uniswapv3"
) {
  return queryAll(
    getGraphClient(chainId, "messari"),
    gql`
      query MyQuery($skip: Int!, $day: Int!) {
        liquidityPoolDailySnapshots(
          first: 1000
          skip: $skip
          where: { day: $day }
        ) {
          activeLiquidity
          activeLiquidityUSD
          blockNumber
          closedPositionCount
          cumulativeDepositCount
          cumulativeProtocolSideRevenueUSD
          cumulativeSupplySideRevenueUSD
          cumulativeSwapCount
          cumulativeTotalRevenueUSD
          cumulativeVolumeByTokenAmount
          cumulativeVolumeByTokenUSD
          cumulativeVolumeUSD
          dailyDepositCount
          cumulativeWithdrawCount
          dailySupplySideRevenueUSD
          dailyProtocolSideRevenueUSD
          dailySwapCount
          dailyTotalRevenueUSD
          dailyVolumeByTokenAmount
          dailyVolumeByTokenUSD
          dailyVolumeUSD
          dailyWithdrawCount
          day
          id
          inputTokenBalances
          inputTokenBalancesUSD
          inputTokenWeights
          openPositionCount
          positionCount
          pool {
            id
          }
          rewardTokenEmissionsAmount
          rewardTokenEmissionsUSD
          stakedOutputTokenAmount
          tick
          timestamp
          totalLiquidity
          totalLiquidityUSD
          totalValueLockedUSD
          uncollectedProtocolSideTokenAmounts
          uncollectedProtocolSideValuesUSD
          uncollectedSupplySideTokenAmounts
          uncollectedSupplySideValuesUSD
        }
      }
    `,
    { day: day },
    "liquidityPoolDailySnapshots"
  );
}

async function fetchUniswapDailyPoolData(
  chainId: number,
  day: number,
  dex = "uniswapv3"
) {
  return queryAll(
    getGraphClient(chainId, "uniswap"),
    gql`
      query MyQuery($skip: Int!, $date: Int!) {
        poolDayDatas(where: { date: $date }, first: 1000, skip: $skip) {
          low
          open
          high
          feesUSD
          date
          tick
          token0Price
          token1Price
          tvlUSD
          txCount
          volumeToken0
          volumeToken1
          volumeUSD
          sqrtPrice
          liquidity
          id
          feeGrowthGlobal0X128
          feeGrowthGlobal1X128
          close
          pool {
            id
          }
        }
      }
    `,
    { date: day * 86400 },
    "poolDayDatas"
  );
}

const ethusdc = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640";
function printPool(data: unknown[], poolId: string) {
  for (let item of data) {
    if ((item as any).pool.id === poolId) {
      console.log(item);
    }
  }
}

// 2024.02.12 通常 uniswap 的数据比 messari 的数据多
async function fetchHourlyPoolData(
  chainId: number,
  hour: number,
  dex = "uniswapv3"
): Promise<DBPoolData[]> {
  const messariData = await fetchMessariHourlyPoolData(chainId, hour, dex);
  const uniswapData = await fetchUniswapHourlyPoolData(chainId, hour, dex);

  if (uniswapData.length === 0) return [];

  //   console.log(
  //     `hour: ${hour}, messariData: ${messariData.length} uniswapData: ${uniswapData.length}`
  //   );
  //   printPool(messariData, ethusdc);
    // printPool(uniswapData, ethusdc);
  const messariMap: { [key: string]: any } = {};
  for (let item of messariData) {
    messariMap[item.pool.id] = item;
  }
  const startAt = dayjs(uniswapData[0].periodStartUnix*1000).format(
    "YYYY-MM-DDTHH:mm"
  );
  const date = dayjs(uniswapData[0].periodStartUnix*1000).format("YYYYMMDD");
  const data: DBPoolData[] = [];
  for (let item of uniswapData) {
    const mItem = messariMap[item.pool.id];
    if (mItem) {
      // both data exist
      data.push({
        chainId: chainId,
        dex: dex,
        interval: 3600,
        poolId: item.pool.id,
        periodStartUnix: item.periodStartUnix,
        date: +date,
        hour: mItem.hour,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        // 小时没有数据
        avgPrice: item.volumeToken1 === '0' ? '0': BigNumber(item.volumeToken0).div(item.volumeToken1).toString(),
        feesUSD: item.feesUSD,
        protocolFeesUSD: mItem.hourlyProtocolSideRevenueUSD,
        tvlUSD: item.tvlUSD,
        token0Price: item.token0Price,
        token1Price: item.token1Price,
        volToken0: item.volumeToken0,
        volToken1: item.volumeToken1,
        sqrtPrice: item.sqrtPrice,
        liquidity: item.liquidity,
        feeGrowthGlobal0X128: item.feeGrowthGlobal0X128,
        feeGrowthGlobal1X128: item.feeGrowthGlobal1X128,
        txCount: item.txCount,
        volumeUSD: item.volumeUSD,
        startAt: startAt, // 2024-01-20T15:00:00
        blockNumber: mItem.blockNumber,
        closedPositionCount: mItem.closedPositionCount,
        cumulativeDepositCount: mItem.cumulativeDepositCount,
        cumulativeSwapCount: mItem.cumulativeSwapCount,
        depositCount: mItem.hourlyDepositCount,
        cumulativeWithdrawCount: mItem.cumulativeWithdrawCount,
        withdrawCount: mItem.hourlyWithdrawCount,
        openPositionCount: mItem.openPositionCount,
        positionCount: mItem.positionCount,
        tick: mItem.tick,
        swapCount: mItem.hourlySwapCount,
        activeLiquidity: mItem.activeLiquidity,
        cumulativeProtocolSideRevenueUSD:
          mItem.cumulativeProtocolSideRevenueUSD,
        cumulativeSupplySideRevenueUSD: mItem.cumulativeSupplySideRevenueUSD,
        cumulativeTotalRevenueUSD: mItem.cumulativeTotalRevenueUSD,
        cumulativeVolumeUSD: mItem.cumulativeVolumeUSD,
        protocolSideRevenueUSD: mItem.hourlyProtocolSideRevenueUSD,
        supplySideRevenueUSD: mItem.hourlySupplySideRevenueUSD,
        totalRevenueUSD: mItem.hourlyTotalRevenueUSD,
        totalLiquidity: mItem.totalLiquidity,
        totalValueLockedUSD: mItem.totalValueLockedUSD,
        volumeByTokenAmount0: mItem.hourlyVolumeByTokenAmount[0],
        volumeByTokenUSD0: mItem.hourlyVolumeByTokenUSD[0],
        inputTokenBalances0: mItem.inputTokenBalances[0],
        inputTokenBalancesUSD0: mItem.inputTokenBalancesUSD[0],
        cumulativeVolumeByTokenAmount0: mItem.cumulativeVolumeByTokenAmount[0],
        cumulativeVolumeByTokenUSD0: mItem.cumulativeVolumeByTokenUSD[0],
        volumeByTokenAmount1: mItem.hourlyVolumeByTokenAmount[1],
        volumeByTokenUSD1: mItem.hourlyVolumeByTokenUSD[1],
        inputTokenBalances1: mItem.inputTokenBalances[1],
        inputTokenBalancesUSD1: mItem.inputTokenBalancesUSD[1],
        cumulativeVolumeByTokenAmount1: mItem.cumulativeVolumeByTokenAmount[1],
        cumulativeVolumeByTokenUSD1: mItem.cumulativeVolumeByTokenUSD[1],
      });
    }
  }

  return data;
}

async function fetchDailyPoolData(
  chainId: number,
  day: number,
  dex = "uniswapv3"
): Promise<DBPoolDayData[]> {
  const messariData = await fetchMessariDailyPoolData(chainId, day, dex);
  const uniswapData = await fetchUniswapDailyPoolData(chainId, day, dex);

  //   console.log(
  //     `day: ${day}, messariData: ${messariData.length} uniswapData: ${uniswapData.length}`
  //   );
  //   printPool(messariData, ethusdc);
  //   printPool(uniswapData, ethusdc);
  const messariMap: { [key: string]: any } = {};
  for (let item of messariData) {
    messariMap[item.pool.id] = item;
  }
  const startAt = dayjs(uniswapData[0].periodStartUnix*1000).format(
    "YYYY-MM-DDTHH:mm"
  );
  const date = dayjs(uniswapData[0].periodStartUnix*1000).format("YYYYMMDD");
  const data: DBPoolDayData[] = [];
  for (let item of uniswapData) {
    const mItem = messariMap[item.pool.id];
    if (mItem) {
      // both data exist
      data.push({
        chainId: chainId,
        dex: dex,
        interval: 86400,
        poolId: item.pool.id,
        date: +date,
        day: mItem.day,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        avgPrice: item.volumeToken1 === '0' ? '0': BigNumber(item.volumeToken0).div(item.volumeToken1).toString(),
        feesUSD: item.feesUSD,
        protocolFeesUSD: mItem.hourlyProtocolSideRevenueUSD,
        tvlUSD: item.tvlUSD,
        token0Price: item.token0Price,
        token1Price: item.token1Price,
        volToken0: item.volumeToken0,
        volToken1: item.volumeToken1,
        sqrtPrice: item.sqrtPrice,
        liquidity: item.liquidity,
        feeGrowthGlobal0X128: item.feeGrowthGlobal0X128,
        feeGrowthGlobal1X128: item.feeGrowthGlobal1X128,
        txCount: item.txCount,
        volumeUSD: item.volumeUSD,
        startAt: startAt, // 2024-01-20T15:00:00
        blockNumber: mItem.blockNumber,
        closedPositionCount: mItem.closedPositionCount,
        cumulativeDepositCount: mItem.cumulativeDepositCount,
        cumulativeSwapCount: mItem.cumulativeSwapCount,
        depositCount: mItem.dailyDepositCount,
        cumulativeWithdrawCount: mItem.cumulativeWithdrawCount,
        withdrawCount: mItem.dailyWithdrawCount,
        openPositionCount: mItem.openPositionCount,
        positionCount: mItem.positionCount,
        tick: mItem.tick,
        swapCount: mItem.dailySwapCount,
        activeLiquidity: mItem.activeLiquidity,
        cumulativeProtocolSideRevenueUSD:
          mItem.cumulativeProtocolSideRevenueUSD,
        cumulativeSupplySideRevenueUSD: mItem.cumulativeSupplySideRevenueUSD,
        cumulativeTotalRevenueUSD: mItem.cumulativeTotalRevenueUSD,
        cumulativeVolumeUSD: mItem.cumulativeVolumeUSD,
        protocolSideRevenueUSD: mItem.dailyProtocolSideRevenueUSD,
        supplySideRevenueUSD: mItem.dailySupplySideRevenueUSD,
        totalRevenueUSD: mItem.dailyTotalRevenueUSD,
        totalLiquidity: mItem.totalLiquidity,
        totalValueLockedUSD: mItem.totalValueLockedUSD,
        volumeByTokenAmount0: mItem.dailyVolumeByTokenAmount[0],
        volumeByTokenUSD0: mItem.dailyVolumeByTokenUSD[0],
        inputTokenBalances0: mItem.inputTokenBalances[0],
        inputTokenBalancesUSD0: mItem.inputTokenBalancesUSD[0],
        cumulativeVolumeByTokenAmount0: mItem.cumulativeVolumeByTokenAmount[0],
        cumulativeVolumeByTokenUSD0: mItem.cumulativeVolumeByTokenUSD[0],
        volumeByTokenAmount1: mItem.dailyVolumeByTokenAmount[1],
        volumeByTokenUSD1: mItem.dailyVolumeByTokenUSD[1],
        inputTokenBalances1: mItem.inputTokenBalances[1],
        inputTokenBalancesUSD1: mItem.inputTokenBalancesUSD[1],
        cumulativeVolumeByTokenAmount1: mItem.cumulativeVolumeByTokenAmount[1],
        cumulativeVolumeByTokenUSD1: mItem.cumulativeVolumeByTokenUSD[1],
      });
    }
  }

  return data;
}

async function hourlyPoolDataRoutine(chainIds: number[]) {
  if (chainIds.length === 0) {
    console.warn("hourlyPoolDataRoutine: empty chainId list");
    return;
  }

  const doHourly = async (hour: number) => {
    for (let chainId of chainIds) {
      const data = await fetchHourlyPoolData(chainId, hour!, "uniswapv3");
      await insertHourlyPoolData(data);
    }
  };
  const hourlyRoutine = async () => {
    async function handler() {
      const hour = Math.floor(new Date().getTime() / 1000 / 3600) - 1;
      doHourly(hour);

      const current = Math.floor(new Date().getTime());
      const remainer = current % 3600000;
      const next = 3600000 + 180000 - remainer;
      setTimeout(handler, next);
    }

    const current = Math.floor(new Date().getTime());
    const remainer = current % 3600000;
    const next = remainer > 180000 ? 3600000 + 180000 - remainer : 18000;
    setTimeout(async () => {
      await handler();
    }, next);
  };

  // 上一小时
  const hour = Math.floor(new Date().getTime() / 1000 / 3600) - 1;
  await doHourly(hour);

  hourlyRoutine();
}

async function dailyPoolDataRoutine(chainIds: number[]) {
  if (chainIds.length === 0) {
    console.warn("dailyPoolDataRoutine: empty chainId list");
    return;
  }

  const doDaily = async (day: number) => {
    for (let chainId of chainIds) {
      const data = await fetchDailyPoolData(chainId, day, "uniswapv3");
      await insertDailyPoolData(data);
    }
  };
  const dailyRoutine = async () => {
    async function handler() {
      const day = Math.floor(new Date().getTime() / 1000 / 86400) - 1;
      doDaily(day);

      const current = Math.floor(new Date().getTime());
      const remainer = current % 86400000;
      const next = 86400000 + 180000 - remainer;
      setTimeout(handler, next);
    }

    const current = Math.floor(new Date().getTime());
    const remainer = current % 86400000;
    const next = remainer > 180000 ? 86400000 + 180000 - remainer : 18000;
    setTimeout(async () => {
      await handler();
    }, next);
  };

  // 上一天
  const day = Math.floor(new Date().getTime() / 1000 / 86400) - 1;
  await doDaily(day);

  dailyRoutine();
}

/*
(async () => {
  const current = Math.floor(new Date().getTime() / 1000 / 3600) - 1;
  for (let i = 0; i < 3; i++) {
    const hour = current - i;
    const items = await fetchHourlyPoolData(1, hour);
    // console.log(items[0]);
  }

  const currentDay = Math.floor(new Date().getTime() / 1000 / 86400) - 1;
  for (let i = 0; i < 3; i++) {
    const day = currentDay - i;
    const items = await fetchDailyPoolData(1, day);
    // console.log(items[0])
  }
  //   console.log("done");
})();
*/

// hourlyPoolDataRoutine([1])

export {
  fetchHourlyPoolData,
  fetchDailyPoolData,
  hourlyPoolDataRoutine,
  dailyPoolDataRoutine,
};
