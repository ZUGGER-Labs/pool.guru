import { ChainId } from "@uniswap/sdk-core";

// weth 地址
function getWETH(chainId: number) {
    switch (chainId) {
        case ChainId.MAINNET:
            return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

        case ChainId.ARBITRUM_ONE:
            return '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'

        case ChainId.OPTIMISM:
            return '0x4200000000000000000000000000000000000006'

        case ChainId.BASE:
            return '0x4200000000000000000000000000000000000006'

        case ChainId.BNB:
            return '0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA' // Wormhole
        case ChainId.AVALANCHE:
            return ''
        case ChainId.POLYGON:
            return ''
    }
}

export default getWETH