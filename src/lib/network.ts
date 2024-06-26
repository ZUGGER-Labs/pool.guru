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

const CHAIN_LOGO: Record<number, string> = {
  [ChainId.MAINNET]: "https://tokenlogo.xyz/assets/chain/ethereum.svg",
  [ChainId.ARBITRUM_ONE]: "https://tokenlogo.xyz/assets/chain/arbitrum.svg",
  [ChainId.OPTIMISM]: "https://tokenlogo.xyz/assets/chain/optimism.svg",
  [ChainId.POLYGON]: "https://tokenlogo.xyz/assets/chain/polygon.svg",
  [ChainId.CELO]: "https://tokenlogo.xyz/assets/chain/celo.svg",
  [ChainId.BNB]: "https://tokenlogo.xyz/assets/chain/bsc.svg",
  [ChainId.AVALANCHE]: "https://tokenlogo.xyz/assets/chain/avalanche.svg",
  [ChainId.BASE]: "https://tokenlogo.xyz/assets/chain/base.svg",
};

const DEX_LOGO: Record<string, string> = {
  'uniswapv3': "https://tokenlogo.xyz/assets/token/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.svg",
  'uniswapv2': "https://tokenlogo.xyz/assets/token/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.svg",
  'panacakev3': "https://tokenlogo.xyz/assets/token/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82.svg",
  'panacakev2': "https://tokenlogo.xyz/assets/token/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82.svg",
};

const CHAIN_ID_BY_NAME: Record<string, number> = {
  "ethereum": ChainId.MAINNET,
  "arbitrum": ChainId.ARBITRUM_ONE,
  "optimism": ChainId.OPTIMISM,
  "polygon": ChainId.POLYGON,
  "celo": ChainId.CELO,
  "bnb": ChainId.BNB,
  "avax": ChainId.AVALANCHE,
  "base": ChainId.BASE,
};

const CHAIN_BLOCK_SUBGRAPH_URL: Record<number, string> = {
  [ChainId.MAINNET]: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
  [ChainId.ARBITRUM_ONE]: "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks",
  [ChainId.OPTIMISM]: "https://api.thegraph.com/subgraphs/name/ianlapham/uni-testing-subgraph",
  [ChainId.POLYGON]: "https://api.thegraph.com/subgraphs/name/ianlapham/polygon-blocks",
  [ChainId.CELO]: "https://api.thegraph.com/subgraphs/name/jesse-sawa/celo-blocks",
  [ChainId.BNB]: "https://api.thegraph.com/subgraphs/name/wombat-exchange/bnb-chain-block",
  [ChainId.AVALANCHE]: "https://api.thegraph.com/subgraphs/name/lynnshaoyu/avalanche-blocks",
  [ChainId.BASE]: "https://api.studio.thegraph.com/query/48211/base-blocks/version/latest",
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

function getNetworkDexEndpoint(
  chainId: number,
  dexType: DEX_TYPES = "uniswapv3"
) {
  const endpoint = CHAIN_UINSWAPV3_SUBGRAPH_URL[chainId][dexType];
  if (!endpoint) throw new Error("unsupport dex type: " + dexType);
  return endpoint;
}

function getBlockQueryEndpoint(chainId: number) {
  const endpoint = CHAIN_BLOCK_SUBGRAPH_URL[chainId];

  if (!endpoint) throw new Error("unsupport chain: " + chainId);
  return endpoint;
}

function getChainNameLogo(chainId: number) {
  return {
    name: CHAIN_NAME[chainId],
    logo: CHAIN_LOGO[chainId]
  }
}

function getDEXLogoByName(dex: string) {
  return DEX_LOGO[dex]
}

export {
  CHAIN_NAME,
  DEX_LOGO,
  CHAIN_LOGO,
  CHAIN_ID_BY_NAME,
  getChainNameLogo,
  getDEXLogoByName,
  getNetworkDexEndpoint,
  getBlockQueryEndpoint,
  getNetworkName,
  CHAIN_UINSWAPV3_SUBGRAPH_URL,
};
