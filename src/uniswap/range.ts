import BigNumber from "bignumber.js";

// 非常重要, 否则 bn 在计算pow时会保留所有精度, 运算速度极慢
BigNumber.config({ DECIMAL_PLACES: 60, POW_PRECISION: 60 });

const q96 = BigNumber(2).pow(96);
const tickBasePrice = 1.0001;
const bnTickBase = BigNumber(tickBasePrice);
const basePrecision = BigNumber(10).pow(18);
const bnZero = BigNumber(0);
const bn10 = BigNumber(10);

interface IOutOfRangeResut {
  amount: number;
  usd: number;
}

export type TFeeTier = 100 | 500 | 3000 | 10000;

// cprice: 当前价格, 例如 2300
// eprice: 看空期权执行价格, 例如 2200
// initAmount: 初始总投入金额, usd本位, 例如 1000
//
// 计算超出区间时, 均价, 数量
function calcOutOfRange(
  cprice: number,
  eprice: number,
  initUSDBalance: number,
  feeTier: TFeeTier,
  decimal = 18
): IOutOfRangeResut[] {
  let { price: midPrice, tick: midTick } = accuratedPrice(cprice, feeTier);
  let { price: lowerPrice, tick: lowerTick } = accuratedPrice(eprice, feeTier);
  console.log(midPrice, midTick);
  console.log(lowerPrice, lowerTick);

  const liquidity = 0;
  // 初始 xy 数量
  const initBalance = BigNumber(initUSDBalance).times(basePrecision);
  const initAmount = initBalance.div(midPrice).div(2); // 一半价值的币提供流动性
  // 保证不亏钱时, 按照执行价格需要多少个币
  const excuteAmount = initBalance.div(eprice);
  // 当价格跌到多少时, 我得到这么多币

  return [];
}

// def price_to_sqrtp(p):
//     return int(math.sqrt(p) * q96)
//
// price_to_sqrtp(5000)
// > 5602277097478614198912276234240

function priceToSqrtPrice(price: number | string | BigNumber) {
  return BigNumber(price).sqrt().times(q96);
}

// 根据 tick 修正后的价格
function accuratedPrice(
  price: number,
  feeTier: TFeeTier
): { tick: number; price: number } {
  let tick = Math.round(Math.log(price) / Math.log(tickBasePrice));
  const tickSpacing = getTickSpacing(feeTier);
  const tickLower = Math.floor(tick / tickSpacing) * tickSpacing;
  const tickHigher = tickLower + tickSpacing;
  const priceLower = Math.pow(tickBasePrice, tickLower);
  const priceHigher = Math.pow(tickBasePrice, tickHigher);

  if (price - priceLower > priceHigher - price) {
    return { tick: tickHigher, price: priceHigher };
  }

  return { tick: tickLower, price: priceLower };
}

// uniswap v3 的 tick spacing
function getTickSpacing(feeTier: TFeeTier) {
  switch (feeTier) {
    case 100:
      return 1;
    case 500:
      return 10;
    case 3000:
      return 60;
    case 10000:
      return 200;
  }
  throw new Error("invalid feeTier");
}

// 在 tick 时 的 sqrtPrice * 2**96
function getSqrtRatioAtTick(tick: number) {
  return BigNumber(tickBasePrice).pow(tick).sqrt().times(q96);
}

// console.log('calcOutOfRange:', calcOutOfRange(2300, 2200, 1000, 100));

function equation(delta: any, y2: any, y: any, tickMid: any) {
  const base = tickBasePrice;
  return (
    (y2 - y) * Math.sqrt(Math.pow(base, tickMid - delta)) +
    y * Math.sqrt(Math.pow(base, tickMid + delta)) -
    y2 * Math.sqrt(Math.pow(1.0001, tickMid))
  );
}

