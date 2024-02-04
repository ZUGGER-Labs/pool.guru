import { ChainId } from "@uniswap/sdk-core";

const symbolContractAddress: {
  [key: number]: { [key: string]: string | string[] };
} = {
  [ChainId.MAINNET]: {
    'USDT': "0xdAC17F958D2ee523a2206206994597C13D831ec7".toLowerCase(),
    'USDC': "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase(),
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase()
  },
  [ChainId.ARBITRUM_ONE]: {
    'USDT': "",
    'USDC': "",
    'DAI': ''
  },
  [ChainId.OPTIMISM]: {
    'USDT': "",
    'USDC': "",
    'DAI': ''
  },
  [ChainId.BASE]: {
    'USDT': "",
    'USDC': "",
    'DAI': ''
  },
  [ChainId.BNB]: {
    'USDT': "",
    'USDC': "",
    'DAI': ''
  },
  [ChainId.CELO]: {
    'USDT': "",
    'USDC': "",
    'DAI': ''
  },
  [ChainId.POLYGON]: {
    'USDT': "",
    'USDC': "",
    'DAI': ''
  },
  [ChainId.AVALANCHE]: {
    'USDT': "",
    'USDC': "",
    'DAI': ''
  },
};

function getAddressBySymbol(
  chainId: number,
  symbol: string
): string | string[] {
  if (symbol === "ETH" || symbol === "WETH") {
    return getWETH(chainId);
  }
  if (symbol === "BTC" || symbol === "WBTC") {
    return getWBTC(chainId);
  }
  // other USDC USDT

  if (!symbolContractAddress[chainId][symbol]) {
    throw new Error("not found symbol contract address");
  }

  return symbolContractAddress[chainId][symbol];
}

// weth 地址
function getWETH(chainId: number): string | string[] {
  switch (chainId) {
    case ChainId.MAINNET:
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

    case ChainId.ARBITRUM_ONE:
      return "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

    case ChainId.OPTIMISM:
      return "0x4200000000000000000000000000000000000006";

    case ChainId.BASE:
      return [
        "0x4200000000000000000000000000000000000006",
        "0x71b35ecb35104773537f849fbc353f81303a5860",
      ];

    case ChainId.BNB:
      // pancake 0x2170ed0880ac9a755fd29b2688956bd959f933f8
      // uniswap v3 0x2170ed0880ac9a755fd29b2688956bd959f933f8
      return "0x2170ed0880ac9a755fd29b2688956bd959f933f8";

    case ChainId.AVALANCHE:
      // WETH.e
      return "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab";

    case ChainId.POLYGON:
      return "";

    case ChainId.CELO:
      return "0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207"; // wormhole
  }
  throw new Error("not support chain");
}

function getWBTC(chainId: number): string | string[] {
  switch (chainId) {
    case ChainId.MAINNET:
      return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

    case ChainId.ARBITRUM_ONE:
      return "";

    case ChainId.OPTIMISM:
      return "";

    case ChainId.BASE:
      return "0x236aa50979d5f3de3bd1eeb40e81137f22ab794b"; // Base tBTC

    case ChainId.BNB:
      return "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c"; // BTCB

    case ChainId.AVALANCHE:
      // BTC.b
      return "0x152b9d0fdc40c096757f570a51e494bd4b943e50";

    case ChainId.POLYGON:
      return "";

    case ChainId.CELO:
      return "0xd71ffd0940c920786ec4dbb5a12306669b5b81ef";
  }
  throw new Error("not support chain");
}

export { getWETH, getWBTC, getAddressBySymbol };
