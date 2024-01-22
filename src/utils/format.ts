import numbro from "numbro";

// using a currency library here in case we want to add more in future
export const formatAmount = (num: string | number | bigint | undefined, digits = 2) => {
  if (typeof num === "string") {
    num = +num;
  }
  if (typeof num === 'bigint') {
    num = +(num.toString())
  }

  if (num === 0) return "0";
  if (!num) return "-";
  if (num < 0.001) {
    return "<0.001";
  }
  return numbro(num).format({
    average: true,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: "M",
      billion: "B",
    },
  });
};
