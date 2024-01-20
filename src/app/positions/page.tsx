import TokenItem from "@/components/common/TokenItem";
import { PositionColumnDataType } from "@/interfaces/uniswap.interface";
import { getPoolsByIdList } from "@/uniswap/graph";
import { getPositions, processPositions } from "@/uniswap/position";
import _ from "lodash";

async function Positions() {
  const chainId = 1;
  const positions = await getPositions(chainId, {orderBy: 'liquidity', orderDirection: 'desc', total: 30});
  const pools = _.keyBy(positions, (p) => p.pool? p.pool.id: '')
  const uniquePools = _.size(pools)
  const idList = _.keys(pools)
  const {ethPriceUSD, pools: poolDatas} = await getPoolsByIdList(chainId, idList)
  const poolsMap = _.keyBy(poolDatas, (p) => p.id)

  console.log('positions:', positions)
  console.log('ethPriceUSD:', ethPriceUSD, idList.length, poolDatas.length)
  // console.log('pools Data:', poolDatas)
  const processedPositions: PositionColumnDataType[] = processPositions(chainId, +ethPriceUSD, positions, poolsMap)

  return (
    <div>
      <h1>Positions</h1>
      <h1>Total: {positions.length} {uniquePools}</h1>
      <table>
        <thead>
          <tr>
            <td>ID</td>
            <td>Pool</td>
            <td>Pair</td>
            <td>Liquidity</td>
            <td>TVL(USD)</td>
            <td>totalFee(USD)</td>
            <td>APY</td>
          </tr>
        </thead>

        <tbody>
          {processedPositions.map((p) => {
            return <tr key={p.key}>
                <td>{p.positionId}</td>
                <td>{p.pool?.id || ''}</td>
                <td><TokenItem token={p.pool!.token0} /> <TokenItem token={p.pool!.token1} /></td>
                <td>{p.liquidity.toString()}</td>
                <td>{p.assetUSD}</td>
                <td>{p.totalFeeUSD}</td>
                <td>{p.apr}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Positions;
