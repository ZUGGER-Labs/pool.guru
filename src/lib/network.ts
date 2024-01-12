import { ChainId } from "@uniswap/sdk-core";

// https://github.com/Uniswap/interface/blob/main/apps/web/src/graphql/thegraph/apollo.ts

export type DEX_TYPES = "uniswapv3" | "uniswapv2";

const CHAIN_NAME: Record<number, string> = {
  [ChainId.MAINNET]: "ethereum",
  [ChainId.ARBITRUM_ONE]: "arbitrum",
  [ChainId.OPTIMISM]: "optimism",
  [ChainId.POLYGON]: "polygon",
  [ChainId.CELO]: "celo",
  [ChainId.BNB]: "bnb",
  [ChainId.AVALANCHE]: "avax",
  [ChainId.BASE]: "base",
};

const CHAIN_UINSWAPV3_SUBGRAPH_URL: Record<number, Record<string, string>> = {
  [ChainId.MAINNET]: {
    uniswapv3:
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3?source=uniswap",
  },
  [ChainId.ARBITRUM_ONE]: {
    uniswapv3:
      "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one?source=uniswap",
  },
  [ChainId.OPTIMISM]: {
    uniswapv3:
      "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis?source=uniswap",
  },
  [ChainId.POLYGON]: {
    uniswapv3:
      "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon?source=uniswap",
  },
  [ChainId.CELO]: {
    uniswapv3:
      "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo?source=uniswap",
  },
  [ChainId.BNB]: {
    uniswapv3:
      "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc?source=uniswap",
  },
  [ChainId.AVALANCHE]: {
    uniswapv3:
      "https://api.thegraph.com/subgraphs/name/lynnshaoyu/uniswap-v3-avax?source=uniswap",
  },
  [ChainId.BASE]: {
    uniswapv3:
      "https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest",
  },
};

function getNetworkName(chainId: number): string {
  const name = CHAIN_NAME[chainId];
  if (!name) throw new Error("unsupport chainId: " + chainId);

  return name;
}

function getNetworkEndpoint(chainId: number, dexType: DEX_TYPES = "uniswapv3") {
  const endpoint = CHAIN_UINSWAPV3_SUBGRAPH_URL[chainId][dexType];
  if (!endpoint) throw new Error("unsupport dex type: " + dexType);
  return endpoint;
}

export { getNetworkEndpoint, getNetworkName, CHAIN_UINSWAPV3_SUBGRAPH_URL };
