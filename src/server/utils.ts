import dayjs from "dayjs";

export const now = () => {
  // const tm = new Date();
  // return tm.toISOString();

  return dayjs().format('YYYY-MM-DDTHH:mm:ss')
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
