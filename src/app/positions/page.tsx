import { getPoolsByIdList } from "@/uniswap/graph";
import { getPositions } from "@/uniswap/position";
import _ from "lodash";

async function Positions() {
  const chainId = 1;
  const positions = await getPositions(chainId, {orderBy: 'liquidity', orderDirection: 'desc', total: 300});
  const pools = _.keyBy(positions, (p) => p.pool? p.pool.id: '')
  const uniquePools = _.size(pools)
  const idList = _.keys(pools)
  const {ethPriceUSD, pools: poolDatas} = await getPoolsByIdList(chainId, idList)

  console.log('ethPriceUSD:', ethPriceUSD, idList.length, poolDatas.length)
  // console.log('pools Data:', poolDatas)

  return (
    <div>
      <h1>Positions</h1>
      <h1>Total: {positions.length} {uniquePools}</h1>
      <table>
        <thead>
          <tr>
            <td>ID</td>
            <td>Pool</td>
            <td>Liquidity</td>
          </tr>
        </thead>

        <tbody>
          {positions.map((p) => {
            return <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.pool?.id}</td>
                <td>{p.liquidity}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Positions;
