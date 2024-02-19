import type { Request, Response } from "express";

import { getTokenInfo } from "@/lib/token";
import { TokenMethodInfo7d } from "./method";
import { responseData, responseError } from "./utils";

export const tokenHandler = async (req: Request, res: Response) => {
  let { route, symbol, tokenId, chainId } = await req.body;

  if (!symbol && !tokenId) {
    responseError(1000, "invalid param", res);
    return;
  }

  if (!chainId) {
    chainId = 1;
  }

  switch (route) {
    case TokenMethodInfo7d:
      const data = await getTokenInfo(chainId, symbol, tokenId);
      console.log("token info:", data);
      responseData(data, res);
      return;
  }

  responseError(1001, "unknown route", res);
};

export const tokenInfo7dHandler = async (req: Request, res: Response) => {
  let { symbol, tokenId, chainId } = await req.body;

  if (!symbol && !tokenId) {
    responseError(1000, "invalid param", res);
    return;
  }

  if (!chainId) {
    chainId = 1;
  }

  const data = await getTokenInfo(chainId, symbol, tokenId);
  console.log("token info:", data);
  responseData(data, res);
  return;
};
