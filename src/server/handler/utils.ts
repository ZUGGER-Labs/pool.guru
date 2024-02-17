import { Response } from "express";
import { NextResponse } from "next/server";

export const responseError = (
  code: number,
  message: string | Error,
  res?: Response
) => {
  const data = {
    code: code,
    message: message,
  };
  if (res) {
    res.json(data);
    return;
  }
  return NextResponse.json(data);
};

export const responseData = (data: unknown, res?: Response) => {
  const ret = {
    code: 200,
    message: "OK",
    data: data,
  };
  if (res) {
    res.json(ret);
    return;
  }
  return NextResponse.json(ret);
};
