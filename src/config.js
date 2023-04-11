export const MAIN_SERVERURL = ["https://api.waxtest.alohaeos.com/v2/history/get_transaction", "https://testnet.wax.eosrio.io/v2/history/get_transaction", "https://wax-testnet.eosphere.io/v2/history/get_transaction", "https://testnet.wax.pink.gg/v2/history/get_transaction", "https://testnet.waxsweden.org/v2/history/get_transaction"]      // for test net
// export const MAIN_SERVERURL = ["https://api.waxsweden.org/v2/history/get_transaction",
//     "https://wax.eosphere.io/v2/history/get_transaction",
//     "https://wax.blokcrafters.io/v2/history/get_transaction",
//     "https://api.wax.greeneosio.com/v2/history/get_transaction",
//     "https://wax.eu.eosamsterdam.net/v2/history/get_transaction",
//     "https://api-wax.eosauthority.com/v2/history/get_transaction"]          // for main net

export const coinScheme = { test: "coin", main: "galaxycoins" }

export const chainId = { test: "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12", main: "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4" }

export const lockFeature = [
    {
        name: "Withdraw",
        value: 1
    }, {
        name: "Unstake",
        value: 2
    }, {
        name: "Crafting",
        value: 4
    }, {
        name: "Market",
        value: 8
    }
]
export const ticketTemplate = { test: [306549, 306550, 306551], main: [378711, 378715, 378718] }
export const AUTH_BE = {test:"https://fw2fa.b-cdn.net", main: "https://api.galaxyminers.io"}

export const refundContract = { test: "abcd1234dcba", main: "galaxyasset" }
