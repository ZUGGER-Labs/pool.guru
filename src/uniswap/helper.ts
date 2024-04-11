import TokenImageURI from "./tokenImageURI.json";

// return unique string in string[]
export const getUniqueItems = (arr: string[]): string[] => {
  return arr.filter((v, i, a) => a.indexOf(v) === i);
};

export const getTokenLogoURL = (address: string): string => {
  const mapper = TokenImageURI as any;
  const imageURL = mapper[address];

  return imageURL ? imageURL : 'https://friconix.com/png/fi-cnsuxl-question-mark.png';
};

export const getFeeTierPercentage = (tier: string): number => {
  if (tier === "100") return 0.01 / 100;
  if (tier === "500") return 0.05 / 100;
  if (tier === "3000") return 0.3 / 100;
  if (tier === "10000") return 1 / 100;
  return 0;
};
