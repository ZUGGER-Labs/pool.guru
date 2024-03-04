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

import { LiquidityPool, Pool } from "@/interfaces/uniswap.interface";
import { useMemo, useState } from "react";
import PoolDetail from "./PoolDetail";
import { formatAmount } from "@/utils/format";
import { TPoolSortBy, convertToPoolData, fetchPools } from "@/lib/pools";

export interface PoolListProps {
  itemsPerPage: number;
  pools: IPoolData[];
  total: number;
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

function PoolFilter() {
  return <></>;
}

function toSortParam(field: string): TPoolSortBy {
  switch (field) {
    case "TVL":
      return "tvlUSD";
    case "Vol(24H)":
      return "volUSD24H";
    case "Vol(7D)":
      return "volUSD7D";
    case "Vol(14D)":
      return "volUSD14D";
    case "Fee(24H)":
      return "feeUSD24H";
    case "Fee(7D)":
      return "feeUSD7D";
    case "Fee(14D)":
      return "feeUSD14D";
    case "%FeeAPY(24H)":
      return "feeApy24H";
    case "%FeeAPY(7D)":
      return "feeApy7D";
    case "%FeeAPY(14D)":
      return "feeApy14D";
  }
  throw new Error("invalid field:" + field);
}

function PoolList(props: PoolListProps) {
  const [data, setData] = useState<{ nodes: IPoolData[] }>({
    nodes: props.pools,
  });
  const [total, setTotal] = useState<number>(props.total);

  const fileds = [
    "TVL",
    "Vol(24H)",
    "Vol(7D)",
    "Vol(14D)",
    "Fee(24H)",
    "Fee(7D)",
    "Fee(14D)",
    "%FeeAPY(24H)",
    "%FeeAPY(7D)",
    "%FeeAPY(14D)",
  ];
  const [sortKey, setSortKey] = useState({ field: "TVL", order: "desc" });
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

    let resp = await fetchPools({
      sortBy: toSortParam(newSortKey.field),
      order: newSortKey.order,
    });

    const total = resp.total;
    const pools = resp.apyList.map((item: any) => {
      // console.log('logo:', item.baseToken.logoURI)
      return convertToPoolData(item);
    });
    setSortKey({ ...newSortKey });
    setData({ nodes: pools });
    setTotal(total);
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

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <PoolFilter />
      </div>

      <div></div>

      <div className="flex flex-col justify-between items-center">
        <div>
          <Table data={data} theme={theme}>
            {(tableList: any) => (
              <>
                <Header>
                  <HeaderRow>
                    <HeaderCell className="text-sm">Pool</HeaderCell>
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

                    <HeaderCell
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
                    </HeaderCell>

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
                    <HeaderCell
                      className="text-sm"
                      onClick={() => onFieldSort("%FeeAPY(14D)")}
                    >
                      <SortNameAndArrow
                        name="%FeeAPY(14D)"
                        showName="%fAPY(14D)"
                      />
                    </HeaderCell>
                  </HeaderRow>
                </Header>

                <Body>
                  {tableList.map((item: any, idx: any) => (
                    <Row key={idx} item={item}>
                      <Cell
                        title={
                          item.chainDex.chainName + " " + item.chainDex.dexName
                        }
                      >
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
                      </Cell>

                      <Cell>{formatAmount(item.tvlUSD)}</Cell>
                      <Cell>{formatAmount(item.volume24H)}</Cell>
                      <Cell>{formatAmount(item.fee24H)}</Cell>
                      <Cell>{formatAmount(item.volume7D)}</Cell>
                      <Cell>{formatAmount(item.fee7D)}</Cell>
                      <Cell>{formatAmount(item.volume14D)}</Cell>
                      <Cell>{formatAmount(item.fee14D)}</Cell>
                      <Cell>{formatAmount(item.feeApy24H)}</Cell>
                      <Cell>{formatAmount(item.feeApy7D)}</Cell>
                      <Cell>{formatAmount(item.feeApy14D)}</Cell>
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
              <div className="px-2">Prev</div>
              <div className="px-2">Next</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoolList;
