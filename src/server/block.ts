import { gql } from "@apollo/client";
import { getGraphClient } from "./client";
import { queryAll } from "./poolData";
import { now } from "./utils";

export async function getLatestBlockNumber(chainId: number): Promise<number> {
  const client = getGraphClient(chainId, "block");

  const resp = await client.query({
    query: gql`
      query blocks {
        blocks(orderBy: number, orderDirection: desc, first: 1) {
          number
          timestamp
        }
      }
    `,
  });

  if (resp.errors) {
    console.log(`query chain ${chainId} block number failed: ${resp.errors}`);
    return 0;
  }
  const blocks = resp.data["blocks"];
  if (!blocks || blocks.length === 0) {
    console.log(`query chain ${chainId} block number: empty data`);
    return 0;
  }

  return +resp.data["blocks"][0].number;
}

export async function getBlockTimestamp(chainId: number, block: number) {
  const client = getGraphClient(chainId, "block");

  const blocks = await queryAll(
    client,
    gql`
      query blocks($skip: Int!, $blockNumber: BigInt!) {
        blocks(
          orderBy: number
          orderDirection: asc
          first: 1000
          skip: $skip
          where: { number_gte: $blockNumber }
        ) {
          number
          timestamp
        }
      }
    `,
    {blockNumber: block},
    "blocks"
  );

  if (!blocks) {
    console.log(`getBlockTimestamp: query chain ${chainId} block after ${block} timestamp failed: null data`);
    return [];
  }

  // console.log(`${now()} getBlockTimestamp: query chain ${chainId} block after ${block}: ${blocks.length}`)
  return blocks;
}

// console.log(await getLatestBlockNumber(1))
// console.log((await getBlockTimestamp(1, 190000)).length)
