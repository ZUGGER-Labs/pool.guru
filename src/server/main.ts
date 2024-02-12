
// in server, start main.ts

import { getDailyChainPools } from "./apy"

async function main() {
    const chains = [1]
    for (let chainId of chains) {
        await getDailyChainPools(chainId)
    }

    
}

main()
