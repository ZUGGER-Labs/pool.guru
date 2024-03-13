/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from "@table-library/react-table-library/table";
import { RxArrowUp, RxArrowDown } from "react-icons/rx";

import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

import { useEffect, useMemo, useState } from "react";
import { formatAmount } from "@/utils/format";
import {
  FilterChainId,
  FilterDexId,
  TPoolSortBy,
  convertToPoolData,
  fetchPools,
} from "@/lib/pools";
import PoolFilter from "./PoolFilter";
import {
  FilterConfig,
  getQuerySearchFiler,
  toFilterValueNames,
} from "@/lib/filter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildURI, buildURIByKeys } from "@/lib/page";
import Link from "next/link";

export interface PoolListProps {
  itemsPerPage: number;
  pools: IPoolData[];
  total: number;
  filters: FilterConfig[];
}

export interface IChainDEX {
  dexName: string;
  dexLogo: string;
  chainName: string;
  chainLogo: string;
}

export interface IPoolData {
  id: string;
  poolName?: string;
  baseLogo: string;
  baseName?: string;
  quoteLogo: string;
  quoteName?: string;
  chainDex: IChainDEX;
  tvlUSD: string;
  volume24H: string;
  volume7D: string;
  volume14D: string;
  fee24H: string;
  fee7D: string;
  fee14D: string;
  apy24H: string;
  apy7D: string;
  apy14D: string;
  feeApy24H: string;
  feeApy7D: string;
  feeApy14D: string;
}

const sortKeyToField: Record<TPoolSortBy, string> = {
  tvlUSD: "TVL",
  volUSD7D: "Vol(7D)",
  volUSD24H: "Vol(24H)",
  volUSD14D: "Vol(14D)",
  feeUSD24H: "Fee(24H)",
  feeUSD7D: "Fee(7D)",
  feeUSD14D: "Fee(14D)",
  apyByUSD24H: "APYByUSD(24H)",
  apyByUSD7D: "APYByUSD(7D)",
  apyByUSD14D: "APYByUSD(14D)",
  feeApy24H: "%FeeAPY(24H)",
  feeApy7D: "%FeeAPY(7D)",
  feeApy14D: "%FeeAPY(14D)",
};

const sortFieldToKey: Record<string, TPoolSortBy> = {
  TVL: "tvlUSD",
  "Vol(7D)": "volUSD7D",
  "Vol(24H)": "volUSD24H",
  "Vol(14D)": "volUSD14D",
  "Fee(24H)": "feeUSD24H",
  "Fee(7D)": "feeUSD7D",
  "Fee(14D)": "feeUSD14D",
  "APYByUSD(24H)": "apyByUSD24H",
  "APYByUSD(7D)": "apyByUSD7D",
  "APYByUSD(14D)": "apyByUSD14D",
  "%FeeAPY(24H)": "feeApy24H",
  "%FeeAPY(7D)": "feeApy7D",
  "%FeeAPY(14D)": "feeApy14D",
};

function toSortField(key: TPoolSortBy): string {
  if (sortKeyToField[key]) {
    return sortKeyToField[key];
  }
  // console.log('invalid field')
  // return field as TPoolSortBy
  throw new Error("invalid key: " + key);
}

function toSortParam(field: string): TPoolSortBy {
  if (sortFieldToKey[field]) {
    return sortFieldToKey[field];
  }
  // console.log('invalid field')
  // return field as TPoolSortBy
  throw new Error("invalid field: " + field);
}

