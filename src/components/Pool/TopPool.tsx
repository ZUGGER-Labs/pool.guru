'use client';

import { LiquidityPool, Pool } from "@/interfaces/uniswap.interface"
import { useState } from "react"
import PoolDetail from "./PoolDetail";

export interface TopPoolProps {
    itemsPerPage?: number
}

function PoolFilter() {
    return (<></>)
}

function TopPool({itemsPerPage}: TopPoolProps) {
    itemsPerPage = itemsPerPage || 10
    const [pools, setPools] = useState<LiquidityPool[]>([])

    return (<div>
        <div className="flex flex-row justify-between items-center">
        <PoolFilter />
        </div>

        <div>

        </div>

        <div className="flex flex-row justify-between items-center">
            <div>
                {pools.map(pool => {
                    return <PoolDetail key={pool.id} poolData={pool} />
                })}
            </div>
            <div className="hidden md:block">
                <span>Showing 10 out of 195 pools</span>
            </div>

            <div className="w-full md:w-1/3">
                <div className="flex flex-row">
                    <div>Prev</div>
                    <div>Page 1 of 10</div>
                    <div>Next</div>
                </div>
            </div>
        </div>
    </div>)
}

export default TopPool