function solveDelta(initAmout: number, finalAmount: number) {
  var initialGuess = 0.1;

  // 提供其他常数或变量的值
  var y2Value = finalAmount;
  var yValue = initAmout;
  var baseValue = tickBasePrice; /* your value */
  var tickMidValue = 2300; /* your value */

  // 调用 fsolve 求解方程
  // const math =create(all)
  const math = require("mathjs");
  // console.log('math:', math)
  console.log(math.evaluate("sqrt(3^2 + 4^2)"));
  // var deltaSolution = math.solver(equation, [initialGuess], {y2: y2Value, y: yValue, tickMid: tickMidValue});
  // console.log('delta:', deltaSolution)
}

// solveDelta(0.5, (0.5 * 2300) / 2200);

function calcRightValue(y2: BigNumber, tickMid: number) {
  return BigNumber(y2).times(BigNumber(tickBasePrice).pow(tickMid).sqrt());
}

function calcLeftValue(
  y2: BigNumber,
  y: BigNumber,
  tickMid: number,
  delta: number
) {
  const v1 = BigNumber(y2)
    .minus(y)
    .times(
      BigNumber(tickBasePrice)
        .pow(tickMid - delta)
        .sqrt()
    );
  const v2 = BigNumber(y).times(
    BigNumber(tickBasePrice).pow(tickMid).plus(delta).sqrt()
  );
  return v1.plus(v2);
}

// 计算 价格下跌后得到的 x
// x2 = x1 * (1/sqrt(low) - 1/sqrt(upper)) / [1/sqrt(mid) - 1/sqrt(upper)]
function calcX(x1: BigNumber, midTick: number, delta: number) {
  const lowTick = midTick - delta;
  const upperTick = midTick + delta;
  const spl = BigNumber(1).div(bnTickBase.pow(lowTick).sqrt());
  const spm = BigNumber(1).div(bnTickBase.pow(midTick).sqrt());
  const spu = BigNumber(1).div(bnTickBase.pow(upperTick).sqrt());

  return x1.times(spl.minus(spu)).div(spm.minus(spu));
}

// calculate liquidity by token X, current price and price range
function calcLiquidityX(
  cprice: number | string | BigNumber,
  range: (number | string | BigNumber)[],
  amountX: number | string | BigNumber,
  decimals = [18, 18]
) {
  if (BigNumber(cprice).gt(range[1])) {
    // current price great than price range, all liquidity is provide by token Y (ex. usd)
    console.assert(
      BigNumber(amountX).eq(0),
      "cprice great than price range, amountX should be 0"
    );
    return bnZero;
  }
  if (BigNumber(amountX).eq(0)) {
    throw new Error("amount X should great than 0");
  }

  let spl: BigNumber;
  if (BigNumber(cprice).lt(range[0])) {
    // current price out of range
    console.log(
      "calcLiquidityX: current price less than low price range, use low price range"
    );
    spl = priceToSqrtPrice(range[0]);
  } else {
    // L = amountX * [sqrt(l)*sqrt(h)/(sqrt(h) - sqrt(l))]
    spl = priceToSqrtPrice(cprice);
  }
  const sph = priceToSqrtPrice(range[1]);
  return BigNumber(amountX)
    .times(bn10.pow(decimals[0]))
    .times(sph)
    .times(spl)
    .div(sph.minus(spl))
    .div(q96);
}

// calculate liquidity by token Y, current price and price range
function calcLiquidityY(
  cprice: number | string | BigNumber,
  range: (number | string | BigNumber)[],
  amountY: number | string | BigNumber,
  decimals = [18, 18]
) {
  // L = amountY / [sqrt(ph) - sqrt(l)]
  if (BigNumber(cprice).lt(range[0])) {
    // current price less than price range, all liquidity is provide by token X (ex. ETH)
    const errmsg = `cprice ${cprice} less than price range([${range[0]}, ${range[1]}]), amountY should be 0`;
    console.assert(BigNumber(amountY).eq(0), errmsg);
    return bnZero;
  }

  if (BigNumber(amountY).eq(0)) {
    throw new Error("amount Y should great than 0");
  }
  let sph: BigNumber;
  if (BigNumber(cprice).gt(range[1])) {
    // current price out of range
    console.log(
      "calcLiquidityY: current price great than high price range, use high price range"
    );
    sph = priceToSqrtPrice(range[1]);
  } else {
    sph = priceToSqrtPrice(cprice);
  }

  const spl = priceToSqrtPrice(range[0]);
  return BigNumber(amountY)
    .times(bn10.pow(decimals[1]))
    .times(q96)
    .div(sph.minus(spl));
}

