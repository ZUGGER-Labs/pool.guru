import { query } from "@/utils/query";

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
}

export async function fetchPools(param: IPoolFilters) {
  param.page = param.page ? param.page : 1;
  param.itemsPerPage = param.itemsPerPage ? param.itemsPerPage : 20;
  param.chains = param.chains ? param.chains : [];
  param.dexes = param.dexes ? param.dexes : [];
  param.tokens = param.tokens ? param.tokens : [];
  param.sortBy = param.sortBy ? param.sortBy : 'tvlUSD';

  const res = await query("/pools/info", param);

  return res;
}
