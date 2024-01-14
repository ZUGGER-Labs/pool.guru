"use client";

/* eslint-disable @next/next/no-img-element */
import { Pool, Token } from "@/interfaces/uniswap.interface";
import { getUniswapV3Pools } from "@/uniswap/graph";
import { formatAmount } from "@/utils/format";
import { ChainId } from "@uniswap/sdk-core";
import { useEffect, useState } from "react";
import TokenItem from "../common/TokenItem";
import { sqrtPriceToPrice } from "@/uniswap/calculator";
import { AmountFilter, ChainSwapFilter } from "./Filter";
import PairItem from "../common/PairItem";

function FeeTier({fr, className}: {fr: number | string, className?: string}) {
    let ratio = ''
    
    if (typeof fr === 'string') fr = +fr;
    switch (fr) {
        case 100:
            ratio = '0.01%'
            break
        case 200:
            ratio = '0.02%'
            break
        case 500:
            ratio = '0.05%'
            break
        case 3000:
            ratio = '0.3%'
            break
        case 10000:
            ratio = '1%'
            break

        default:
            ratio = fr/1000000 + '%'
    }

    return <span className={className}>{ratio}</span>
}


function Pools() {
  const [poolsInfo, setPoolsInfo] = useState<{
    pools: Pool[];
    tokens: Token[];
  }>({ pools: [], tokens: [] });
  useEffect(() => {
    const fetchPoolsInfo = async () => {
      const { pools, tokens } = await getUniswapV3Pools({
        chainId: ChainId.MAINNET,
        total: 20,
        tvlUSD_gte: 5000,
        volUSD_gte: 5000,
      });
      console.log("pools:", pools);
      console.log("tokens:", tokens);

      setPoolsInfo({ pools: pools, tokens: tokens });
    };
    fetchPoolsInfo();
  }, []);

  return (
    <div>
      <AmountFilter />
      <ChainSwapFilter />

      <table>
        <thead>
          <tr>
            <td>Pair</td>
            <td>FeeRatio</td>
            <td>Liquidity</td>
            <td>Fees/Vol 24H(USD)</td>
            <td>Fees/Vol 7D(USD)</td>
            <td>Fees/Vol 30D(USD)</td>
            <td>Vol(USD)</td>
            <td>TVL(USD)</td>
          </tr>
        </thead>
        <tbody>
          {poolsInfo.pools.map((pool) => {
            const volFeeData = pool.volFeeData
            return (
              <tr key={pool.id}>
                <td>
                  <PairItem token0={pool.token0} token1={pool.token1} />
                </td>

                <td><FeeTier fr={pool.feeTier} /></td>
                <td>{pool.liquidity}</td>
            <td>{formatAmount(volFeeData?.fees24h)} {formatAmount(volFeeData?.volume24h)}</td>
            <td>{formatAmount(volFeeData?.fees7d)} {formatAmount(volFeeData?.volume7d)}</td>
            <td>{formatAmount(volFeeData?.fees30d)} {formatAmount(volFeeData?.volume30d)}</td>
                <td>{formatAmount(+pool.volumeUSD)}</td>
                <td>{formatAmount(+pool.totalValueLockedUSD)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { Pools };
