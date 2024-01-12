import bn from "bignumber.js";

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const Q96 = new bn(2).pow(96);
const Q128 = new bn(2).pow(128);
const ZERO = new bn(0);

export const sqrtPriceToPrice = (sqrtPrice: string) => {
  let sp = new bn(sqrtPrice).div(Q96);

  return sp.multipliedBy(sp).toNumber();
};
