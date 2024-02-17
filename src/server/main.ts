// in server, start main.ts

import { hourlyPoolDataRoutine } from "./poolData";
import express, { Express, Request, Response } from "express";
import { loopTokenPrice } from "./price";

async function startBackend() {
  const chains = [1];
//   hourlyPoolDataRoutine(chains);
  loopTokenPrice(chains)
}

const tokenHandler = async (req: Request, res: Response) => {

}

async function startHTTPServer(port?: number | string) {
  port = port ? +port : 5050;
  const app: Express = express();

  app.post('/token', tokenHandler)
  app.listen(port, () => {
    console.log(`HTTP API listening on port ${port}`);
  });
}

async function main() {
  startBackend();
  startHTTPServer(process.env.SERVER_LISTEN_PORT);
}

main();
