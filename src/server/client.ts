// apollo clients
import {
  ApolloClient,
  ApolloClientOptions,
  InMemoryCache,
} from "@apollo/client";
import { ChainId } from "@uniswap/sdk-core";
import _ from "lodash";

export const healthClient = new ApolloClient({
  uri: "https://api.thegraph.com/index-node/graphql",
  cache: new InMemoryCache(),
});

export const blockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const baseBlockClient = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/48211/base-blocks/version/latest",
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});

export const celoBlockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/jesse-sawa/celo-blocks",
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});

export const avalancheBlockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/lynnshaoyu/avalanche-blocks",
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});

export const arbitrumBlockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks",
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});

export const bscBlockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/wombat-exchange/bnb-chain-block",
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});

export const optimismBlockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/ianlapham/uni-testing-subgraph",
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});

export const polygonBlockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/ianlapham/polygon-blocks",
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
  },
});

function createApolloClient(uri: string, opts?: any) {
  const options: ApolloClientOptions<any> = {
    uri: uri,
    cache: new InMemoryCache({
      typePolicies: {
        Token: {
          // Singleton types that have no identifying field can use an empty
          // array for their keyFields.
          keyFields: false,
        },
        Pool: {
          // Singleton types that have no identifying field can use an empty
          // array for their keyFields.
          keyFields: false,
        },
      },
    }),
    queryDeduplication: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
      },
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
    },
  };
  opts && _.assign(options, opts);
  // console.log(options)
  return new ApolloClient(options);
  // {
  // uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3?source=uniswap',
  // ...options,
  // uri: uri,
  // });
}

/*
export const client = new ApolloClient({
  // uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3?source=uniswap',
  uri: 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-ethereum',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const avalancheClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/lynnshaoyu/uniswap-v3-avax?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const arbitrumClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})


export const optimismClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const baseClient = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})


export const bscClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})


export const polygonClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const celoClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})
*/

const mainnetUniswapClient = createApolloClient("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3?source=uniswap");
const mainnetMessariClient = createApolloClient("https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-ethereum");
const arbiUniswapClient = createApolloClient("https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one?source=uniswap");
const arbiMessariClient = createApolloClient("https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-arbitrum");
const opUniswapClient = createApolloClient("https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis?source=uniswap");
const opMessariClient = createApolloClient("https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-optimism");
const bscUniswapClient = createApolloClient("https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc?source=uniswap");
const bscMessariClient = createApolloClient("https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-bsc");
const celoUniswapClient = createApolloClient("https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo?source=uniswap");
const celoMessariClient = createApolloClient("https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-celo");
const polygonUniswapClient = createApolloClient("https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon?source=uniswap");
const polygonMessariClient = createApolloClient("https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-polygon");
const baseUniswapClient = createApolloClient("https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest?source=uniswap");
const baseMessariClient = createApolloClient("https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-base");
const avaUniswapClient = createApolloClient("https://api.thegraph.com/subgraphs/name/lynnshaoyu/uniswap-v3-avax?source=uniswap");
const avaMessariClient = createApolloClient("");

export type TGraphType = "uniswap" | "messari" | "block";

export const getGraphClient = (chainId: number, graphType: TGraphType) => {
  if (graphType !== 'uniswap' && graphType !== 'messari' && graphType !== 'block') {
    throw new Error('invalid graphType: ' + graphType)
  }

  // if we found avax graph, this should be removed
  if (chainId === ChainId.AVALANCHE && graphType === 'messari') {
    throw new Error('messari graph not support avax')
  }

  switch (+chainId) {
    case ChainId.MAINNET:
      return graphType === "block"
        ? blockClient
        : graphType === "uniswap"
        ? mainnetUniswapClient
        : mainnetMessariClient;

    case ChainId.ARBITRUM_ONE:
      return graphType === "block"
        ? arbitrumBlockClient
        : graphType === "uniswap"
        ? arbiUniswapClient
        : arbiMessariClient;

    case ChainId.OPTIMISM:
      return graphType === "block"
        ? optimismBlockClient
        : graphType === "uniswap"
        ? opUniswapClient
        : opMessariClient;

    case ChainId.BNB:
      return graphType === "block"
        ? bscBlockClient
        : graphType === "uniswap"
        ? bscUniswapClient
        : bscMessariClient;

    case ChainId.BASE:
      return graphType === "block"
        ? baseBlockClient
        : graphType === "uniswap"
        ? baseUniswapClient
        : baseMessariClient;

    case ChainId.CELO:
      return graphType === "block"
        ? celoBlockClient
        : graphType === "uniswap"
        ? celoUniswapClient
        : celoMessariClient;

    case ChainId.POLYGON:
      return graphType === "block"
        ? polygonBlockClient
        : graphType === "uniswap"
        ? polygonUniswapClient
        : polygonMessariClient;

    case ChainId.AVALANCHE:
      return graphType === "block"
        ? avalancheBlockClient
        : graphType === "uniswap"
        ? avaUniswapClient
        : avaMessariClient;

    default:
      throw new Error("unsupport chainId: " + chainId);
  }
};
