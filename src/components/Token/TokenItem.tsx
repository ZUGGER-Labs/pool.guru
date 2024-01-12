/* eslint-disable @next/next/no-img-element */

import { Token } from "@/interfaces/uniswap.interface";

function TokenItem({ token }: { token: Token }) {
  return (
    <>
      <span>{token.symbol}</span>
      <img src={token.logoURI} alt={token.symbol} width={24} height={24} />
    </>
  );
}

export default TokenItem;
