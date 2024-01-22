const fs = require("fs");
// const axios = require("axios");
// const request = require('request');
const { DEFAULT_LIST_OF_LISTS } = require("./tokenLists");
const fetch = require('node-fetch'); // v2
const httpsProxyAgent = require('https-proxy-agent')

const TOKEN_URLS = DEFAULT_LIST_OF_LISTS;

const CHAINID_MAPPING = {
  1: "ethereum",
  3: "ethereum",
  4: "ethereum",
  5: "ethereum",
  42: "ethereum",
  80001: "ethereum",
  10: "optimism",
  420: "optimism",
  137: "polygon",
  42161: "arbitrum",
  42220: "celo",
  44787: "celo",
  56: "bnb",
};

Promise.all(TOKEN_URLS.map(async (url) => {
  // return axios.get(url, 
  //   {
  //   proxy: {
  //       protocol: 'https',
  //       host: '127.0.0.1',
  //       port: 7890,
  //   },
  // }
  // )

  const resp = await fetch(url, {
    agent: new httpsProxyAgent.HttpsProxyAgent('http://127.0.0.1:7890'),
  })
  // console.log('resp', resp)
  return await resp.json()
  // const {resp } = await  request({
  //   url: url,
  //   proxy: 'http://127.0.0.1:7890 '
  // }) //.then(res => JSON.parse(res))
}
))
  .then((lists) => {
    // console.log('lists:', lists)
    return lists.map((list) => list.tokens).flat();
  })
  .then((tokens) => {
    return tokens
      .filter((t) => t !== undefined && t.logoURI)
      .reduce((result, curr) => {
        const platform = CHAINID_MAPPING[+curr.chainId];
        if (platform === undefined) return result;
        if (!result[platform]) result[platform] = {};

        let logoURI = curr.logoURI;
        if (logoURI.indexOf("ipfs://") !== -1) {
          logoURI = logoURI.replace(`ipfs://`, `https://ipfs.io/ipfs/`);
        }
        result[platform][curr.address.toLowerCase()] = logoURI;
        return result;
      }, {});
  })
  .then((data) => {
    const filepath = "./src/uniswap/chainTokenImageURI.json";

    fs.writeFileSync(filepath, JSON.stringify(data, 2, 2));
    console.log(`[DONE] Generated token image URI mapping file to ${filepath}`);
  });
