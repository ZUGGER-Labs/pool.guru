import { Pool } from "@/interfaces/uniswap.interface";
import { getRedisPools } from "@/uniswap/token";
import { ChainId } from "@uniswap/sdk-core";
import { PublicClient, createPublicClient, http, parseAbiItem } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
} from "viem/chains";

// get pool tvl

function getPublicClient(chainId: number) {
  let chain;
  switch (chainId) {
    case ChainId.MAINNET:
      chain = mainnet;
      break;
    case ChainId.BNB:
      chain = bsc;
      break;
    case ChainId.AVALANCHE:
      chain = avalanche;
      break;
    case ChainId.BASE:
      chain = base;
      break;
    case ChainId.ARBITRUM_ONE:
      chain = arbitrum;
      break;
    case ChainId.POLYGON:
      chain = polygon;
      break;
    case ChainId.OPTIMISM:
      chain = optimism;
      break;
    default:
      throw new Error("unsupport chainId: " + chainId);
  }

  return createPublicClient({
    chain: chain,
    transport: http(),
  });
}

async function balanceOf(client: PublicClient, token: string, pool: string) {
  const abiItem = [
    parseAbiItem(
      //  ^? const abiItem: { name: "balanceOf"; type: "function"; stateMutability: "view";...
      "function balanceOf(address owner) view returns (uint256)"
    ),
  ];

  const res = await client.readContract({
    address: token as `0x{string}`,
    abi: abiItem,
    functionName: "balanceOf",
    args: [pool as `0x{string}`],
  });
  return res
}

// 从链上获取 pool 合约的 token 数量
async function getPoolTokens(chainId: number, pools: Pool[], maxPerCall = 500) {
  const client = getPublicClient(chainId);
  const abiItem = [
    parseAbiItem(
      //  ^? const abiItem: { name: "balanceOf"; type: "function"; stateMutability: "view";...
      "function balanceOf(address owner) view returns (uint256)"
    ),
  ];

  const contracts = [];
  for (let p of pools) {
    contracts.push({
      address: p.token0.id as `0x{string}`,
      abi: abiItem,
      functionName: "balanceOf",
      args: [p.id],
    });
    contracts.push({
      address: p.token1.id as `0x{string}`,
      abi: abiItem,
      functionName: "balanceOf",
      args: [p.id],
    });
  }
  const queries = [];
  for (let i = 0; i < contracts.length; i += maxPerCall) {
    queries.push(contracts.slice(i, maxPerCall + i));
  }
  console.log(`split to contract call to ${queries.length}`);

  const resList = await Promise.all(
    queries.map((q) => client.multicall({ contracts: q }))
  );
  const res = resList.flat();

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const item0 = res[2 * i],
      item1 = res[2 * i + 1];

    if (item0.status === "success") {
      pool.token0Amount = item0.result;
    } else {
      // todo
      const pool = pools[Math.floor(i / 2)];
      const amount = await balanceOf(client, pool.token0.id, pool.id)
      console.log(
        `get contract balanceOf failed: token0=${pool.token0.id} pool=${pool.id} retry: amount=${amount}`
      );
      pool.token0Amount = amount
    }

    if (item1.status === "success") {
      pool.token1Amount = item1.result;
    } else {
      // todo
      const pool = pools[Math.floor(i / 2)];
      const amount = await balanceOf(client, pool.token1.id, pool.id)
      console.log(
        `get contract balanceOf failed: token1=${pool.token1.id} pool=${pool.id}`
      );
      pool.token1Amount = amount
    }
  }

  console.log(res.length);
}

// (async function () {
//   const chainId = 1;
//   let pools = await getRedisPools([chainId]);
//   console.log("got pools:", pools.length);

//   getPoolTokens(1, pools);
// })();

export { getPoolTokens };
