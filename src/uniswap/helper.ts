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
