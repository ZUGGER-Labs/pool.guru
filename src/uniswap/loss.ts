// 无常损失
import BigNumber from "bignumber.js";
import { calcPriceRangeLower, calcPriceRangeUpper, calcTokenAmountOnPriceChange } from "./range";

const bn1 = BigNumber(1);

// uniswap v2 LP impermanet loss
// price0t0: token0 price at time0
// price0t1: token0 price at time1
function impermanentLossV2(
  price0t0: string,
  price0t1: string,
  quote: "token0" | "token1"
) {
  const price1t0 = bn1.div(price0t0);
  const price1t1 = bn1.div(price1t0);
  let a0t0, a1t0, a0t1, a1t1;

  if (BigNumber(price0t0).gt(1)) {
    a0t0 = BigNumber(1);
    a1t0 = BigNumber(price0t0);

    // a0t0*a1t0 = a0t1*a1t1
    // price0t1 = a1t1/a0t1
    // a1t1 = sqrt(price0t1 * a0t0 * a1t0)
    // a0t1 = sqrt(a0t0*a1t0/price0t1)
    a1t1 = BigNumber(price0t1).times(a0t0).times(a1t0).sqrt();
    a0t1 = BigNumber(a0t0).times(a1t0).div(price0t1).sqrt();
  } else {
    a0t0 = BigNumber(price1t0);
    a1t0 = BigNumber(1);
    // a0t0*a1t0 = a0t1*a1t1
    // price1t1 = a0t1/a1t1
    // a0t1 = sqrt(price1t1 * a0t0 * a1t0)
    // a1t1 = sqrt(a0t0*a1t0/price1t1)
    a0t1 = BigNumber(price1t1).times(a0t0).times(a1t0).sqrt();
    a1t1 = BigNumber(a0t0).times(a1t0).div(price1t1).sqrt();
  }

  let totalt0 = BigNumber(0),
    totalt1 = BigNumber(0);
  if (quote === "token0") {
    totalt0 = a0t0.plus(a1t0.times(price1t0));
    totalt1 = a0t1.plus(a1t1.times(price1t1));
  } else {
    totalt0 = a1t0.plus(a0t0.times(price0t0));
    totalt1 = a1t1.plus(a0t1.times(price0t1));
  }

  return totalt1.minus(totalt0).div(totalt0);
}

// pricet0: token x price at T0
// pricet1: token y price at T1
// 假设 price0 时刻的流动性为 1:1, 且到 price1 时 out of range
function impermanentLossV3(
  pricet0: string,
  pricet1: string,
  quote: "token0" | "token1"
) {
  const price0t0 = BigNumber(pricet0)
  const price0t1 = BigNumber(pricet1)
  
  if (price0t0.eq(price0t1)) {
    // 无损失
    return BigNumber(0)
  }
  
  const price1t0 = bn1.div(price0t0);
  const price1t1 = bn1.div(price1t0);
  let priceRangeLower: BigNumber // 与 pricet1 对应的另一端的价格
  let priceRangeUpper: BigNumber


  const a0t0 = BigNumber(1);
  const a1t0 = BigNumber(price0t0);
  const amountT0 = [a0t0, a1t0]

  if (price0t1.gt(price0t0)) {
  } else {
  }

  // a0t0*a1t0 = a0t1*a1t1
  // price0t1 = a1t1/a0t1
  // a1t1 = sqrt(price0t1 * a0t0 * a1t0)
  // a0t1 = sqrt(a0t0*a1t0/price0t1)
  if (price0t0.lt(price0t1)) {
    // price rise
    priceRangeUpper = price0t1
    priceRangeLower = calcPriceRangeLower(pricet0, price0t1, amountT0)
  } else {
    // price fall
    priceRangeUpper = calcPriceRangeUpper(pricet0, price0t1, amountT0)
    priceRangeLower = price0t1
  }
  const amountT1 = calcTokenAmountOnPriceChange(price0t0, price0t1, [priceRangeLower, priceRangeUpper], amountT0)
  const a0t1 = amountT1[0]
  const a1t1 = amountT1[1]

  // a1t1 = BigNumber(price0t1).times(a0t0).times(a1t0).sqrt();
  // a0t1 = BigNumber(a0t0).times(a1t0).div(price0t1).sqrt();

  let totalt0 = BigNumber(0),
    totalt1 = BigNumber(0);
  if (quote === "token0") {
    totalt0 = a0t0.plus(a1t0.times(price1t0));
    totalt1 = a0t1.plus(a1t1.times(price1t1));
  } else {
    totalt0 = a1t0.plus(a0t0.times(price0t0));
    totalt1 = a1t1.plus(a0t1.times(price0t1));
  }

  return totalt1.minus(totalt0).div(totalt0);
}

const loss = impermanentLossV3("2000", "1800", "token1");
console.log("loss:", loss);

export { impermanentLossV2, impermanentLossV3 };
