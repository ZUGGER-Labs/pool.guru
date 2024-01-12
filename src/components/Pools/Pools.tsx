"use client";

/* eslint-disable @next/next/no-img-element */
import { Pool, Token } from "@/interfaces/uniswap.interface";
import { getUniswapV3Pools } from "@/uniswap/graph";
import { formatAmount } from "@/utils/format";
import { ChainId } from "@uniswap/sdk-core";
import { useEffect, useState } from "react";
import TokenItem from "../Token/TokenItem";
import { sqrtPriceToPrice } from "@/uniswap/calculator";

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
        take: 10,
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
      <table>
        <thead>
          <tr>
            <td>TOKEN0</td>
            <td>TOKEN1</td>
            <td>FeeRatio</td>
            <td>Liquidity</td>
            <td>Vol(USD)</td>
            <td>TVL(USD)</td>
          </tr>
        </thead>
        <tbody>
          {poolsInfo.pools.map((pool) => {
            return (
              <tr key={pool.id}>
                <td>
                  <TokenItem token={pool.token0} />
                </td>
                <td>
                  <TokenItem token={pool.token1} />
                </td>
                <td><FeeTier fr={pool.feeTier} /></td>
                <td>{pool.liquidity}</td>
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