// calculate liquidity by current price, price range and token amount
function calcLiquidity(
  cprice: number | string | BigNumber,
  range: (number | string | BigNumber)[],
  tokenAmount: (number | string | BigNumber)[],
  decimals = [18, 18]
): BigNumber {
  // if (tokenAmount[0] && tokenAmount[1]) {
  //     // price = tokenAmount[1] / tokenAmount[0]
  //     const price = BigNumber(tokenAmount[1]).div(tokenAmount[0])
  //     // price 与 cprice 偏差不应该太大
  //     if (price.minus(cprice).abs().div(price).gt( 0.01)) {
  //         throw new Error('cprice derivate too many from tokenAmount ratio')
  //     }
  // }

  const l0 = calcLiquidityX(cprice, range, tokenAmount[0], decimals);
  const l1 = calcLiquidityY(cprice, range, tokenAmount[1], decimals);

  if (!l0) return l1;

  if (!l1) return l0;

  // console.log(`liquidity x: ${l0}, liquidity y: ${l1}`);
  return l0.gt(l1) ? l1 : l0;
}

// calculate token amount at new price
function calcTokenAmountAtPrice(
  l: BigNumber,
  price: number | string | BigNumber,
  range: (number | string | BigNumber)[],
  decimals = [18, 18]
) {
  // l = l.times(q96)
  if (BigNumber(price).gte(range[1])) {
    price = range[1];
    // price rise up, all x sell to y
    const amountX = bnZero;
    const amountY = l
      .times(priceToSqrtPrice(price).minus(priceToSqrtPrice(range[0])))
      .div(q96)
      .div(bn10.pow(decimals[1]));
    return [amountX, amountY];
  }
  if (BigNumber(price).lte(range[0])) {
    // price go down, all y buy to x
    price = range[0];
    const amountY = bnZero;
    const spl = priceToSqrtPrice(price);
    const sph = priceToSqrtPrice(range[1]);
    const amountX = l
      .times(q96)
      .times(sph.minus(spl))
      .div(sph.times(spl))
      .div(bn10.pow(decimals[0]));
    return [amountX, amountY];
  }

  // in range
  // L = amountX * [sqrt(c)*sqrt(h)/(sqrt(h) - sqrt(c))]
  // amountX = L / [sqrt(c)*sqrt(h)/(sqrt(h) - sqrt(c))]
  //
  // L = amountY / [sqrt(ph) - sqrt(l)]
  // amountY = L * [sqrt(ph) - sqrt(l)]
  const spl = priceToSqrtPrice(range[0]);
  const sph = priceToSqrtPrice(range[1]);
  const spc = priceToSqrtPrice(price);
  const amountX = l
    .times(q96)
    .times(sph.minus(spc))
    .div(sph.times(spc))
    .div(bn10.pow(decimals[0]));
  const amountY = l.times(spc.minus(spl)).div(q96).div(bn10.pow(decimals[1]));

  return [amountX, amountY];
}

function calcPriceRangeLower(
  cprice: number | string | BigNumber,
  upper: number | string | BigNumber,
  tokenAmount: (number | string | BigNumber)[],
  decimals = [18, 18]
): BigNumber {
  if (BigNumber(cprice).gte(upper)) {
    throw new Error("current price great than upper price");
  }

  // liquidity x
  const lx = calcLiquidityX(cprice, [cprice, upper], tokenAmount[0], decimals);

  // L = amountY / [sqrt(ph) - sqrt(pl)]
  // [sqrt(ph) - sqrt(pl)] = amountY/L
  // sqrt(l) = sqrt(ph)-amountY/L
  // pl = [sqrt(ph)-amountY/L]2
  const spc = priceToSqrtPrice(cprice);
  const amountYDivL = bn10
    .pow(decimals[1])
    .times(tokenAmount[1])
    .times(q96)
    .div(lx);
  const spl = spc.minus(amountYDivL);
  // console.log(`calcPriceRangeLower: spc=${spc}, amountYDivL=${amountYDivL} spl=${spl}`)
  return spl.div(q96).pow(2);
}

