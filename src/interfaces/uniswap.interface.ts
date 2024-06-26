import BigNumber from "bignumber.js";

export interface Network {
  id: string;
  chainId: number;
  name: string;
  desc: string;
  logoURI: string;
  disabled?: boolean;
  isNew?: boolean;
  error?: string;
  subgraphEndpoint: string;

  // for pool overview
  totalValueLockedUSD_gte: number;
  volumeUSD_gte: number;
  disabledTopPositions?: boolean;
}

export interface Tick {
  tickIdx: string;
  liquidityNet: string;
  price0: string;
  price1: string;
}

interface TokenDayData {
  priceUSD: string;
}

interface ITokenOHCL {
  tokenId: string;
  high: string | number;
  close: string | number;
  open: string | number;
  low: string | number;
  startTs: string | number;
  hour: number;
}

export interface Token {
  chainId?: string | number
  id: string;
  name: string;
  symbol: string;
  volumeUSD: string;
  logoURI: string;
  decimals: string;

  // For pool overview
  tokenDayData?: TokenDayData[];
  totalValueLockedUSD: string;
  poolCount: number;

  derivedETH?: number
  priceUSD?: number
  alias?: string

  // For select assests
  latestPrice: number;
  prices7d: ITokenOHCL[];
  change7d: number;
  isLoading: boolean;
}

export interface PoolDayData {
  date: number;
  volumeUSD: string;
  feesUSD: string
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface PoolDailyData {
  dailyVolumeUSD: string // "16526422.90186559656843213099466",
  dailyTotalRevenueUSD: string // "49579.26870559678970529639298403",
  dailyVolumeByTokenUSD?: string[],
  day: number,
  totalValueLockedUSD: string, // "218991647.2802760685152789455778981",
  totalLiquidity: string, // "1743527678474047750",
  dailySupplySideRevenueUSD: string //
}

export type PoolVolumeFeeData = {
  fees24h: string | number
  volume24h: string | number
  fees7d: string | number
  volume7d: string | number
  fees30d: string | number
  volume30d: string | number
}

export interface Pool {
  id: string;
  feeTier: string;
  liquidity: string;
  tick: string;
  sqrtPrice: string;
  createdAtTimestamp: string;
  token0Price: string;
  token1Price: string;
  feeGrowthGlobal0X128: string;
  feeGrowthGlobal1X128: string;

  // For pool overview
  token0: Token;
  token1: Token;
  token0Amount?: bigint // for calculate tvl
  token1Amount?: bigint // for calculate tvl
  volumeUSD: string;
  feesUSD: string;
  txCount: string;
  totalValueLockedUSD: string;
  // tvlContract?: BigNumber
  apyBy1d?: BigNumber
  apyBy7d?: BigNumber
  apyBy30d?: BigNumber
  volume1D?: string
  volume7D?: string
  volume30D?: string
  avgFee1D?: number
  avgFee7D?: number
  avgFee30D?: number
  poolDayData: PoolDayData[];
  
  volFeeData?: PoolVolumeFeeData
}

export interface LiquidityPool {
  chainId?: number
  id: string;
  feeTier: string;
  tick: string;
  sqrtPrice?: string;
  token0Price: string;
  token1Price: string;
  feeGrowthGlobal0X128?: string;
  feeGrowthGlobal1X128?: string;
  activeLiquidity: string
  totalLiquidity: string

  // For pool overview
  inputTokens: Token[];
  totalValueLockedUSD: string;
  // tvlContract?: BigNumber
  apyBy1d?: BigNumber
  apyBy7d?: BigNumber
  apyBy30d?: BigNumber
  volume1D?: string
  volume7D?: string
  volume30D?: string
  avgFee1D?: number
  avgFee7D?: number
  avgFee30D?: number
  impermanentLoss1d?: BigNumber
  impermanentLoss7d?: BigNumber
  impermanentLoss30d?: BigNumber
  // poolDayData: PoolDayData[];
  dailySnapshots: PoolDailyData[];
  poolDayData?: PoolDayData[];
  fees: {feePercentage: string}[]

  price?: PriceOpenClose
}

export type PriceOpenClose = {
  open1D: string | BigNumber;
  close1D: string | BigNumber;
  open7D: string | BigNumber;
  close7D: string | BigNumber;
  open30D: string | BigNumber
  close30D: string | BigNumber
}

export interface Position {
  id: string;
  owner?: string;
  pool?: {id: string};
  tickLower: {
    tickIdx: string;
    feeGrowthOutside0X128: string;
    feeGrowthOutside1X128: string;
  };
  tickUpper: {
    tickIdx: string;
    feeGrowthOutside0X128: string;
    feeGrowthOutside1X128: string;
  };
  depositedToken0: string;
  depositedToken1: string;
  liquidity: string;
  transaction: {
    timestamp: string;
  };
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
}

export enum PositionStrategy {
  LONG = "LONG",
  MIDDLE = "MIDDLE",
  SHORT = "SHORT",
}

export interface PositionColumnDataType {
  key: string;
  positionId: string;
  isActive: boolean;
  strategy: PositionStrategy;
  roi: number;
  apr: number;
  liquidity: bigint;
  priceRange: {
    lower: number;
    upper: number;
    current: number;
  };
  createdAt: number;

  // Additional data
  maxDailyPriceFluctuation?: number;
  maxWeeklyPriceFluctuation?: number;
  token0Amount: number;
  token1Amount: number;
  token0Price: number;
  token1Price: number;
  totalFeeUSD: number;
  claimedFee0: number;
  claimedFee1: number;
  unclaimedFee0: number;
  unclaimedFee1: number;
  hourlyFeeUSD: number;

  // Filtering data
  unclaimedROI: number;

  // liquidity convert to USD
  // token0Amount * token0Price(USD) + token1Amount * token1Price(USD)
  assetUSD: number
  pool?: Pool
  position?: Position
}

