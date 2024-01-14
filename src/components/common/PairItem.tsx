/* eslint-disable @next/next/no-img-element */

import { Token } from "@/interfaces/uniswap.interface";

function TokenItem({ token0, token1 }: { token0: Token, token1: Token, chainId?: number }) {
  return (
    <div className="flex flex-row">
      <span>{token0.symbol}/{token1.symbol}</span>
      <img src={token0.logoURI} alt={token0.symbol} width={24} height={24} />
      <img src={token1.logoURI} alt={token1.symbol} width={24} height={24} />
    </div>
  );
}

export default TokenItem;