function calcPriceRangeUpper(
  cprice: number | string | BigNumber,
  lower: number | string | BigNumber,
  tokenAmount: (number | string | BigNumber)[],
  decimals = [18, 18]
) {
  if (BigNumber(cprice).lte(lower)) {
    throw new Error("current price less than lower price");
  }

  const ly = calcLiquidityY(
    cprice,
    [lower, cprice],
    tokenAmount[1],
    decimals
  ).times(q96);

  // L = amountX * [sqrt(c)*sqrt(h)/(sqrt(h) - sqrt(c))]
  // amountX = L / [sqrt(c)*sqrt(h)/(sqrt(h) - sqrt(c))]
  // l/amountX = [sqrt(c)*sqrt(h)/(sqrt(h) - sqrt(c))]
  // (sqrt(h) - sqrt(c)) * amountX/l = sqrt(c)*sqrt(h)
  // sqrt(h) * amountX/l - sqrt(c)) * amountX/l = sqrt(c)*sqrt(h)
  // (amountX/l - sqrt(c)) sqrt(h) = sqrt(c)) * amountX/l
  // sqrt(h) = sqrt(c)) * amountX/l / (amountX/l - sqrt(c))

  const spc = priceToSqrtPrice(cprice);
  const lDivAmountX = ly.div(bn10.pow(decimals[0]).times(tokenAmount[0]));
  const sph = spc.times(lDivAmountX).div(lDivAmountX.minus(spc));
  // console.log(`calcPriceRangeUpper: spc=${spc}, lDivAmountX=${lDivAmountX} sph=${sph}`)

  return sph.div(q96).pow(2);
}

// cprice: 当前价格
// nprice: 新价格
// range: LP的价格区间
// tokenAmount: 当前token数量, 可以只提供一种
function calcTokenAmountOnPriceChange(
  cprice: number | string | BigNumber,
  nprice: number | string | BigNumber,
  range: (number | string | BigNumber)[],
  tokenAmount: (number | string | BigNumber)[],
  decimals = [18, 18]
) {
  const l = calcLiquidity(cprice, range, tokenAmount, decimals);

  return calcTokenAmountAtPrice(l, nprice, range, decimals);
}

// y2:
// y:
function findBestDelta(
  price: number,
  eprice: number,
  amount: number,
  feeTier: TFeeTier,
  token = "ETH"
) {
  const { price: midPrice, tick: tickMid } = accuratedPrice(price, feeTier);
  const y = BigNumber(amount).div(2).div(midPrice);
  const y2 = BigNumber(amount).div(eprice).div(2).plus(y);

  console.log(BigNumber(tickBasePrice).pow(200)); // .pow(tickMid))

  console.log("tick current:", tickMid);
  // const rv = calcRightValue(y2, tickMid)
  const tickSpacing = getTickSpacing(feeTier);

  let prevDiff: BigNumber = BigNumber(0).minus(y2);
  let bestDelta = 0;

  for (let i = 1; i < 10000; i++) {
    const delta = i * tickSpacing;
    const lv = calcX(y, tickMid, delta);
    const diff = lv.minus(y2);

    if (diff.eq(0)) {
      console.log(`diff is 0: delta=${delta}`);
      bestDelta = delta;
      break;
    }
    if (prevDiff.lt(0) && diff.gt(0)) {
      console.log(`got break point: delta=${delta}`);
      if (prevDiff.abs().lt(diff)) {
        bestDelta = delta - tickSpacing;
      } else {
        bestDelta = delta;
      }
      break;
    }

    prevDiff = diff;
    // console.log("delta:", delta, diff)
  }
  const lowCrossPrice = bnTickBase.pow(tickMid - bestDelta);
  const upperCrossPrice = bnTickBase.pow(tickMid + bestDelta);
  console.log(
    `initial invest: ${amount} USD\ninitial price: ${midPrice}\noption execute price: ${eprice}\n` +
      "--------------------------------------\n" +
      `cross price range: [${lowCrossPrice}, ${upperCrossPrice}]\ninitial ${token} amount: ${y}\nfinal ${token} amount: ${y2}`
  );
}

