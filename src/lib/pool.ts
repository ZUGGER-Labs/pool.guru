import { query } from "@/utils/query";


async function getPoolInfo(poolId: string, period?: string) {
    return query('/pool/info/' + poolId, {
        period: period ? period : '14D'
    })
}

export {
    getPoolInfo
}
