"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./src/uniswap/graph.ts":
/*!******************************!*\
  !*** ./src/uniswap/graph.ts ***!
  \******************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getUniswapV3Pools: function() { return /* binding */ getUniswapV3Pools; }\n/* harmony export */ });\n/* harmony import */ var _lib_network__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/network */ \"(app-pages-browser)/./src/lib/network.ts\");\n/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helper */ \"(app-pages-browser)/./src/uniswap/helper.ts\");\n\n\n// private helper functions\nconst _query = async (endpoint, query)=>{\n    const resp = await fetch(endpoint, {\n        method: \"POST\",\n        body: JSON.stringify({\n            query\n        })\n    });\n    if (resp.status !== 200) {\n        throw new Error(\"invalid response status: \" + resp.status);\n    }\n    const data = await resp.json();\n    const errors = data.errors;\n    if (errors && errors.length > 0) {\n        console.error(\"Uniswap Subgraph Errors\", {\n            errors,\n            query\n        });\n        throw new Error(\"Uniswap Subgraph Errors: \".concat(JSON.stringify(errors)));\n    }\n    return data.data;\n};\nconst _processTokenInfo = (token)=>{\n    token.logoURI = (0,_helper__WEBPACK_IMPORTED_MODULE_1__.getTokenLogoURL)(token.id);\n    // TODO: check the network id before replace the token name\n    if (token.name === \"Wrapped Ether\" || token.name === \"Wrapped Ethereum\") {\n        token.name = \"Ethereum\";\n        token.symbol = \"ETH\";\n        token.logoURI = \"https://cdn.iconscout.com/icon/free/png-128/ethereum-2752194-2285011.png\";\n    }\n    if (token.name === \"Wrapped Matic\") {\n        token.name = \"Polygon Native Token\";\n        token.symbol = \"MATIC\";\n    }\n    if (token.name === \"Wrapped BNB\") {\n        token.name = \"BSC Native Token\";\n        token.symbol = \"BNB\";\n    }\n    return token;\n};\nconst getBulkTokens = async (endpoint, tokenAddresses)=>{\n    const res = await _query(endpoint, \"{\\n      tokens(where: {id_in: [\".concat(tokenAddresses.map((id)=>'\"'.concat(id, '\"')).join(\",\"), \"]}) {\\n        id\\n        name\\n        symbol\\n        volumeUSD\\n        decimals\\n        totalValueLockedUSD\\n        tokenDayData(first: 1, orderBy: date, orderDirection: desc) {\\n          priceUSD\\n        }\\n      }\\n    }\"));\n    if (res.tokens !== null) {\n        res.tokens = res.tokens.map(_processTokenInfo);\n    }\n    return res.tokens;\n};\nconst processPools = async (endpoint, pools)=>{\n    const tokenIds = (0,_helper__WEBPACK_IMPORTED_MODULE_1__.getUniqueItems)(pools.reduce((acc, p)=>[\n            ...acc,\n            p.token0.id,\n            p.token1.id\n        ], []));\n    const queryPage = Math.ceil(tokenIds.length / 100);\n    // batch query getBulkTokens function by page using Promise.all\n    const tokens = await Promise.all(Array.from({\n        length: queryPage\n    }, (_, i)=>{\n        const start = i * 100;\n        const end = start + 100;\n        return getBulkTokens(endpoint, tokenIds.slice(start, end));\n    })).then((res)=>res.flat());\n    // sort token by volume\n    tokens.sort((a, b)=>Number(b.volumeUSD) - Number(a.volumeUSD));\n    // map poolCount\n    const poolCountByTokenId = pools.reduce((acc, p)=>{\n        acc[p.token0.id] = (acc[p.token0.id] || 0) + 1;\n        acc[p.token1.id] = (acc[p.token1.id] || 0) + 1;\n        return acc;\n    }, {});\n    const _tokens = tokens.map((t)=>{\n        return {\n            ...t,\n            poolCount: poolCountByTokenId[t.id]\n        };\n    });\n    // create hashmap of tokens id\n    const tokenMap = _tokens.reduce((acc, t)=>{\n        acc[t.id] = t;\n        return acc;\n    }, {});\n    const npools = pools.map((p)=>{\n        return {\n            ...p,\n            token0: tokenMap[p.token0.id],\n            token1: tokenMap[p.token1.id]\n        };\n    });\n    return {\n        pools: npools,\n        tokens\n    };\n};\n// get uniswap v3 pools\nconst getUniswapV3Pools = async (param)=>{\n    let { chainId, take, tvlUSD_gte, volUSD_gte } = param;\n    chainId = chainId || 1;\n    take = take || 1000; // fir\n    const endpoint = (0,_lib_network__WEBPACK_IMPORTED_MODULE_0__.getNetworkEndpoint)(chainId);\n    try {\n        const res = await _query(endpoint, \"{\\n        pools (first: \".concat(take, \", orderBy: totalValueLockedUSD, orderDirection: desc, where: {liquidity_gt: 0, totalValueLockedUSD_gte: \").concat(tvlUSD_gte, \", volumeUSD_gte: \").concat(volUSD_gte, \"}) {\\n          id\\n          token0 {\\n            id\\n          }\\n          token1 {\\n            id\\n          }\\n          feeTier\\n          liquidity\\n          tick\\n          sqrtPrice\\n          totalValueLockedUSD\\n          createdAtTimestamp\\n        }\\n      }\"));\n        if (!res || res.length === 0) {\n            return {\n                pools: [],\n                tokens: []\n            };\n        }\n        return processPools(endpoint, res.pools);\n    } catch (err) {\n        return {\n            pools: [],\n            tokens: []\n        };\n    }\n};\n\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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M0IsTUFBTS9ELFdBQVdKLGdFQUFrQkEsQ0FBQ2tFO0lBRXBDLElBQUk7UUFDRixNQUFNdEMsTUFBTSxNQUFNekIsT0FDaEJDLFVBQ0EsNEJBQ2lJZ0UsT0FBL0dELE1BQUssNEdBQXdJRSxPQUE5QkQsWUFBVyxxQkFBOEIsT0FBWEMsWUFBVztRQWlCNUssSUFBSSxDQUFDekMsT0FBT0EsSUFBSVgsTUFBTSxLQUFLLEdBQUc7WUFDNUIsT0FBTztnQkFBRWdCLE9BQU8sRUFBRTtnQkFBRUYsUUFBUSxFQUFFO1lBQUM7UUFDakM7UUFFQSxPQUFPQyxhQUFhNUIsVUFBVXdCLElBQUlLLEtBQUs7SUFDekMsRUFBRSxPQUFPcUMsS0FBSztRQUNaLE9BQU87WUFBRXJDLE9BQU8sRUFBRTtZQUFFRixRQUFRLEVBQUU7UUFBQztJQUNqQztBQUNGO0FBRTZCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL3NyYy91bmlzd2FwL2dyYXBoLnRzP2M0YWYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9vbCwgVG9rZW4gfSBmcm9tIFwiQC9pbnRlcmZhY2VzL3VuaXN3YXAuaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBERVhfVFlQRVMsIGdldE5ldHdvcmtFbmRwb2ludCwgZ2V0TmV0d29ya05hbWUgfSBmcm9tIFwiQC9saWIvbmV0d29ya1wiO1xuaW1wb3J0IHsgZ2V0VG9rZW5Mb2dvVVJMLCBnZXRVbmlxdWVJdGVtcyB9IGZyb20gXCIuL2hlbHBlclwiO1xuXG4vLyBwcml2YXRlIGhlbHBlciBmdW5jdGlvbnNcbmNvbnN0IF9xdWVyeSA9IGFzeW5jIChlbmRwb2ludDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGVuZHBvaW50LCB7XG4gICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHF1ZXJ5IH0pLFxuICB9KTtcblxuICBpZiAocmVzcC5zdGF0dXMgIT09IDIwMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgcmVzcG9uc2Ugc3RhdHVzOiBcIiArIHJlc3Auc3RhdHVzKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcblxuICBjb25zdCBlcnJvcnMgPSBkYXRhLmVycm9ycztcbiAgaWYgKGVycm9ycyAmJiBlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJVbmlzd2FwIFN1YmdyYXBoIEVycm9yc1wiLCB7IGVycm9ycywgcXVlcnkgfSk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmlzd2FwIFN1YmdyYXBoIEVycm9yczogJHtKU09OLnN0cmluZ2lmeShlcnJvcnMpfWApO1xuICB9XG5cbiAgcmV0dXJuIGRhdGEuZGF0YTtcbn07XG5cbmNvbnN0IF9wcm9jZXNzVG9rZW5JbmZvID0gKHRva2VuOiBUb2tlbikgPT4ge1xuICB0b2tlbi5sb2dvVVJJID0gZ2V0VG9rZW5Mb2dvVVJMKHRva2VuLmlkKTtcblxuICAvLyBUT0RPOiBjaGVjayB0aGUgbmV0d29yayBpZCBiZWZvcmUgcmVwbGFjZSB0aGUgdG9rZW4gbmFtZVxuICBpZiAodG9rZW4ubmFtZSA9PT0gXCJXcmFwcGVkIEV0aGVyXCIgfHwgdG9rZW4ubmFtZSA9PT0gXCJXcmFwcGVkIEV0aGVyZXVtXCIpIHtcbiAgICB0b2tlbi5uYW1lID0gXCJFdGhlcmV1bVwiO1xuICAgIHRva2VuLnN5bWJvbCA9IFwiRVRIXCI7XG4gICAgdG9rZW4ubG9nb1VSSSA9XG4gICAgICBcImh0dHBzOi8vY2RuLmljb25zY291dC5jb20vaWNvbi9mcmVlL3BuZy0xMjgvZXRoZXJldW0tMjc1MjE5NC0yMjg1MDExLnBuZ1wiO1xuICB9XG4gIGlmICh0b2tlbi5uYW1lID09PSBcIldyYXBwZWQgTWF0aWNcIikge1xuICAgIHRva2VuLm5hbWUgPSBcIlBvbHlnb24gTmF0aXZlIFRva2VuXCI7XG4gICAgdG9rZW4uc3ltYm9sID0gXCJNQVRJQ1wiO1xuICB9XG4gIGlmICh0b2tlbi5uYW1lID09PSBcIldyYXBwZWQgQk5CXCIpIHtcbiAgICB0b2tlbi5uYW1lID0gXCJCU0MgTmF0aXZlIFRva2VuXCI7XG4gICAgdG9rZW4uc3ltYm9sID0gXCJCTkJcIjtcbiAgfVxuXG4gIHJldHVybiB0b2tlbjtcbn07XG5cbmNvbnN0IGdldEJ1bGtUb2tlbnMgPSBhc3luYyAoXG4gIGVuZHBvaW50OiBzdHJpbmcsXG4gIHRva2VuQWRkcmVzc2VzOiBzdHJpbmdbXVxuKTogUHJvbWlzZTxUb2tlbltdPiA9PiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IF9xdWVyeShcbiAgICBlbmRwb2ludCxcbiAgICBge1xuICAgICAgdG9rZW5zKHdoZXJlOiB7aWRfaW46IFske3Rva2VuQWRkcmVzc2VzXG4gICAgICAgIC5tYXAoKGlkKSA9PiBgXCIke2lkfVwiYClcbiAgICAgICAgLmpvaW4oXCIsXCIpfV19KSB7XG4gICAgICAgIGlkXG4gICAgICAgIG5hbWVcbiAgICAgICAgc3ltYm9sXG4gICAgICAgIHZvbHVtZVVTRFxuICAgICAgICBkZWNpbWFsc1xuICAgICAgICB0b3RhbFZhbHVlTG9ja2VkVVNEXG4gICAgICAgIHRva2VuRGF5RGF0YShmaXJzdDogMSwgb3JkZXJCeTogZGF0ZSwgb3JkZXJEaXJlY3Rpb246IGRlc2MpIHtcbiAgICAgICAgICBwcmljZVVTRFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWBcbiAgKTtcblxuICBpZiAocmVzLnRva2VucyAhPT0gbnVsbCkge1xuICAgIHJlcy50b2tlbnMgPSByZXMudG9rZW5zLm1hcChfcHJvY2Vzc1Rva2VuSW5mbyk7XG4gIH1cblxuICByZXR1cm4gcmVzLnRva2Vucztcbn07XG5cbmNvbnN0IHByb2Nlc3NQb29scyA9IGFzeW5jIChcbiAgZW5kcG9pbnQ6IHN0cmluZyxcbiAgcG9vbHM6IFBvb2xbXVxuKSA9PiB7XG4gIGNvbnN0IHRva2VuSWRzID0gZ2V0VW5pcXVlSXRlbXMoXG4gICAgcG9vbHMucmVkdWNlKFxuICAgICAgKGFjYzogc3RyaW5nW10sIHA6IFBvb2wpID0+IFsuLi5hY2MsIHAudG9rZW4wLmlkLCBwLnRva2VuMS5pZF0sXG4gICAgICBbXVxuICAgIClcbiAgKTtcbiAgY29uc3QgcXVlcnlQYWdlID0gTWF0aC5jZWlsKHRva2VuSWRzLmxlbmd0aCAvIDEwMCk7XG4gIC8vIGJhdGNoIHF1ZXJ5IGdldEJ1bGtUb2tlbnMgZnVuY3Rpb24gYnkgcGFnZSB1c2luZyBQcm9taXNlLmFsbFxuICBjb25zdCB0b2tlbnMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBxdWVyeVBhZ2UgfSwgKF8sIGkpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gaSAqIDEwMDtcbiAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgMTAwO1xuICAgICAgcmV0dXJuIGdldEJ1bGtUb2tlbnMoZW5kcG9pbnQsIHRva2VuSWRzLnNsaWNlKHN0YXJ0LCBlbmQpKTtcbiAgICB9KVxuICApLnRoZW4oKHJlcykgPT4gcmVzLmZsYXQoKSk7XG4gIC8vIHNvcnQgdG9rZW4gYnkgdm9sdW1lXG4gIHRva2Vucy5zb3J0KChhLCBiKSA9PiBOdW1iZXIoYi52b2x1bWVVU0QpIC0gTnVtYmVyKGEudm9sdW1lVVNEKSk7XG4gIC8vIG1hcCBwb29sQ291bnRcbiAgY29uc3QgcG9vbENvdW50QnlUb2tlbklkID0gcG9vbHMucmVkdWNlKChhY2M6IGFueSwgcDogUG9vbCkgPT4ge1xuICAgIGFjY1twLnRva2VuMC5pZF0gPSAoYWNjW3AudG9rZW4wLmlkXSB8fCAwKSArIDE7XG4gICAgYWNjW3AudG9rZW4xLmlkXSA9IChhY2NbcC50b2tlbjEuaWRdIHx8IDApICsgMTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG5cbiAgY29uc3QgX3Rva2VucyA9IHRva2Vucy5tYXAoKHQ6IFRva2VuKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnQsXG4gICAgICBwb29sQ291bnQ6IHBvb2xDb3VudEJ5VG9rZW5JZFt0LmlkXSxcbiAgICB9O1xuICB9KTtcbiAgLy8gY3JlYXRlIGhhc2htYXAgb2YgdG9rZW5zIGlkXG4gIGNvbnN0IHRva2VuTWFwID0gX3Rva2Vucy5yZWR1Y2UoKGFjYzogYW55LCB0OiBUb2tlbikgPT4ge1xuICAgIGFjY1t0LmlkXSA9IHQ7XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuICBjb25zdCBucG9vbHMgPSBwb29scy5tYXAoKHA6IFBvb2wpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ucCxcbiAgICAgIHRva2VuMDogdG9rZW5NYXBbcC50b2tlbjAuaWRdLFxuICAgICAgdG9rZW4xOiB0b2tlbk1hcFtwLnRva2VuMS5pZF0sXG4gICAgfTtcbiAgfSk7XG5cbiAgcmV0dXJuIHsgcG9vbHM6IG5wb29scywgdG9rZW5zIH07XG59O1xuXG4vLyBnZXQgdW5pc3dhcCB2MyBwb29sc1xuY29uc3QgZ2V0VW5pc3dhcFYzUG9vbHMgPSBhc3luYyAoe1xuICBjaGFpbklkLFxuICB0YWtlLFxuICB0dmxVU0RfZ3RlLFxuICB2b2xVU0RfZ3RlLFxufToge1xuICBjaGFpbklkPzogbnVtYmVyO1xuICB0YWtlPzogbnVtYmVyO1xuICB0dmxVU0RfZ3RlOiBudW1iZXI7XG4gIHZvbFVTRF9ndGU6IG51bWJlcjtcbn0pOiBQcm9taXNlPHtcbiAgcG9vbHM6IFBvb2xbXTtcbiAgdG9rZW5zOiBUb2tlbltdO1xufT4gPT4ge1xuICBjaGFpbklkID0gY2hhaW5JZCB8fCAxO1xuICB0YWtlID0gdGFrZSB8fCAxMDAwOyAvLyBmaXJcbiAgY29uc3QgZW5kcG9pbnQgPSBnZXROZXR3b3JrRW5kcG9pbnQoY2hhaW5JZCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBfcXVlcnkoXG4gICAgICBlbmRwb2ludCxcbiAgICAgIGB7XG4gICAgICAgIHBvb2xzIChmaXJzdDogJHt0YWtlfSwgb3JkZXJCeTogdG90YWxWYWx1ZUxvY2tlZFVTRCwgb3JkZXJEaXJlY3Rpb246IGRlc2MsIHdoZXJlOiB7bGlxdWlkaXR5X2d0OiAwLCB0b3RhbFZhbHVlTG9ja2VkVVNEX2d0ZTogJHt0dmxVU0RfZ3RlfSwgdm9sdW1lVVNEX2d0ZTogJHt2b2xVU0RfZ3RlfX0pIHtcbiAgICAgICAgICBpZFxuICAgICAgICAgIHRva2VuMCB7XG4gICAgICAgICAgICBpZFxuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbjEge1xuICAgICAgICAgICAgaWRcbiAgICAgICAgICB9XG4gICAgICAgICAgZmVlVGllclxuICAgICAgICAgIGxpcXVpZGl0eVxuICAgICAgICAgIHRpY2tcbiAgICAgICAgICBzcXJ0UHJpY2VcbiAgICAgICAgICB0b3RhbFZhbHVlTG9ja2VkVVNEXG4gICAgICAgICAgY3JlYXRlZEF0VGltZXN0YW1wXG4gICAgICAgIH1cbiAgICAgIH1gXG4gICAgKTtcbiAgICBpZiAoIXJlcyB8fCByZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4geyBwb29sczogW10sIHRva2VuczogW10gfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvY2Vzc1Bvb2xzKGVuZHBvaW50LCByZXMucG9vbHMpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiB7IHBvb2xzOiBbXSwgdG9rZW5zOiBbXSB9O1xuICB9XG59O1xuXG5leHBvcnQgeyBnZXRVbmlzd2FwVjNQb29scyB9O1xuIl0sIm5hbWVzIjpbImdldE5ldHdvcmtFbmRwb2ludCIsImdldFRva2VuTG9nb1VSTCIsImdldFVuaXF1ZUl0ZW1zIiwiX3F1ZXJ5IiwiZW5kcG9pbnQiLCJxdWVyeSIsInJlc3AiLCJmZXRjaCIsIm1ldGhvZCIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5Iiwic3RhdHVzIiwiRXJyb3IiLCJkYXRhIiwianNvbiIsImVycm9ycyIsImxlbmd0aCIsImNvbnNvbGUiLCJlcnJvciIsIl9wcm9jZXNzVG9rZW5JbmZvIiwidG9rZW4iLCJsb2dvVVJJIiwiaWQiLCJuYW1lIiwic3ltYm9sIiwiZ2V0QnVsa1Rva2VucyIsInRva2VuQWRkcmVzc2VzIiwicmVzIiwibWFwIiwiam9pbiIsInRva2VucyIsInByb2Nlc3NQb29scyIsInBvb2xzIiwidG9rZW5JZHMiLCJyZWR1Y2UiLCJhY2MiLCJwIiwidG9rZW4wIiwidG9rZW4xIiwicXVlcnlQYWdlIiwiTWF0aCIsImNlaWwiLCJQcm9taXNlIiwiYWxsIiwiQXJyYXkiLCJmcm9tIiwiXyIsImkiLCJzdGFydCIsImVuZCIsInNsaWNlIiwidGhlbiIsImZsYXQiLCJzb3J0IiwiYSIsImIiLCJOdW1iZXIiLCJ2b2x1bWVVU0QiLCJwb29sQ291bnRCeVRva2VuSWQiLCJfdG9rZW5zIiwidCIsInBvb2xDb3VudCIsInRva2VuTWFwIiwibnBvb2xzIiwiZ2V0VW5pc3dhcFYzUG9vbHMiLCJjaGFpbklkIiwidGFrZSIsInR2bFVTRF9ndGUiLCJ2b2xVU0RfZ3RlIiwiZXJyIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/uniswap/graph.ts\n"));

/***/ })

});