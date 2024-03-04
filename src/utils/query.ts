import dayjs from "dayjs";

// block number before 24H
// block number before 1 Week
// block number before 1 Month
export function getDeltaTimestamps(): [number, number, number] {
  const utcCurrentTime = dayjs();

  const t1 = utcCurrentTime.subtract(1, "day").startOf("minute").unix();
  const tWeek = utcCurrentTime.subtract(1, "week").startOf("minute").unix();
  const tMonth = utcCurrentTime.subtract(1, "month").startOf("minute").unix();
  return [t1, tWeek, tMonth];
}

export const query = async (endpoint: string, query: any): Promise<any> => {
  const uri = (process.env.NEXT_PUBLIC_API || 'https://api.poolguru.xyz') + endpoint

  console.log(`query uri: ${uri}`)
  const resp = await fetch(uri, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
    },
    cache: 'no-cache',
    body: JSON.stringify(query),
  });

  // console.log('resp:', resp)
  if (resp.status !== 200) {
    console.log("query failed:", uri, query);
    console.log("invalid resp:", resp);
    throw new Error("invalid response status: " + resp.status);
  }

  const data = await resp.json();
  if (data.code !== 200) {
    console.error(`query ${uri} failed:`, data.message);
    throw new Error(`query failed: ${data.message}`);
  }

  // console.log('response data:', data.data.apyList[0])
  return data.data;
};
