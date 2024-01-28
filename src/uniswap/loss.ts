// 无常损失
import BigNumber from "bignumber.js";

// price0t0: token0 price at time0
// price1t0: token1 price at time0
// price0t1: token0 price at time1
// price1t1: token1 price at time1
function impermanentLoss(
  price0t0: string,
  price1t0: string,
  price0t1: string,
  price1t1: string,
  quote: "token0" | "token1"
) {
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

export { impermanentLoss };
