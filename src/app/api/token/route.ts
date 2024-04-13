import { getTokenInfo } from "@/lib/token";
import { TokenMethodInfo7d } from "@/server/handler/method";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {}

export async function POST(req: NextRequest) {
  let { route, symbol, tokenId, chainId } = await req.json();

  if (!chainId) {
    chainId = 1;
  }

  switch (route) {
    case TokenMethodInfo7d:
      const data = getTokenInfo(chainId, symbol, tokenId);
      return NextResponse.json({
        code: 200,
        message: "OK",
        data: data,
      });
  }
}

