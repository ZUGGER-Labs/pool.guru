import { IChainDEX } from "@/components/Pool/PoolList";
import { query } from "@/utils/query";
import { CHAIN_LOGO, CHAIN_NAME, getDEXLogoByName } from "./network";

export const FilterChainId = 1
export const FilterDexId = 10
export const FilterTokenId = 20

export type TPoolSortBy =
  | "tvlUSD"
  | "volUSD7D"
  | "volUSD24H"
  | "volUSD14D"
  | "feeUSD24H"
  | "feeUSD7D"
  | "feeUSD14D"
  | "apyByUSD24H"
  | "apyByUSD7D"
  | "apyByUSD14D"
  | "feeApy24H"
  | "feeApy7D"
  | "feeApy14D";

export interface IPoolFilters {
  page?: number;
  itemsPerPage?: number;
  chains?: number[];
  dexes?: string[];
  tokens?: string[];
  sortBy?: TPoolSortBy;
  order?: 'desc' | 'asc'
}

export async function fetchPools(param: IPoolFilters) {
  param.page = param.page ? param.page : 1;
  param.itemsPerPage = param.itemsPerPage ? param.itemsPerPage : 20;
  param.chains = param.chains ? param.chains : [];
  param.dexes = param.dexes ? param.dexes : [];
  param.tokens = param.tokens ? param.tokens : [];
  param.sortBy = param.sortBy ? param.sortBy : "tvlUSD";
  param.order = param.order ? param.order : 'desc'

  const res = await query("/pools/info", param);

  return res;
}

export async function fetchPoolFilters() {
  return query('/pools/filters', {})
}

export function getChainDex(chainId: number, dex: string): IChainDEX {
  return {
    dexName: dex,
    dexLogo: getDEXLogoByName(dex),
    chainName: CHAIN_NAME[chainId],
    chainLogo: CHAIN_LOGO[chainId],
  };
}

export function convertToPoolData(item: any) {
  let feeTier = '0.3%'

  switch (item.feeTier) {
    case '100':
      feeTier = '0.01%'
      break
    case '500':
      feeTier = '0.05%'
      break
    case '3000':
      feeTier = '0.3%'
      break
    case '10000':
      feeTier = '1%'
      break
    default:
      feeTier = +item.feeRate / 1000 + '%'
  }

  return {
    id: item.poolId,
    poolName: item.dex,
    baseLogo: item.baseToken.logoURI,
    baseName: item.baseToken.symbol,
    quoteLogo: item.quoteToken.logoURI,
    quoteName: item.quoteToken.symbol,
    chainDex: getChainDex(item.chainId, item.dex),
    feeTier: feeTier,
    symbol: item.baseToken.symbol + '/' + item.quoteToken.symbol,
    tvlUSD: item.tvlUSD,
    volume24H: item.volumeUSD24H,
    volume7D: item.volumeUSD7D,
    volume14D: item.volumeUSD14D,
    fee24H: item.feeUSD24H,
    fee7D: item.feeUSD7D,
    fee14D: item.feeUSD14D,
    apy24H: item.apy24H.apyPoolByUSD,
    apy7D: item.apy7D.apyPoolByUSD,
    apy14D: item.apy14D.apyPoolByUSD,
    feeApy24H: item.apy24H.feeAPYByUSD,
    feeApy7D: item.apy7D.feeAPYByUSD,
    feeApy14D: item.apy14D.feeAPYByUSD,
  };
}
