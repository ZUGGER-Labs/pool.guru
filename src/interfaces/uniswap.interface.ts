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
  volumeUSD: string;
  feesUSD: string;
  txCount: string;
  totalValueLockedUSD: string;
  poolDayData: PoolDayData[];
  
  volFeeData?: PoolVolumeFeeData
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