function PoolList(props: PoolListProps) {
  const [data, setData] = useState<{ nodes: IPoolData[] }>({
    nodes: props.pools,
  });
  const [total, setTotal] = useState<number>(props.total);
  const pathname = usePathname();
  const query = useSearchParams();
  const router = useRouter();

  const sortBy = query.get("sortBy");
  const sortOrder = query.get("order");
  const [sortKey, setSortKey] = useState({
    field: !sortBy ? "TVL" : toSortField(sortBy as TPoolSortBy),
    order: !sortOrder ? "desc" : sortOrder,
  });
  const theme = useTheme(getTheme());
  const onFieldSort = async (field: string) => {
    console.log("click:", field);
    let newSortKey: any = {};

    if (sortKey.field === field) {
      if (sortKey.order === "desc") {
        newSortKey.field = sortKey.field;
        newSortKey.order = "asc";
      } else {
        // make sortKey to default
        newSortKey.field = "TVL";
        newSortKey.order = "desc";
      }
    } else {
      newSortKey.field = field;
      newSortKey.order = "desc";
    }

    router.push(
      buildURIByKeys(
        pathname,
        query,
        ["sortBy", "order"],
        [toSortParam(newSortKey.field), newSortKey.order]
      )
    );
    setSortKey({ ...newSortKey });
  };

  useEffect(() => {
    const chains = getQuerySearchFiler(query, "cat-" + FilterChainId);
    const dexes = toFilterValueNames(
      props.filters,
      FilterDexId,
      getQuerySearchFiler(query, "cat-" + FilterDexId)
    );
    // const tokens = []
    const refreshData = async () => {
      const resp = await fetchPools({
        page: query.get("page") ? +query.get("page")! : 1,
        chains: chains,
        dexes: dexes,
        itemsPerPage: query.get("itemsPerPage")
          ? +query.get("itemsPerPage")!
          : 20,
        sortBy: toSortParam(sortKey.field),
        order: sortKey.order as "desc" | "asc",
      });
      const total = resp.total;
      const pools = resp.apyList.map((item: any) => {
        // console.log('logo:', item.baseToken.logoURI)
        return convertToPoolData(item);
      });
      setData({ nodes: pools });
      setTotal(total);
    };

    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const pageURI = (prev: boolean) => {
    let page = 1;
    if (query.get("page")) {
      page = +query.get("page")!;
    }

    if (prev) {
      if (page <= 1) {
        return { pagable: false, uri: buildURI(pathname, query, "page", "1") };
      } else {
        return {
          pagable: true,
          uri: buildURI(pathname, query, "page", page - 1 + ""),
        };
      }
    } else {
      if (page === total) {
        return {
          pagable: false,
          uri: buildURI(pathname, query, "page", page + ""),
        };
      } else {
        return {
          pagable: true,
          uri: buildURI(pathname, query, "page", page + 1 + ""),
        };
      }
    }
  };

  const PageLink = ({ prev }: { prev: boolean }) => {
    const { pagable, uri } = pageURI(prev);

    // console.log(`page link: prev=${prev} pagable=${pagable} uri=${uri}`);
    if (prev) {
      if (!pagable) {
        return <>Prev</>;
      }
      return <Link href={uri}>Prev</Link>;
    } else {
      if (!pagable) return <>Next</>;
      return <Link href={uri}>Next</Link>;
    }
  };

  const SortNameAndArrow = ({
    name,
    showName,
  }: {
    name: string;
    showName?: string;
  }) => {
    const sorted = sortKey.field === name;
    const order = sortKey.order;

    return (
      <span className="flex flex-row items-center">
        <span>{showName ? showName : name}</span>
        {sorted && (
          <span className="pl-1">
            {order === "desc" ? <RxArrowDown /> : <RxArrowUp />}
          </span>
        )}
        {/* {!sorted && (
          <span className="gray-500">
            <RxArrowUp />
            <RxArrowDown />
          </span>
        )} */}
      </span>
    );
  };

  const clickRow = (item: any) => {
    window.open("/pool/" + item.id, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center">
        <PoolFilter filters={props.filters} />
      </div>

      <div className="flex flex-col justify-between items-center w-full">
        <div className="w-full">
          <Table data={data} theme={theme}>
            {(tableList: any) => (
              <>
                <Header>
                  <HeaderRow>
                    <HeaderCell className="text-sm text-center">
                      Pool
                    </HeaderCell>
                    <HeaderCell className="text-sm">Chain/Protocol</HeaderCell>

                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("TVL")}
                    >
                      <SortNameAndArrow name="TVL" />
                    </HeaderCell>
                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("Vol(24H)")}
                    >
                      <SortNameAndArrow name="Vol(24H)" />
                    </HeaderCell>
                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("Fee(24H)")}
                    >
                      <SortNameAndArrow name="Fee(24H)" />
                    </HeaderCell>

                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("Vol(7D)")}
                    >
                      <SortNameAndArrow name="Vol(7D)" />
                    </HeaderCell>
                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("Fee(7D)")}
                    >
                      <SortNameAndArrow name="Fee(7D)" />
                    </HeaderCell>

                    {/* <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("Vol(14D)")}
                    >
                      <SortNameAndArrow name="Vol(14D)" />
                    </HeaderCell>
                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("Fee(14D)")}
                    >
                      <SortNameAndArrow name="Fee(14D)" />
                    </HeaderCell> */}

                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("%FeeAPY(24H)")}
                    >
                      <SortNameAndArrow
                        name="%FeeAPY(24H)"
                        showName="%fAPY(24H)"
                      />
                    </HeaderCell>
                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("%FeeAPY(7D)")}
                    >
                      <SortNameAndArrow
                        name="%FeeAPY(7D)"
                        showName="%fAPY(7D)"
                      />
                    </HeaderCell>
                    {/* <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("%FeeAPY(14D)")}
                    >
                      <SortNameAndArrow
                        name="%FeeAPY(14D)"
                        showName="%fAPY(14D)"
                      />
                    </HeaderCell> */}
                  </HeaderRow>
                </Header>

                <Body>
                  {tableList.map((item: any, idx: any) => (
                    <Row
                      key={idx}
                      item={item}
                      onClick={() => clickRow(item)}
                      data-href={"/pool/" + item.id}
                      className="cursor-pointer"
                    >
                      <Cell title={item.symbol}>
                        <div className="flex flex-col justify-start items-center">
                          <div className="flex flex-row">
                            <img
                              className="h-5"
                              src={item.baseLogo}
                              alt={item.baseName}
                              title={item.baseName}
                            />
                            <img
                              className="h-5"
                              src={item.quoteLogo}
                              alt={item.quoteName}
                              title={item.quoteName}
                            />
                          </div>
                          <div className="text-sm" title={item.symbol}>
                            {item.symbol}
                          </div>
                        </div>
                      </Cell>

                      <Cell
                        title={
                          item.chainDex.dexName +
                          " - " +
                          item.chainDex.chainName
                        }
                      >
                        <div className="flex flex-col justify-start items-center">
                          <div className="flex flex-row">
                            <span>{item.feeTier}</span>
                            <img
                              className="h-6 px-1"
                              src={item.chainDex.dexLogo}
                              alt={item.chainDex.dexName}
                              title={item.chainDex.dexName}
                            />
                            <img
                              className="h-6"
                              src={item.chainDex.chainLogo}
                              alt={item.chainDex.chainName}
                              title={item.chainDex.chainName}
                            />
                          </div>
                        </div>
                      </Cell>

                      <Cell>{formatAmount(item.tvlUSD)}</Cell>
                      <Cell>{formatAmount(item.volume24H)}</Cell>
                      <Cell>{formatAmount(item.fee24H)}</Cell>
                      <Cell>{formatAmount(item.volume7D)}</Cell>
                      <Cell>{formatAmount(item.fee7D)}</Cell>
                      {/* <Cell>{formatAmount(item.volume14D)}</Cell> */}
                      {/* <Cell>{formatAmount(item.fee14D)}</Cell> */}
                      <Cell>{formatAmount(item.feeApy24H)}</Cell>
                      <Cell>{formatAmount(item.feeApy7D)}</Cell>
                      {/* <Cell>{formatAmount(item.feeApy14D)}</Cell> */}
                    </Row>
                  ))}
                </Body>
              </>
            )}
          </Table>
        </div>
        <div className="w-full px-2 py-2 flex flex-row justify-between items-center">
          <div className="hidden md:block">
            <span>
              Showing {props.itemsPerPage} out of {total} pools
            </span>
          </div>

          <div className="">
            <div className="flex flex-row">
              <div className="px-2">
                <PageLink prev={true} />
              </div>
              <div className="px-2">
                <PageLink prev={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoolList;
