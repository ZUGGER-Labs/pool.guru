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

import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

import { LiquidityPool, Pool } from "@/interfaces/uniswap.interface";
import { useMemo, useState } from "react";
import PoolDetail from "./PoolDetail";
import { formatAmount } from "@/utils/format";

export interface PoolListProps {
  itemsPerPage: number;
  pools: IPoolData[];
  total: number
}

export interface IChainDEX {
  dexName: string;
  dexLogo: string;
  chainName: string;
  chainLogo: string;
}

export interface IPoolData {
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

function PoolList(props: PoolListProps) {
  const [data, setData] = useState<{ nodes: IPoolData[] }>({
    nodes: props.pools,
  });

  const theme = useTheme(getTheme());

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
                    <HeaderCell className="text-sm">TVL</HeaderCell>
                    <HeaderCell className="text-sm">Vol/Fee(24H)</HeaderCell>
                    <HeaderCell className="text-sm">Vol/Fee(7D)</HeaderCell>
                    <HeaderCell className="text-sm">Vol/Fee(14D)</HeaderCell>
                    <HeaderCell className="text-sm">%FeeAPY(24H)</HeaderCell>
                    <HeaderCell className="text-sm">%FeeAPY(7D)</HeaderCell>
                    <HeaderCell className="text-sm">%FeeAPY(14D)</HeaderCell>
                  </HeaderRow>
                </Header>

                <Body>
                  {tableList.map((item: any, idx: any) => (
                    <Row key={idx} item={item}>
                      <Cell title={item.chainDex.chainName + ' ' + item.chainDex.dexName} >
                        <div className="flex flex-row">
                        <img className="h-5" src={item.baseLogo} alt={item.baseName} title={item.baseName} />
                        <img className="h-5" src={item.quoteLogo} alt={item.quoteName} title={item.quoteName} />
                        </div>
                      </Cell>

                      <Cell>{formatAmount(item.tvlUSD)}</Cell>
                      <Cell>{formatAmount(item.volume24H)}/{formatAmount(item.fee24H)}</Cell>
                      <Cell>{formatAmount(item.volume7D)}/{formatAmount(item.fee7D)}</Cell>
                      <Cell>{formatAmount(item.volume14D)}/{formatAmount(item.fee14D)}</Cell>
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
        <div className="hidden md:block">
          <span>Showing {props.itemsPerPage} out of {props.total} pools</span>
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex flex-row">
            <div>Prev</div>
            <div>Page 1 of 10</div>
            <div>Next</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoolList;
