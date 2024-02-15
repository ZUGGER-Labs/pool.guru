import { gql } from "@apollo/client";
import { getGraphClient } from "./client";

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
    console.log(`query chain ${chainId} block number failed: ${resp.errors}`)
    return 0
  }
  const blocks = resp.data['blocks']
  if (!blocks || blocks.length === 0) {
    console.log(`query chain ${chainId} block number: empty data`)
    return 0
  }

  return +resp.data['blocks'][0].number
}

// console.log(await getLatestBlockNumber(1))
