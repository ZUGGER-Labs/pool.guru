// in server, start main.ts

import express, { Express } from "express";

// import { hourlyPoolDataRoutine } from "./poolData";
import { loopTokenPrice } from "./price";

import { tokenHandler } from "./handler/token";

async function startBackend() {
  const chains = [1];
//   hourlyPoolDataRoutine(chains);
  loopTokenPrice(chains)
}

async function startHTTPServer(port?: number | string) {
  port = port ? +port : 5050;
  const app: Express = express();
  app.use(express.json()) 

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
