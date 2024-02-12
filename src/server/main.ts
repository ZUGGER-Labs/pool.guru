
// in server, start main.ts

import { dailyPoolDataRoutine, hourlyPoolDataRoutine } from "./poolData"

async function main() {
    const chains = [1]
    hourlyPoolDataRoutine(chains)
    dailyPoolDataRoutine(chains)
}

main()
