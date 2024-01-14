// get blocknumber by timestamp

import { getBlockQueryEndpoint } from "@/lib/network";
import _query from "./query";
import { getDeltaTimestamps } from "@/utils/query";

export const GET_BLOCK_BY_TIMESTAMP = (timestamp: string | number) => {
  return `query blocks {
        blocks(first: 1, orderBy: timestamp, orderDirection: asc, where: { timestamp_gt: "${timestamp}", timestamp_lt: "${(+timestamp) + 600}" }) {
          number
        }
    }`;
};

async function getBlockByTimestamp(chainId: number, timestamp: string | number) {
    const endpoint = getBlockQueryEndpoint(chainId)

    const resp = await _query(endpoint, GET_BLOCK_BY_TIMESTAMP(timestamp))
    // console.log('block resp:', resp)
    return +resp.blocks[0].number
}

async function getBlock24H(chainId: number) {
  const [t24h] = getDeltaTimestamps()

  return getBlockByTimestamp(chainId, t24h)
}

export { getBlockByTimestamp, getBlock24H }