// findBestDelta(42191, 41000, 500, 100, "BNB");

// const tokenAmounts = ["0.25", "1500"]; // 0.836144305852
// const decimals = [18, 18];
// console.log('price range upper:', calcPriceRangeUpper(2000, 1400, tokenAmounts, decimals))

// console.log(calcTokenAmountOnPriceChange(2000, 1800, [1400, 2236], tokenAmounts))
// //console.log()

/*
const tokenAmounts = ["0.5", "1000"];0.836144305852
const decimals = [18, 6];
console.log(
  "price range lower:",
  calcPriceRangeLower(2000, 2200, tokenAmounts, decimals)
);
console.log(
  "price range upper:",
  calcPriceRangeUpper(2000, 1800, tokenAmounts, decimals)
);
// console.log('price range upper:', calcPriceRangeUpper(2000, 2222, tokenAmounts, decimals))
console.log(
  calcTokenAmountOnPriceChange(
    2000,
    1800,
    [1800, 2222],
    ["0.5", "1000"],
    decimals
  )
);
console.log(
  calcTokenAmountOnPriceChange(
    2000,
    2222,
    [1800, 2222],
    ["0.5", "1000"],
    decimals
  )
);
*/

//
// 1519437308014769733632
// 1517882343751509868544
/*
x1 = liquidity / sqrt(mid) - liquidity / sqrt(upper)
x2 = l / sqrt(low) - l / sqrt(upper)

x1/x2 = [1/sqrt(mid) - 1/sqrt(upper)] / (1/sqrt(low) - 1/sqrt(upper))
x2 = x1 * (1/sqrt(low) - 1/sqrt(upper)) / [1/sqrt(mid) - 1/sqrt(upper)]

x1(1/sqrt(low) - 1/sqrt(upper)) = x2(1/sqrt(mid) - 1/sqrt(upper))


// y1: eth 数量
y1 = liquidity * (sqrt(mid) - sqrt(lower))
y2 = liquidity * (sqrt(upper) - sqrt(lower))

y/y2 = [(sqrt(mid) - sqrt(lower))] / [(sqrt(upper) - sqrt(lower))]

y[(sqrt(upper) - sqrt(lower))] = y2[(sqrt(mid) - sqrt(lower))]

(y2-y)*sqrt(lower) + y*sqrt(upper) = y2*sqrt(mid)

(y2-y)*sqrt(lower) + y*sqrt(upper) = y2 * sqrt(mid)

sqrt(lower) = sqrt(1.0001**tickLower) * q64
sqrt(upper) = sqrt(1.0001**tickHigh) * q64
sqrt(mid) = sqrt(1.0001**tickMid) * q64

(y2-y)*sqrt(base**tickLower) + y*sqrt(base**tickHigh) = y2*sqrt(1.0001**tickMid)

(y2-y)*sqrt(base**(tickMid-delta)) + y*sqrt(base**(tickMid+delta)) = y2*sqrt(1.0001**tickMid)
delta: 880 -0.00009146711377573175
delta: 890  0.00002214623670168481
*/

export {
  priceToSqrtPrice,
  getSqrtRatioAtTick,
  calcTokenAmountOnPriceChange,
  calcLiquidity,
  calcLiquidityX,
  calcLiquidityY,
  calcPriceRangeUpper,
  calcPriceRangeLower,
  calcTokenAmountAtPrice,
};
